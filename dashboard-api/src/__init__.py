import quart.flask_patch
from flask import Flask
from flask_session import Session
from datetime import timedelta

app = Flask(__name__)
app.config['DEBUG'] = False
session = Session(app)
