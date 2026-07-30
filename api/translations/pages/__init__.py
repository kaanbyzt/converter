"""Araç sayfalarına özgü çeviriler (her dosya bir sayfa grubunu kapsar).

Her modül `PAGES = {"tr": {...}, "en": {...}, ...}` şeklinde bir dict export eder.
Burada otomatik olarak keşfedilip birleştirilir; yeni bir grup eklemek için
sadece bu klasöre yeni bir .py dosyası eklemek yeterlidir.
"""

import importlib
import pkgutil


def _collect_page_translations():
    merged = {}
    package = importlib.import_module(__name__)
    for _, module_name, is_pkg in pkgutil.iter_modules(package.__path__):
        if is_pkg:
            continue
        module = importlib.import_module(f"{__name__}.{module_name}")
        pages = getattr(module, "PAGES", None)
        if not pages:
            continue
        for lang, entries in pages.items():
            merged.setdefault(lang, {}).update(entries)
    return merged


PAGE_TRANSLATIONS = _collect_page_translations()
