import os
from flask import Flask, render_template, request, send_file, jsonify
from io import BytesIO
from PyPDF2 import PdfMerger
import groq as groq_sdk

app = Flask(__name__)

GROQ_API_KEY = os.environ.get("GROQ_API_KEY")


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/mikrotik")
def mikrotik():
    return render_template("mikrotik_ai.html", active_page="ai")


@app.route("/mikrotik/nasil-kullanilir")
def mikrotik_guide():
    return render_template("mikrotik_guide.html", active_page="nasil-kullanilir")


@app.route("/mikrotik/api/ai", methods=["POST"])
def mikrotik_ai_api():
    data = request.get_json(silent=True) or {}
    prompt = data.get("prompt", "").strip()
    if not prompt:
        return jsonify({"success": False, "error": "Lütfen bir soru veya komut girin."}), 400
    try:
        client = groq_sdk.Groq(api_key=GROQ_API_KEY)
        completion = client.chat.completions.create(
            messages=[
                {
                    "role": "system",
                    "content": (
                        "Sen profesyonel bir MikroTik RouterOS uzmanı ve ağ mühendisisin. "
                        "Sadece ağ yönetimi, RouterOS v6/v7 komutları, firewall, routing ve kablosuz ağlar hakkında teknik destek sağla. "
                        "Cevaplarında mutlaka terminale kopyalanıp yapıştırılabilecek kod blokları kullan. "
                        "Başka konularda soru gelirse alanının olmadığını kibarca belirt. Türkçe cevap ver."
                    ),
                },
                {"role": "user", "content": prompt},
            ],
            model="llama3-70b-8192",
            temperature=0.5,
        )
        text = completion.choices[0].message.content or "Cevap üretilemedi."
        return jsonify({"success": True, "text": text})
    except Exception as e:
        return jsonify({"success": False, "error": "AI servisine ulaşılamıyor."}), 500


@app.route("/mikrotik/subnet")
def mikrotik_subnet():
    return render_template("mikrotik_subnet.html", active_page="subnet")


@app.route("/mikrotik/ip-guide")
def mikrotik_ip_guide():
    return render_template("mikrotik_ip_guide.html", active_page="ip-guide")


@app.route("/mikrotik/dhcp-server")
def mikrotik_dhcp():
    return render_template("mikrotik_dhcp.html", active_page="dhcp-server")


@app.route("/mikrotik/interface-ip")
def mikrotik_interface():
    return render_template("mikrotik_interface.html", active_page="interface-ip")


@app.route("/mikrotik/port-forward")
def mikrotik_port_forward():
    return render_template("mikrotik_port_forward.html", active_page="port-forward")


@app.route("/mikrotik/src-nat")
def mikrotik_src_nat():
    return render_template("mikrotik_src_nat.html", active_page="src-nat")


@app.route("/mikrotik/routing")
def mikrotik_routing():
    return render_template("mikrotik_routing.html", active_page="routing")


@app.route("/mikrotik/load-balance")
def mikrotik_load_balance():
    return render_template("mikrotik_load_balance.html", active_page="load-balance")


@app.route("/mikrotik/firewall")
def mikrotik_firewall():
    return render_template("mikrotik_firewall.html", active_page="firewall")


@app.route("/mikrotik/dns-security")
def mikrotik_dns():
    return render_template("mikrotik_dns.html", active_page="dns-security")


@app.route("/mikrotik/port-services")
def mikrotik_port_services():
    return render_template("mikrotik_port_services.html", active_page="port-services")


@app.route("/mikrotik/vpn")
def mikrotik_vpn():
    return render_template("mikrotik_vpn.html", active_page="vpn")


@app.route("/mikrotik/netwatch")
def mikrotik_netwatch():
    return render_template("mikrotik_netwatch.html", active_page="netwatch")


@app.route("/mikrotik/log-helper")
def mikrotik_log():
    return render_template("mikrotik_log.html", active_page="log-helper")


@app.route("/mikrotik/bandwidth-pcq")
def mikrotik_bandwidth():
    return render_template("mikrotik_bandwidth.html", active_page="bandwidth-pcq")


@app.route("/mikrotik/fasttrack")
def mikrotik_fasttrack():
    return render_template("mikrotik_fasttrack.html", active_page="fasttrack")


@app.route("/mikrotik/wifi-channels")
def mikrotik_wifi():
    return render_template("mikrotik_wifi.html", active_page="wifi-channels")


@app.route("/mikrotik/hardware-selector")
def mikrotik_hardware():
    return render_template("mikrotik_hardware.html", active_page="hardware-selector")


@app.route("/mikrotik/hotspot")
def mikrotik_hotspot():
    return render_template("mikrotik_hotspot.html", active_page="hotspot")


@app.route("/video-tools")
def video_tools():
    return render_template("video_tools.html")


@app.route("/audio-tools")
def audio_tools():
    return render_template("audio_tools.html")


@app.route("/pdf-tools", methods=["GET", "POST"])
def pdf_tools():
    if request.method == "GET":
        return render_template("pdf_tools.html", download_url=None, error=None)

    files = request.files.getlist("pdf_files")
    pdf_files = [f for f in files if f and f.filename.lower().endswith(".pdf")]

    if len(pdf_files) < 2:
        return render_template(
            "pdf_tools.html",
            download_url=None,
            error="Lütfen en az iki PDF dosyası yükleyin.",
        )

    merger = PdfMerger()
    for f in pdf_files:
        merger.append(f.stream)

    output = BytesIO()
    merger.write(output)
    merger.close()
    output.seek(0)

    return send_file(
        output,
        mimetype="application/pdf",
        as_attachment=True,
        download_name="toolboxquick-merged.pdf",
    )
