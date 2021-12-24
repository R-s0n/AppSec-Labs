from flask import Flask, g
from application.database import get_db
from application.blueprints.routes import web, jwk, api

class HTB(Flask):
    def process_response(self, response):
        response.headers['Server'] = 'Hell'
        super(HTB, self).process_response(response)
        return response

app = HTB(__name__)
app.config.from_object('application.config.Config')

app.register_blueprint(web, url_prefix='/')
app.register_blueprint(jwk, url_prefix='/.well-known')
app.register_blueprint(api, url_prefix='/api')

@app.before_first_request
def init_db():
    with app.open_resource('schema.sql', mode='r') as f:
        get_db().cursor().executescript(f.read())

@app.teardown_appcontext
def close_connection(exception):
    db = getattr(g, '_database', None)
    if db is not None: db.close()

@app.errorhandler(Exception)
def handle_error(error):
    message = error.description if hasattr(error, 'description') else [str(x) for x in error.args]
    response = {
        'error': {
            'type': error.__class__.__name__,
            'message': message
        }
    }

    return response, error.code if hasattr(error, 'code') else 500