import os
from flask import Flask, render_template

# Klasör yollarını mutlak yol (absolute path) olarak tanımlayalım
template_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'templates'))
static_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'static'))

app = Flask(__name__, template_folder=template_dir, static_folder=static_dir)

@app.route('/')
def index():
    return render_template('index.html')

# Vercel için kritik satır
app = app