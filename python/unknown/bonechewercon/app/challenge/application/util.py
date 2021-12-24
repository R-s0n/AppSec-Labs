from application.models import user, session
from flask import request, g, make_response, redirect, abort
import string, functools, random

generate = lambda x: ''.join([random.choice(string.hexdigits) for _ in range(x)])

SETTINGS_REPORT_CSP = {
	
	'default-src': [
		'\'self\''
	],

	'frame-ancestors': [
		'\'none\''
	],

	'object-src': [
		'\'none\''
	], 

	'base-uri': [
		'\'none\''
	]

}

SETTINGS_SECURITY_PRACTICES = {

	'Cache-Control': [
		'no-cache, no-store, must-revalidate'
	],

	'Pragma': [
		'no-cache'
	],

	'Expires': [
		'0'
	]

}

def make_csp_header(settings, report_uri=None):
	header = ''

	for directive, policies in settings.items():
		
		header += f'{directive} '
		header += ' '.join(
			(policy for policy in policies)
		)
		header += '; '

	if report_uri:
		header += f'report-uri {report_uri};'

	return header

def csp(func):
	@functools.wraps(func)
	def headers(*args, **kwargs):
		response = make_response(func(*args, **kwargs))

		REPORT_URI = f"/api/csp-report?token={g.session.get('token')}"
	
		if SETTINGS_REPORT_CSP:
			response.headers[
				'Content-Security-Policy'
			] = make_csp_header(SETTINGS_REPORT_CSP, REPORT_URI)
	
		if SETTINGS_SECURITY_PRACTICES:
			for header, directive in SETTINGS_SECURITY_PRACTICES.items():
				response.headers[header] = directive[0]
	
		return response
	return headers

def check_if_authenticated(check_auth=False, check_ip=False):
	def decorator(func):
		@functools.wraps(func)
		def authenticate(*args, **kwargs):
			if 'auth' not in request.cookies:
				resp = make_response(redirect(request.path))

				username = f'guest_{generate(10)}'
				while user.username_exists(username):
					username = f'guest_{generate(10)}'

				token = generate(16)
				while user.token_exists(token):
					token = generate(16)

				user.add(username, token)
				
				resp.set_cookie('auth', session.create(username, token))
				return resp

			g.session = session.decode(request.cookies.get('auth'))

			if check_auth and g.session.get('username') != check_auth:
			 	return abort(403, f'You are not {check_auth}')

			if check_ip and not request.remote_addr == '127.0.0.1':
			 	return abort(403, 'Your IP is not allowed')

			return func(*args, **kwargs)
		return authenticate
	return decorator