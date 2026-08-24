"""Vercel KV / Upstash Redis REST API üzerinden basit ziyaret/kullanım sayaçları.

Sunucu tarafında dosya sistemi kalıcı değildir (Vercel serverless), bu yüzden
sayaçlar KV_REST_API_URL / KV_REST_API_TOKEN ortam değişkenleri ile erişilen
Upstash REST API'sinde tutulur. Bu değişkenler tanımlı değilse (ör. yerelde
env ayarlanmadıysa) izleme sessizce devre dışı kalır; site bundan etkilenmez.
"""

import datetime
import hashlib
import json
import os

import requests

_KV_URL = os.environ.get("KV_REST_API_URL", "").rstrip("/")
_KV_TOKEN = os.environ.get("KV_REST_API_TOKEN", "")
_TIMEOUT = 1.5

_PAGEVIEWS_KEY = "stats:pageviews"
_VISITORS_KEY = "stats:visitors"
_ROUTES_KEY = "stats:routes"
_ACTIONS_KEY = "stats:actions"

_DAILY_PREFIX = "stats:daily:"
_DAILY_TTL = 60 * 60 * 24 * 40  # gösterilen 14 günden fazla, güvenlik payı

_DEDUP_PREFIX = "seen:"
_DEDUP_TTL = 60 * 60 * 24  # aynı IP + sayfa bir günde yalnızca bir kez sayılır
_DEDUP_PEPPER = os.environ.get("FLASK_SECRET_KEY", "")

_LOGIN_FAIL_PREFIX = "loginfail:"
_LOGIN_MAX_ATTEMPTS = 5
_LOGIN_LOCK_SECONDS = 300

_LOCATION_DAILY_PREFIX = "stats:locdaily:"
_LOCATION_TOTALS_KEY = "stats:loctotals"
_LOCATION_DAILY_TTL = 60 * 60 * 24 * 40  # gösterilen 14 günden fazla, güvenlik payı

_LOG_PREFIX = "log:"
_LOG_TTL = 60 * 60 * 24 * 60  # 60 gün saklanır, sonra kendiliğinden silinir
_LOG_MAX_PER_DAY = 500  # tek günde en fazla bu kadar satır tutulur (depolama sınırı)

_GEOCODE_LOCK_KEY = "geocode:lock"
_GEOCODE_LOCK_MS = 1100  # Nominatim kullanım politikası: saniyede en fazla 1 istek

_OVERPASS_LOCK_KEY = "overpass:lock"
_OVERPASS_LOCK_MS = 2500  # ücretsiz Overpass sunucusu yoğun altında hızlı tükeniyor; daha temkinli aralık

_IP_RATE_PREFIX = "iprate:"
_IP_RATE_PEPPER = os.environ.get("FLASK_SECRET_KEY", "")


def _today_str():
    return datetime.datetime.utcnow().strftime("%Y-%m-%d")


def _dedup_key(day, path, ip):
    digest = hashlib.sha256(f"{_DEDUP_PEPPER}:{day}:{path}:{ip}".encode()).hexdigest()[:24]
    return _DEDUP_PREFIX + digest


def is_configured():
    return bool(_KV_URL and _KV_TOKEN)


def _pipeline(commands):
    if not is_configured():
        return None
    try:
        resp = requests.post(
            f"{_KV_URL}/pipeline",
            headers={"Authorization": f"Bearer {_KV_TOKEN}"},
            json=commands,
            timeout=_TIMEOUT,
        )
        resp.raise_for_status()
        return resp.json()
    except requests.RequestException:
        return None


def track_pageview(path, visitor_id, ip):
    """Bir sayfa görüntülemesini kaydeder. Aynı IP aynı sayfayı aynı gün
    içinde tekrar açarsa (yenileme dahil) sayaçlara ikinci kez eklenmez.
    Depo yoksa/erişilemezse no-op."""
    day = _today_str()
    dedup_key = _dedup_key(day, path, ip)

    result = _pipeline([
        ["SET", dedup_key, "1", "NX", "EX", str(_DEDUP_TTL)],
        ["SADD", _VISITORS_KEY, visitor_id],
    ])
    if result is None:
        return

    is_first_today = (result[0] or {}).get("result") is not None
    if not is_first_today:
        return

    daily_key = _DAILY_PREFIX + day
    _pipeline([
        ["INCR", _PAGEVIEWS_KEY],
        ["HINCRBY", _ROUTES_KEY, path, 1],
        ["INCR", daily_key],
        ["EXPIRE", daily_key, str(_DAILY_TTL)],
    ])
    log_event(ip, path, "view", day=day)


def log_event(ip, path, kind, action=None, day=None):
    """Tek bir satırlık kayıt: kim (ip), ne zaman, hangi sayfa, ne yaptı.
    Dosya/belge içeriği asla tutulmaz — yalnızca bu üstveri. Depo yoksa no-op."""
    day = day or _today_str()
    entry = {
        "ts": datetime.datetime.utcnow().strftime("%H:%M:%S"),
        "ip": ip,
        "path": path,
        "kind": kind,
    }
    if action:
        entry["action"] = action
    key = _LOG_PREFIX + day
    commands = [
        ["RPUSH", key, json.dumps(entry, ensure_ascii=False)],
        ["LTRIM", key, str(-_LOG_MAX_PER_DAY), "-1"],
        ["EXPIRE", key, str(_LOG_TTL)],
    ]
    if kind == "action" and action:
        commands.append(["HINCRBY", _ACTIONS_KEY, action, 1])
    _pipeline(commands)


def get_log(day, limit=500):
    """Belirli bir gün için kayıtları en yeniden en eskiye döner."""
    result = _pipeline([["LRANGE", _LOG_PREFIX + day, "0", str(limit - 1)]])
    if result is None:
        return []
    raw = (result[0] or {}).get("result") or []
    events = []
    for item in raw:
        try:
            events.append(json.loads(item))
        except (ValueError, TypeError):
            continue
    events.reverse()
    return events


def get_daily_series(days=14):
    """Son `days` gün için (tarih, görüntülenme) listesini eskiden yeniye döner."""
    if not is_configured():
        return []
    today = datetime.datetime.utcnow().date()
    date_strs = [
        (today - datetime.timedelta(days=i)).strftime("%Y-%m-%d")
        for i in range(days - 1, -1, -1)
    ]
    result = _pipeline([["GET", _DAILY_PREFIX + d] for d in date_strs])
    if result is None:
        return []
    return [(d, int((r or {}).get("result") or 0)) for d, r in zip(date_strs, result)]


def get_stats():
    result = _pipeline([
        ["GET", _PAGEVIEWS_KEY],
        ["SCARD", _VISITORS_KEY],
        ["HGETALL", _ROUTES_KEY],
        ["HGETALL", _ACTIONS_KEY],
    ])
    if result is None:
        return {"available": False, "pageviews": 0, "visitors": 0, "routes": [], "actions": [], "daily": []}

    pageviews = int((result[0] or {}).get("result") or 0)
    visitors = int((result[1] or {}).get("result") or 0)
    flat_routes = (result[2] or {}).get("result") or []
    flat_actions = (result[3] or {}).get("result") or []

    routes = [(flat_routes[i], int(flat_routes[i + 1])) for i in range(0, len(flat_routes) - 1, 2)]
    routes.sort(key=lambda item: item[1], reverse=True)

    actions = [(flat_actions[i], int(flat_actions[i + 1])) for i in range(0, len(flat_actions) - 1, 2)]
    actions.sort(key=lambda item: item[1], reverse=True)

    return {
        "available": True,
        "pageviews": pageviews,
        "visitors": visitors,
        "routes": routes,
        "actions": actions,
        "daily": get_daily_series(14),
    }


def check_login_lock(client_id):
    """KV yoksa/erişilemiyorsa her zaman 0 (kilitli değil) döner — bu durumda
    kaba kuvvet koruması devre dışı kalır ama giriş engellenmez."""
    result = _pipeline([
        ["GET", _LOGIN_FAIL_PREFIX + client_id],
        ["TTL", _LOGIN_FAIL_PREFIX + client_id],
    ])
    if result is None:
        return 0
    count = int((result[0] or {}).get("result") or 0)
    ttl = int((result[1] or {}).get("result") or -1)
    if count >= _LOGIN_MAX_ATTEMPTS and ttl > 0:
        return ttl
    return 0


def record_failed_login(client_id):
    key = _LOGIN_FAIL_PREFIX + client_id
    _pipeline([
        ["INCR", key],
        ["EXPIRE", key, str(_LOGIN_LOCK_SECONDS)],
    ])


def clear_login_attempts(client_id):
    _pipeline([["DEL", _LOGIN_FAIL_PREFIX + client_id]])


def _try_acquire_lock(key, ms):
    if not is_configured():
        return True
    result = _pipeline([["SET", key, "1", "NX", "PX", str(ms)]])
    if result is None:
        return True
    return (result[0] or {}).get("result") is not None


def try_acquire_geocode_slot():
    """Dış geocoding servisine (Nominatim) saniyede en fazla 1 istek gitmesini
    sağlayan basit bir kilit. KV yoksa (yerelde env tanımlı değilse) her zaman
    izin verir — bu durumda sınırlama devre dışı kalır ama site çökmez."""
    return _try_acquire_lock(_GEOCODE_LOCK_KEY, _GEOCODE_LOCK_MS)


def try_acquire_overpass_slot():
    """Dış POI arama servisine (Overpass API) saniyede en fazla 1 istek
    gitmesini sağlayan basit bir kilit. KV yoksa her zaman izin verir."""
    return _try_acquire_lock(_OVERPASS_LOCK_KEY, _OVERPASS_LOCK_MS)


def log_location_query(kind):
    """Konum tabanlı dış servis sorgularını (reverse_geocode, nearby_places)
    günlük ve toplam olarak sayar. Konum/koordinat burada asla tutulmaz,
    yalnızca bir sayaç artırılır. KV yoksa no-op."""
    day = _today_str()
    key = _LOCATION_DAILY_PREFIX + day
    _pipeline([
        ["HINCRBY", key, kind, 1],
        ["EXPIRE", key, str(_LOCATION_DAILY_TTL)],
        ["HINCRBY", _LOCATION_TOTALS_KEY, kind, 1],
    ])


def get_location_stats(days=14):
    """Son `days` gün için reverse-geocode/yakın-yer sorgu sayılarını ve
    toplam sayaçları döner."""
    if not is_configured():
        return {"daily": [], "totals": {}}

    today = datetime.datetime.utcnow().date()
    date_strs = [
        (today - datetime.timedelta(days=i)).strftime("%Y-%m-%d")
        for i in range(days - 1, -1, -1)
    ]
    commands = [["HGETALL", _LOCATION_DAILY_PREFIX + d] for d in date_strs]
    commands.append(["HGETALL", _LOCATION_TOTALS_KEY])
    result = _pipeline(commands)
    if result is None:
        return {"daily": [], "totals": {}}

    daily = []
    for d, r in zip(date_strs, result[:-1]):
        flat = (r or {}).get("result") or []
        counts = {flat[i]: int(flat[i + 1]) for i in range(0, len(flat) - 1, 2)}
        daily.append({
            "date": d,
            "reverse_geocode": counts.get("reverse_geocode", 0),
            "nearby_places": counts.get("nearby_places", 0),
        })

    totals_flat = (result[-1] or {}).get("result") or []
    totals = {totals_flat[i]: int(totals_flat[i + 1]) for i in range(0, len(totals_flat) - 1, 2)}

    return {"daily": daily, "totals": totals}


def try_acquire_ip_slot(ip, scope, seconds):
    """Aynı IP'nin belirli bir konum uç noktasını (`scope`) `seconds`
    saniyede yalnızca bir kez çağırabilmesini sağlar — bot/otomatik istek
    koruması. IP ham olarak saklanmaz, tuzlanıp hash'lenir. KV yoksa her
    zaman izin verir."""
    digest = hashlib.sha256(f"{_IP_RATE_PEPPER}:{scope}:{ip}".encode()).hexdigest()[:24]
    return _try_acquire_lock(_IP_RATE_PREFIX + digest, seconds * 1000)
