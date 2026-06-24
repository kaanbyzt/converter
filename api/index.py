import os
import zipfile
import uuid
from flask import Flask, render_template, request, send_file, jsonify
from io import BytesIO
from PyPDF2 import PdfMerger, PdfReader, PdfWriter

app = Flask(__name__)


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/mikrotik")
def mikrotik():
    return render_template("mikrotik.html", active_page="dashboard")


@app.route("/mikrotik/nasil-kullanilir")
def mikrotik_guide():
    return render_template("mikrotik_guide.html", active_page="nasil-kullanilir")


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


@app.route("/pdf-tools/split", methods=["GET", "POST"])
def pdf_split():
    if request.method == "GET":
        return render_template("pdf_split.html", error=None)

    file = request.files.get("pdf_file")
    range_str = request.form.get("page_range", "").strip()

    if not file or not file.filename.lower().endswith(".pdf"):
        return render_template("pdf_split.html", error="Lütfen geçerli bir PDF dosyası seçin.")

    if not range_str:
        return render_template("pdf_split.html", error="Lütfen ayıklanacak sayfa aralığını belirtin.")

    try:
        reader = PdfReader(file.stream)
        max_pages = len(reader.pages)
        
        # Parse range
        pages_to_keep = set()
        for part in range_str.split(','):
            part = part.strip()
            if '-' in part:
                start, end = part.split('-')
                start_idx = int(start.strip()) - 1
                end_idx = int(end.strip()) - 1
                for p in range(max(0, start_idx), min(max_pages, end_idx + 1)):
                    pages_to_keep.add(p)
            else:
                p_idx = int(part) - 1
                if 0 <= p_idx < max_pages:
                    pages_to_keep.add(p_idx)
                    
        sorted_pages = sorted(list(pages_to_keep))
        if not sorted_pages:
            return render_template("pdf_split.html", error="Belirtilen aralıkta geçerli sayfa bulunamadı.")

        writer = PdfWriter()
        for p in sorted_pages:
            writer.add_page(reader.pages[p])

        output = BytesIO()
        writer.write(output)
        output.seek(0)

        return send_file(
            output,
            mimetype="application/pdf",
            as_attachment=True,
            download_name="toolboxquick-split.pdf",
        )
    except Exception as e:
        return render_template("pdf_split.html", error=f"Hata oluştu: {str(e)}")


@app.route("/audio-tools/trim")
def audio_trim():
    return render_template("audio_trim.html")


@app.route("/audio-tools/record")
def audio_record():
    return render_template("audio_record.html")


@app.route("/video-tools/screen-record")
def video_screen_record():
    return render_template("video_screen_record.html")


@app.route("/convert/image")
def convert_image():
    return render_template("convert_image.html")


# Temporary directory setup for ZIP extractor
TEMP_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "temp_zips")
os.makedirs(TEMP_DIR, exist_ok=True)


@app.route("/pdf-tools/protect", methods=["GET", "POST"])
def pdf_protect():
    if request.method == "GET":
        return render_template("pdf_protect.html", error=None)

    file = request.files.get("pdf_file")
    password = request.form.get("password")

    if not file or not file.filename.lower().endswith(".pdf"):
        return render_template("pdf_protect.html", error="Lütfen geçerli bir PDF dosyası seçin.")

    if not password:
        return render_template("pdf_protect.html", error="Lütfen bir şifre belirleyin.")

    try:
        reader = PdfReader(file.stream)
        writer = PdfWriter()

        for page in reader.pages:
            writer.add_page(page)

        writer.encrypt(password)

        output = BytesIO()
        writer.write(output)
        output.seek(0)

        return send_file(
            output,
            mimetype="application/pdf",
            as_attachment=True,
            download_name="toolboxquick-protected.pdf"
        )
    except Exception as e:
        return render_template("pdf_protect.html", error=f"Hata oluştu: {str(e)}")


@app.route("/pdf-tools/unlock", methods=["GET", "POST"])
def pdf_unlock():
    if request.method == "GET":
        return render_template("pdf_unlock.html", error=None)

    file = request.files.get("pdf_file")
    password = request.form.get("password")

    if not file or not file.filename.lower().endswith(".pdf"):
        return render_template("pdf_unlock.html", error="Lütfen geçerli bir PDF dosyası seçin.")

    if not password:
        return render_template("pdf_unlock.html", error="Lütfen şifreyi girin.")

    try:
        reader = PdfReader(file.stream)

        if not reader.is_encrypted:
            return render_template("pdf_unlock.html", error="Bu PDF dosyası zaten şifreli değil.")

        decryption_result = reader.decrypt(password)
        if decryption_result == 0:
            return render_template("pdf_unlock.html", error="Hatalı şifre. Lütfen tekrar deneyin.")

        writer = PdfWriter()
        for page in reader.pages:
            writer.add_page(page)

        output = BytesIO()
        writer.write(output)
        output.seek(0)

        return send_file(
            output,
            mimetype="application/pdf",
            as_attachment=True,
            download_name="toolboxquick-unlocked.pdf"
        )
    except Exception as e:
        return render_template("pdf_unlock.html", error=f"Hata oluştu: {str(e)}")


@app.route("/audio-tools/volume")
def audio_volume():
    return render_template("audio_volume.html")


@app.route("/audio-tools/speed")
def audio_speed():
    return render_template("audio_speed.html")


@app.route("/video-tools/rotate")
def video_rotate():
    return render_template("video_rotate.html")


@app.route("/video-tools/trim")
def video_trim():
    return render_template("video_trim.html")


@app.route("/video-tools/merge")
def video_merge():
    return render_template("video_merge.html")


@app.route("/convert/audio")
def convert_audio():
    return render_template("convert_audio.html")


@app.route("/convert/video")
def convert_video():
    return render_template("convert_video.html")


@app.route("/convert/extract", methods=["GET", "POST"])
def convert_extract():
    if request.method == "GET":
        return render_template("convert_extract.html", files=None, error=None)

    file = request.files.get("zip_file")
    if not file or not file.filename.lower().endswith(".zip"):
        return render_template("convert_extract.html", files=None, error="Lütfen geçerli bir ZIP dosyası seçin.")

    try:
        zip_id = str(uuid.uuid4())
        zip_path = os.path.join(TEMP_DIR, f"{zip_id}.zip")
        file.save(zip_path)

        files_list = []
        with zipfile.ZipFile(zip_path, 'r') as zip_ref:
            for info in zip_ref.infolist():
                if not info.is_dir():
                    files_list.append({
                        "name": info.filename,
                        "size": info.file_size
                    })

        return render_template(
            "convert_extract.html",
            files=files_list,
            zip_id=zip_id,
            archive_name=file.filename,
            error=None
        )
    except Exception as e:
        return render_template("convert_extract.html", files=None, error=f"Hata oluştu: {str(e)}")


@app.route("/convert/extract/download")
def convert_extract_download():
    zip_id = request.args.get("id")
    file_path = request.args.get("file")

    if not zip_id or not file_path:
        return "Geçersiz istek.", 400

    zip_path = os.path.join(TEMP_DIR, f"{zip_id}.zip")
    if not os.path.exists(zip_path):
        return "Arşiv bulunamadı veya süresi dolmuş.", 404

    try:
        with zipfile.ZipFile(zip_path, 'r') as zip_ref:
            if file_path not in zip_ref.namelist():
                return "Dosya arşiv içinde bulunamadı.", 404

            data = zip_ref.read(file_path)
            io_buf = BytesIO(data)
            basename = os.path.basename(file_path)
            
            return send_file(
                io_buf,
                as_attachment=True,
                download_name=basename
            )
    except Exception as e:
        return f"İndirme sırasında hata oluştu: {str(e)}", 500
