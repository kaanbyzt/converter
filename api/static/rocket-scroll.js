/*
 * Roket Scroll — sağ kenarda sayfa ilerlemesini gösteren, sürüklenebilir roket.
 * - Sayfa kaydıkça roket ray üzerinde akıcı şekilde hareket eder.
 * - Roket tutulup sayfada serbestçe uçurulabilir; yüksekliği sayfa konumunu belirler,
 *   bırakılınca rayındaki yerine geri döner. Raya tıklayınca sayfa oraya kayar.
 * - Hareket yönüne göre döner, hızlandıkça alevi büyür ve iz bırakır.
 */
(function () {
    'use strict';

    if (window.__rocketScroll) return;
    window.__rocketScroll = true;

    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    var css = '' +
        '@media (pointer: fine) {' +
        '  html.has-rocket-scroll { scrollbar-width: none; }' +
        '  html.has-rocket-scroll::-webkit-scrollbar { display: none; }' +
        '}' +
        '.rs-track {' +
        '  position: fixed; top: 12px; bottom: 12px; right: 4px; width: 36px;' +
        '  z-index: 150; cursor: pointer; touch-action: none;' +
        '  transition: opacity .3s ease;' +
        '}' +
        '@media (pointer: coarse) { .rs-track { pointer-events: none; } .rs-rocket { pointer-events: auto; } }' +
        '.rs-rail, .rs-fill {' +
        '  position: absolute; left: 50%; width: 2px; margin-left: -1px; border-radius: 2px;' +
        '}' +
        '.rs-rail {' +
        '  top: 0; bottom: 0;' +
        '  background: repeating-linear-gradient(to bottom, rgba(148,163,184,.45) 0 4px, transparent 4px 9px);' +
        '}' +
        '.rs-fill {' +
        '  top: 0; height: 0;' +
        '  background: linear-gradient(to bottom, rgba(96,165,250,0), rgba(96,165,250,.9) 60%, #fbbf24);' +
        '  box-shadow: 0 0 8px rgba(96,165,250,.6);' +
        '}' +
        '.rs-canvas { position: fixed; inset: 0; width: 100vw; height: 100vh; pointer-events: none; z-index: 149; }' +
        '.rs-rocket {' +
        '  position: fixed; left: 0; top: 0; width: 30px; height: 56px; z-index: 151;' +
        '  cursor: grab; touch-action: none; will-change: transform; outline: none;' +
        '  -webkit-tap-highlight-color: transparent; -webkit-user-select: none; user-select: none; -webkit-touch-callout: none;' +
        '}' +
        '@media (pointer: coarse) { .rs-rocket::before { content: ""; position: absolute; inset: -14px -10px; } }' +
        '.rs-rocket:focus-visible .rs-body { filter: drop-shadow(0 0 6px #60a5fa); }' +
        '.rs-dragging, .rs-dragging * { cursor: grabbing !important; user-select: none !important; }' +
        '.rs-ship { position: absolute; inset: 0; transform-origin: 50% 50%; will-change: transform; }' +
        '.rs-body { position: absolute; left: 0; top: 0; width: 30px; height: 44px; filter: drop-shadow(0 2px 6px rgba(0,0,0,.5)); transition: filter .2s; }' +
        '.rs-rocket:hover .rs-body { filter: drop-shadow(0 0 8px rgba(251,191,36,.6)); }' +
        '.rs-flame {' +
        '  position: absolute; left: 50%; top: 40px; width: 12px; height: 18px; margin-left: -6px;' +
        '  transform-origin: 50% 0; transform: scaleY(var(--rs-flame, .5));' +
        '  background: radial-gradient(ellipse 50% 60% at 50% 25%, #fff 0%, #fde68a 25%, #f97316 60%, rgba(239,68,68,0) 100%);' +
        '  border-radius: 50% 50% 50% 50% / 30% 30% 70% 70%;' +
        '  filter: blur(.4px);' +
        '  animation: rs-flicker .09s infinite alternate;' +
        '}' +
        '@keyframes rs-flicker { from { opacity: .85; } to { opacity: 1; } }' +
        'html.has-rocket-scroll .notice-panel { right: 3rem; }' +
        'html.has-rocket-scroll .notice-toggle-btn { right: 3rem; }' +
        '@media (max-width: 900px) {' +
        '  .rs-track { width: 28px; right: 2px; top: 70px; }' +
        '  html.has-rocket-scroll .notice-panel, html.has-rocket-scroll .notice-toggle-btn { right: 2.4rem; }' +
        '}';

    var ROCKET_SVG =
        '<svg class="rs-body" viewBox="0 0 30 44" aria-hidden="true">' +
        '<defs>' +
        '<linearGradient id="rsHull" x1="0" x2="1">' +
        '<stop offset="0" stop-color="#cbd5e1"/><stop offset=".45" stop-color="#ffffff"/><stop offset="1" stop-color="#94a3b8"/>' +
        '</linearGradient>' +
        '<linearGradient id="rsFin" x1="0" x2="0" y1="0" y2="1">' +
        '<stop offset="0" stop-color="#f87171"/><stop offset="1" stop-color="#b91c1c"/>' +
        '</linearGradient>' +
        '</defs>' +
        '<path d="M9 26 L2 36 L2 40 L9 36 Z" fill="url(#rsFin)"/>' +
        '<path d="M21 26 L28 36 L28 40 L21 36 Z" fill="url(#rsFin)"/>' +
        '<path d="M15 1 C22 7 23 17 22 28 L21 38 L9 38 L8 28 C7 17 8 7 15 1 Z" fill="url(#rsHull)" stroke="#475569" stroke-width=".6"/>' +
        '<path d="M15 1 C18.5 4 20.5 7.5 21.3 11 L8.7 11 C9.5 7.5 11.5 4 15 1 Z" fill="url(#rsFin)"/>' +
        '<circle cx="15" cy="19" r="4.2" fill="#1e3a8a" stroke="#64748b" stroke-width="1.2"/>' +
        '<circle cx="13.8" cy="17.8" r="1.4" fill="#93c5fd" opacity=".9"/>' +
        '<path d="M13.5 29 L16.5 29 L16.5 40 L13.5 40 Z" fill="url(#rsFin)"/>' +
        '<path d="M10 38 L20 38 L19 42 L11 42 Z" fill="#334155"/>' +
        '</svg>';

    function init() {
        var style = document.createElement('style');
        style.textContent = css;
        document.head.appendChild(style);

        var track = document.createElement('div');
        track.className = 'rs-track';
        track.innerHTML =
            '<div class="rs-rail"></div><div class="rs-fill"></div>' +
            '<canvas class="rs-canvas"></canvas>' +
            '<div class="rs-rocket" tabindex="0" role="scrollbar" aria-orientation="vertical" ' +
            'aria-valuemin="0" aria-valuemax="100" aria-valuenow="0" aria-label="Scroll">' +
            '<div class="rs-ship">' + ROCKET_SVG + '<div class="rs-flame"></div></div></div>';
        document.body.appendChild(track);
        document.documentElement.classList.add('has-rocket-scroll');

        var fill = track.querySelector('.rs-fill');
        var rocket = track.querySelector('.rs-rocket');
        var ship = track.querySelector('.rs-ship');
        var flame = track.querySelector('.rs-flame');
        var canvas = track.querySelector('.rs-canvas');
        var ctx = canvas.getContext('2d');

        var ROCKET_H = 56, ROCKET_W = 30;
        var trackRect = null, trackH = 0, maxScroll = 0, dpr = 1;
        var railY = 0;                // ray üzerindeki (yumuşatılmış) konum
        var pos = { x: 0, y: 0 };     // roketin ekrandaki merkez konumu
        var goal = { x: 0, y: 0 };    // serbest uçuşta imlecin hedefi
        var grab = { x: 0, y: 0 };
        var mode = 'rail';            // 'rail' | 'free' (tutuluyor) | 'return' (rayına dönüyor)
        var angle = 0;
        var flamePow = 0.4;
        var lastScrollY = window.scrollY;
        var velocity = 0;             // scroll hızı
        var targetScroll = null;      // raya tıklama / klavye ile hedef scroll
        var particles = [];
        var lastTime = performance.now();

        function measure() {
            trackRect = track.getBoundingClientRect();
            trackH = trackRect.height;
            maxScroll = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
            dpr = Math.min(window.devicePixelRatio || 1, 2);
            canvas.width = Math.round(window.innerWidth * dpr);
            canvas.height = Math.round(window.innerHeight * dpr);
            ROCKET_H = rocket.offsetHeight || 56;
            ROCKET_W = rocket.offsetWidth || 30;
        }

        function travel() { return Math.max(1, trackH - ROCKET_H); }

        function railPoint() {
            return {
                x: trackRect.left + trackRect.width / 2,
                y: trackRect.top + railY + ROCKET_H / 2
            };
        }

        function scrollToRatio(ratio) {
            ratio = Math.min(1, Math.max(0, ratio));
            targetScroll = ratio * maxScroll;
        }

        // Kare hızından bağımsız yumuşatma: 60fps'te k, düşük fps'te aynı süre
        function ease(k, dt) { return 1 - Math.pow(1 - k, dt); }

        // Anında kaydır: Bootstrap'in scroll-behavior: smooth ayarını geçici olarak devre dışı bırakır
        // (behavior: 'instant' eski Safari sürümlerinde desteklenmiyor)
        var rootStyle = document.documentElement.style;
        function jumpTo(y) {
            var prev = rootStyle.scrollBehavior;
            rootStyle.scrollBehavior = 'auto';
            window.scrollTo(0, y);
            rootStyle.scrollBehavior = prev;
        }

        // En kısa yoldan hedef açıya dön
        function turnTo(target, k) {
            var d = ((target - angle) % 360 + 540) % 360 - 180;
            angle += d * k;
        }

        rocket.addEventListener('pointerdown', function (e) {
            if (e.button !== 0) return;
            e.preventDefault();
            e.stopPropagation();
            mode = 'free';
            targetScroll = null;
            grab.x = e.clientX - pos.x;
            grab.y = e.clientY - pos.y;
            goal.x = pos.x; goal.y = pos.y;
            rocket.setPointerCapture(e.pointerId);
            document.documentElement.classList.add('rs-dragging');
        });

        rocket.addEventListener('pointermove', function (e) {
            if (mode !== 'free') return;
            goal.x = e.clientX - grab.x;
            goal.y = e.clientY - grab.y;
        });

        function endDrag() {
            if (mode !== 'free') return;
            mode = 'return';
            targetScroll = null;
            document.documentElement.classList.remove('rs-dragging');
        }
        // iOS Safari touch-action'ı her zaman dinlemiyor: tutarken sayfanın kendi kaymasını engelle
        rocket.addEventListener('touchmove', function (e) { e.preventDefault(); }, { passive: false });
        rocket.addEventListener('contextmenu', function (e) { e.preventDefault(); });

        rocket.addEventListener('pointerup', endDrag);
        rocket.addEventListener('pointercancel', endDrag);
        rocket.addEventListener('lostpointercapture', endDrag);

        track.addEventListener('pointerdown', function (e) {
            if (e.target.closest('.rs-rocket')) return;
            scrollToRatio((e.clientY - trackRect.top - ROCKET_H / 2) / travel());
        });

        rocket.addEventListener('keydown', function (e) {
            var step = window.innerHeight * 0.15;
            var base = targetScroll !== null ? targetScroll : window.scrollY;
            var next = null;
            if (e.key === 'ArrowDown') next = base + step;
            else if (e.key === 'ArrowUp') next = base - step;
            else if (e.key === 'PageDown') next = base + window.innerHeight * 0.9;
            else if (e.key === 'PageUp') next = base - window.innerHeight * 0.9;
            else if (e.key === 'Home') next = 0;
            else if (e.key === 'End') next = maxScroll;
            if (next === null) return;
            e.preventDefault();
            targetScroll = Math.min(maxScroll, Math.max(0, next));
        });

        // Kullanıcı tekerlekle / dokunarak kaydırırsa otomatik uçuşu bırak
        ['wheel', 'touchstart'].forEach(function (ev) {
            window.addEventListener(ev, function () { if (mode !== 'free') targetScroll = null; }, { passive: true });
        });

        function spawn(x, y, dx, dy, power) {
            if (reduceMotion || particles.length > 160) return;
            var n = power > 0.6 ? 3 : 1;
            for (var i = 0; i < n; i++) {
                var sp = 0.6 + Math.random() * 1.8 * power;
                particles.push({
                    x: x + (Math.random() - 0.5) * 6,
                    y: y + (Math.random() - 0.5) * 6,
                    vx: dx * sp + (Math.random() - 0.5) * 0.6,
                    vy: dy * sp + (Math.random() - 0.5) * 0.6,
                    life: 1,
                    decay: 0.018 + Math.random() * 0.025,
                    size: 1 + Math.random() * 2.2 * (0.4 + power),
                    hue: 25 + Math.random() * 30
                });
            }
        }

        function drawParticles(dt) {
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
            for (var i = particles.length - 1; i >= 0; i--) {
                var p = particles[i];
                p.x += p.vx * dt; p.y += p.vy * dt;
                p.life -= p.decay * dt;
                if (p.life <= 0) { particles.splice(i, 1); continue; }
                var light = 50 + p.life * 40;
                ctx.fillStyle = p.life > 0.55
                    ? 'hsla(' + p.hue + ',100%,' + light + '%,' + p.life + ')'
                    : 'hsla(220,15%,70%,' + (p.life * 0.5) + ')';
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size * (p.life > 0.55 ? 1 : 1.8 - p.life), 0, Math.PI * 2);
                ctx.fill();
            }
        }

        function frame(now) {
            var dt = Math.min(6, (now - lastTime) / 16.67);
            lastTime = now;

            // Serbest uçuşta roketin yüksekliği = sayfa konumu (ray ile aynı oran)
            if (mode === 'free') scrollToRatio((pos.y - ROCKET_H / 2 - trackRect.top) / travel());

            if (targetScroll !== null) {
                var cur = window.scrollY;
                var diff = targetScroll - cur;
                if (Math.abs(diff) < 0.5) {
                    jumpTo(targetScroll);
                    if (mode !== 'free') targetScroll = null;
                } else if (mode === 'free') {
                    jumpTo(targetScroll);   // tutarken sayfa roketle birebir gider
                } else {
                    jumpTo(cur + diff * ease(0.14, dt));
                }
            }

            var sy = window.scrollY;
            var delta = sy - lastScrollY;
            lastScrollY = sy;
            velocity += (delta - velocity) * 0.25;

            var ratio = maxScroll > 0 ? sy / maxScroll : 0;
            railY += (ratio * travel() - railY) * ease(0.22, dt);
            var rail = railPoint();

            var px = pos.x, py = pos.y, speed, heading = null;

            if (mode === 'rail') {
                speed = Math.min(1, Math.abs(velocity) / 30);
                var bob = reduceMotion ? 0 : Math.sin(now / 450) * (1 - speed) * 1.5;
                pos.x = rail.x;
                pos.y = rail.y + bob;
                if (Math.abs(velocity) > 0.4) heading = velocity > 0 ? 180 : 0;
                // Rayda yan durmasın: en yakın dik yöne (yukarı/aşağı) dön
                else heading = Math.abs((((angle % 360) + 360) % 360) - 180) < 90 ? 180 : 0;
            } else {
                var target = mode === 'free' ? goal : rail;
                var k = mode === 'free' ? 0.3 : 0.1;
                pos.x += (target.x - pos.x) * ease(k, dt);
                pos.y += (target.y - pos.y) * ease(k, dt);
                var mx = pos.x - px, my = pos.y - py;
                var moved = Math.sqrt(mx * mx + my * my);
                speed = Math.min(1, moved / (12 * dt));
                if (moved > 0.6 * dt) heading = Math.atan2(mx, -my) * 180 / Math.PI;
                if (mode === 'return') {
                    var rx = rail.x - pos.x, ry = rail.y - pos.y;
                    if (rx * rx + ry * ry < 2) mode = 'rail';
                }
            }

            if (heading !== null) turnTo(heading, ease((mode === 'rail' ? 0.15 : 0.25), dt));

            flamePow += ((0.35 + speed * 1.4) - flamePow) * ease(0.2, dt);

            var small = window.innerWidth <= 900;
            rocket.style.transform = 'translate3d(' + (pos.x - ROCKET_W / 2).toFixed(2) + 'px,' +
                (pos.y - ROCKET_H / 2).toFixed(2) + 'px,0)';
            ship.style.transform = 'rotate(' + angle.toFixed(2) + 'deg)' + (small ? ' scale(.8)' : '');
            flame.style.setProperty('--rs-flame', flamePow.toFixed(3));
            fill.style.height = (railY + ROCKET_H / 2).toFixed(1) + 'px';
            rocket.setAttribute('aria-valuenow', Math.round(ratio * 100));

            // Egzoz: kuyruk ucundan, burnun tersine doğru
            var rad = angle * Math.PI / 180;
            var nx = Math.sin(rad), ny = -Math.cos(rad);
            var tail = (ROCKET_H / 2 - 6) * (small ? 0.8 : 1);
            if (speed > 0.05 || Math.random() < 0.15) spawn(pos.x - nx * tail, pos.y - ny * tail, -nx, -ny, speed);
            drawParticles(dt);

            requestAnimationFrame(frame);
        }

        measure();
        railY = (maxScroll > 0 ? window.scrollY / maxScroll : 0) * travel();
        var start = railPoint();
        pos.x = start.x; pos.y = start.y;
        window.addEventListener('resize', measure);
        if ('ResizeObserver' in window) new ResizeObserver(measure).observe(document.body);
        requestAnimationFrame(frame);
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();
})();
