import streamlit as st
from rembg import remove
from PIL import Image
import io

st.set_page_config(page_title="Arka Plan Silici", page_icon="🪄")
st.header("🪄 AI Arka Plan Silme")

file = st.file_uploader("Resim Yükle", type=["jpg", "jpeg", "png", "webp"])
if file:
    image = Image.open(file)
    if st.button("Arka Planı Temizle"):
        with st.spinner("İşleniyor..."):
            output = remove(io.BytesIO(file.getvalue()).read())
            st.image(Image.open(io.BytesIO(output)), caption="Sonuç")
            st.download_button("⬇️ Şeffaf PNG İndir", output, "no_bg.png", "image/png")
            st.balloons()