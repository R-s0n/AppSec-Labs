from application.util import generate
from Crypto.PublicKey import RSA
from uuid import uuid4

class Config(object):
	SECRET_KEY = generate(69)
	KEY = RSA.generate(2048)
	PUBLIC_KEY = KEY.publickey()
	PRIVATE_KEY = KEY.export_key('PEM')
	KID = str(uuid4())
	AUTH_PROVIDER = 'localhost'

class ProductionConfig(Config):
	pass

class DevelopmentConfig(Config):
	DEBUG = True

class TestingConfig(Config):
	TESTING = True