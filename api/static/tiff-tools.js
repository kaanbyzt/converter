/* TIFF okuma/yazma yardımcıları (tarayıcıda çalışır, dosya sunucuya gitmez).
 *
 * Sayfa ayırma piksel çözmeden bayt düzeyinde yapılır: sıkıştırılmış veri ve
 * etiketler (DPI, ICC vb.) aynen kopyalanır. Böylece kalite kaybı olmaz ve 1-bit
 * faks/tarama dosyaları RGBA'ya açılıp onlarca kat büyümez.
 */
(function (root) {
    'use strict';

    var TYPE_SIZE = { 1: 1, 2: 1, 3: 2, 4: 4, 5: 8, 6: 1, 7: 1, 8: 2, 9: 4, 10: 8, 11: 4, 12: 8, 13: 4 };
    var T_SHORT = 3, T_LONG = 4, T_RATIONAL = 5;
    var MAX_PAGES = 10000;

    // Başka bir IFD'ye/dosya içi konuma işaret eden etiketler kopyalanamaz:
    // SubIFDs, FreeOffsets/FreeByteCounts, Exif, GPS, Interop.
    var DROP_TAGS = { 288: 1, 289: 1, 330: 1, 34665: 1, 34853: 1, 40965: 1 };
    var DATA_GROUPS = [[273, 279], [324, 325], [513, 514]];

    function tiffError(code) {
        var err = new Error(code);
        err.code = code;
        return err;
    }

    function readValues(view, pos, type, count, le) {
        var out = [];
        for (var i = 0; i < count; i++) {
            if (type === T_SHORT) out.push(view.getUint16(pos + i * 2, le));
            else if (type === T_LONG || type === 13) out.push(view.getUint32(pos + i * 4, le));
            else if (type === 1) out.push(view.getUint8(pos + i));
            else throw tiffError('corrupt');
        }
        return out;
    }

    /** IFD zincirini okur. Döngülü/bozuk zincirde ilk sağlam sayfalarla devam eder. */
    function parse(buffer) {
        if (buffer.byteLength < 8) throw tiffError('not_tiff');
        var view = new DataView(buffer);
        var mark = view.getUint16(0, false);
        if (mark !== 0x4949 && mark !== 0x4D4D) throw tiffError('not_tiff');
        var le = mark === 0x4949;
        var magic = view.getUint16(2, le);
        if (magic === 43) throw tiffError('bigtiff');
        if (magic !== 42) throw tiffError('not_tiff');

        var pages = [];
        var seen = {};
        var damaged = false;
        var offset = view.getUint32(4, le);
        while (offset) {
            if (seen[offset] || pages.length >= MAX_PAGES || offset + 2 > buffer.byteLength) {
                damaged = true;
                break;
            }
            seen[offset] = true;
            var n = view.getUint16(offset, le);
            var end = offset + 2 + n * 12;
            if (end > buffer.byteLength) {
                damaged = true;
                break;
            }

            var entries = {};
            for (var i = 0; i < n; i++) {
                var p = offset + 2 + i * 12;
                var tag = view.getUint16(p, le);
                var type = view.getUint16(p + 2, le);
                var count = view.getUint32(p + 4, le);
                var size = TYPE_SIZE[type];
                if (!size) continue;
                var total = size * count;
                var valuePos = total <= 4 ? p + 8 : view.getUint32(p + 8, le);
                if (valuePos + total > buffer.byteLength) continue;
                entries[tag] = { type: type, count: count, pos: valuePos, total: total };
            }
            if (entries[256] && entries[257]) pages.push(describePage(view, entries, le));
            if (end + 4 > buffer.byteLength) {
                damaged = true;
                break;
            }
            offset = view.getUint32(end, le);
        }
        if (!pages.length) throw tiffError('no_pages');

        // Küçük önizleme/maske IFD'leri belge sayfası değildir.
        var main = pages.filter(function (pg) { return !(pg.subfileType & 5); });
        var tiff = { buffer: buffer, littleEndian: le, pages: main.length ? main : pages, damaged: damaged };
        tiff.damaged = damaged || tiff.pages.some(function (pg) { return !isCopyable(tiff, pg); });
        return tiff;
    }

    function isCopyable(tiff, page) {
        try {
            toCopyPage(tiff, page);
            return true;
        } catch (err) {
            return false;
        }
    }

    function describePage(view, entries, le) {
        function one(tag, fallback) {
            var e = entries[tag];
            if (!e) return fallback;
            return readValues(view, e.pos, e.type, 1, le)[0];
        }
        function rational(tag) {
            var e = entries[tag];
            if (!e || e.type !== T_RATIONAL) return 0;
            var den = view.getUint32(e.pos + 4, le);
            return den ? view.getUint32(e.pos, le) / den : 0;
        }
        function dpiOf(tag) {
            var value = rational(tag);
            var unit = one(296, 2);
            if (!value || unit === 1) return 0;
            return unit === 3 ? value * 2.54 : value;
        }
        var bps = entries[258] ? readValues(view, entries[258].pos, entries[258].type, Math.min(entries[258].count, 8), le) : [1];
        return {
            entries: entries,
            width: one(256, 0),
            height: one(257, 0),
            compression: one(259, 1),
            photometric: one(262, -1),
            samples: one(277, bps.length),
            bitsPerSample: bps[0],
            bitsPerSampleCount: entries[258] ? entries[258].count : 1,
            fillOrder: one(266, 1),
            extraSample: one(338, 0),
            planar: one(284, 1),
            sampleFormat: one(339, 1),
            orientation: one(274, 1),
            subfileType: one(254, 0),
            dpiX: dpiOf(282),
            dpiY: dpiOf(283)
        };
    }

    /** Ham etiketleri ve veri parçalarını yazıcıya uygun sayfa nesnesine çevirir. */
    function toCopyPage(tiff, page) {
        var view = new DataView(tiff.buffer);
        var bytes = new Uint8Array(tiff.buffer);
        var le = tiff.littleEndian;
        var groups = [];

        DATA_GROUPS.forEach(function (pair) {
            var offEntry = page.entries[pair[0]];
            var cntEntry = page.entries[pair[1]];
            if (!offEntry || !cntEntry) return;
            var offs = readValues(view, offEntry.pos, offEntry.type, offEntry.count, le);
            var cnts = readValues(view, cntEntry.pos, cntEntry.type, cntEntry.count, le);
            if (offs.length !== cnts.length) throw tiffError('corrupt');
            var chunks = offs.map(function (off, i) {
                if (off + cnts[i] > bytes.length) throw tiffError('corrupt');
                return bytes.subarray(off, off + cnts[i]);
            });
            groups.push({ offsetTag: pair[0], countTag: pair[1], chunks: chunks });
        });
        if (!groups.length) throw tiffError('corrupt');

        // Eski tip JPEG'de tablolar dosya konumuyla verilir; tek akış (513) yoksa kopyalanamaz.
        if (page.compression === 6 && !page.entries[513] && (page.entries[519] || page.entries[520] || page.entries[521])) {
            throw tiffError('old_jpeg');
        }

        var tags = {};
        Object.keys(page.entries).forEach(function (key) {
            var tag = +key;
            var e = page.entries[tag];
            if (DROP_TAGS[tag] || e.type === 13 || tag === 297 || (tag >= 519 && tag <= 521)) return;
            if (DATA_GROUPS.some(function (pair) { return pair[0] === tag || pair[1] === tag; })) return;
            tags[tag] = { type: e.type, count: e.count, bytes: bytes.subarray(e.pos, e.pos + e.total) };
        });
        return { tags: tags, groups: groups };
    }

    /** Sayfalardan klasik TIFF dosyası üretir (Uint8Array döner). */
    function write(pages, littleEndian) {
        var le = littleEndian;
        var total = 8;
        var layouts = pages.map(function (page) {
            var tagCount = Object.keys(page.tags).length + page.groups.length * 2 + (pages.length > 1 ? 1 : 0);
            var ifdSize = 2 + tagCount * 12 + 4;
            var extra = 0;
            function reserve(size) { if (size > 4) extra += size + (size & 1); }
            Object.keys(page.tags).forEach(function (k) { reserve(page.tags[k].bytes.length); });
            var dataSize = 0;
            page.groups.forEach(function (g) {
                reserve(g.chunks.length * 4);
                reserve(g.chunks.length * 4);
                g.chunks.forEach(function (c) { dataSize += c.length + (c.length & 1); });
            });
            var layout = { ifdSize: ifdSize, size: ifdSize + extra + dataSize };
            total += layout.size;
            return layout;
        });
        if (total > 0xFFFFFFFF) throw tiffError('too_large');

        var out = new Uint8Array(total);
        var view = new DataView(out.buffer);
        view.setUint16(0, le ? 0x4949 : 0x4D4D, false);
        view.setUint16(2, 42, le);
        view.setUint32(4, 8, le);

        var cursor = 8;
        pages.forEach(function (page, pageIndex) {
            var ifdPos = cursor;
            var heap = ifdPos + layouts[pageIndex].ifdSize;
            var rows = [];

            function place(bytes) {
                var at = heap;
                out.set(bytes, heap);
                heap += bytes.length + (bytes.length & 1);
                return at;
            }
            function u32Array(values) {
                var arr = new Uint8Array(values.length * 4);
                var dv = new DataView(arr.buffer);
                values.forEach(function (v, i) { dv.setUint32(i * 4, v, le); });
                return arr;
            }

            Object.keys(page.tags).forEach(function (k) {
                var t = page.tags[k];
                rows.push({ tag: +k, type: t.type, count: t.count, bytes: t.bytes });
            });
            if (pages.length > 1) {
                var pn = new Uint8Array(4);
                var pnView = new DataView(pn.buffer);
                pnView.setUint16(0, pageIndex, le);
                pnView.setUint16(2, pages.length, le);
                rows.push({ tag: 297, type: T_SHORT, count: 2, bytes: pn });
            }
            page.groups.forEach(function (g) {
                var offsets = g.chunks.map(function (c) { return place(c); });
                rows.push({ tag: g.offsetTag, type: T_LONG, count: offsets.length, bytes: u32Array(offsets) });
                rows.push({ tag: g.countTag, type: T_LONG, count: g.chunks.length, bytes: u32Array(g.chunks.map(function (c) { return c.length; })) });
            });
            rows.sort(function (a, b) { return a.tag - b.tag; });

            view.setUint16(ifdPos, rows.length, le);
            rows.forEach(function (row, i) {
                var p = ifdPos + 2 + i * 12;
                view.setUint16(p, row.tag, le);
                view.setUint16(p + 2, row.type, le);
                view.setUint32(p + 4, row.count, le);
                if (row.bytes.length <= 4) out.set(row.bytes, p + 8);
                else view.setUint32(p + 8, place(row.bytes), le);
            });
            var next = pageIndex < pages.length - 1 ? ifdPos + layouts[pageIndex].size : 0;
            view.setUint32(ifdPos + 2 + rows.length * 12, next, le);
            cursor = ifdPos + layouts[pageIndex].size;
        });
        return out;
    }

    /** Seçili sayfaları kayıpsız olarak tek bir TIFF'e kopyalar. */
    function copyPages(tiff, indexes) {
        var pages = indexes.map(function (i) { return toCopyPage(tiff, tiff.pages[i]); });
        return write(pages, tiff.littleEndian);
    }

    /** UTIF'in boş/bozuk çıktı üretmeden çözebildiği türler; aksi hâlde yalnızca TIFF kopyası mümkündür. */
    function canRender(page) {
        var cmpr = page.compression;
        if ([1, 3, 4, 5, 6, 7, 8, 32773].indexOf(cmpr) < 0) return false;
        if (page.planar !== 1 || page.sampleFormat !== 1) return false;
        // UTIF LSB bit sırasını yalnızca faks (G3/G4) çözücülerinde uygular.
        if (page.fillOrder !== 1 && cmpr !== 3 && cmpr !== 4) return false;
        var bps = page.bitsPerSample, smp = page.samples, ph = page.photometric;
        if (page.bitsPerSampleCount !== smp && smp !== 1) return false;
        if (ph === 5 && (cmpr === 6 || cmpr === 7)) return false;
        if (ph === 0) return smp === 1 && [1, 4, 8].indexOf(bps) >= 0;
        if (ph === 1) return smp === 1 && [1, 2, 8, 16].indexOf(bps) >= 0;
        if (ph === 2) return (smp === 3 || smp === 4) && (bps === 8 || bps === 16);
        if (ph === 3) return smp === 1 && bps === 8;
        if (ph === 5) return bps === 8 && (smp === 4 || smp === 5);
        if (ph === 6) return cmpr === 6 || cmpr === 7;
        return false;
    }

    /**
     * Photometric=RGB olan JPEG'ler YCbCr'ye çevrilmeden saklanır ama UTIF'in JPEG çözücüsü
     * aksi belirtilmedikçe YCbCr varsayar. Adobe APP14 (transform=0) işareti bunu bildirir.
     */
    function withRgbJpegMarker(chunk) {
        if (chunk[0] !== 0xFF || chunk[1] !== 0xD8) return chunk;
        var app14 = [0xFF, 0xD8, 0xFF, 0xEE, 0x00, 0x0E, 0x41, 0x64, 0x6F, 0x62, 0x65, 0x00, 0x64, 0, 0, 0, 0, 0];
        var out = new Uint8Array(app14.length + chunk.length - 2);
        out.set(app14, 0);
        out.set(chunk.subarray(2), app14.length);
        return out;
    }

    /** UTIF'in RGBA çıktısındaki bilinen sapmaları düzeltir. */
    function fixRgba(rgba, page) {
        // CMYK: son pikselde dizi dışı okuma alfayı NaN (0) yapıyor.
        if (page.photometric === 5 && page.samples === 4) rgba[rgba.length - 1] = 255;
        // Önceden çarpılmış alfa: canvas çarpılmamış değer bekler.
        if (page.photometric === 2 && page.samples === 4 && page.extraSample === 1) {
            for (var i = 0; i < rgba.length; i += 4) {
                var a = rgba[i + 3];
                if (a === 0 || a === 255) continue;
                rgba[i] = Math.min(255, Math.round(rgba[i] * 255 / a));
                rgba[i + 1] = Math.min(255, Math.round(rgba[i + 1] * 255 / a));
                rgba[i + 2] = Math.min(255, Math.round(rgba[i + 2] * 255 / a));
            }
        }
    }

    /** Sayfayı RGBA piksellere çözer ve Orientation etiketini uygulayarak canvas'a çizer. */
    function renderToCanvas(tiff, index) {
        var page = tiff.pages[index];
        if (!canRender(page)) throw tiffError('unsupported_page');
        // Tek sayfalık kopya: UTIF'in IFD okuyucusunda döngü koruması yok ve EXIF/SubIFD'lere de girer.
        var copy = toCopyPage(tiff, page);
        if (page.compression === 7 && page.photometric === 2) {
            copy.groups.forEach(function (g) { g.chunks = g.chunks.map(withRgbJpegMarker); });
        }
        var buf = write([copy], tiff.littleEndian).buffer;
        var ifd = root.UTIF.decode(buf)[0];
        root.UTIF.decodeImage(buf, ifd);
        var rgba = root.UTIF.toRGBA8(ifd);
        fixRgba(rgba, page);
        var w = ifd.width, h = ifd.height;

        var src = document.createElement('canvas');
        src.width = w;
        src.height = h;
        var srcCtx = src.getContext('2d');
        if (!srcCtx) throw tiffError('too_large');
        srcCtx.putImageData(new ImageData(new Uint8ClampedArray(rgba.buffer, 0, w * h * 4), w, h), 0, 0);

        var o = page.orientation;
        if (o < 2 || o > 8) return src;
        var dst = document.createElement('canvas');
        var swap = o >= 5;
        dst.width = swap ? h : w;
        dst.height = swap ? w : h;
        var ctx = dst.getContext('2d');
        if (!ctx) throw tiffError('too_large');
        var M = {
            2: [-1, 0, 0, 1, w, 0],
            3: [-1, 0, 0, -1, w, h],
            4: [1, 0, 0, -1, 0, h],
            5: [0, 1, 1, 0, 0, 0],
            6: [0, 1, -1, 0, h, 0],
            7: [0, -1, -1, 0, h, w],
            8: [0, -1, 1, 0, 0, w]
        }[o];
        ctx.setTransform(M[0], M[1], M[2], M[3], M[4], M[5]);
        ctx.drawImage(src, 0, 0);
        src.width = src.height = 0;
        return dst;
    }

    /** TIFF LZW (MSB-first, erken kod genişliği artışı). */
    function lzwEncode(input) {
        var out = new Uint8Array(Math.ceil(input.length * 1.5) + 16);
        var pos = 0, acc = 0, nbits = 0, width = 9, next = 258;
        var HASH = 16411;
        var keys = new Int32Array(HASH).fill(-1);
        var vals = new Int16Array(HASH);

        function put(code) {
            acc = (acc << width) | code;
            nbits += width;
            while (nbits >= 8) {
                nbits -= 8;
                out[pos++] = (acc >>> nbits) & 0xFF;
            }
            acc &= (1 << nbits) - 1;
        }
        // Kodlayıcı tablosu çözücüden bir adım öndedir; eşikler libtiff ile aynıdır.
        function afterAdd() {
            if (next === 4094) {
                put(256);
                keys.fill(-1);
                next = 258;
                width = 9;
            } else if (next === 512 || next === 1024 || next === 2048) {
                width++;
            }
        }

        put(256);
        if (input.length) {
            var prefix = input[0];
            for (var i = 1; i < input.length; i++) {
                var byte = input[i];
                var key = (prefix << 8) | byte;
                var h = key % HASH;
                while (keys[h] !== -1 && keys[h] !== key) h = (h + 1) % HASH;
                if (keys[h] === key) {
                    prefix = vals[h];
                    continue;
                }
                put(prefix);
                keys[h] = key;
                vals[h] = next++;
                afterAdd();
                prefix = byte;
            }
            put(prefix);
            next++;
            afterAdd();
        }
        put(257);
        if (nbits) out[pos++] = (acc << (8 - nbits)) & 0xFF;
        return out.subarray(0, pos);
    }

    /** RGBA pikselleri LZW + yatay öngörü ya da sıkıştırmasız TIFF sayfasına çevirir. */
    function encodeRgbaPage(rgba, w, h, opts) {
        var hasAlpha = false;
        for (var a = 3; a < rgba.length; a += 4) {
            if (rgba[a] !== 255) { hasAlpha = true; break; }
        }
        var samples = hasAlpha ? 4 : 3;
        var rowBytes = w * samples;
        var rowsPerStrip = Math.max(1, Math.min(h, Math.floor(65536 / rowBytes)));
        var chunks = [];
        for (var top = 0; top < h; top += rowsPerStrip) {
            var rows = Math.min(rowsPerStrip, h - top);
            var strip = new Uint8Array(rows * rowBytes);
            for (var y = 0; y < rows; y++) {
                var src = (top + y) * w * 4;
                var dst = y * rowBytes;
                for (var x = 0; x < w; x++, src += 4, dst += samples) {
                    strip[dst] = rgba[src];
                    strip[dst + 1] = rgba[src + 1];
                    strip[dst + 2] = rgba[src + 2];
                    if (hasAlpha) strip[dst + 3] = rgba[src + 3];
                }
                if (opts.lzw) {
                    var row = y * rowBytes;
                    for (var i = rowBytes - 1; i >= samples; i--) {
                        strip[row + i] = (strip[row + i] - strip[row + i - samples]) & 0xFF;
                    }
                }
            }
            chunks.push(opts.lzw ? lzwEncode(strip).slice() : strip);
        }

        function shorts(values) {
            var arr = new Uint8Array(values.length * 2);
            var dv = new DataView(arr.buffer);
            values.forEach(function (v, i) { dv.setUint16(i * 2, v, true); });
            return { type: T_SHORT, count: values.length, bytes: arr };
        }
        function longs(value) {
            var arr = new Uint8Array(4);
            new DataView(arr.buffer).setUint32(0, value, true);
            return { type: T_LONG, count: 1, bytes: arr };
        }
        function rational(value) {
            var arr = new Uint8Array(8);
            var dv = new DataView(arr.buffer);
            dv.setUint32(0, Math.round(value), true);
            dv.setUint32(4, 1, true);
            return { type: T_RATIONAL, count: 1, bytes: arr };
        }
        var bits = [];
        for (var s = 0; s < samples; s++) bits.push(8);
        var tags = {
            254: longs(0),
            256: longs(w),
            257: longs(h),
            258: shorts(bits),
            259: shorts([opts.lzw ? 5 : 1]),
            262: shorts([2]),
            277: shorts([samples]),
            278: longs(rowsPerStrip),
            282: rational(opts.dpi),
            283: rational(opts.dpi),
            284: shorts([1]),
            296: shorts([2])
        };
        if (opts.lzw) tags[317] = shorts([2]);
        if (hasAlpha) tags[338] = shorts([2]);
        return { tags: tags, groups: [{ offsetTag: 273, countTag: 279, chunks: chunks }] };
    }

    function jpegComponents(bytes) {
        var i = 2;
        while (i + 9 < bytes.length && bytes[i] === 0xFF) {
            var marker = bytes[i + 1];
            if (marker >= 0xC0 && marker <= 0xCF && marker !== 0xC4 && marker !== 0xC8 && marker !== 0xCC) return bytes[i + 9];
            i += 2 + ((bytes[i + 2] << 8) | bytes[i + 3]);
        }
        return 3;
    }

    /**
     * Görüntüleri yeniden kodlamadan gömerek PDF üretir.
     * images: [{ kind: 'jpeg' | 'bilevel', bytes, pixelWidth, pixelHeight, widthPt, heightPt }]
     * bilevel: satır başına bayta hizalı 1 bit, Flate ile sıkıştırılmış (1 = beyaz).
     */
    function buildPdf(images) {
        var parts = [], offset = 0, xref = [];
        function add(chunk) {
            parts.push(chunk);
            offset += chunk.length;
        }
        function obj(num, dict, stream) {
            xref[num] = offset;
            add(num + ' 0 obj\n' + dict + '\n');
            if (stream) {
                add('stream\n');
                add(stream);
                add('\nendstream\n');
            }
            add('endobj\n');
        }
        function num(value) {
            return String(+value.toFixed(3));
        }

        add('%PDF-1.4\n');
        add(new Uint8Array([37, 226, 227, 207, 211, 10]));
        var kids = images.map(function (_, i) { return (3 + i * 3) + ' 0 R'; }).join(' ');
        obj(1, '<< /Type /Catalog /Pages 2 0 R >>');
        obj(2, '<< /Type /Pages /Count ' + images.length + ' /Kids [' + kids + '] >>');
        images.forEach(function (img, i) {
            var pageNum = 3 + i * 3, contentNum = pageNum + 1, imageNum = pageNum + 2;
            var w = num(img.widthPt), h = num(img.heightPt);
            obj(pageNum, '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ' + w + ' ' + h + '] /Contents ' + contentNum +
                ' 0 R /Resources << /XObject << /Im0 ' + imageNum + ' 0 R >> >> >>');
            var content = 'q ' + w + ' 0 0 ' + h + ' 0 0 cm /Im0 Do Q';
            obj(contentNum, '<< /Length ' + content.length + ' >>', content);
            var common = '<< /Type /XObject /Subtype /Image /Width ' + img.pixelWidth + ' /Height ' + img.pixelHeight + ' /Length ' + img.bytes.length;
            var dict = img.kind === 'jpeg'
                ? common + ' /ColorSpace /' + (jpegComponents(img.bytes) === 1 ? 'DeviceGray' : 'DeviceRGB') + ' /BitsPerComponent 8 /Filter /DCTDecode >>'
                : common + ' /ColorSpace /DeviceGray /BitsPerComponent 1 /Filter /FlateDecode >>';
            obj(imageNum, dict, img.bytes);
        });

        var count = 3 + images.length * 3;
        var xrefAt = offset;
        add('xref\n0 ' + count + '\n0000000000 65535 f \n');
        for (var n = 1; n < count; n++) add(('0000000000' + xref[n]).slice(-10) + ' 00000 n \n');
        add('trailer\n<< /Size ' + count + ' /Root 1 0 R >>\nstartxref\n' + xrefAt + '\n%%EOF\n');
        return new Blob(parts, { type: 'application/pdf' });
    }

    /** "1-3, 5, 8-" gibi sayfa aralığını 0 tabanlı sıralı dizine çevirir; geçersizse null. */
    function parseRange(text, pageCount) {
        var parts = String(text).split(',');
        var out = [];
        var seen = {};
        for (var i = 0; i < parts.length; i++) {
            var part = parts[i].trim();
            if (!part) continue;
            var m = /^(\d+)?\s*(-)?\s*(\d+)?$/.exec(part);
            if (!m || (!m[1] && !m[3])) return null;
            var from = m[1] ? +m[1] : 1;
            var to = m[2] ? (m[3] ? +m[3] : pageCount) : from;
            if (from < 1 || to < from || to > pageCount) return null;
            for (var p = from; p <= to; p++) {
                if (!seen[p]) {
                    seen[p] = true;
                    out.push(p - 1);
                }
            }
        }
        return out.length ? out : null;
    }

    root.TiffTools = {
        parse: parse,
        copyPages: copyPages,
        isCopyable: isCopyable,
        canRender: canRender,
        renderToCanvas: renderToCanvas,
        encodeRgbaPage: encodeRgbaPage,
        write: write,
        buildPdf: buildPdf,
        parseRange: parseRange
    };
})(typeof window !== 'undefined' ? window : globalThis);
