from flask import Flask, render_template

app = Flask(__name__, template_folder='../templates', static_folder='../static')

@app.route('/')
def index():
    return render_template('index.html')

# Vercel için uygulama nesnesini dışarı açıyoruz
app = app