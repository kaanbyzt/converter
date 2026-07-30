from . import tr, en, de, fr, es, ru, ar, zh
from .pages import PAGE_TRANSLATIONS

ALL_TRANSLATIONS = {
    "tr": tr.TRANSLATIONS,
    "en": en.TRANSLATIONS,
    "de": de.TRANSLATIONS,
    "fr": fr.TRANSLATIONS,
    "es": es.TRANSLATIONS,
    "ru": ru.TRANSLATIONS,
    "ar": ar.TRANSLATIONS,
    "zh": zh.TRANSLATIONS,
}

for _lang, _entries in PAGE_TRANSLATIONS.items():
    ALL_TRANSLATIONS.setdefault(_lang, {}).update(_entries)
