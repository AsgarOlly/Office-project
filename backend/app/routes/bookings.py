from datetime import datetime
from flask import Blueprint, request, jsonify
from backend.app.models.booking import OrderBooking, MasterJobAssignment
from backend.app.models.employee import Employee
from backend.app.models.ledger import LedgerEntry, ProductStage
from backend.app.extensions import db

bookings_bp = Blueprint('bookings', __name__)

@bookings_bp.route('', methods=['GET'])
def get_bookings():
    bookings = OrderBooking.query.order_by(OrderBooking.created_at.desc()).all()
    return jsonify([b.to_dict() for b in bookings]), 200

@bookings_bp.route('/<string:booking_id>', methods=['GET'])
def get_booking(booking_id):
    booking = OrderBooking.query.get(booking_id)
    if not booking:
        return jsonify({'error': 'Booking not found'}), 404
    return jsonify(booking.to_dict()), 200

@bookings_bp.route('/<string:booking_id>', methods=['PATCH'])
def update_booking(booking_id):
    booking = OrderBooking.query.get(booking_id)
    if not booking:
        return jsonify({'error': 'Booking not found'}), 404

    data = request.get_json() or {}
    if 'status' in data: booking.status = data['status']
    if data.get('balancePaidNow'):
        amount = float(data['balancePaidNow'])
        booking.advance_paid = float(booking.advance_paid or 0) + amount
        booking.balance_due = max(0, float(booking.balance_due or 0) - amount)

    db.session.commit()
    return jsonify(booking.to_dict()), 200

@bookings_bp.route('', methods=['POST'])
def create_booking():
    data = request.get_json() or {}
    new_id = data.get('id') or f"BKG-2026-{OrderBooking.query.count() + 101}"
    booking_no = data.get('bookingNo') or f"BK-{OrderBooking.query.count() + 101}"
    
    booking = OrderBooking(
        id=new_id,
        booking_no=booking_no,
        customer_id=data.get('customerId'),
        customer_name=data.get('customerName', 'Guest Client'),
        customer_phone=data.get('customerPhone'),
        garment_type=data.get('garmentType', 'Custom Tailoring'),
        fabric_details=data.get('fabricDetails'),
        booking_date=data.get('bookingDate', datetime.utcnow().strftime('%Y-%m-%d')),
        trial_date=data.get('trialDate'),
        delivery_date=data.get('deliveryDate'),
        total_amount=data.get('totalAmount', 0.0),
        advance_paid=data.get('advancePaid', 0.0),
        balance_due=data.get('balanceDue', 0.0),
        status=data.get('status', 'In Production'),
        assigned_master=data.get('assignedMaster'),
        special_instructions=data.get('specialInstructions'),
        measurement_id=data.get('measurementId'),
    )
    db.session.add(booking)

    initial_stage = data.get('initialStage', 'Fabric Sourcing & Inward')
    db.session.add(ProductStage(
        id=f"STG-{new_id}",
        batch_no=f"LOT-{booking_no}",
        booking_id=new_id,
        client_name=data.get('customerName', 'Guest Client'),
        garment_type=data.get('garmentType', 'Custom Tailoring'),
        quantity=1,
        current_stage=initial_stage,
        assigned_to=data.get('assignedMaster'),
        start_date=data.get('bookingDate', datetime.utcnow().strftime('%Y-%m-%d')),
        target_date=data.get('deliveryDate'),
        progress=15,
        qc_status='In Progress',
        notes=data.get('specialInstructions', ''),
        history=[{
            'stage': initial_stage,
            'date': datetime.utcnow().strftime('%Y-%m-%d'),
            'status': 'Active',
            'by': data.get('assignedMaster') or 'Supervisor',
        }],
    ))

    # Automatically create a MasterJobAssignment tracking delivery-linked bonus
    assigned_master_name = data.get('assignedMaster')
    if assigned_master_name:
        # Determine incentive based on garment type
        garment = data.get('garmentType', '').lower()
        incentive = 200.00
        if 'suit' in garment:
            incentive = 500.00
        elif 'sherwani' in garment:
            incentive = 400.00

        # Try to find employee
        master_emp = Employee.query.filter(Employee.name.like(f"%{assigned_master_name.split()[0]}%")).first()
        job = MasterJobAssignment(
            id=f"JOB-{int(datetime.utcnow().timestamp())}",
            booking_id=new_id,
            master_id=master_emp.id if master_emp else None,
            master_name=assigned_master_name,
            garment_type=data.get('garmentType', 'Custom Tailoring'),
            incentive_rate=incentive,
            work_status='ASSIGNED',
            payout_status='PENDING_DELIVERY',
        )
        db.session.add(job)

    db.session.commit()
    return jsonify(booking.to_dict()), 201

@bookings_bp.route('/<string:booking_id>/deliver-and-settle', methods=['POST'])
def deliver_and_settle(booking_id):
    """
    CRITICAL BUSINESS TRIGGER:
    Order is marked as DELIVERED and balance payment is SETTLED.
    This unlocks the Master Tailor's performance incentive for the current payroll month!
    """
    booking = OrderBooking.query.get(booking_id)
    if not booking:
        return jsonify({'error': 'Booking not found'}), 404

    booking.status = 'Delivered'
    prev_balance = float(booking.balance_due)
    booking.advance_paid = float(booking.total_amount)
    booking.balance_due = 0.0

    current_month = datetime.utcnow().strftime('%B %Y') # e.g. "September 2026"

    # Unlock linked master jobs
    jobs = MasterJobAssignment.query.filter_by(booking_id=booking_id).all()
    unlocked_jobs = []
    for job in jobs:
        job.work_status = 'COMPLETED'
        job.is_delivered = True
        job.is_payment_settled = True
        job.delivered_at = datetime.utcnow()
        job.payout_status = 'READY_FOR_PAYROLL'
        job.payroll_month = current_month
        unlocked_jobs.append(job.to_dict())

        # If employee exists, increment their delivered pieces count
        if job.master_id:
            emp = Employee.query.get(job.master_id)
            if emp:
                emp.pieces_completed_this_month = (emp.pieces_completed_this_month or 0) + 1

    linked_stages = ProductStage.query.filter_by(booking_id=booking_id).all()
    for stage in linked_stages:
        stage.current_stage = 'Showroom / Ready Stock'
        stage.progress = 100
        stage.history = [
            *(stage.history or []),
            {
                'stage': 'Showroom / Ready Stock',
                'date': datetime.utcnow().strftime('%Y-%m-%d'),
                'status': 'Completed',
                'by': 'Delivery Settlement',
            },
        ]

    # Record ledger entry for the settled balance
    if prev_balance > 0:
        ledger = LedgerEntry(
            id=f"LED-SETTLE-{int(datetime.utcnow().timestamp())}",
            date=datetime.utcnow().strftime('%Y-%m-%d'),
            type='CREDIT',
            category='Custom Tailoring Final Settlement',
            description=f"Delivery & Balance Settlement for Booking #{booking.booking_no} ({booking.customer_name})",
            amount=prev_balance,
            balance_after=20000.0, # will calculate or keep
            reference=booking.booking_no,
        )
        db.session.add(ledger)

    db.session.commit()
    return jsonify({
        'message': f'Order {booking.booking_no} settled and delivered! Master incentive unlocked.',
        'booking': booking.to_dict(),
        'unlockedJobs': unlocked_jobs
    }), 200

@bookings_bp.route('/master-jobs', methods=['GET'])
def get_master_jobs():
    master_name = request.args.get('master')
    month = request.args.get('month')
    query = MasterJobAssignment.query
    if master_name:
        query = query.filter_by(master_name=master_name)
    if month:
        query = query.filter_by(payroll_month=month)
    jobs = query.order_by(MasterJobAssignment.created_at.desc()).all()
    return jsonify([j.to_dict() for j in jobs]), 200

@bookings_bp.route('/master-jobs/<string:job_id>/complete', methods=['POST'])
def complete_master_job(job_id):
    job = MasterJobAssignment.query.get(job_id)
    if not job:
        return jsonify({'error': 'Master job not found'}), 404
    if job.work_status != 'COMPLETED':
        job.work_status = 'COMPLETED'
        job.work_completed_at = datetime.utcnow()
        if job.master_id:
            employee = Employee.query.get(job.master_id)
            if employee:
                employee.pieces_completed_this_month = (employee.pieces_completed_this_month or 0) + 1
    db.session.commit()
    return jsonify(job.to_dict()), 200
