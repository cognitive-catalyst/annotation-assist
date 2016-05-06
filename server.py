from flask import Flask, request, Response, send_from_directory
from functools import wraps
import ConfigParser
import api
import os

app = Flask(__name__, template_folder='.')
app.register_blueprint(api.blueprint, url_prefix='/api')

config = ConfigParser.ConfigParser()
config.read('config/properties.ini')


def check_auth(username, password):
    """This function is called to check if a username /
    password combination is valid.
    """
    return username == config.get('properties', 'username') and password == config.get('properties', 'password')


def authenticate():
    """Sends a 401 response that enables basic auth"""
    return Response(
        'Could not verify your access level for that URL.\n'
        'You have to login with proper credentials', 401,
        {'WWW-Authenticate': 'Basic realm="Login Required"'})


def requires_auth(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        auth = request.authorization
        if not auth or not check_auth(auth.username, auth.password):
            return authenticate()
        return f(*args, **kwargs)
    return decorated


@app.route('/')
@app.route('/vis')
@app.route('/uploading')
@app.route('/downloading')
@requires_auth
def html():
    ''' Serves the index.html file for frontend views'''
    return send_from_directory(".", "index.html")


@app.route("/static/build/bundle.js")
def bundle():
    ''' Serves the bundle.js file that controls the frontend view'''
    return send_from_directory("static/build", "bundle.js")


if __name__ == '__main__':
    port = os.getenv('VCAP_APP_PORT', '8080')
    app.run(host='0.0.0.0', port=int(port), debug=True, processes=4)
