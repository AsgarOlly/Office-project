from functools import wraps
from flask import jsonify
from flask_jwt_extended import get_jwt_identity, verify_jwt_in_request
from backend.app.models.user import User

def role_required(allowed_roles):
    """
    Decorator to restrict endpoint access based on user role_key (e.g., ['admin', 'manager'])
    """
    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            verify_jwt_in_request()
            user_id = get_jwt_identity()
            user = User.query.get(user_id)
            if not user or user.role_key not in allowed_roles:
                return jsonify({'error': 'Forbidden: Insufficient privileges for this action'}), 403
            return fn(*args, **kwargs)
        return wrapper
    return decorator

def admin_required():
    return role_required(['admin'])
