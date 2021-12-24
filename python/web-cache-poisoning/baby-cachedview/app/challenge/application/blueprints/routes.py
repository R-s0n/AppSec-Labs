from flask import Blueprint, request, render_template, abort, send_file
from application.util import cache_web, is_from_localhost

web = Blueprint('web', __name__)
api = Blueprint('api', __name__)

@web.route('/')
def index():
    return render_template('index.html')

@api.route('/cache', methods=['POST'])
def cache():
    if not request.is_json or 'url' not in request.json:
        return abort(400)
    
    return cache_web(request.json['url'])

@web.route('/flag')
@is_from_localhost
def flag():
    return send_file('flag.png')