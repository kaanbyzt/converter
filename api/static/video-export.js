/*
 * Video araçlarının ortak kayıt yardımcıları.
 *  - Tarayıcının kaydedebildiği formatı seçer (Firefox VP9, Safari WebM kaydedemez).
 *  - Sesi Web Audio üzerinden alır: <video>.captureStream() Firefox'ta yoktur ve
 *    Chrome'da video kaynağı değişince ses izi biter, bu da kaydı bozar.
 *  - Açılamayan dosyaları yakalar, kullanıcıya mesaj gösterir.
 */
(function () {
    'use strict';

    var CANDIDATES = [
        'video/webm;codecs=vp9,opus',
        'video/webm;codecs=vp8,opus',
        'video/webm',
        'video/mp4'
    ];
    var audioGraphs = new WeakMap();

    function recorderAvailable() {
        return typeof MediaRecorder !== 'undefined';
    }

    function pickMime() {
        if (!recorderAvailable()) return null;
        if (typeof MediaRecorder.isTypeSupported !== 'function') return '';
        for (var i = 0; i < CANDIDATES.length; i++) {
            if (MediaRecorder.isTypeSupported(CANDIDATES[i])) return CANDIDATES[i];
        }
        return null;
    }

    function canvasSupported() {
        return pickMime() !== null && !!HTMLCanvasElement.prototype.captureStream;
    }

    function createRecorder(stream, preferredMime) {
        var mime = preferredMime && MediaRecorder.isTypeSupported(preferredMime)
            ? preferredMime
            : pickMime();
        if (mime) {
            try {
                return new MediaRecorder(stream, { mimeType: mime });
            } catch (e) { /* aşağıda varsayılan formatla devam edilir */ }
        }
        return new MediaRecorder(stream);
    }

    function extensionFor(recorder) {
        return /mp4/i.test(recorder.mimeType || '') ? '.mp4' : '.webm';
    }

    function blobFor(recorder, chunks) {
        var type = recorder.mimeType || (chunks[0] && chunks[0].type) || 'video/webm';
        return new Blob(chunks, { type: type });
    }

    function download(blob, name) {
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url;
        a.download = name;
        document.body.appendChild(a);
        a.click();
        a.remove();
        // Hemen iptal edilirse Firefox/Safari indirmeyi başlatmayabilir
        setTimeout(function () { URL.revokeObjectURL(url); }, 10000);
    }

    // Videonun sesini kayda bağlar. Dönen ses izi, video kaynağı değişse de canlı kalır.
    function attachAudio(video, gainValue) {
        var Ctx = window.AudioContext || window.webkitAudioContext;
        if (!Ctx) return null;

        var graph = audioGraphs.get(video);
        if (!graph) {
            var ctx = new Ctx();
            var source = ctx.createMediaElementSource(video);
            var gain = ctx.createGain();
            var dest = ctx.createMediaStreamDestination();
            source.connect(gain);
            gain.connect(dest);
            graph = { ctx: ctx, source: source, gain: gain, dest: dest, previewConnected: false };
            audioGraphs.set(video, graph);
        }
        if (graph.previewConnected) {
            graph.source.disconnect(graph.ctx.destination);
            graph.previewConnected = false;
        }
        graph.saved = { muted: video.muted, volume: video.volume };
        graph.gain.gain.value = typeof gainValue === 'number' ? gainValue : 1;
        // Sessize alınmış video Web Audio'ya da sessiz gider; hoparlöre bağlı olmadığı için kullanıcı duymaz.
        video.muted = false;
        video.volume = 1;
        if (graph.ctx.state === 'suspended') graph.ctx.resume();
        return { track: graph.dest.stream.getAudioTracks()[0], ctx: graph.ctx };
    }

    function releaseAudio(video) {
        var graph = audioGraphs.get(video);
        if (!graph || !graph.saved) return;
        video.muted = graph.saved.muted;
        video.volume = graph.saved.volume;
        graph.saved = null;
        // Önizlemede sesi açan kullanıcı duymaya devam etsin
        graph.source.connect(graph.ctx.destination);
        graph.previewConnected = true;
    }

    // Açılamayan veya görüntüsü olmayan dosyada onFail bir kez çağrılır.
    function guardSource(video, onFail) {
        video._videoExportFail = onFail;
        video.onerror = function () {
            // resetEditor içindeki src='' de error üretir, o gerçek bir hata değildir
            if (!video.getAttribute('src')) return;
            if (video._videoExportFail) video._videoExportFail();
        };
        if (!video._videoExportWatched) {
            video._videoExportWatched = true;
            video.addEventListener('loadedmetadata', function () {
                if (!video.videoWidth && video._videoExportFail) video._videoExportFail();
            });
        }
    }

    window.VideoExport = {
        canvasSupported: canvasSupported,
        recorderAvailable: recorderAvailable,
        createRecorder: createRecorder,
        extensionFor: extensionFor,
        blobFor: blobFor,
        download: download,
        attachAudio: attachAudio,
        releaseAudio: releaseAudio,
        guardSource: guardSource,
        badFileMessage: (window.VIDEO_EXPORT_MSG || {}).badFile || '',
        unsupportedMessage: (window.VIDEO_EXPORT_MSG || {}).unsupported || ''
    };
})();
