from datetime import datetime
from backend.app.extensions import db

class LedgerEntry(db.Model):
    __tablename__ = 'ledger_entries'

    id = db.Column(db.String(50), primary_key=True)
    date = db.Column(db.String(50), nullable=False) # YYYY-MM-DD
    type = db.Column(db.String(30), nullable=False) # Credit / Debit
    category = db.Column(db.String(100), nullable=True, default='General')
    party_type = db.Column(db.String(100), nullable=True) # Supplier, Customer, Expense
    party_name = db.Column(db.String(150), nullable=True)
    description = db.Column(db.String(255), nullable=False)
    amount = db.Column(db.Numeric(10, 2), nullable=False, default=0.00)
    balance_after = db.Column(db.Numeric(12, 2), nullable=True, default=0.00)
    reference = db.Column(db.String(100), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'date': self.date,
            'type': self.type,
            'category': self.category or self.party_type or 'General',
            'partyType': self.party_type or self.category or 'Expense',
            'partyName': self.party_name or self.description,
            'description': self.description,
            'amount': float(self.amount) if self.amount is not None else 0.0,
            'balance': float(self.balance_after) if self.balance_after is not None else 0.0,
            'balanceAfter': float(self.balance_after) if self.balance_after is not None else 0.0,
            'refNo': self.reference or '',
            'reference': self.reference or '',
        }

class ProductStage(db.Model):
    __tablename__ = 'product_stages'

    id = db.Column(db.String(50), primary_key=True)
    booking_id = db.Column(db.String(50), db.ForeignKey('order_bookings.id', ondelete='SET NULL'), nullable=True, index=True)
    batch_no = db.Column(db.String(50), unique=True, nullable=False, index=True)
    client_name = db.Column(db.String(150), nullable=True)
    garment_type = db.Column(db.String(150), nullable=False)
    quantity = db.Column(db.Integer, default=1)
    current_stage = db.Column(db.String(100), nullable=False) # Pattern Making, Cutting, Stitching, Trial, QC, Ready
    assigned_to = db.Column(db.String(150), nullable=True)
    start_date = db.Column(db.String(50), nullable=True)
    target_date = db.Column(db.String(50), nullable=True)
    progress = db.Column(db.Integer, default=0) # percentage
    priority = db.Column(db.String(30), default='Medium') # High, Medium, Low
    fabric_code = db.Column(db.String(100), nullable=True)
    qc_status = db.Column(db.String(50), nullable=True)
    notes = db.Column(db.Text, nullable=True)
    history = db.Column(db.JSON, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    booking = db.relationship('OrderBooking', back_populates='product_stages')

    def to_dict(self):
        return {
            'id': self.id,
            'bookingId': self.booking_id,
            'bookingNo': self.booking.booking_no if self.booking else None,
            'batchNo': self.batch_no,
            'client': self.client_name or '',
            'clientName': self.client_name or '',
            'garmentType': self.garment_type,
            'quantity': self.quantity,
            'currentStage': self.current_stage,
            'assignedTo': self.assigned_to,
            'startDate': self.start_date,
            'targetDate': self.target_date,
            'deliveryDate': self.target_date,
            'progress': self.progress,
            'priority': self.priority,
            'fabricCode': self.fabric_code,
            'qcStatus': self.qc_status,
            'notes': self.notes,
            'history': self.history or [],
        }

