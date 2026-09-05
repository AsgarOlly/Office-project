import os
from dotenv import load_dotenv

# Load environment variables from .env located in backend/
backend_dir = os.path.abspath(os.path.dirname(os.path.dirname(__file__)))
load_dotenv(os.path.join(backend_dir, '.env'))

class Config:
    SECRET_KEY = os.getenv('SECRET_KEY', 'default-session-secret-key')
    SQLALCHEMY_DATABASE_URI = os.getenv(
        'DATABASE_URL', 
        'mysql+pymysql://root:@localhost:3306/garment_erp?charset=utf8mb4'
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'jwt-secret-key')
    JWT_ACCESS_TOKEN_EXPIRES = 86400  # 24 hours in seconds
    JSON_SORT_KEYS = False
