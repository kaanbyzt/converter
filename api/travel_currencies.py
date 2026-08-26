"""Seyahat Asistanı > Döviz Çevirici için para birimi listesi.

Her kayıt (ISO 4217 kodu, bayrak emoji, çeviri anahtarı) şeklindedir.
Kurlar sunucuda tutulmaz; tarayıcı doğrudan açık bir döviz kuru API'sinden
(exchangerate-api.com, CORS açık, anahtar gerektirmez) çeker.
"""

CURRENCIES = [
    ("USD", "🇺🇸", "travel.currency.name.USD"),
    ("EUR", "🇪🇺", "travel.currency.name.EUR"),
    ("GBP", "🇬🇧", "travel.currency.name.GBP"),
    ("JPY", "🇯🇵", "travel.currency.name.JPY"),
    ("CNY", "🇨🇳", "travel.currency.name.CNY"),
    ("CHF", "🇨🇭", "travel.currency.name.CHF"),
    ("CAD", "🇨🇦", "travel.currency.name.CAD"),
    ("AUD", "🇦🇺", "travel.currency.name.AUD"),
    ("TRY", "🇹🇷", "travel.currency.name.TRY"),
    ("RUB", "🇷🇺", "travel.currency.name.RUB"),
    ("INR", "🇮🇳", "travel.currency.name.INR"),
    ("KRW", "🇰🇷", "travel.currency.name.KRW"),
    ("HKD", "🇭🇰", "travel.currency.name.HKD"),
    ("SGD", "🇸🇬", "travel.currency.name.SGD"),
    ("SEK", "🇸🇪", "travel.currency.name.SEK"),
    ("NOK", "🇳🇴", "travel.currency.name.NOK"),
    ("DKK", "🇩🇰", "travel.currency.name.DKK"),
    ("PLN", "🇵🇱", "travel.currency.name.PLN"),
    ("THB", "🇹🇭", "travel.currency.name.THB"),
    ("MXN", "🇲🇽", "travel.currency.name.MXN"),
    ("BRL", "🇧🇷", "travel.currency.name.BRL"),
    ("ZAR", "🇿🇦", "travel.currency.name.ZAR"),
    ("AED", "🇦🇪", "travel.currency.name.AED"),
    ("SAR", "🇸🇦", "travel.currency.name.SAR"),
    ("NZD", "🇳🇿", "travel.currency.name.NZD"),
    ("ILS", "🇮🇱", "travel.currency.name.ILS"),
]

# Çevirici açıldığında hızlı referans tablosunda gösterilecek en çok kullanılan kodlar.
QUICK_REFERENCE_CODES = ["USD", "EUR", "GBP", "JPY", "CNY", "CHF", "AUD", "RUB"]
