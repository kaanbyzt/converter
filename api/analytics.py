"""Vercel KV / Upstash Redis REST API üzerinden basit ziyaret/kullanım sayaçları.

Sunucu tarafında dosya sistemi kalıcı değildir (Vercel serverless), bu yüzden
sayaçlar KV_REST_API_URL / KV_REST_API_TOKEN ortam değişkenleri ile erişilen
Upstash REST API'sinde tutulur. Bu değişkenler tanımlı değilse (ör. yerelde
env ayarlanmadıysa) izleme sessizce devre dışı kalır; site bundan etkilenmez.
"""

import os

import requests

_KV_URL = os.environ.get("KV_REST_API_URL", "").rstrip("/")
_KV_TOKEN = os.environ.get("KV_REST_API_TOKEN", "")
_TIMEOUT = 1.5

_PAGEVIEWS_KEY = "stats:pageviews"
_VISITORS_KEY = "stats:visitors"
_ROUTES_KEY = "stats:routes"

_LOGIN_FAIL_PREFIX = "loginfail:"
_LOGIN_MAX_ATTEMPTS = 5
_LOGIN_LOCK_SECONDS = 300


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


def track_pageview(path, visitor_id):
    """Tek bir sayfa görüntülemesini kaydeder. Depo yoksa/erişilemezse no-op."""
    _pipeline([
        ["INCR", _PAGEVIEWS_KEY],
        ["SADD", _VISITORS_KEY, visitor_id],
        ["HINCRBY", _ROUTES_KEY, path, 1],
    ])


def get_stats():
    result = _pipeline([
        ["GET", _PAGEVIEWS_KEY],
        ["SCARD", _VISITORS_KEY],
        ["HGETALL", _ROUTES_KEY],
    ])
    if result is None:
        return {"available": False, "pageviews": 0, "visitors": 0, "routes": []}

    pageviews = int((result[0] or {}).get("result") or 0)
    visitors = int((result[1] or {}).get("result") or 0)
    flat = (result[2] or {}).get("result") or []

    routes = [(flat[i], int(flat[i + 1])) for i in range(0, len(flat) - 1, 2)]
    routes.sort(key=lambda item: item[1], reverse=True)

    return {"available": True, "pageviews": pageviews, "visitors": visitors, "routes": routes}


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
