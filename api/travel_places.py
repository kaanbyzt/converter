"""Seyahat Asistanı > Yakın Yerler için arama kategorisi verisi.

Her kategori (key, ikon, çeviri etiketi, Google Haritalar arama terimi) şeklindedir.
Arama terimi İngilizcedir çünkü Google Haritalar ABD içinde en iyi sonucu bu şekilde verir.
"""

NEARBY_CATEGORIES = [
    ("hospital", "🏥", "travel.nearby.cat.hospital", "hospital"),
    ("pharmacy", "💊", "travel.nearby.cat.pharmacy", "pharmacy"),
    ("police", "🚔", "travel.nearby.cat.police", "police station"),
    ("consulate", "🇹🇷", "travel.nearby.cat.consulate", "Turkish consulate"),
    ("restaurant", "🍽️", "travel.nearby.cat.restaurant", "restaurant"),
    ("transit", "🚇", "travel.nearby.cat.transit", "public transit station"),
    ("atm", "🏧", "travel.nearby.cat.atm", "ATM"),
    ("gas", "⛽", "travel.nearby.cat.gas", "gas station"),
]
