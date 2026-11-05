"""Birden fazla sayfanın kullandığı ortak mesajlar."""

PAGES = {
    "tr": {
        "video_common.bad_file": "Bu video açılamadı. Dosya bozuk olabilir veya tarayıcınız bu formatı desteklemiyor olabilir.",
        "video_common.unsupported": "Tarayıcınız video kaydetmeyi desteklemiyor. Lütfen Chrome, Edge veya Firefox'un güncel sürümünü kullanın.",
        "video_common.export_failed": "Video işlenirken bir hata oluştu. Lütfen başka bir dosyayla tekrar deneyin.",
        "common.range_invalid": "Başlangıç saniyesi, bitiş saniyesinden küçük olmalıdır.",

        "upload.too_large": "Dosya çok büyük. Bu araç toplamda en fazla 4 MB kabul ediyor; lütfen daha küçük bir dosya seçin.",
        "upload.hint": "Toplam en fazla 4 MB. Dosya işlem için sunucuya gönderilir ve saklanmaz.",

        "error.back_to_tools": "Araçlara dön",
        "error.404_title": "Sayfa bulunamadı",
        "error.404_message": "Aradığınız sayfa taşınmış veya hiç var olmamış olabilir.",
        "error.500_title": "Bir şeyler ters gitti",
        "error.500_message": "Beklenmeyen bir hata oluştu. Lütfen biraz sonra tekrar deneyin.",

        "pdf_compress.note_text_kept": "Metinler seçilebilir kalır, sayfa boyutu değişmez. Küçültme PDF içindeki görseller üzerinde yapılır; görsel içermeyen PDF'ler az küçülür.",
        "pdf_compress.result_saved": "{before} → {after} (%{pct} küçüldü)",
        "pdf_compress.result_none": "Bu PDF daha fazla küçültülemedi, orijinal dosya indirildi.",

        "pdf_office.desc_server": "(Dosyanız dönüştürme için sunucuya gönderilir ve saklanmaz.)",
        "pdf_office.err_invalid_file": "Dosya okunamadı. Bozuk olabilir veya seçilen formatta olmayabilir.",

        "video_editor.stabilize_note_v2": "Sarsıntıyı azaltmak için görüntü yaklaşık %14 yakınlaştırılır. Hafif titremelerde en iyi sonucu verir.",

        "convert_image.err_load": "Resim yüklenemedi, dosya bozuk veya desteklenmiyor.",
        "convert_image.tiff_redirect": "TIFF dosyaları bu araçta açılamıyor. TIFF Dönüştürücü'ye gitmek ister misiniz?",

        "mk_load_balance.label_version": "RouterOS Sürümü",
        "mk_load_balance.label_gateways": "WAN Ağ Geçitleri (virgülle ayırın)",
        "mk_load_balance.comment_tables": "Yönlendirme tabloları (RouterOS v7)",
        "mk_load_balance.comment_failover": "Yedek varsayılan rotalar",
        "mk_dhcp.label_prefix": "Ağ Maskesi (ön ek)",
        "notice.privacy": "Yüklediğiniz belge, evrak ve görseller saklanmaz. Çoğu işlem tarayıcınızda yapılır; PDF birleştirme, bölme, şifreleme, PDF→Word, PPT→PDF ve arşiv dönüştürme dosyayı sunucuda anlık işler.",
        "travel.nearby.list_partial": "Yedek kaynak kullanıldı, liste eksik olabilir. Google Haritalar bağlantısıyla da kontrol edebilirsiniz.",
        "convert_tiff.file_page": "sayfa",
        "convert_tiff.file_pages": "sayfalar",
    },
    "en": {
        "home.popular.title": "Most Used Tools",
        "home.search.placeholder": "Search for a tool... (e.g. merge pdf)",
        "home.search.no_results": "No results found.",

        "video_common.bad_file": "This video could not be opened. The file may be damaged, or your browser may not support this format.",
        "video_common.unsupported": "Your browser does not support saving video. Please use a current version of Chrome, Edge or Firefox.",
        "video_common.export_failed": "Something went wrong while processing the video. Please try again with another file.",
        "common.range_invalid": "The start second must be smaller than the end second.",

        "upload.too_large": "The file is too large. This tool accepts up to 4 MB in total; please choose a smaller file.",
        "upload.hint": "Up to 4 MB in total. The file is sent to the server for processing and is not stored.",

        "error.back_to_tools": "Back to tools",
        "error.404_title": "Page not found",
        "error.404_message": "The page you are looking for may have moved or may never have existed.",
        "error.500_title": "Something went wrong",
        "error.500_message": "An unexpected error occurred. Please try again in a moment.",

        "pdf_compress.note_text_kept": "Text stays selectable and the page size does not change. Compression applies to images inside the PDF, so PDFs without images shrink very little.",
        "pdf_compress.result_saved": "{before} → {after} ({pct}% smaller)",
        "pdf_compress.result_none": "This PDF could not be made any smaller, so the original file was downloaded.",

        "pdf_office.desc_server": "(Your file is sent to the server for conversion and is not stored.)",
        "pdf_office.err_invalid_file": "The file could not be read. It may be damaged or not in the selected format.",

        "video_editor.stabilize_note_v2": "To reduce shake, the picture is zoomed in by about 14%. It works best on light shake.",

        "convert_image.err_load": "The image could not be loaded. The file is damaged or not supported.",
        "convert_image.tiff_redirect": "TIFF files cannot be opened in this tool. Would you like to go to the TIFF Converter?",

        "mk_load_balance.label_version": "RouterOS Version",
        "mk_load_balance.label_gateways": "WAN Gateways (comma separated)",
        "mk_load_balance.comment_tables": "Routing tables (RouterOS v7)",
        "mk_load_balance.comment_failover": "Backup default routes",
        "mk_dhcp.label_prefix": "Network Prefix",
        "notice.privacy": "Documents, files and images you upload are not stored. Most tools run in your browser; PDF merge, split, password, PDF to Word, PPT to PDF and archive conversion process the file briefly on the server.",
        "travel.nearby.list_partial": "A backup source was used, so this list may be incomplete. You can also check with the Google Maps link.",
        "convert_tiff.file_page": "page",
        "convert_tiff.file_pages": "pages",
    },
}
