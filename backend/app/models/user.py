from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash
from backend.app.extensions import db

class User(db.Model):
    __tablename__ = 'users'

    id = db.Column(db.String(50), primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    name = db.Column(db.String(120), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=True)
    role = db.Column(db.String(80), nullable=False) # e.g. Store Owner & Managing Director
    role_key = db.Column(db.String(40), nullable=False, default='admin') # admin, manager, tailor, cashier
    avatar = db.Column(db.String(10), default='👤')
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        # Fallback to plain text comparison only for initial seed dev migration if needed, otherwise secure hash
        if self.password_hash.startswith('scrypt:') or self.password_hash.startswith('pbkdf2:'):
            return check_password_hash(self.password_hash, password)
        return self.password_hash == password

    def to_dict(self):
        return {
            'id': self.id,
            'username': self.username,
            'name': self.name,
            'email': self.email,
            'role': self.role,
            'roleKey': self.role_key,
            'avatar': self.avatar,
            'isActive': self.is_active,
        }
