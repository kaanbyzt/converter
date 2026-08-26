"""Basit, bağımlılıksız çoklu dil (i18n) ve temel SEO yardımcı katmanı.

Vercel serverless ortamında (dosya tabanlı session yok) çalışacak şekilde
sadece query-string + cookie + Accept-Language ile dil tespiti yapar.
Flask-Babel/.mo derleme adımına ihtiyaç duymaz; çeviriler düz Python
dict'leri olarak `translations/` altında tutulur.
"""

from urllib.parse import urlencode

from flask import g, request

SUPPORTED_LANGS = ["tr", "en"]
DEFAULT_LANG = "tr"
RTL_LANGS = set()

LANG_META = {
    "tr": {"name": "Türkçe", "flag": "🇹🇷"},
    "en": {"name": "English", "flag": "🇬🇧"},
}

_COOKIE_NAME = "lang"
_COOKIE_MAX_AGE = 60 * 60 * 24 * 365  # 1 yıl

_translations = {}


def _load_translations():
    from translations import ALL_TRANSLATIONS
    _translations.clear()
    _translations.update(ALL_TRANSLATIONS)


def _best_accept_language_match():
    best = request.accept_languages.best_match(SUPPORTED_LANGS)
    return best


def _resolve_lang():
    lang = request.args.get("lang")
    if lang in SUPPORTED_LANGS:
        return lang, True

    lang = request.cookies.get(_COOKIE_NAME)
    if lang in SUPPORTED_LANGS:
        return lang, False

    lang = _best_accept_language_match()
    if lang in SUPPORTED_LANGS:
        return lang, False

    return DEFAULT_LANG, False


def t(key, **kwargs):
    lang = getattr(g, "lang", DEFAULT_LANG)
    text = _translations.get(lang, {}).get(key)
    if text is None:
        text = _translations.get(DEFAULT_LANG, {}).get(key)
    if text is None:
        text = key
    if kwargs:
        try:
            text = text.format(**kwargs)
        except (KeyError, IndexError):
            pass
    return text


def _current_full_url_for_lang(lang):
    args = request.args.to_dict(flat=True)
    args["lang"] = lang
    return f"{request.path}?{urlencode(args)}"


def init_i18n(app):
    if not _translations:
        _load_translations()

    @app.before_request
    def _set_lang():
        lang, from_query = _resolve_lang()
        g.lang = lang
        g.lang_set_via_query = from_query

    @app.after_request
    def _persist_lang_cookie(response):
        if getattr(g, "lang_set_via_query", False):
            response.set_cookie(
                _COOKIE_NAME,
                g.lang,
                max_age=_COOKIE_MAX_AGE,
                samesite="Lax",
            )
        return response

    @app.context_processor
    def _inject_i18n():
        lang = getattr(g, "lang", DEFAULT_LANG)
        hreflang_links = [
            (code, _current_full_url_for_lang(code)) for code in SUPPORTED_LANGS
        ]
        lang_urls = {
            code: _current_full_url_for_lang(code) for code in SUPPORTED_LANGS
        }
        return {
            "t": t,
            "CURRENT_LANG": lang,
            "SUPPORTED_LANGS": SUPPORTED_LANGS,
            "LANG_META": LANG_META,
            "IS_RTL": lang in RTL_LANGS,
            "SEO_CANONICAL": request.url,
            "SEO_HREFLANG": hreflang_links,
            "SEO_HREFLANG_DEFAULT": _current_full_url_for_lang(DEFAULT_LANG),
            "LANG_URLS": lang_urls,
        }
