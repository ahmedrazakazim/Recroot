import os

class Config:
    SQLALCHEMY_DATABASE_URI = os.getenv('DATABASE_URL', 'mysql+pymysql://root:admin@localhost/recroot')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'recroot-jwt-secret-2026')
    SECRET_KEY = os.getenv('SECRET_KEY', 'recroot-super-secret-key-2026')