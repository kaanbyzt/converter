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

_DAILY_PREFIX = "stats:daily:"
_DAILY_TTL = 60 * 60 * 24 * 40  # gösterilen 14 günden fazla, güvenlik payı

_DEDUP_PREFIX = "seen:"
_DEDUP_TTL = 60 * 60 * 24  # aynı IP + sayfa bir günde yalnızca bir kez sayılır
_DEDUP_PEPPER = os.environ.get("FLASK_SECRET_KEY", "")

_LOGIN_FAIL_PREFIX = "loginfail:"
_LOGIN_MAX_ATTEMPTS = 5
_LOGIN_LOCK_SECONDS = 300

_LOG_PREFIX = "log:"
_LOG_TTL = 60 * 60 * 24 * 60  # 60 gün saklanır, sonra kendiliğinden silinir
_LOG_MAX_PER_DAY = 500  # tek günde en fazla bu kadar satır tutulur (depolama sınırı)


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
    _pipeline([
        ["RPUSH", key, json.dumps(entry, ensure_ascii=False)],
        ["LTRIM", key, str(-_LOG_MAX_PER_DAY), "-1"],
        ["EXPIRE", key, str(_LOG_TTL)],
    ])


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
    ])
    if result is None:
        return {"available": False, "pageviews": 0, "visitors": 0, "routes": [], "daily": []}

    pageviews = int((result[0] or {}).get("result") or 0)
    visitors = int((result[1] or {}).get("result") or 0)
    flat = (result[2] or {}).get("result") or []

    routes = [(flat[i], int(flat[i + 1])) for i in range(0, len(flat) - 1, 2)]
    routes.sort(key=lambda item: item[1], reverse=True)

    return {
        "available": True,
        "pageviews": pageviews,
        "visitors": visitors,
        "routes": routes,
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
