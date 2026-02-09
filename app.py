from flask import Flask, render_template, request

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/mikrotik', methods=['GET', 'POST'])
def mikrotik():
    script = ""
    if request.method == 'POST':
        ip = request.form.get('ip', '192.168.88.1/24')
        bridge = request.form.get('bridge', 'bridge-local')
        # Script mantığını burada genişletebiliriz
        script = f"/interface bridge add name={bridge}\n/ip address add address={ip} interface={bridge}\n/ip dns set allow-remote-requests=yes servers=8.8.8.8"
    
    return render_template('mikrotik.html', script=script)

if __name__ == '__main__':
    app.run()