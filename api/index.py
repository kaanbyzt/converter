from flask import Flask, render_template, request, send_file
from io import BytesIO

from PyPDF2 import PdfMerger

app = Flask(__name__)


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/mikrotik")
def mikrotik():
    return render_template("mikrotik.html")


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