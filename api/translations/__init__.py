from . import tr, en
from .pages import PAGE_TRANSLATIONS

ALL_TRANSLATIONS = {
    "tr": tr.TRANSLATIONS,
    "en": en.TRANSLATIONS,
}

for _lang, _entries in PAGE_TRANSLATIONS.items():
    ALL_TRANSLATIONS.setdefault(_lang, {}).update(_entries)
