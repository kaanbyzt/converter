"""Seyahat Asistanı > Acil Çeviri için Türkçe-İngilizce hazır cümle verisi.

Her kategori (key, çeviri etiketi, [(türkçe, ingilizce), ...]) şeklindedir.
Sadece bu dosyayı düzenleyerek yeni kategori/cümle eklenebilir.
"""

EMERGENCY_CATEGORIES = [
    (
        "medical",
        "travel.emergency.cat.medical",
        [
            ("Yardım edin, lütfen!", "Help me, please!"),
            ("Ambulans çağırın!", "Call an ambulance!"),
            ("Doktora ihtiyacım var.", "I need a doctor."),
            ("En yakın hastane nerede?", "Where is the nearest hospital?"),
            ("Penisiline alerjim var.", "I'm allergic to penicillin."),
            ("Göğsümde ağrı var.", "I have chest pain."),
            ("Nefes alamıyorum.", "I can't breathe."),
            ("İlaçlarımı kaybettim.", "I lost my medication."),
            ("Sağlık sigortam var.", "I have health insurance."),
        ],
    ),
    (
        "police",
        "travel.emergency.cat.police",
        [
            ("Polis çağırın!", "Call the police!"),
            ("Çantam çalındı.", "My bag was stolen."),
            ("Kayboldum.", "I am lost."),
            ("Pasaportumu kaybettim.", "I lost my passport."),
            ("Türk Konsolosluğu'nu aramam gerekiyor.", "I need to call the Turkish Consulate."),
            ("Bir kaza oldu.", "There has been an accident."),
            ("Kendimi güvende hissetmiyorum.", "I don't feel safe."),
            ("Bir avukatla konuşmak istiyorum.", "I want to speak to a lawyer."),
        ],
    ),
    (
        "airport",
        "travel.emergency.cat.airport",
        [
            ("Uçağımı kaçırdım.", "I missed my flight."),
            ("Bagajım kayboldu.", "My luggage is lost."),
            ("Aktarma uçuşum var.", "I have a connecting flight."),
            ("İşte pasaportum ve vizem.", "Here is my passport and visa."),
            ("Ziyaret amacım turizm.", "The purpose of my visit is tourism."),
            ("Gümrükte beyan edecek bir şeyim yok.", "I have nothing to declare."),
            ("Uçuşum ertelendi.", "My flight has been delayed."),
        ],
    ),
    (
        "hotel",
        "travel.emergency.cat.hotel",
        [
            ("Rezervasyonum var.", "I have a reservation."),
            ("Oda anahtarımı kaybettim.", "I lost my room key."),
            ("Odamda sıcak su yok.", "There is no hot water in my room."),
            ("Faturamı görebilir miyim?", "Can I see my bill, please?"),
            ("Bagajımı saklayabilir misiniz?", "Can you store my luggage, please?"),
            ("Bana bir taksi çağırabilir misiniz?", "Can you call me a taxi, please?"),
        ],
    ),
    (
        "restaurant",
        "travel.emergency.cat.restaurant",
        [
            ("Menüyü görebilir miyim?", "Can I see the menu, please?"),
            ("Fıstık alerjim var.", "I have a peanut allergy."),
            ("Vejetaryen bir seçenek var mı?", "Is there a vegetarian option?"),
            ("Hesabı alabilir miyim?", "Can I have the check, please?"),
            ("Biraz su alabilir miyim?", "Can I have some water, please?"),
        ],
    ),
    (
        "general",
        "travel.emergency.cat.general",
        [
            ("Bu adrese nasıl giderim?", "How do I get to this address?"),
            ("En yakın eczane nerede?", "Where is the nearest pharmacy?"),
            ("Tuvalet nerede?", "Where is the restroom?"),
            ("Wi-Fi şifresi nedir?", "What is the Wi-Fi password?"),
            ("Yardımcı olabilir misiniz?", "Can you help me, please?"),
            ("Türkçe bilen biri var mı?", "Does anyone speak Turkish?"),
            ("Anlamıyorum.", "I don't understand."),
            ("Daha yavaş konuşabilir misiniz?", "Could you speak more slowly, please?"),
        ],
    ),
]
