import streamlit as st
import pandas as pd
import io

st.set_page_config(page_title="Excel & CSV Converter", page_icon="📊")
st.header("📊 Excel ↔ CSV Dönüştürücü")

uploaded_file = st.file_uploader("Dosya yükleyin", type=["csv", "xlsx", "xls"])
if uploaded_file:
    df = pd.read_csv(uploaded_file) if uploaded_file.name.endswith(".csv") else pd.read_excel(uploaded_file)
    st.dataframe(df.head(), use_container_width=True)
    
    if uploaded_file.name.endswith(".csv"):
        if st.button("Excel'e Çevir"):
            output = io.BytesIO()
            with pd.ExcelWriter(output, engine='openpyxl') as writer:
                df.to_excel(writer, index=False)
            st.download_button("⬇️ Excel İndir", output.getvalue(), "veri.xlsx")
    else:
        if st.button("CSV'ye Çevir"):
            csv_data = df.to_csv(index=False).encode('utf-8')
            st.download_button("⬇️ CSV İndir", csv_data, "veri.csv")