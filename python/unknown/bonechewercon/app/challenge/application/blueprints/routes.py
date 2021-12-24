from flask import render_template, request, flash, current_app, Blueprint, make_response, g
from application.models import submissions, session
from application.util import csp, check_if_authenticated, generate
import json

web = Blueprint('web', __name__)
jwk = Blueprint('jwk', __name__)
api = Blueprint('api', __name__)

@web.before_request
def check_404s():
	error_path = request.args.get('error_path', '')

	if error_path: 
		flash(f'{error_path} does not exist', 'danger')

	pass

@web.route('/', methods=['GET', 'POST'])
@check_if_authenticated()
def index():
	if request.method == 'POST':
		submissions.new(g.session.get('username'), request.form.get('idea', ''))
		flash('Presentation submitted successfully', 'success')
	
	return render_template('index.html')

@web.route('/list')
@check_if_authenticated(check_auth='admin', check_ip=True)
@csp
def list():
	return render_template('list.html')

@api.route('/list')
@check_if_authenticated(check_auth='admin', check_ip=True)
def gata():
	return {'submissions': submissions.getall()}

@api.route('/bot/login')
@check_if_authenticated(check_ip=True)
def botlogin():
	resp = make_response()
	resp.set_cookie('auth', session.create('admin', generate(16)))
	return resp

@api.route('/csp-report', methods=['POST'])
def csp_report():
	report = json.loads(request.get_data()).get('csp-report')
	
	submissions.report(report.get('blocked-uri'), report.get('violated-directive'), request.args.get('token', ''))
	return 'ok', 200

@jwk.route('/jwks.json')
def jwks():
	key = current_app.config.get('PUBLIC_KEY')
	kid = current_app.config.get('KID')
	return {
		'keys': [
			{
				'alg': 'RS256',
				'kty': 'RSA',
				'use': 'sig',
				'n': str(key.n),
				'e': str(key.e),
				'kid': kid
			}
		]
	}