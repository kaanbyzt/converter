import streamlit as st
import fitz  # PyMuPDF
from PIL import Image
import io
import zipfile

st.set_page_config(page_title="PDF Merkezi", page_icon="📄")
st.header("📄 Profesyonel PDF Merkezi")

tab1, tab2, tab3 = st.tabs(["🔗 PDF Birleştir", "🖼️ Resimden PDF'e", "🔍 PDF'ten Resim Çıkar"])

with tab1:
    st.subheader("PDF Dosyalarını Birleştir")
    uploaded_pdfs = st.file_uploader("PDF'leri seçin", type=["pdf"], accept_multiple_files=True, key="m1")
    if uploaded_pdfs and st.button("Hepsini Birleştir", key="b1"):
        merged_doc = fitz.open()
        for pdf_file in uploaded_pdfs:
            doc = fitz.open(stream=pdf_file.read(), filetype="pdf")
            merged_doc.insert_pdf(doc)
        output = io.BytesIO()
        merged_doc.save(output)
        st.download_button("⬇️ Birleşmiş PDF'i İndir", output.getvalue(), "birlesmis.pdf")
        st.balloons()

with tab2:
    st.subheader("Resimleri PDF'e Dönüştür")
    img_files = st.file_uploader("Resimleri yükle", type=["jpg", "png", "jpeg"], accept_multiple_files=True, key="m2")
    if img_files and st.button("PDF Oluştur", key="b2"):
        images = [Image.open(f).convert("RGB") for f in img_files]
        pdf_buf = io.BytesIO()
        images[0].save(pdf_buf, save_all=True, append_images=images[1:], format="PDF")
        st.download_button("⬇️ PDF İndir", pdf_buf.getvalue(), "gorsel_belge.pdf")
        st.balloons()

with tab3:
    st.subheader("PDF Sayfalarını Resim Olarak Ayıkla")
    single_pdf = st.file_uploader("PDF yükle", type=["pdf"], key="m3")
    if single_pdf and st.button("Resimleri Ayıkla", key="b3"):
        doc = fitz.open(stream=single_pdf.read(), filetype="pdf")
        zip_buf = io.BytesIO()
        with zipfile.ZipFile(zip_buf, "w") as zf:
            for i in range(len(doc)):
                pix = doc[i].get_pixmap()
                zf.writestr(f"sayfa_{i+1}.jpg", pix.tobytes("jpg"))
        st.download_button("⬇️ ZIP Olarak İndir", zip_buf.getvalue(), "pdf_resimleri.zip")