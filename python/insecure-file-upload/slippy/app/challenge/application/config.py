from application.util import generate
from os.path import abspath

class Config(object):
    SECRET_KEY = generate(50)
    UPLOAD_FOLDER = '/app/application/static/archives'

class ProductionConfig(Config):
    pass

class DevelopmentConfig(Config):
    DEBUG = True

class TestingConfig(Config):
    TESTING = True