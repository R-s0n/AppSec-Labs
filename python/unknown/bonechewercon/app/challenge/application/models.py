from application.database import query_db
from flask import abort, current_app
import jwt, datetime, requests, json, re

scheme_chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789+-.'
SCHEME_RE = re.compile(r'^([' + scheme_chars + ']+:)?//')

class submissions(object):

	@staticmethod
	def getall():
		return query_db('SELECT * FROM presentations')

	@staticmethod
	def report(blocked_uri, document_uri, token):
		return query_db('INSERT INTO reports (blocked_uri, document_uri, token) VALUES (?, ?, ?)', (blocked_uri, document_uri, token))

	@staticmethod
	def new(username, idea):
		return query_db('INSERT INTO presentations (user, idea) VALUES (?, ?)', (username, idea))

class user(object):

	@staticmethod
	def username_exists(username):
		return len(query_db('SELECT 1 FROM users WHERE user = ?', (username,))) == 1

	@staticmethod
	def token_exists(token):
		return len(query_db('SELECT 1 FROM users WHERE token = ?', (token,))) == 1

	@staticmethod
	def add(username, token):
		return query_db('INSERT INTO users (user, token) VALUES (?, ?)', (username, token))

class session(object):

	@staticmethod
	def create(user, token):
		return jwt.encode(
			{
				'username': user, 
				'token': token,
				'iat': datetime.datetime.utcnow(),
				'exp': datetime.datetime.utcnow() + datetime.timedelta(days=0, hours=6, seconds=0)
			},
			current_app.config.get('PRIVATE_KEY'), 
			algorithm='RS256', headers={
				'jku': 'http://localhost/.well-known/jwks.json',
				'kid': current_app.config.get('KID')}
		)

	@staticmethod
	def fetch_jku(url):
		domain = SCHEME_RE.sub('', url).partition('/')[0]
		scheme = re.match(SCHEME_RE, url)
		
		if not scheme or not filter(lambda x: scheme.group(0) in x, ('http://', 'https://')):
			return abort(400, 'Invalid scheme')

		if '@' in url:
			domain = domain.split('@')[1]

		if ':' in domain:
			domain, port = domain.split(':')

		if 'port' in locals() and not filter(lambda x: port in x, ('80', '8080', '5000')):
			return abort(400, 'Invalid port')

		if not domain == current_app.config.get('AUTH_PROVIDER'):
			return abort(400, 'Invalid provider')

		jwks = requests.get(url)

		if not jwks.url.endswith('jwks.json'):
			return abort(400, 'Invalid jwks endpoint')

		if not jwks.status_code == 200:
			return abort(500, 'Invalid response status code from provider')

		if not jwks.headers.get('Content-Type', '') == 'application/json':
			return abort(500, 'Invalid response from provider')

		return jwks.json()

	@staticmethod
	def get_jwk(url, kid):
		jwks = session.fetch_jku(url)

		if not jwks or not isinstance(jwks, dict):
			return abort(400, 'Invalid jwk response')

		public_keys = {}

		for jwk in jwks.get('keys'):

			if not jwk['alg'] == 'RS256':
				return abort(400, 'Invalid key algorithm')

			if not set(('e', 'n')).issubset(jwk):
				return abort(400, 'Missing exponent and/or modulus')

			for field in ['e', 'n']:
				if jwk[field].isdigit():
					jwk[field] = jwt.utils.to_base64url_uint(int(jwk[field])).decode()
				else:
					return abort(400, 'Invalid exponent and/or modulus')


			public_keys[jwk['kid']] = jwt.algorithms.RSAAlgorithm.from_jwk(json.dumps(jwk))

		if kid not in public_keys:
			return abort(400, 'Invalid key-id')
	
		return public_keys[kid]

	@staticmethod
	def decode(jwt_token):
		kid = jwt.get_unverified_header(jwt_token).get('kid', '')

		if not kid:
			return abort(400, 'Missing header key-id')
		
		jku = jwt.get_unverified_header(jwt_token).get('jku', '')

		if not jku:
			return abort(400, 'Missing header jku')

		sess = jwt.decode(jwt_token, key=session.get_jwk(jku, kid), algorithms=['RS256'])
		
		if not set(('username', 'token')).issubset(sess):
			return abort(400, 'Username or token is missing')

		return sess