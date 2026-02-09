import streamlit as st
import qrcode
import io

st.set_page_config(page_title="QR Kod", page_icon="🔗")
st.header("🔗 QR Kod Oluşturucu")

qr_text = st.text_input("Link veya Metin Gir:", "https://toolboxquick.streamlit.app/")
col1, col2 = st.columns(2)
with col1: qr_color = st.color_picker("QR Rengi", "#000000")
with col2: bg_color = st.color_picker("Arka Plan", "#FFFFFF")
    
if st.button("QR Kod Oluştur"):
    qr = qrcode.QRCode(version=1, box_size=10, border=4)
    qr.add_data(qr_text)
    qr.make(fit=True)
    img_qr = qr.make_image(fill_color=qr_color, back_color=bg_color)
    st.image(img_qr.get_image(), width=300)
    buf = io.BytesIO()
    img_qr.save(buf, format="PNG")
    st.download_button("⬇️ PNG İndir", buf.getvalue(), "qr_kod.png")