from flask import Flask

app = Flask(__name__)

@app.route('/')
def index():
    return "Kaan Byzt Toolbox - Sunucu Calisiyor!"

# Bu satır Vercel'in uygulamayı tanıması için hayatidir
app = app