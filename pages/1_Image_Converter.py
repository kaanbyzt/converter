import streamlit as st
from PIL import Image
import io

st.set_page_config(page_title="Resim Çevirici", page_icon="🖼️")
st.header("🖼️ Resim Formatı Dönüştürücü")

img_file = st.file_uploader("Bir resim yükle", type=["png", "jpg", "jpeg", "webp", "tiff", "bmp", "ico"])

if img_file:
    original_image = Image.open(img_file)
    st.image(original_image, caption="Yüklenen Resim", width=300)
    hedef_format = st.selectbox("Hedef Format:", ["PNG", "JPEG", "WEBP", "ICO", "PDF"])
    
    if st.button("Dönüştür"):
        buf = io.BytesIO()
        if hedef_format == "JPEG":
            original_image.convert("RGB").save(buf, format="JPEG", quality=90)
            mime, ext = "image/jpeg", ".jpg"
        elif hedef_format == "PNG":
            original_image.save(buf, format="PNG")
            mime, ext = "image/png", ".png"
        elif hedef_format == "WEBP":
            original_image.save(buf, format="WEBP")
            mime, ext = "image/webp", ".webp"
        elif hedef_format == "ICO":
            # Birden fazla ikon boyutu desteği eklendi
            original_image.save(buf, format="ICO", sizes=[(16,16), (32,32), (64,64)])
            mime, ext = "image/x-icon", ".ico"
        elif hedef_format == "PDF":
            original_image.convert("RGB").save(buf, format="PDF")
            mime, ext = "application/pdf", ".pdf"

        st.success("İşlem Başarılı!")
        st.download_button(f"⬇️ {hedef_format} İndir", buf.getvalue(), f"tool_export{ext}", mime)
        st.balloons()