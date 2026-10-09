import json
from bank250_common import ROOT, grouped, rows

def expand_world(questions,add,provinces):
    # 81 existing province-to-code, 81 code-to-province, 81 ordered pairs, 7 route exercises.
    for i,province in enumerate(provinces,1):
        add('plakalar',f'{i:02d} ile başlayan bir Türk araç plakası hangi ili gösterir?',province,provinces,f'{i:02d}, {province} iline tahsis edilmiş plaka kodudur.')
    for i,province in enumerate(provinces):
        other=provinces[(i+17)%81]
        answer=f'{i+1:02d} – {(i+17)%81+1:02d}'
        pool=[f'{i+1:02d} – {n:02d}' for n in range(1,82) if n!=i+1]
        add('plakalar',f'{province} ve {other} plakalarının kodları bu sırayla hangisidir?',answer,pool,f'{province}: {i+1:02d}; {other}: {(i+17)%81+1:02d}. Kodların sırası sorudaki şehir sırasını izler.')
    for cities in [('Ankara','İstanbul','İzmir'),('Adana','Mersin','Antalya'),('Samsun','Ordu','Trabzon'),('Bursa','Balıkesir','Çanakkale'),('Konya','Aksaray','Nevşehir'),('Kars','Ardahan','Iğdır'),('Diyarbakır','Mardin','Şanlıurfa')]:
        codes=[f'{provinces.index(c)+1:02d}' for c in cities]
        correct=' – '.join(codes)
        choices=[correct,' – '.join(codes[::-1]),' – '.join([codes[1],codes[0],codes[2]]),' – '.join([codes[0],codes[2],codes[1]])]
        add('plakalar',' → '.join(cities)+' sırasındaki şehirlerin plaka kodları hangisidir?',correct,choices,'; '.join(f'{city}: {code}' for city,code in zip(cities,codes)))
    flags=json.loads((ROOT/'data/flag-countries.json').read_text())
    flagpool=['flag:'+f['code'] for f in flags]
    # Some flags have effectively identical designs when shown at the same size.
    similar=[{'id','mc'},{'ro','td'},{'ie','ci'},{'au','nz'}]
    def flag_add(text,code,note):
        excluded=set().union(*(g for g in similar if code in g))-{code}
        add('bayraklar',text,'flag:'+code,[f for f in flagpool if f[5:] not in excluded],note)
    for f in flags[100:]:
        flag_add(f"{f['name']} bayrağını dört görsel arasından seçebilir misin?",f['code'],f"Gösterilen doğru bayrak {f['name']} bayrağıdır.")
    clues=json.loads((ROOT/'data/expansion250/flag-capital-clues.json').read_text())
    for c in clues:
        flag_add(f"Başkenti {c['capital']} olan {c['region']} ülkesinin bayrağı hangisidir?",c['code'],f"{c['capital']}, {c['name']} ülkesinin başkentidir. Doğru görsel bu ülkenin bayrağıdır.")
    grouped(add,'ulkeler','{} hangi ülkenin para birimidir?', '''
Japon yeni|Japonya
İngiliz sterlini|Birleşik Krallık
İsviçre frangı|İsviçre
Türk lirası|Türkiye
Çin yuanı|Çin
Hindistan rupisi|Hindistan
Pakistan rupisi|Pakistan
Nepal rupisi|Nepal
Sri Lanka rupisi|Sri Lanka
Bangladeş takası|Bangladeş
Tayland bahtı|Tayland
Vietnam dongu|Vietnam
Endonezya rupiahı|Endonezya
Malezya ringgiti|Malezya
Filipin pesosu|Filipinler
Güney Kore wonu|Güney Kore
Moğol tugriki|Moğolistan
Kazakistan tengesi|Kazakistan
Gürcistan larisi|Gürcistan
Ermenistan dramı|Ermenistan
Azerbaycan manatı|Azerbaycan
İsrail şekeli|İsrail
Ürdün dinarı|Ürdün
Kuveyt dinarı|Kuveyt
Bahreyn dinarı|Bahreyn
Umman riyali|Umman
Suudi Arabistan riyali|Suudi Arabistan
Birleşik Arap Emirlikleri dirhemi|Birleşik Arap Emirlikleri
Mısır lirası|Mısır
Fas dirhemi|Fas
Tunus dinarı|Tunus
Cezayir dinarı|Cezayir
Güney Afrika randı|Güney Afrika
Kenya şilini|Kenya
Etiyopya birri|Etiyopya
Nijerya nairası|Nijerya
Gana cedisi|Gana
Zambiya kvaçası|Zambiya
Brezilya reali|Brezilya
Arjantin pesosu|Arjantin
Şili pesosu|Şili
Kolombiya pesosu|Kolombiya
Peru solü|Peru
Bolivya bolivyanosu|Bolivya
Paraguay guaranisi|Paraguay
Uruguay pesosu|Uruguay
Meksika pesosu|Meksika
Macar forinti|Macaristan
Polonya zlotisi|Polonya
Romanya leyi|Romanya
''')
    grouped(add,'ulkeler','{} hangi ülkede yer alır?', '''
Tac Mahal|Hindistan
Angkor Wat|Kamboçya
Borobudur Tapınağı|Endonezya
Petra antik kenti|Ürdün
Persepolis kalıntıları|İran
Gize piramitleri|Mısır
Machu Picchu|Peru
Chichén Itzá|Meksika
Kurtarıcı İsa heykeli|Brezilya
Stonehenge|Birleşik Krallık
Versay Sarayı|Fransa
Neuschwanstein Şatosu|Almanya
Schönbrunn Sarayı|Avusturya
Sagrada Família|İspanya
Kolezyum|İtalya
Akropolis'in Parthenon tapınağı|Yunanistan
Moai heykellerinin bulunduğu Paskalya Adası|Şili
Sydney Opera Binası|Avustralya
Himeji Kalesi|Japonya
Yasak Şehir|Çin
Potala Sarayı|Çin
Bagan tapınakları|Myanmar
Sigiriya Kaya Kalesi|Sri Lanka
Lumbini kutsal alanı|Nepal
Taktsang Manastırı|Bhutan
Burc Halife|Birleşik Arap Emirlikleri
Kuveyt Kuleleri|Kuveyt
Kral II. Hasan Camii|Fas
Leptis Magna antik kenti|Libya
Lalibela kaya kiliseleri|Etiyopya
Büyük Zimbabve kalıntıları|Zimbabve
Robben Adası|Güney Afrika
Zanzibar'ın Taş Şehri|Tanzanya
Elmina Kalesi|Gana
Gorée Adası|Senegal
Timbuktu'nun tarihî camileri|Mali
Belém Kulesi|Portekiz
Brugge tarihî merkezi|Belçika
Kinderdijk yel değirmenleri|Hollanda
Kronborg Şatosu|Danimarka
Suomenlinna deniz kalesi|Finlandiya
Drottningholm Sarayı|İsveç
Bryggen tarihî limanı|Norveç
Wieliczka Tuz Madeni|Polonya
Bran Şatosu|Romanya
Rila Manastırı|Bulgaristan
Mostar Köprüsü|Bosna-Hersek
Dubrovnik surları|Hırvatistan
Bled Gölü'ndeki ada kilisesi|Slovenya
Registan Meydanı|Özbekistan
''')
    grouped(add,'ulkeler','{} ülkesinin başkenti hangi şehirdir?', '''
Andorra|Andorra la Vella
Lihtenştayn|Vaduz
Monako|Monako
San Marino|San Marino
Malta|Valletta
Fiji|Suva
Kosova|Priştine
Afganistan|Kabil
Kiribati|Güney Tarava
Myanmar|Naypyidaw
Brunei|Bandar Seri Begavan
Doğu Timor|Dili
Samoa|Apia
Suriye|Şam
Sudan|Hartum
Güney Sudan|Juba
Eritre|Asmara
Cibuti|Cibuti
Somali|Mogadişu
Çad|Encemine
Nijer|Niamey
Mali|Bamako
Burkina Faso|Vagadugu
Benin|Porto-Novo
Togo|Lomé
Liberya|Monrovia
Sierra Leone|Freetown
Gine|Konakri
Gine-Bissau|Bissau
Gambiya|Banjul
Yeşil Burun Adaları|Praia
Moritanya|Nuakşot
Kamerun|Yaoundé
Orta Afrika Cumhuriyeti|Bangui
Gabon|Libreville
Kongo Cumhuriyeti|Brazzaville
Demokratik Kongo Cumhuriyeti|Kinşasa
Ekvator Ginesi|Ciudad de la Paz|Ekvator Ginesi, 2 Ocak 2026 tarihli kararla başkentini Malabo’dan Ciudad de la Paz’a taşıdı.
São Tomé ve Príncipe|São Tomé
Lesotho|Maseru
Botsvana|Gaborone
Namibya|Windhoek
Malavi|Lilongwe
Mozambik|Maputo
Seyşeller|Victoria
Mauritius|Port Louis
Komorlar|Moroni
Burundi|Gitega
Surinam|Paramaribo
Guyana|Georgetown
''')
