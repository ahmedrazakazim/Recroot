import os

class Config:
    database_url = os.getenv('DATABASE_URL', 'mysql+pymysql://root:admin@localhost/recroot')
    
    # Aiven MySQL requires SSL
    ssl_args = {}
    if 'aivencloud.com' in database_url:
        ssl_args = {'ssl': {'ca': None}}  # Accept SSL without custom CA
    
    SQLALCHEMY_DATABASE_URI = database_url
    SQLALCHEMY_ENGINE_OPTIONS = {'connect_args': ssl_args} if ssl_args else {}
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'recroot-jwt-secret-2026')
    SECRET_KEY = os.getenv('SECRET_KEY', 'recroot-super-secret-key-2026')