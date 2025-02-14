from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
import sqlite3

app = Flask(__name__)
CORS(app) # enable CORS


#Database
def init_db():
    connect = sqlite3.connect('database.db')
    cursor = connect.cursor()
    