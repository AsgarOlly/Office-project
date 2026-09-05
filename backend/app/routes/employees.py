from datetime import datetime
from flask import Blueprint, request, jsonify
from backend.app.models.employee import Employee, Attendance
from backend.app.models.booking import MasterJobAssignment
from backend.app.extensions import db

employees_bp = Blueprint('employees', __name__)

@employees_bp.route('', methods=['POST'])
def create_employee():
    data = request.get_json() or {}
    employee = Employee(
        id=data.get('id') or f"EMP-{Employee.query.count() + 1:02d}",
        emp_id=data.get('empId') or f"TC-EMP-{Employee.query.count() + 1:02d}",
        name=data.get('name'),
        role=data.get('role', 'Staff'),
        department=data.get('department'),
        phone=data.get('phone'),
        join_date=data.get('joinDate'),
        pay_type=data.get('payType', 'piece_rate'),
        base_salary=data.get('baseSalary', 500),
        piece_rate_unit=data.get('pieceRateUnit', 28.5),
        overtime_rate_per_hour=data.get('overtimeRatePerHour', 8),
        avatar=data.get('avatar', '👤'),
        status=data.get('status', 'Active'),
    )
    db.session.add(employee)
    db.session.commit()
    return jsonify(employee.to_dict()), 201

@employees_bp.route('', methods=['GET'])
def get_employees():
    employees = Employee.query.all()
    return jsonify([e.to_dict() for e in employees]), 200

@employees_bp.route('/<string:emp_id>', methods=['GET'])
def get_employee(emp_id):
    emp = Employee.query.filter((Employee.id == emp_id) | (Employee.emp_id == emp_id)).first()
    if not emp:
        return jsonify({'error': 'Employee not found'}), 404
    return jsonify(emp.to_dict()), 200

@employees_bp.route('/<string:emp_id>/salary', methods=['PUT', 'PATCH'])
def update_salary(emp_id):
    emp = Employee.query.filter((Employee.id == emp_id) | (Employee.emp_id == emp_id)).first()
    if not emp:
        return jsonify({'error': 'Employee not found'}), 404

    data = request.get_json() or {}
    if 'baseSalary' in data: emp.base_salary = data['baseSalary']
    if 'pieceRateUnit' in data: emp.piece_rate_unit = data['pieceRateUnit']
    if 'piecesCompletedThisMonth' in data: emp.pieces_completed_this_month = data['piecesCompletedThisMonth']
    if 'salesAchievedThisMonth' in data: emp.sales_achieved_this_month = data['salesAchievedThisMonth']
    if 'salesCommissionRate' in data: emp.sales_commission_rate = data['salesCommissionRate']
    if 'overtimeRatePerHour' in data: emp.overtime_rate_per_hour = data['overtimeRatePerHour']
    if 'performanceScore' in data: emp.performance_score = data['performanceScore']
    if 'advanceLoanDeductionPerMonth' in data: emp.advance_loan_deduction_per_month = data['advanceLoanDeductionPerMonth']

    db.session.commit()
    return jsonify(emp.to_dict()), 200

@employees_bp.route('/<string:emp_id>', methods=['PATCH'])
def update_employee(emp_id):
    emp = Employee.query.filter((Employee.id == emp_id) | (Employee.emp_id == emp_id)).first()
    if not emp:
        return jsonify({'error': 'Employee not found'}), 404
    data = request.get_json() or {}
    fields = {
        'name': 'name', 'role': 'role', 'department': 'department', 'phone': 'phone',
        'joinDate': 'join_date', 'payType': 'pay_type', 'status': 'status', 'avatar': 'avatar',
    }
    for source, target in fields.items():
        if source in data:
            setattr(emp, target, data[source])
    db.session.commit()
    return jsonify(emp.to_dict()), 200

@employees_bp.route('/<string:emp_id>/advance-loan', methods=['POST'])
def grant_advance_loan(emp_id):
    emp = Employee.query.filter((Employee.id == emp_id) | (Employee.emp_id == emp_id)).first()
    if not emp:
        return jsonify({'error': 'Employee not found'}), 404

    data = request.get_json() or {}
    amount = float(data.get('amount', 0))
    deduction = float(data.get('monthlyDeduction', 50))

    emp.advance_loan_total = float(emp.advance_loan_total or 0) + amount
    emp.advance_loan_remaining = float(emp.advance_loan_remaining or 0) + amount
    emp.advance_loan_deduction_per_month = deduction

    db.session.commit()
    return jsonify(emp.to_dict()), 200

@employees_bp.route('/attendance', methods=['GET'])
def get_attendance():
    records = Attendance.query.order_by(Attendance.date.desc()).all()
    return jsonify([a.to_dict() for a in records]), 200

@employees_bp.route('/attendance', methods=['POST'])
def log_attendance():
    data = request.get_json() or {}
    record = Attendance(
        id=f"ATT-{Attendance.query.count() + 101}",
        emp_id=data.get('empId'),
        emp_name=data.get('empName'),
        date=data.get('date'),
        in_time=data.get('inTime', ''),
        out_time=data.get('outTime', ''),
        status=data.get('status', 'Present'),
        ot_hours=data.get('otHours', 0.0),
        notes=data.get('notes', ''),
    )
    db.session.add(record)
    db.session.commit()
    return jsonify(record.to_dict()), 201

@employees_bp.route('/attendance/<string:attendance_id>', methods=['PATCH'])
def update_attendance(attendance_id):
    record = Attendance.query.get(attendance_id)
    if not record:
        return jsonify({'error': 'Attendance record not found'}), 404

    data = request.get_json() or {}
    if data.get('action') == 'checkIn':
        record.in_time = datetime.now().strftime('%I:%M %p')
    elif data.get('action') == 'checkOut':
        record.out_time = datetime.now().strftime('%I:%M %p')

    if 'status' in data: record.status = data['status']
    if 'inTime' in data: record.in_time = data['inTime']
    if 'outTime' in data: record.out_time = data['outTime']
    if 'otHours' in data: record.ot_hours = data['otHours']
    if 'notes' in data: record.notes = data['notes']

    db.session.commit()
    return jsonify(record.to_dict()), 200
