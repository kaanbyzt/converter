/*
 * Render koruması — video oynatılarak MediaRecorder ile kaydedilen işlemler için.
 * Tarayıcılar arka plandaki sekmede video çözümlemeyi ve çizimi durdurur; kayıt
 * devam ederse çıktıya donmuş kareler girer. Sekme gizlenince kayıt, video ve ses
 * birlikte duraklatılır, sekmeye dönülünce kaldığı yerden devam eder.
 *
 * Kullanım:
 *   RenderGuard.start({ recorder: mediaRecorder, media: [videoEl], audioCtx: audioCtx });
 *   ... mediaRecorder.onstop içinde: RenderGuard.stop();
 */
(function () {
    'use strict';

    var MSG = window.RENDER_GUARD_MSG || {
        keepTab: 'İşlem bitene kadar bu sekmeyi açık tutun.',
        resumed: 'Siz başka sekmedeyken işlem duraklatıldı; şimdi kaldığı yerden devam ediyor.',
        pausedTitle: '⏸ İşlem duraklatıldı'
    };

    var active = null;
    var banner = null;
    var originalTitle = '';

    function showBanner(text, tone) {
        if (!banner) {
            banner = document.createElement('div');
            banner.setAttribute('role', 'status');
            banner.style.cssText =
                'position:fixed;left:50%;bottom:1.25rem;transform:translateX(-50%);z-index:1100;' +
                'max-width:min(92vw,520px);padding:.6rem 1rem;border-radius:10px;font-size:.85rem;' +
                'box-shadow:0 6px 24px rgba(0,0,0,.35);text-align:center;';
            document.body.appendChild(banner);
        }
        banner.textContent = text;
        banner.style.background = tone === 'warn' ? '#78350f' : '#1e293b';
        banner.style.color = tone === 'warn' ? '#fde68a' : '#e2e8f0';
        banner.style.border = '1px solid ' + (tone === 'warn' ? '#f59e0b' : '#334155');
    }

    function hideBanner() {
        if (banner) banner.remove();
        banner = null;
    }

    function pause() {
        var a = active;
        a.wasPaused = true;
        if (a.recorder && a.recorder.state === 'recording') a.recorder.pause();
        a.playing = a.media.filter(function (m) { return !m.paused && !m.ended; });
        a.playing.forEach(function (m) { m.pause(); });
        if (a.audioCtx && a.audioCtx.state === 'running') a.audioCtx.suspend();
        document.title = MSG.pausedTitle;
    }

    function resume() {
        var a = active;
        document.title = originalTitle;
        if (a.audioCtx && a.audioCtx.state === 'suspended') a.audioCtx.resume();
        (a.playing || []).forEach(function (m) { m.play(); });
        if (a.recorder && a.recorder.state === 'paused') a.recorder.resume();
        showBanner(MSG.resumed, 'warn');
    }

    function onVisibility() {
        if (!active) return;
        if (document.visibilityState === 'hidden') pause();
        else if (active.wasPaused) resume();
    }

    document.addEventListener('visibilitychange', onVisibility);

    window.RenderGuard = {
        start: function (opts) {
            active = {
                recorder: opts.recorder,
                media: (opts.media || []).filter(Boolean),
                audioCtx: opts.audioCtx || null,
                wasPaused: false,
                playing: []
            };
            originalTitle = document.title;
            showBanner(MSG.keepTab, 'info');
            if (document.visibilityState === 'hidden') pause();
        },
        stop: function () {
            if (!active) return;
            active = null;
            document.title = originalTitle;
            hideBanner();
        }
    };
})();
