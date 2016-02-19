from flask import Flask, request, send_file, redirect, send_from_directory, Blueprint
import api

import os

app = Flask(__name__, template_folder='.')
app.register_blueprint(api.blueprint, url_prefix='/api')


@app.route('/')
@app.route('/vis')
@app.route('/uploading')
@app.route('/downloading')
def html():
    ''' Serves the index.html file for frontend views'''
    return send_from_directory(".", "index.html")


@app.route("/static/build/bundle.js")
def bundle():
    ''' Serves the bundle.js file that controls the frontend view'''
    return send_from_directory("static/build", "bundle.js")


if __name__ == '__main__':
    port = os.getenv('VCAP_APP_PORT', '8000')
    app.run(host='0.0.0.0', port=int(port), debug=True, threaded=True)
