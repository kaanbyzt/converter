/*
 * jsPDF için Unicode font yardımcısı.
 * jsPDF'in varsayılan fontu (Helvetica) Türkçe karakterleri (ş, ğ, ı, İ) çizemez;
 * bu yardımcı DejaVu Sans'ı bir kez indirip her yeni belgeye ekler.
 * Kullanım: const pdf = new jsPDF(); await useUnicodeFont(pdf);
 */
(function () {
    'use strict';

    var FONT_URL = '/static/fonts/DejaVuSans.ttf';
    var FONT_FILE = 'DejaVuSans.ttf';
    var FONT_NAME = 'DejaVuSans';
    var fontBase64 = null;

    function toBase64(buffer) {
        var bytes = new Uint8Array(buffer);
        var chunks = [];
        for (var i = 0; i < bytes.length; i += 0x8000) {
            chunks.push(String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000)));
        }
        return btoa(chunks.join(''));
    }

    window.useUnicodeFont = async function (pdf) {
        if (!fontBase64) {
            var resp = await fetch(FONT_URL);
            if (!resp.ok) throw new Error('Font yüklenemedi (' + resp.status + ')');
            fontBase64 = toBase64(await resp.arrayBuffer());
        }
        pdf.addFileToVFS(FONT_FILE, fontBase64);
        pdf.addFont(FONT_FILE, FONT_NAME, 'normal');
        pdf.addFont(FONT_FILE, FONT_NAME, 'bold');
        pdf.setFont(FONT_NAME, 'normal');
        return pdf;
    };
})();
