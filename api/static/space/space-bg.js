// Uzay arka planı: three.js ile yıldız alanı + gerçek dokulu gezegenler.
// Sayfa kaydırıldıkça kamera gezegenlerin yanından geçer; açık temada ve sekme gizliyken durur.
(() => {
  const canvas = document.getElementById('space-canvas');
  if (!canvas || !window.THREE) return;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const BASE = canvas.dataset.base || '/static/space/';

  let renderer;
  try { renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'low-power' }); }
  catch (e) { return; }                                   // WebGL yoksa düz arka plan kalır
  // Araç sayfaları ağır işler yapabiliyor: piksel oranı sınırlı
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
  renderer.setClearColor(0x05060c, 1);
  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x05060c, 0.0028);
  const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 2000);
  camera.position.set(0, 0, 40);

  function resize() {
    const w = innerWidth, h = innerHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  addEventListener('resize', resize); resize();

  // Gerçek yıldız renkleri: sıcaklığa göre mavi-beyazdan turuncuya
  const starColors = [0x9bb0ff, 0xaabfff, 0xcad7ff, 0xf8f7ff, 0xfff4ea, 0xffd2a1, 0xffcc6f];
  const starUniforms = {
    uTime:  { value: 0 },
    uSpeed: { value: 0 },
    uPR:    { value: renderer.getPixelRatio() },
  };
  function starLayer(count, spread, depth, baseSize) {
    const g = new THREE.BufferGeometry();
    const pos = new Float32Array(count * 3), col = new Float32Array(count * 3);
    const size = new Float32Array(count), seed = new Float32Array(count);
    const c = new THREE.Color();
    for (let i = 0; i < count; i++) {
      pos[i*3]   = (Math.random() - .5) * spread;
      pos[i*3+1] = (Math.random() - .5) * spread;
      pos[i*3+2] = 60 - Math.random() * depth;
      // çoğu yıldız beyazımsı, azı renkli
      c.setHex(Math.random() < .7 ? 0xf8f7ff : starColors[(Math.random() * starColors.length) | 0]);
      col[i*3] = c.r; col[i*3+1] = c.g; col[i*3+2] = c.b;
      // parlaklık dağılımı: çok sayıda sönük, az sayıda parlak yıldız
      size[i] = baseSize * (0.4 + Math.pow(Math.random(), 6) * 3.5);
      seed[i] = Math.random() * 100;
    }
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    g.setAttribute('color',    new THREE.BufferAttribute(col, 3));
    g.setAttribute('aSize',    new THREE.BufferAttribute(size, 1));
    g.setAttribute('aSeed',    new THREE.BufferAttribute(seed, 1));
    const m = new THREE.ShaderMaterial({
      uniforms: starUniforms,
      vertexColors: true,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      vertexShader: `
        attribute float aSize; attribute float aSeed;
        uniform float uTime; uniform float uSpeed; uniform float uPR;
        varying vec3 vColor; varying float vTwinkle;
        void main() {
          vColor = color;
          vTwinkle = 0.75 + 0.25 * sin(uTime * (1.0 + fract(aSeed) * 2.5) + aSeed);
          vec4 mv = modelViewMatrix * vec4(position, 1.0);
          gl_Position = projectionMatrix * mv;
          float s = aSize * (1.0 + uSpeed * 0.6);
          gl_PointSize = clamp(s * uPR * (300.0 / -mv.z), 1.0, 64.0);
        }`,
      fragmentShader: `
        varying vec3 vColor; varying float vTwinkle;
        void main() {
          vec2 uv = gl_PointCoord - 0.5;
          float d = length(uv);
          float core = smoothstep(0.12, 0.0, d);          // parlak çekirdek
          float glow = exp(-d * 9.0) * 0.6;               // yumuşak hale
          // parlak yıldızlarda ince difraksiyon çizgileri
          float spike = (smoothstep(0.02, 0.0, abs(uv.x)) + smoothstep(0.02, 0.0, abs(uv.y))) * smoothstep(0.5, 0.0, d) * 0.25;
          float a = (core + glow + spike) * vTwinkle;
          if (a < 0.01) discard;
          gl_FragColor = vec4(vColor * a, a);
        }`
    });
    const pts = new THREE.Points(g, m); scene.add(pts); return pts;
  }
  const stars  = starLayer(9000, 900, 900, 1.6);
  const stars2 = starLayer(1200, 500, 900, 3.2);

  const loader = new THREE.TextureLoader();
  const maxAniso = renderer.capabilities.getMaxAnisotropy();
  // Yatayda tekrarla: kaydırılan bulut UV'si 1'i aşınca kenar pikseli uzayıp çizgi oluşturmasın
  const tex = k => { const t = loader.load(BASE + k + '.jpg'); t.anisotropy = maxAniso; t.wrapS = THREE.RepeatWrapping; return t; };
  const blank = new THREE.DataTexture(new Uint8Array([0, 0, 0, 255]), 1, 1); blank.needsUpdate = true;

  // Güneş yönü (tüm gezegenler aynı yönden aydınlanır)
  const LIGHT = new THREE.Vector3(-1, .6, .8).normalize();

  const surfaceVert = `
    varying vec2 vUv; varying vec3 vWN; varying vec3 vWP; varying vec3 vEast; varying vec3 vNorth; varying float vSinLat;
    void main(){
      vUv = uv;
      vWN = normalize(mat3(modelMatrix) * normal);
      // Yüzey teğetleri (doğu/kuzey): bulut gölgesini güneş yönünde kaydırmak için
      float phi = uv.x * 6.2831853;
      vEast = normalize(mat3(modelMatrix) * vec3(sin(phi), 0.0, cos(phi)));
      vNorth = cross(vWN, vEast);
      vSinLat = length(normal.xz);
      vec4 wp = modelMatrix * vec4(position, 1.0); vWP = wp.xyz;
      gl_Position = projectionMatrix * viewMatrix * wp;
    }`;

  const surfaceFrag = `
    uniform sampler2D uMap, uClouds, uNight, uSpec;
    uniform float uHasClouds, uHasNight, uHasSpec, uAtmStr, uCloudOff, uLimb;
    uniform vec3 uAtm, uLight;
    varying vec2 vUv; varying vec3 vWN; varying vec3 vWP; varying vec3 vEast; varying vec3 vNorth; varying float vSinLat;
    void main(){
      vec3 N = normalize(vWN), L = normalize(uLight), V = normalize(cameraPosition - vWP);
      float ndl = dot(N, L);
      float day = smoothstep(-0.12, 0.35, ndl);                  // yumuşak gündüz/gece sınırı
      float diff = clamp(ndl, 0.0, 1.0);
      float ndv = max(dot(N, V), 0.0);

      vec3 col = texture2D(uMap, vUv).rgb;
      // Terminatör yakınında ışık kalın atmosferden geçer: hafif sıcak ton
      vec3 sun = mix(vec3(1.0, 0.62, 0.38), vec3(1.0), smoothstep(0.0, 0.3, ndl));
      vec3 lit = col * sun * (diff * 1.15 + 0.015);
      // Kenar kararması (gaz devlerinde belirgin)
      lit *= mix(1.0, 0.45 + 0.55 * pow(ndv, 0.5), uLimb);

      // Okyanus parlaması (sadece su olan yerlerde)
      if (uHasSpec > 0.5) {
        float water = texture2D(uSpec, vUv).r;
        vec3 H = normalize(L + V);
        lit += vec3(1.0, 0.93, 0.8) * pow(max(dot(N, H), 0.0), 40.0) * water * 0.55 * diff;
      }
      // Gece tarafında şehir ışıkları
      if (uHasNight > 0.5) {
        vec3 lights = texture2D(uNight, vUv).rgb;
        lit += lights * vec3(1.0, 0.8, 0.55) * 1.4 * (1.0 - day);
      }
      // Bulut gölgesi: bulutlar ayrı kürede; gölge, güneş yönünde kaydırılmış noktadan okunur
      if (uHasClouds > 0.5) {
        vec3 T = L - N * ndl;
        float h = 0.012 / max(ndl, 0.25);
        vec2 off = vec2(dot(T, vEast) / (6.2831853 * max(vSinLat, 0.15)), dot(T, vNorth) / 3.1415927) * h;
        float shadow = texture2D(uClouds, vec2(vUv.x + uCloudOff, vUv.y) + off).r;
        lit *= 1.0 - smoothstep(0.1, 0.8, shadow) * 0.45 * diff;
      }
      // Kenarda ince atmosfer tonu (gündüz tarafında yüzeyi hafif pusla örter)
      float fr = pow(1.0 - ndv, 3.0);
      lit = mix(lit, uAtm * diff, fr * 0.35 * uAtmStr * day);
      lit += uAtm * fr * smoothstep(-0.25, 0.6, ndl) * uAtmStr;
      gl_FragColor = vec4(lit, 1.0);
    }`;

  // Bulut katmanı: yüzeyin biraz üstünde, kendi hızıyla dönen yarı saydam küre
  const cloudVert = `
    varying vec2 vUv; varying vec3 vWN; varying vec3 vWP;
    void main(){
      vUv = uv;
      vWN = normalize(mat3(modelMatrix) * normal);
      vec4 wp = modelMatrix * vec4(position, 1.0); vWP = wp.xyz;
      gl_Position = projectionMatrix * viewMatrix * wp;
    }`;
  const cloudFrag = `
    uniform sampler2D uClouds; uniform vec3 uLight, uAtm;
    varying vec2 vUv; varying vec3 vWN; varying vec3 vWP;
    void main(){
      vec3 N = normalize(vWN), L = normalize(uLight), V = normalize(cameraPosition - vWP);
      float c = texture2D(uClouds, vUv).r;
      float a = smoothstep(0.06, 0.75, c);
      a = pow(a, 1.3);                                          // ince bulutlar daha saydam
      float ndl = dot(N, L), ndv = max(dot(N, V), 0.0);
      // Yumuşak (wrap) aydınlatma: bulut ışığı saçar, sınır sert kesilmez
      float wrap = clamp((ndl + 0.15) / 1.15, 0.0, 1.0);
      vec3 sun = mix(vec3(1.0, 0.55, 0.32), vec3(1.0), smoothstep(-0.05, 0.35, ndl));
      // Kalın bulut parlak, ince bulut biraz gri-mavi
      vec3 base = mix(vec3(0.78, 0.82, 0.88), vec3(1.0), c);
      vec3 col = base * sun * wrap * 1.05 + uAtm * 0.03;
      // Kenarda bakış açısı eğikleştikçe bulut yoğunlaşır, ama atmosfer içinde hafifçe kaybolur
      a *= mix(0.55, 1.0, smoothstep(0.0, 0.35, ndv));
      a = min(a * (1.0 + (1.0 - ndv) * 0.6), 1.0);
      gl_FragColor = vec4(col, a * 0.95);
    }`;

  // Atmosfer halesi: gezegenin etrafında, güneşe bakan tarafta parlayan ince kabuk
  const atmVert = `
    varying vec3 vWN; varying vec3 vWP;
    void main(){
      vWN = normalize(mat3(modelMatrix) * normal);
      vec4 wp = modelMatrix * vec4(position, 1.0); vWP = wp.xyz;
      gl_Position = projectionMatrix * viewMatrix * wp;
    }`;
  const atmFrag = `
    uniform vec3 uAtm, uLight; uniform float uK, uStr;
    varying vec3 vWN; varying vec3 vWP;
    void main(){
      vec3 N = normalize(vWN), V = normalize(cameraPosition - vWP);
      float d = clamp(-dot(N, V) / uK, 0.0, 1.0);
      float i = pow(d, 3.0) * smoothstep(-0.45, 0.5, dot(N, normalize(uLight)));
      gl_FragColor = vec4(uAtm * i * uStr, i * uStr);
    }`;

  // Halka: gerçek Satürn halka dokusu + gezegenin halka üzerine düşen gölgesi
  const ringVert = `
    varying vec3 vL; varying vec3 vWP;
    void main(){
      vL = position;
      vec4 wp = modelMatrix * vec4(position, 1.0); vWP = wp.xyz;
      gl_Position = projectionMatrix * viewMatrix * wp;
    }`;
  const ringFrag = `
    uniform sampler2D uRing; uniform float uInner, uOuter, uR; uniform vec3 uCenter, uLight;
    varying vec3 vL; varying vec3 vWP;
    void main(){
      float t = (length(vL.xy) - uInner) / (uOuter - uInner);
      vec3 col = texture2D(uRing, vec2(t, 0.5)).rgb;
      float lum = dot(col, vec3(0.3, 0.59, 0.11));
      float alpha = smoothstep(0.08, 0.55, lum) * smoothstep(0.0, 0.02, t) * smoothstep(1.0, 0.97, t);
      vec3 L = normalize(uLight); vec3 toC = uCenter - vWP;
      float along = dot(toC, L); float perp = length(toC - along * L);
      float shadow = along > 0.0 ? smoothstep(uR * 0.97, uR * 1.02, perp) : 1.0;
      gl_FragColor = vec4(col * (0.1 + 0.95 * shadow), alpha * 0.95);
    }`;

  function planet({ r, x, y, z, map, clouds, night, spec, atm, atmStr = 1, ring, tilt = 0, spin = .03, limb = 0 }) {
    const grp = new THREE.Group();
    grp.position.set(x, y, z);
    grp.rotation.z = tilt;
    const cloudTex = clouds ? tex(clouds) : blank;
    const cloudOff = { value: 0 };
    const mesh = new THREE.Mesh(
      new THREE.SphereGeometry(r, 128, 128),
      new THREE.ShaderMaterial({
        vertexShader: surfaceVert, fragmentShader: surfaceFrag,
        uniforms: {
          uMap: { value: tex(map) },
          uClouds: { value: cloudTex }, uHasClouds: { value: clouds ? 1 : 0 }, uCloudOff: cloudOff,
          uNight:  { value: night  ? tex(night)  : blank }, uHasNight:  { value: night  ? 1 : 0 },
          uSpec:   { value: spec   ? tex(spec)   : blank }, uHasSpec:   { value: spec   ? 1 : 0 },
          uAtm: { value: new THREE.Color(atm) }, uAtmStr: { value: atmStr }, uLight: { value: LIGHT }, uLimb: { value: limb },
        },
      })
    );
    grp.add(mesh);

    // Bulut küresi yüzeyin çocuğu: zeminle birlikte döner, üstüne kendi yavaş kaymasını ekler
    let cloudMesh = null;
    if (clouds) {
      cloudMesh = new THREE.Mesh(
        new THREE.SphereGeometry(r * 1.008, 128, 128),
        new THREE.ShaderMaterial({
          vertexShader: cloudVert, fragmentShader: cloudFrag,
          transparent: true, depthWrite: false,
          uniforms: { uClouds: { value: cloudTex }, uLight: { value: LIGHT }, uAtm: { value: new THREE.Color(atm) } },
        })
      );
      mesh.add(cloudMesh);
    }

    const s = 1.1;
    grp.add(new THREE.Mesh(
      new THREE.SphereGeometry(r * s, 96, 96),
      new THREE.ShaderMaterial({
        vertexShader: atmVert, fragmentShader: atmFrag, side: THREE.BackSide,
        transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
        uniforms: { uAtm: { value: new THREE.Color(atm) }, uLight: { value: LIGHT }, uK: { value: Math.sqrt(1 - 1 / (s * s)) }, uStr: { value: atmStr } },
      })
    ));

    if (ring) {
      // Gerçek oranlar: halka gezegen yarıçapının ~1.24 ile ~2.27 katı arasında
      const inner = r * 1.24, outer = r * 2.27;
      const rg = new THREE.Mesh(
        new THREE.RingGeometry(inner, outer, 256, 1),
        new THREE.ShaderMaterial({
          vertexShader: ringVert, fragmentShader: ringFrag, side: THREE.DoubleSide,
          transparent: true, depthWrite: false,
          uniforms: {
            uRing: { value: tex(ring) }, uInner: { value: inner }, uOuter: { value: outer }, uR: { value: r },
            uCenter: { value: grp.position }, uLight: { value: LIGHT },
          },
        })
      );
      rg.rotation.x = Math.PI / 2.3; grp.add(rg);
    }
    scene.add(grp);
    return { grp, mesh, spin, cloudMesh, cloudOff };
  }

  // Her bölüm için bir gezegen; kamera z ekseninde ilerlerken yanlarından geçer
  const planets = [
    // Kalkış: Dünya (bulutlar, okyanus parlaması, gece şehir ışıkları)
    planet({ r: 14, x: 26, y: -6, z: -10, tilt: .41, spin: .02,
      map: 'earth', clouds: 'clouds', night: 'night', spec: 'spec', atm: '#5fa8ff', atmStr: 1.2 }),
    // Hakkımda: Satürn ve halkaları
    planet({ r: 20, x: -38, y: 4, z: -190, tilt: -.2, spin: .04,
      map: 'saturn', ring: 'ring', atm: '#ffd9a0', atmStr: .35, limb: .8 }),
    // Projeler: Mars
    planet({ r: 13, x: 32, y: 8, z: -360, tilt: .44, spin: .025,
      map: 'mars', atm: '#ff9a6a', atmStr: .45, limb: .3 }),
    // İletişim: Jüpiter
    planet({ r: 36, x: -10, y: -55, z: -560, tilt: .05, spin: .05,
      map: 'jupiter', atm: '#ffd2a8', atmStr: .4, limb: .9 }),
  ];

  // ---------- Kaydırma -> kamera yolculuğu (sayfa ne kadar uzunsa o kadar yol alır) ----------
  const path = [
    { z: 40,   x: 0,  y: 0 },
    { z: -130, x: -6, y: 2 },
    { z: -300, x: 6,  y: 0 },
    { z: -480, x: 0,  y: -8 },
  ];
  const ease = t => t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
  function pathAt(f) {
    const s = f * (path.length - 1), i = Math.min(Math.floor(s), path.length - 2), k = ease(s - i);
    const p = path[i], q = path[i + 1];
    return { x: p.x + (q.x - p.x) * k, y: p.y + (q.y - p.y) * k, z: p.z + (q.z - p.z) * k };
  }
  function scrollFrac() {
    const max = document.documentElement.scrollHeight - innerHeight;
    return max > 40 ? Math.min(Math.max(scrollY / max, 0), 1) : 0;
  }
  const flight = { ...path[0] };

  const mouse = { x: 0, y: 0 }, look = { x: 0, y: 0 };
  addEventListener('pointermove', e => {
    mouse.x = (e.clientX / innerWidth - .5) * 2;
    mouse.y = (e.clientY / innerHeight - .5) * 2;
  }, { passive: true });

  // ---------- Döngü ----------
  const isDark = () => document.documentElement.getAttribute('data-theme') !== 'light';
  const clock = new THREE.Clock();
  let raf = null, lastZ = flight.z, time = 0;
  function frame() {
    time += Math.min(clock.getDelta(), .1);       // duraklatmadan dönünce sıçrama olmasın
    const t = reduce ? 0 : time;
    const target = pathAt(scrollFrac());
    const k = reduce ? 1 : .06;
    flight.x += (target.x - flight.x) * k;
    flight.y += (target.y - flight.y) * k;
    flight.z += (target.z - flight.z) * k;
    look.x += (mouse.x - look.x) * .04;
    look.y += (mouse.y - look.y) * .04;
    camera.position.set(flight.x + look.x * 2, flight.y - look.y * 1.5, flight.z);
    camera.lookAt(flight.x + look.x * 6, flight.y - look.y * 4, flight.z - 100);

    planets.forEach(p => {
      p.mesh.rotation.y = t * p.spin;
      if (p.cloudMesh) {           // bulutlar zeminden biraz hızlı kayar; açı taşmasın diye 2π'de sarılır
        const a = (t * .006) % (Math.PI * 2);
        p.cloudMesh.rotation.y = a;
        p.cloudOff.value = -a / (Math.PI * 2);
      }
    });
    stars.rotation.z = t * .004;
    const speed = Math.abs(flight.z - lastZ); lastZ = flight.z;
    starUniforms.uTime.value = t;
    starUniforms.uSpeed.value += (Math.min(speed, 4) - starUniforms.uSpeed.value) * .1;

    renderer.render(scene, camera);
    raf = requestAnimationFrame(frame);
  }
  function start() { if (!raf && isDark() && !document.hidden) { clock.getDelta(); raf = requestAnimationFrame(frame); } }
  function stop()  { if (raf) { cancelAnimationFrame(raf); raf = null; } }
  const sync = () => (isDark() && !document.hidden ? start() : stop());

  document.addEventListener('visibilitychange', sync);
  new MutationObserver(sync).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  sync();
})();
