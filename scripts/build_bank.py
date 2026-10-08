import json,random,hashlib,sys
from pathlib import Path
ROOT=Path(__file__).resolve().parent.parent
rng=random.Random(8167)
questions=[]
def add(cat,text,answer,pool,explanation=''):
    distractors=list(dict.fromkeys(x for x in pool if x!=answer))
    if len(distractors)<3: raise ValueError((text,answer,pool))
    options=rng.sample(distractors,3)+[answer];rng.shuffle(options)
    questions.append(dict(id=cat+'-'+hashlib.sha256(text.encode()).hexdigest()[:14],category=cat,text=text,options=options,correct=options.index(answer),explanation=explanation or f'Doğru cevap: {answer}.'))
def pairs(cat,raw,template):
    rows=[line.split('|') for line in raw.strip().splitlines() if line.strip()]
    pool=[r[1] for r in rows]
    for r in rows:add(cat,template.format(r[0]),r[1],pool,r[2] if len(r)>2 else '')
def direct(cat,raw):
    for row in raw.strip().splitlines():
        parts=row.split('|');add(cat,parts[0],parts[1],parts[1:5],parts[5] if len(parts)>5 else '')
# 100 countries, 100 distinct capital questions.
pairs('ulkeler','''
Türkiye|Ankara
Almanya|Berlin
Fransa|Paris
İtalya|Roma
İspanya|Madrid
Portekiz|Lizbon
Birleşik Krallık|Londra
İrlanda|Dublin
Belçika|Brüksel
Hollanda|Amsterdam
Lüksemburg|Lüksemburg
İsviçre|Bern
Avusturya|Viyana
Polonya|Varşova
Çekya|Prag
Slovakya|Bratislava
Macaristan|Budapeşte
Romanya|Bükreş
Bulgaristan|Sofya
Yunanistan|Atina
Arnavutluk|Tiran
Kuzey Makedonya|Üsküp
Sırbistan|Belgrad
Karadağ|Podgorica
Bosna-Hersek|Saraybosna
Hırvatistan|Zagreb
Slovenya|Ljubljana
Danimarka|Kopenhag
Norveç|Oslo
İsveç|Stockholm
Finlandiya|Helsinki
İzlanda|Reykjavik
Estonya|Tallinn
Letonya|Riga
Litvanya|Vilnius
Ukrayna|Kyiv
Moldova|Kişinev
Belarus|Minsk
Rusya|Moskova
Gürcistan|Tiflis
Ermenistan|Erivan
Azerbaycan|Bakü
Kazakistan|Astana
Özbekistan|Taşkent
Türkmenistan|Aşkabat
Kırgızistan|Bişkek
Tacikistan|Duşanbe
Moğolistan|Ulan Batur
Çin|Pekin
Japonya|Tokyo
Güney Kore|Seul
Kuzey Kore|Pyongyang
Hindistan|Yeni Delhi
Pakistan|İslamabad
Bangladeş|Dakka
Nepal|Katmandu
Bhutan|Thimphu
Maldivler|Malé
Tayland|Bangkok
Vietnam|Hanoi
Kamboçya|Phnom Penh
Laos|Vientiane
Malezya|Kuala Lumpur
Filipinler|Manila
Singapur|Singapur
İran|Tahran
Irak|Bağdat
Ürdün|Amman
Lübnan|Beyrut
Suudi Arabistan|Riyad
Birleşik Arap Emirlikleri|Abu Dabi
Katar|Doha
Bahreyn|Manama
Kuveyt|Kuveyt
Umman|Maskat
Mısır|Kahire
Fas|Rabat
Cezayir|Cezayir
Tunus|Tunus
Libya|Trablus
Kenya|Nairobi
Tanzanya|Dodoma
Uganda|Kampala
Etiyopya|Addis Ababa
Nijerya|Abuja
Gana|Akra
Senegal|Dakar
Ruanda|Kigali
Angola|Luanda
Zambiya|Lusaka
Zimbabve|Harare
Madagaskar|Antananarivo
Kanada|Ottawa
Amerika Birleşik Devletleri|Washington, D.C.
Meksika|Meksiko
Brezilya|Brasília
Arjantin|Buenos Aires
Şili|Santiago
Peru|Lima
Avustralya|Canberra
''','{} ülkesinin başkenti hangisidir?')
# 81 provinces plus 19 geography and cultural landmarks.
provinces='Adana,Adıyaman,Afyonkarahisar,Ağrı,Amasya,Ankara,Antalya,Artvin,Aydın,Balıkesir,Bilecik,Bingöl,Bitlis,Bolu,Burdur,Bursa,Çanakkale,Çankırı,Çorum,Denizli,Diyarbakır,Edirne,Elazığ,Erzincan,Erzurum,Eskişehir,Gaziantep,Giresun,Gümüşhane,Hakkâri,Hatay,Isparta,Mersin,İstanbul,İzmir,Kars,Kastamonu,Kayseri,Kırklareli,Kırşehir,Kocaeli,Konya,Kütahya,Malatya,Manisa,Kahramanmaraş,Mardin,Muğla,Muş,Nevşehir,Niğde,Ordu,Rize,Sakarya,Samsun,Siirt,Sinop,Sivas,Tekirdağ,Tokat,Trabzon,Tunceli,Şanlıurfa,Uşak,Van,Yozgat,Zonguldak,Aksaray,Bayburt,Karaman,Kırıkkale,Batman,Şırnak,Bartın,Ardahan,Iğdır,Yalova,Karabük,Kilis,Osmaniye,Düzce'.split(',')
for i,province in enumerate(provinces,1):add('turkiye',f'{i:02d} plaka kodu hangi ilimize aittir?',province,provinces,f'{province} ilinin plaka kodu {i:02d} olarak belirlenmiştir.')
direct('turkiye','''
Türkiye'nin yüzölçümü en büyük ili hangisidir?|Konya|Ankara|Sivas|Erzurum
Türkiye'nin en yüksek dağı hangisidir?|Ağrı Dağı|Erciyes|Uludağ|Ilgaz
Türkiye'nin yüzölçümü en büyük gölü hangisidir?|Van Gölü|Tuz Gölü|Beyşehir Gölü|Eğirdir Gölü
Tamamı Türkiye sınırları içinde kalan en uzun nehir hangisidir?|Kızılırmak|Sakarya|Gediz|Büyük Menderes
Pamukkale travertenleri hangi ilimizdedir?|Denizli|Antalya|Muğla|Aydın
Göbeklitepe hangi ilimizdedir?|Şanlıurfa|Mardin|Diyarbakır|Adıyaman
Sümela Manastırı hangi ilimizdedir?|Trabzon|Rize|Artvin|Ordu
Efes Antik Kenti hangi ilimizdedir?|İzmir|Aydın|Manisa|Denizli
Nemrut Dağı'ndaki ünlü heykeller hangi ilimizdedir?|Adıyaman|Malatya|Elazığ|Şanlıurfa
Anıtkabir hangi şehirdedir?|Ankara|İstanbul|İzmir|Samsun
Türkiye Cumhuriyeti hangi tarihte ilan edildi?|29 Ekim 1923|23 Nisan 1920|19 Mayıs 1919|30 Ağustos 1922
İstiklal Marşı'nın sözlerini kim yazdı?|Mehmet Akif Ersoy|Yahya Kemal Beyatlı|Namık Kemal|Ziya Gökalp
Türkiye'nin en kuzey uç noktası hangi il sınırındadır?|Sinop|Samsun|Kastamonu|Bartın
Selimiye Camii hangi ilimizdedir?|Edirne|Bursa|İstanbul|Konya
Mevlânâ Müzesi hangi ilimizdedir?|Konya|Kayseri|Aksaray|Sivas
Türkiye'nin Karadeniz ile Marmara Denizi'ni bağlayan boğazı hangisidir?|İstanbul Boğazı|Çanakkale Boğazı|Cebelitarık Boğazı|Hürmüz Boğazı
İshak Paşa Sarayı hangi ilimizdedir?|Ağrı|Van|Kars|Iğdır
Troya Antik Kenti hangi ilimizdedir?|Çanakkale|Balıkesir|İzmir|Tekirdağ
Türkiye Büyük Millet Meclisi hangi tarihte açıldı?|23 Nisan 1920|29 Ekim 1923|19 Mayıs 1919|30 Ağustos 1922
''')
# A collection of 100 physical-geography facts.
direct('cografya','''
Dünyanın yüzölçümü en büyük okyanusu hangisidir?|Pasifik Okyanusu|Atlas Okyanusu|Hint Okyanusu|Arktik Okyanusu
Dünyanın yüzölçümü en küçük okyanusu hangisidir?|Arktik Okyanusu|Hint Okyanusu|Atlas Okyanusu|Güney Okyanusu
Deniz seviyesinden ölçülen en yüksek dağ hangisidir?|Everest|K2|Kilimanjaro|Aconcagua
Everest hangi sıradağlarda yer alır?|Himalayalar|Alpler|Andlar|Kayalık Dağlar
And Dağları hangi kıtadadır?|Güney Amerika|Asya|Avrupa|Afrika
Alp Dağları hangi kıtadadır?|Avrupa|Afrika|Güney Amerika|Avustralya
Kilimanjaro hangi ülkededir?|Tanzanya|Kenya|Uganda|Etiyopya
Sahra Çölü hangi kıtadadır?|Afrika|Asya|Avustralya|Güney Amerika
Gobi Çölü hangi iki ülkede uzanır?|Çin ve Moğolistan|İran ve Irak|Mısır ve Libya|Peru ve Şili
Atacama Çölü ağırlıklı olarak hangi ülkededir?|Şili|Brezilya|Meksika|Arjantin
Amazon Nehri hangi kıtada akar?|Güney Amerika|Afrika|Asya|Kuzey Amerika
Nil Nehri hangi denize dökülür?|Akdeniz|Kızıldeniz|Karadeniz|Arap Denizi
Tuna Nehri hangi denize dökülür?|Karadeniz|Baltık Denizi|Adriyatik Denizi|Kuzey Denizi
Volga Nehri hangi su kütlesine dökülür?|Hazar Denizi|Karadeniz|Aral Gölü|Baltık Denizi
Mississippi Nehri hangi ülkededir?|ABD|Kanada|Brezilya|Meksika
Dünyanın en derin gölü hangisidir?|Baykal Gölü|Victoria Gölü|Superior Gölü|Titicaca Gölü
Baykal Gölü hangi ülkededir?|Rusya|Çin|Moğolistan|Kazakistan
Yüzölçümü bakımından dünyanın en büyük gölü hangisidir?|Hazar Denizi|Superior Gölü|Victoria Gölü|Baykal Gölü
Titicaca Gölü hangi iki ülke arasındadır?|Peru ve Bolivya|Şili ve Arjantin|Brezilya ve Uruguay|Kolombiya ve Venezuela
Victoria Gölü hangi kıtadadır?|Afrika|Asya|Avrupa|Güney Amerika
Büyük Set Resifi hangi ülkenin kıyısındadır?|Avustralya|Yeni Zelanda|Japonya|Endonezya
Dünyanın en büyük adası hangisidir? (Kıtalar hariç)|Grönland|Madagaskar|Borneo|Yeni Gine
Madagaskar hangi kıtanın doğusundadır?|Afrika|Güney Amerika|Avustralya|Avrupa
Grönland hangi okyanuslar arasındadır?|Atlas ve Arktik|Hint ve Pasifik|Atlas ve Hint|Pasifik ve Güney
İzlanda'nın başkentini çevreleyen ada hangi okyanustadır?|Atlas Okyanusu|Hint Okyanusu|Pasifik Okyanusu|Güney Okyanusu
Cebelitarık Boğazı hangi iki kıtayı ayırır?|Avrupa ve Afrika|Asya ve Afrika|Avrupa ve Asya|Kuzey ve Güney Amerika
Bering Boğazı hangi iki kıtayı ayırır?|Asya ve Kuzey Amerika|Avrupa ve Afrika|Asya ve Avustralya|Avrupa ve Güney Amerika
Süveyş Kanalı hangi iki denizi bağlar?|Akdeniz ve Kızıldeniz|Karadeniz ve Akdeniz|Baltık ve Kuzey Denizi|Arap ve Hazar Denizi
Panama Kanalı hangi iki okyanusu bağlar?|Atlas ve Pasifik|Hint ve Atlas|Arktik ve Hint|Güney ve Hint
Hürmüz Boğazı hangi körfezin çıkışındadır?|Basra Körfezi|Meksika Körfezi|Bengal Körfezi|Biskay Körfezi
Ekvator'un enlemi kaç derecedir?|0°|23,5°|45°|90°
Başlangıç meridyeni hangi yerden geçer?|Greenwich|Paris|Roma|Kahire
Dünya'yı kuzey ve güney yarımküreye ayıran çizgi hangisidir?|Ekvator|Başlangıç meridyeni|Yengeç Dönencesi|Kutup Dairesi
Enlem neyin açısal uzaklığını belirtir?|Ekvator'un kuzeyi veya güneyi|Greenwich'in doğusu|Deniz seviyesinden yükseklik|Dünya'nın merkezine uzaklık
Boylam neyin açısal uzaklığını belirtir?|Başlangıç meridyeninin doğusu veya batısı|Ekvator'a göre yükseklik|Kutuplara göre sıcaklık|Deniz seviyesine göre derinlik
Kuzey Kutbu'nun enlemi kaçtır?|90° kuzey|0°|45° kuzey|23,5° kuzey
Güney Kutbu hangi kıtadadır?|Antarktika|Avustralya|Güney Amerika|Afrika
Dünya'nın en geniş yüzölçümlü kıtası hangisidir?|Asya|Afrika|Kuzey Amerika|Avrupa
Dünya'nın en küçük kıtası hangisidir?|Avustralya|Avrupa|Antarktika|Güney Amerika
Afrika'yı kuzeyden çevreleyen deniz hangisidir?|Akdeniz|Baltık Denizi|Karadeniz|Bering Denizi
Kızıldeniz hangi iki kara alanını ayırır?|Afrika ve Arap Yarımadası|Avrupa ve Anadolu|Hindistan ve Sri Lanka|Balkanlar ve İtalya
Akdeniz ile Atlas Okyanusu'nu bağlayan boğaz hangisidir?|Cebelitarık|Bering|Malakka|Hürmüz
İtalya'nın doğu kıyısındaki deniz hangisidir?|Adriyatik Denizi|Baltık Denizi|Kuzey Denizi|Beyaz Deniz
İskandinav Yarımadası büyük ölçüde hangi iki ülkeyi kapsar?|Norveç ve İsveç|İspanya ve Portekiz|İtalya ve Yunanistan|Fransa ve Belçika
İber Yarımadası'nın iki büyük ülkesi hangileridir?|İspanya ve Portekiz|Norveç ve İsveç|Almanya ve Polonya|İtalya ve Avusturya
Dekkan Platosu hangi ülkededir?|Hindistan|Çin|İran|Mısır
Tibet Platosu hangi kıtadadır?|Asya|Afrika|Avrupa|Güney Amerika
Pampalar hangi kıtanın otlaklarıdır?|Güney Amerika|Afrika|Asya|Avustralya
Preriler en çok hangi kıtayla ilişkilidir?|Kuzey Amerika|Antarktika|Avustralya|Avrupa
Tayga biyomunda hangi ağaçlar yaygındır?|İğne yapraklılar|Palmiyeler|Mangrovlar|Zeytin ağaçları
Tundrada ağaç yetişmesini en çok hangi durum sınırlar?|Uzun soğuk dönem ve donmuş toprak|Sürekli yüksek sıcaklık|Yıl boyu sel|Yoğun volkanizma
Ekvatoral yağmur ormanlarında yağış nasıldır?|Yıl boyunca genellikle bol|Her zaman sıfır|Yalnızca kar şeklinde|Sadece on yılda bir
Muson ikliminin belirgin özelliği hangisidir?|Mevsimsel rüzgâr ve yağış değişimi|Yıl boyu kutup gecesi|Yağışın hiç olmaması|Her gün kar yağması
Akdeniz ikliminde yazlar genellikle nasıldır?|Sıcak ve kurak|Soğuk ve yağışlı|Serin ve karlı|Dondurucu ve kuru
Savanlar hangi bitki örtüsüyle tanınır?|Otlar ve seyrek ağaçlar|Yoğun iğne yapraklı orman|Yalnızca yosun|Buz tabakaları
Yer altındaki erimiş kayaçlara ne denir?|Magma|Lav|Humus|Lös
Yeryüzüne çıkan magmaya ne denir?|Lav|Humus|Silt|Kireç
Depremlerin büyüklüğünü kaydeden cihaz hangisidir?|Sismograf|Barometre|Higrometre|Anemometre
Hava basıncını ölçen araç hangisidir?|Barometre|Termometre|Sismograf|Yağışölçer
Rüzgâr hızını ölçen araç hangisidir?|Anemometre|Barometre|Higrometre|Termometre
Havadaki nemi ölçen araç hangisidir?|Higrometre|Sismograf|Anemometre|Altimetre
Eş yükselti eğrilerine ne denir?|İzohips|İzobar|İzoterm|Meridyen
Eş basınç eğrilerine ne denir?|İzobar|İzohips|İzoterm|Paralel
Eş sıcaklık eğrilerine ne denir?|İzoterm|İzobar|İzohips|Meridyen
Haritadaki küçültme oranına ne denir?|Ölçek|Lejant|Enlem|Koordinat
Haritadaki sembollerin açıklama bölümüne ne denir?|Lejant|Ölçek|Ekvator|Profil
Akarsuyun denize döküldüğü yerde biriktirdiği düzlüğe ne denir?|Delta|Falez|Sirk|Moren
Dalgaların aşındırdığı dik kıyı yamacına ne denir?|Falez|Delta|Ova|Kumul
Rüzgârın biriktirdiği kum tepelerine ne denir?|Kumul|Moren|Traverten|Falez
Buzulların taşıyıp biriktirdiği kaya parçalarına ne denir?|Moren|Lös|Delta|Traverten
Kalkerlerin çözünmesiyle gelişen arazi tipine ne denir?|Karst|Tundra|Savan|Tayga
Mağara tavanından aşağı doğru büyüyen oluşum hangisidir?|Sarkıt|Dikit|Kumul|Moren
Mağara tabanından yukarı doğru büyüyen oluşum hangisidir?|Dikit|Sarkıt|Falez|Lös
Norveç kıyılarında sık görülen buzul vadisi kıyı tipi hangisidir?|Fiyort|Delta|Lagün|Tombolo
Bir adayı kıyıya bağlayan birikim şekli hangisidir?|Tombolo|Falez|Sirk|Obruk
Kıyı kordonuyla denizden ayrılmış sığ su alanına ne denir?|Lagün|Fiyort|Moren|Kanyon
Derin ve dik yamaçlı akarsu vadisine ne denir?|Kanyon|Delta|Ova|Kumul
Gündüz denizden karaya esen yerel rüzgâr hangisidir?|Deniz meltemi|Kara meltemi|Fön|Bora
Gece karadan denize esen yerel rüzgâr hangisidir?|Kara meltemi|Deniz meltemi|Muson|Alize
Dağdan aşağı inerken ısınan kuru rüzgâra ne denir?|Fön|Meltem|Muson|Alize
Tropik bölgelerdeki geniş dönencel çöl kuşağı hangi basınçla ilişkilidir?|Alçalıcı yüksek basınç|Yükselici alçak basınç|Sürekli kutup cephesi|Deniz tabanı basıncı
Suyun sıvı hâlden gaz hâline geçmesi hangisidir?|Buharlaşma|Yoğuşma|Donma|Çökelme
Su buharının sıvı damlalara dönüşmesi hangisidir?|Yoğuşma|Buharlaşma|Erime|Süblimleşme
Toprağın verimli üst katmanının taşınmasına ne denir?|Erozyon|Tektonizma|Volkanizma|Metamorfizma
Bir yamaçtaki toprak ve kayaların aşağı kayması hangisidir?|Heyelan|Erozyon|Gelgit|Yoğuşma
Okyanuslarda su seviyesinin düzenli yükselip alçalması nedir?|Gelgit|Muson|Erozyon|Sismik dalga
Tsunamiler çoğunlukla neyin ardından oluşur?|Deniz tabanındaki ani yer değiştirme|Günlük meltem|Mevsimsel kar yağışı|Güneş tutulması
Pasifik çevresindeki yoğun deprem ve volkan kuşağına ne denir?|Ateş Çemberi|Buz Kuşağı|Sakin Kuşak|Ekvator Kuşağı
Afrika'nın en güney ucuna ne ad verilir?|Agulhas Burnu|Ümit Burnu|Horn Burnu|Kuzey Burnu
Güney Amerika'nın güneyindeki ünlü burun hangisidir?|Horn Burnu|Agulhas Burnu|Finisterre Burnu|Kuzey Burnu
Niagara Şelaleleri hangi iki ülke arasındadır?|ABD ve Kanada|Brezilya ve Arjantin|Zambiya ve Zimbabve|Peru ve Bolivya
Victoria Şelaleleri hangi nehir üzerindedir?|Zambezi|Nil|Kongo|Nijer
Angel Şelalesi hangi ülkededir?|Venezuela|Brezilya|Kolombiya|Peru
Amazon yağmur ormanlarının büyük bölümü hangi ülkededir?|Brezilya|Şili|Uruguay|Paraguay
Kongo Havzası hangi kıtadadır?|Afrika|Güney Amerika|Asya|Avrupa
Sibirya hangi ülkenin geniş bir bölgesidir?|Rusya|Kanada|Çin|Norveç
Patagonya hangi iki ülkede uzanır?|Arjantin ve Şili|Peru ve Ekvador|Brezilya ve Uruguay|Venezuela ve Kolombiya
Büyük Kanyon hangi ABD eyaletindedir?|Arizona|Florida|Maine|Ohio
Ölü Deniz'in suyu hangi özelliğiyle bilinir?|Çok yüksek tuzluluk|Tamamen tatlı olması|Her zaman donmuş olması|Hiç mineral içermemesi
Dünya'nın kendi ekseni çevresindeki dönüşü neyi oluşturur?|Gece ve gündüz|Mevsimlerin tamamını tek başına|Ay tutulmasını|Kıtaların hareketini
''')
# Dino facts: period, diet and a diagnostic trait, plus 25 palaeontology questions.
dinos='''Tyrannosaurus rex|Kretase|Etçil|Kısa ve iki parmaklı ön kollar
Triceratops|Kretase|Otçul|Yüzünde üç boynuz ve kemiksi boyun yakası
Stegosaurus|Jura|Otçul|Sırtında iki sıra büyük kemiksi plaka
Diplodocus|Jura|Otçul|Çok uzun boyun ve kamçı biçimli kuyruk
Brachiosaurus|Jura|Otçul|Ön bacakların arka bacaklardan uzun olması
Allosaurus|Jura|Etçil|Gözlerinin üzerinde küçük kemiksi çıkıntılar
Velociraptor|Kretase|Etçil|Arka ayakta kıvrık büyük pençe
Ankylosaurus|Kretase|Otçul|Zırhlı gövde ve topuz biçimli kuyruk ucu
Iguanodon|Kretase|Otçul|Sivri başparmak dikeni
Parasaurolophus|Kretase|Otçul|Başının arkasına uzanan boru biçimli ibik
Pachycephalosaurus|Kretase|Otçul|Kalın kubbe biçimli kafatası
Spinosaurus|Kretase|Etçil|Sırtında yelken oluşturan uzun omur çıkıntıları
Carnotaurus|Kretase|Etçil|Gözlerinin üzerinde iki belirgin boynuz
Dilophosaurus|Jura|Etçil|Başında iki ince kemiksi ibik
Kentrosaurus|Jura|Otçul|Sırtın arkasında ve kuyrukta uzun dikenler
Styracosaurus|Kretase|Otçul|Boyun yakasının kenarında uzun dikenler
Protoceratops|Kretase|Otçul|Büyük boynuzlar taşımayan kemiksi boyun yakası
Psittacosaurus|Kretase|Otçul|Papağan gagasına benzeyen kısa gaga
Corythosaurus|Kretase|Otçul|Miğfer biçimli baş ibiği
Lambeosaurus|Kretase|Otçul|Balta biçimini andıran baş ibiği
Edmontosaurus|Kretase|Otçul|Ördek gagasına benzeyen geniş ağız
Ceratosaurus|Jura|Etçil|Burnunun üzerinde tek kemiksi boynuz
Deinonychus|Kretase|Etçil|Av yakalamaya uygun orak biçimli ayak pençesi
Coelophysis|Triyas|Etçil|İçi boş kemikleri olan ince ve hafif gövde
Plateosaurus|Triyas|Otçul|Erken uzun boyunlu dinozor yapısı'''
rows=[x.split('|') for x in dinos.splitlines()]
for name,period,diet,trait in rows:
    add('dinozor',f'{name} hangi jeolojik dönemde yaşadı?',period,['Triyas','Jura','Kretase','Devoniyen'])
    add('dinozor',f'{name} temel olarak nasıl beslenirdi?',diet,['Otçul','Etçil','Hepçil','Yalnızca planktonla beslenen'])
    # Distinct choices chosen across highly different anatomical features.
    others=[r[3] for r in rows if r[0]!=name]
    if name in ['Velociraptor','Deinonychus']:others=[t for t in others if 'pençe' not in t]
    # Keep diagnostic alternatives exclusive, avoiding overlapping plate/neck/horn traits.
    others=[t for t in others if not any(k in t and k in trait for k in ['boynuz','boyun','plaka','diken','ibik','gaga','pençe','kuyruk','gövde'])]
    if name=='Triceratops':others=[t for t in others if 'iki belirgin boynuz' not in t]
    if name=='Carnotaurus':others=[t for t in others if 'gözlerinin' not in t.lower()]
    add('dinozor',f'{name} hangi özelliğiyle tanınır?',trait,[trait]+others)
direct('dinozor','''
Dinozorları ve fosilleri inceleyen bilim dalı hangisidir?|Paleontoloji|Meteoroloji|Sosyoloji|Kartografya
Dinozorların ilk ortaya çıktığı jeolojik dönem hangisidir?|Triyas|Kretase|Devoniyen|Permiyen
Triyas, Jura ve Kretase dönemlerinin içinde yer aldığı zaman hangisidir?|Mezozoik|Paleozoik|Senozoyik|Prekambriyen
Kuş olmayan dinozorların kitlesel yok oluşu yaklaşık ne zaman oldu?|66 milyon yıl önce|6 bin yıl önce|2 milyon yıl önce|500 milyon yıl önce
Kretase sonu yok oluşuyla ilişkili büyük çarpma krateri hangisidir?|Chicxulub|Barringer|Tycho|Copernicus
Chicxulub krateri hangi ülkededir?|Meksika|Kanada|Avustralya|Hindistan
Günümüzde dinozorların yaşayan bir kolu kabul edilen grup hangisidir?|Kuşlar|Kertenkeleler|Timsahlar|Yarasalar
Dinozorlar genel olarak hangi omurgalı grubundadır?|Sürüngenler|Memeliler|İki yaşamlılar|Balıklar
Fosilleşmiş hayvan dışkısına ne denir?|Koprolit|Meteorit|Granit|Bazalt
Taşlaşmış ayak izleri hangi fosil türüne örnektir?|İz fosili|Polen fosili|Vücut fosili|Kehribar
Dinozor adı hangi anlama yakın bir ifadeden türemiştir?|Korkunç kertenkele|Dev balık|Uçan memeli|Eski kuş
Dinosauria adını 1842'de kim önerdi?|Richard Owen|Charles Darwin|Isaac Newton|Louis Pasteur
Bilimsel olarak adlandırılan ilk dinozor cinsi hangisidir?|Megalosaurus|Tyrannosaurus|Triceratops|Velociraptor
Sauropod dinozorların tipik özelliği hangisidir?|Uzun boyun ve dört ayak üzerinde yürüyüş|Kanatlarla aktif uçuş|Tamamen yüzgeçli gövde|Yalnızca iki ön bacak
Theropod dinozorlar genellikle kaç arka bacak üzerinde yürürdü?|İki|Dört|Altı|Sekiz
Dinozorlar yavrularını hangi yolla dünyaya getirirdi?|Yumurtlayarak|Tomurcuklanarak|Bölünerek|Tohum oluşturarak
Bir dinozorun beslenme biçimi hakkında en doğrudan ipuçlarından biri hangisidir?|Diş yapısı|Taşın rengi|Müzedeki ışık|Fosilin sergilendiği şehir
Kemik plakaları ve dikenler dinozorlarda hangi işleve katkıda bulunabilir?|Savunma|Fotosentez|Solungaçla soluma|Elektrik üretme
Pterosaurlar hangi gruba aittir?|Uçan sürüngenler|Kuş olmayan dinozorlar|Uçan memeliler|Böcekler
Plesiosaurların temel yaşam ortamı neresiydi?|Denizler|Çöller|Ağaç tepeleri|Yer altı mağaraları
Mosasaurus aşağıdakilerden hangisidir?|Deniz sürüngeni|Boynuzlu kara dinozoru|İlk memeli|Dev kuş
Dinozorlarla ilgili hangi ifade doğrudur?|Hepsi aynı dönemde yaşamadı|Hepsi otçuldu|Hepsi uçabiliyordu|Hepsi dev boyuttaydı
Jura döneminden sonra hangi dönem gelir?|Kretase|Triyas|Permiyen|Karbonifer
Triyas döneminden sonra hangi dönem gelir?|Jura|Devoniyen|Permiyen|Kambriyen
Fosilleri tarihlendirirken çevrelerindeki hangi unsur incelenir?|Kaya katmanları|Modern yol işaretleri|Müze biletleri|Fosilin raf numarası
''')
# 50 animal identifiers and 50 independent classification questions.
animals='''Mavi balina|Memeli|Yaşamış olduğu bilinen en büyük hayvan hangisidir?
Afrika fili|Memeli|Günümüzde yaşayan en büyük kara hayvanı hangisidir?
Zürafa|Memeli|En uzun boyunlu kara memelisi hangisidir?
Çita|Memeli|Kısa mesafede en hızlı koşan kara hayvanı hangisidir?
Kutup ayısı|Memeli|Arktik deniz buzlarında fok avlayan büyük memeli hangisidir?
Dev panda|Memeli|Beslenmesinin büyük kısmını bambunun oluşturduğu hayvan hangisidir?
Koala|Memeli|Okaliptüs yapraklarıyla beslenen Avustralyalı hayvan hangisidir?
Kanguru|Memeli|Güçlü arka ayaklarıyla sıçrayan ve yavrusunu kesede taşıyan hayvan hangisidir?
Ornitorenk|Memeli|Ördek gagasını andıran ağzı olan yumurtlayan memeli hangisidir?
Yarasa|Memeli|Aktif olarak uçabilen tek memeli grubu hangisidir?
Yunus|Memeli|Şişe burunlu türüyle tanınan, ekolokasyon kullanan deniz memelisi hangisidir?
Kunduz|Memeli|Akarsularda ağaç dallarından baraj yapan hayvan hangisidir?
Tembel hayvan|Memeli|Ağaçlara baş aşağı asılı ve çok yavaş yaşamıyla tanınan hayvan hangisidir?
Okapi|Memeli|Zürafanın, bacakları zebra çizgilerini andıran akrabası hangisidir?
Pangolin|Memeli|Vücudu keratinden pullarla kaplı memeli hangisidir?
Mirket|Memeli|Gruplar hâlinde yaşayan, nöbet tutmak için dikilen Afrika hayvanı hangisidir?
Kapibara|Memeli|Günümüzde yaşayan en büyük kemirgen hangisidir?
Narval|Memeli|Erkeklerinde uzun, burgu biçimli diş bulunan kutup balinası hangisidir?
Deniz samuru|Memeli|Kabuklu avlarını açarken taş kullanabilen deniz memelisi hangisidir?
Misk öküzü|Memeli|Arktik bölgelerde yaşayan, uzun tüylü ve adında öküz geçen hayvan hangisidir?
İmparator penguen|Kuş|Erkeği yumurtayı ayakları üzerinde sıcak tutan penguen türü hangisidir?
Devekuşu|Kuş|Günümüzde yaşayan en büyük kuş hangisidir?
Kolibri|Kuş|Havada asılı kalıp geri geri uçabilen küçük kuş grubu hangisidir?
Flamingo|Kuş|Besinlerindeki pigmentlerle pembe tonlar kazanan uzun bacaklı kuş hangisidir?
Ağaçkakan|Kuş|Gagasıyla ağaç gövdelerini delerek besin arayan kuş hangisidir?
Kivi|Kuş|Yeni Zelanda'nın uçamayan, uzun gagalı kuşu hangisidir?
Albatros|Kuş|Okyanus üstünde çok uzun kanatlarıyla süzülmesiyle tanınan kuş hangisidir?
Tukan|Kuş|Gövdesine göre çok büyük ve renkli gagasıyla tanınan tropik kuş hangisidir?
Tavus kuşu|Kuş|Erkeği göz desenli uzun kuyruk örtü tüylerini yelpaze gibi açan kuş hangisidir?
Pelikan|Kuş|Gagasının altında av yakalamaya yarayan geniş kese taşıyan kuş hangisidir?
Komodo ejderi|Sürüngen|Günümüzde yaşayan en büyük kertenkele hangisidir?
Bukalemun|Sürüngen|Gözlerini büyük ölçüde bağımsız hareket ettirebilen sürüngen hangisidir?
Galapagos dev kaplumbağası|Sürüngen|Galapagos adalarının çok uzun ömürlü, dev kara kaplumbağası hangisidir?
Kral kobra|Sürüngen|En uzun zehirli yılan türü hangisidir?
Tuzlu su timsahı|Sürüngen|Günümüzde yaşayan en büyük sürüngen türü hangisidir?
Aksolotl|İki yaşamlı|Erişkin hâlinde dış solungaçlarını koruyan Meksika kökenli hayvan hangisidir?
Ateş semenderi|İki yaşamlı|Siyah zemin üzerindeki sarı lekeleriyle tanınan semender hangisidir?
Balina köpekbalığı|Balık|Günümüzde yaşayan en büyük balık hangisidir?
Denizatı|Balık|Erkeği kuluçka kesesinde yavruları taşıyan hayvan hangisidir?
Elektrikli yılan balığı|Balık|Güney Amerika tatlı sularında güçlü elektrik boşalmasıyla avlanan hayvan hangisidir?
Palyaço balığı|Balık|Denizşakayıklarıyla ortak yaşamıyla tanınan turuncu çizgili balık hangisidir?
Ahtapot|Yumuşakça|Sekiz kolu ve üç kalbi bulunan hayvan hangisidir?
Mürekkep balığı|Yumuşakça|Tehlikede koyu renkli sıvı salan ve adı bu sıvıyı taşıyan hayvan hangisidir?
Nautilus|Yumuşakça|Odacıklı sarmal kabuğu olan kafadanbacaklı hangisidir?
Bal arısı|Böcek|Besin kaynağının yönünü sallanma dansıyla anlatan böcek hangisidir?
İpek böceği|Böcek|Kozasından doğal ipek elde edilen canlı hangisidir?
Peygamberdevesi|Böcek|Ön bacaklarını av yakalamak için kıvrık tutan böcek hangisidir?
Uğur böceği|Böcek|Yaprak bitleriyle beslenen, benekli kanat örtüleriyle tanınan böcek hangisidir?
Tarantula|Örümceğimsiler|İri ve tüylü gövdesiyle tanınan sekiz bacaklı hayvan hangisidir?
Akrep|Örümceğimsiler|Kuyruğunun ucunda zehir iğnesi bulunan hayvan hangisidir?'''
arows=[r.split('|') for r in animals.splitlines()]
for name,group,question in arows:
    add('hayvanlar',question,name,[r[0] for r in arows])
    add('hayvanlar',f'{name} hangi hayvan grubuna aittir?',group,['Memeli','Kuş','Sürüngen','İki yaşamlı','Balık','Yumuşakça','Böcek','Örümceğimsiler'])
# Car makers' origins, and models' maker (historically unambiguous brands).
brands='''Toyota|Japonya|Corolla
Honda|Japonya|Civic
Nissan|Japonya|Qashqai
Mazda|Japonya|MX-5
Subaru|Japonya|Forester
Suzuki|Japonya|Swift
Mitsubishi|Japonya|Lancer
Lexus|Japonya|RX
Infiniti|Japonya|Q50
Acura|Japonya|Integra
Volkswagen|Almanya|Golf
BMW|Almanya|M3
Mercedes-Benz|Almanya|S-Serisi
Audi|Almanya|A4
Porsche|Almanya|911
Opel|Almanya|Corsa
Ford|ABD|Mustang
Chevrolet|ABD|Camaro
Dodge|ABD|Challenger
Jeep|ABD|Wrangler
Cadillac|ABD|Escalade
Lincoln|ABD|Navigator
Tesla|ABD|Model S
Chrysler|ABD|Pacifica
Buick|ABD|Enclave
GMC|ABD|Yukon
Renault|Fransa|Clio
Peugeot|Fransa|308
Citroën|Fransa|C3
DS Automobiles|Fransa|DS 7
Bugatti|Fransa|Chiron
Fiat|İtalya|Panda
Ferrari|İtalya|F40
Lamborghini|İtalya|Aventador
Maserati|İtalya|Quattroporte
Alfa Romeo|İtalya|Giulia
Lancia|İtalya|Delta
Pagani|İtalya|Zonda
Aston Martin|Birleşik Krallık|DB5
Bentley|Birleşik Krallık|Continental GT
Rolls-Royce|Birleşik Krallık|Phantom
Jaguar|Birleşik Krallık|E-Type
Land Rover|Birleşik Krallık|Defender
Lotus|Birleşik Krallık|Elise
McLaren|Birleşik Krallık|720S
Volvo|İsveç|XC90
Saab|İsveç|9-3
Škoda|Çekya|Octavia
SEAT|İspanya|Ibiza
Hyundai|Güney Kore|Tucson'''
brows=[r.split('|') for r in brands.splitlines()]
for name,country,model in brows:
    add('arabalar',f'{name} markasının kökeni hangi ülkeye dayanır?',country,[r[1] for r in brows])
    add('arabalar',f'{model} modeli hangi otomobil markasına aittir?',name,[r[0] for r in brows])
world_cups='''1930|Uruguay|Uruguay|Arjantin
1934|İtalya|İtalya|Çekoslovakya
1938|Fransa|İtalya|Macaristan
1950|Brezilya|Uruguay|Brezilya
1954|İsviçre|Batı Almanya|Macaristan
1958|İsveç|Brezilya|İsveç
1962|Şili|Brezilya|Çekoslovakya
1966|İngiltere|İngiltere|Batı Almanya
1970|Meksika|Brezilya|İtalya
1974|Batı Almanya|Batı Almanya|Hollanda
1978|Arjantin|Arjantin|Hollanda
1982|İspanya|İtalya|Batı Almanya
1986|Meksika|Arjantin|Batı Almanya
1990|İtalya|Batı Almanya|Arjantin
1994|ABD|Brezilya|İtalya
1998|Fransa|Fransa|Brezilya
2002|Güney Kore ve Japonya|Brezilya|Almanya
2006|Almanya|İtalya|Fransa
2010|Güney Afrika|İspanya|Hollanda
2014|Brezilya|Almanya|Arjantin
2018|Rusya|Fransa|Hırvatistan
2022|Katar|Arjantin|Fransa'''
wc=[r.split('|') for r in world_cups.splitlines()]
for year,host,winner,runner in wc:
    add('futbol',f'{year} FIFA Erkekler Dünya Kupası\'nı hangi takım kazandı?',winner,[r[2] for r in wc])
    add('futbol',f'{year} FIFA Erkekler Dünya Kupası\'nın ev sahibi ülke veya ülkeleri hangisiydi?',host,[r[1] for r in wc])
    add('futbol',f'{year} FIFA Erkekler Dünya Kupası\'nı hangi takım ikinci bitirdi?',runner,[r[3] for r in wc])
euros='''1960|Fransa|Sovyetler Birliği
1964|İspanya|İspanya
1968|İtalya|İtalya
1972|Belçika|Batı Almanya
1976|Yugoslavya|Çekoslovakya
1980|İtalya|Batı Almanya
1984|Fransa|Fransa
1988|Batı Almanya|Hollanda
1992|İsveç|Danimarka
1996|İngiltere|Almanya
2000|Belçika ve Hollanda|Fransa
2004|Portekiz|Yunanistan
2008|Avusturya ve İsviçre|İspanya
2012|Polonya ve Ukrayna|İspanya
2016|Fransa|Portekiz
2020|11 farklı Avrupa ülkesi|İtalya
2024|Almanya|İspanya'''
ec=[r.split('|') for r in euros.splitlines()]
for year,host,winner in ec:
    add('futbol',f'EURO {year} Erkekler Avrupa Futbol Şampiyonası\'nı kim kazandı?',winner,[r[2] for r in ec],('EURO 2020, pandemi nedeniyle 2021 yılında oynandı. Şampiyon İtalya oldu.' if year=='2020' else ''))
    add('futbol',f'EURO {year} finallerinin ev sahibi ülke veya ülkeleri hangisiydi?',host,[r[1] for r in ec],('EURO 2020 turnuvası 2021 yılında 11 farklı Avrupa ülkesinde düzenlendi.' if year=='2020' else ''))
pairs('kaleciler','''
Gianluigi Buffon|İtalya
Dino Zoff|İtalya
Gianluigi Donnarumma|İtalya
Walter Zenga|İtalya
Francesco Toldo|İtalya
Iker Casillas|İspanya
David de Gea|İspanya
Pepe Reina|İspanya
Víctor Valdés|İspanya
Andoni Zubizarreta|İspanya
Manuel Neuer|Almanya
Oliver Kahn|Almanya
Sepp Maier|Almanya
Marc-André ter Stegen|Almanya
Jens Lehmann|Almanya
Toni Schumacher|Almanya
Peter Schmeichel|Danimarka
Kasper Schmeichel|Danimarka
Edwin van der Sar|Hollanda
Hans van Breukelen|Hollanda
Tim Krul|Hollanda
Thibaut Courtois|Belçika
Simon Mignolet|Belçika
Petr Čech|Çekya
Hugo Lloris|Fransa
Fabien Barthez|Fransa
Mike Maignan|Fransa
Steve Mandanda|Fransa
David Seaman|İngiltere
Gordon Banks|İngiltere
Peter Shilton|İngiltere
Joe Hart|İngiltere
Jordan Pickford|İngiltere
Alisson Becker|Brezilya
Ederson|Brezilya
Dida|Brezilya
Júlio César|Brezilya
Cláudio Taffarel|Brezilya
Emiliano Martínez|Arjantin
Sergio Romero|Arjantin
Ubaldo Fillol|Arjantin
Keylor Navas|Kosta Rika
Guillermo Ochoa|Meksika
Jorge Campos|Meksika
René Higuita|Kolombiya
José Luis Chilavert|Paraguay
Fernando Muslera|Uruguay
Rüştü Reçber|Türkiye
Volkan Demirel|Türkiye
Jan Oblak|Slovenya
''','Kaleci {} hangi ülkenin A millî takımında forma giymiştir?')
direct('kaleciler','''
1963 yılında Ballon d'Or kazanan kaleci kimdir?|Lev Yaşin|Gordon Banks|Dino Zoff|Sepp Maier
2002 Dünya Kupası'nda Altın Top ödülünü kazanan kaleci kimdir?|Oliver Kahn|Iker Casillas|Gianluigi Buffon|Rüştü Reçber
2010 Dünya Kupası'nda şampiyon İspanya'nın kaptan kalecisi kimdi?|Iker Casillas|Pepe Reina|Víctor Valdés|David de Gea
2014 Dünya Kupası'nda Altın Eldiven ödülünü kim kazandı?|Manuel Neuer|Hugo Lloris|Sergio Romero|Keylor Navas
2018 Dünya Kupası'nda Altın Eldiven ödülünü kim kazandı?|Thibaut Courtois|Jordan Pickford|Hugo Lloris|Alisson Becker
2022 Dünya Kupası'nda Altın Eldiven ödülünü kim kazandı?|Emiliano Martínez|Hugo Lloris|Dominik Livaković|Wojciech Szczęsny
1982 Dünya Kupası'nı İtalya kaptanı olarak kaldıran kaleci kimdir?|Dino Zoff|Walter Zenga|Gianluigi Buffon|Francesco Toldo
2006 Dünya Kupası şampiyonu İtalya'nın finaldeki kalecisi kimdi?|Gianluigi Buffon|Dino Zoff|Francesco Toldo|Angelo Peruzzi
1998 Dünya Kupası finalinde Fransa'nın kalesini kim korudu?|Fabien Barthez|Hugo Lloris|Bernard Lama|Grégory Coupet
1994 Dünya Kupası finalinde Brezilya'nın kalesini kim korudu?|Cláudio Taffarel|Dida|Júlio César|Alisson Becker
EURO 1992 şampiyonu Danimarka'nın kalecisi kimdi?|Peter Schmeichel|Kasper Schmeichel|Thomas Sørensen|Jesper Christiansen
2015–16 Premier League şampiyonu Leicester City'nin birinci kalecisi kimdi?|Kasper Schmeichel|Peter Schmeichel|Petr Čech|Joe Hart
1999 Şampiyonlar Ligi finalinde Manchester United'ın kalecisi kimdi?|Peter Schmeichel|Edwin van der Sar|David de Gea|Fabien Barthez
2008 Şampiyonlar Ligi finalinde Manchester United'ın kalecisi kimdi?|Edwin van der Sar|Peter Schmeichel|David de Gea|Tim Howard
2012 Şampiyonlar Ligi finalinde Chelsea'nin kalecisi kimdi?|Petr Čech|Thibaut Courtois|Edouard Mendy|Kepa Arrizabalaga
2005 Şampiyonlar Ligi İstanbul finalinde Liverpool'un kalecisi kimdi?|Jerzy Dudek|Pepe Reina|Alisson Becker|Simon Mignolet
2005 Şampiyonlar Ligi İstanbul finalinde Milan'ın kalecisi kimdi?|Dida|Gianluigi Donnarumma|Mike Maignan|Sebastiano Rossi
1995'te Wembley'de akrep kurtarışıyla ünlenen kaleci kimdir?|René Higuita|José Luis Chilavert|Jorge Campos|Óscar Córdoba
Renkli formaları ve kısa boyuyla tanınan Meksikalı kaleci kimdir?|Jorge Campos|Guillermo Ochoa|Keylor Navas|René Higuita
Frikik golleriyle tanınan Paraguaylı kaleci kimdir?|José Luis Chilavert|René Higuita|Rogério Ceni|Jorge Campos
São Paulo formasıyla çok sayıda gol atan Brezilyalı kaleci kimdir?|Rogério Ceni|Dida|Taffarel|Júlio César
2011 yılında Lazio'dan Galatasaray'a transfer olan kaleci kimdir?|Fernando Muslera|Cláudio Taffarel|Faryd Mondragón|Morgan De Sanctis
2002 Dünya Kupası'nda Türkiye'nin birinci kalecisi kimdi?|Rüştü Reçber|Volkan Demirel|Mert Günok|Uğurcan Çakır
EURO 2020'nin turnuvanın oyuncusu seçilen kalecisi kimdir?|Gianluigi Donnarumma|Jordan Pickford|Yann Sommer|Thibaut Courtois
1970 Dünya Kupası'nda Pelé'nin kafa vuruşunu unutulmaz şekilde kurtaran kaleci kimdir?|Gordon Banks|Peter Shilton|Dino Zoff|Lev Yaşin
Kaleci topu elleriyle normal olarak hangi bölgede oynayabilir?|Kendi ceza alanında|Rakibin ceza alanında|Orta yuvarlakta|Sahanın her yerinde
Kaleci kendi ceza alanı dışında kural bakımından nasıl değerlendirilir?|Diğer saha oyuncuları gibi|Ellerini kullanabilir|Her zaman dokunulmazdır|Ofsayta tabi değildir
Kaleci formasının rengi neden ayırt edici olmalıdır?|Diğer oyunculardan ve hakemlerden ayrılması için|Sadece sponsoru göstermek için|Topun hızını artırmak için|Kale çizgisini uzatmak için
Kalecinin şutu iki eliyle gövdesine almasına en yakın terim hangisidir?|Topu tutma|Taç atışı|Ofsayt|Santra
Kalecinin topa yumrukla müdahalesinin temel amacı nedir?|Topu tehlikeli bölgeden uzaklaştırmak|Her zaman gol atmak|Faul kazanmak|Oyunu otomatik bitirmek
Kalecinin topu eliyle oyuna sokarken yaptığı atış hangisidir?|Elle dağıtım|Taç atışı|Köşe vuruşu|Penaltı
Savunma arkasına atılan topa kalesinden çıkıp müdahale eden kaleci rolü hangisidir?|Süpürücü kaleci|Kanat bek|Santrfor|Oyun kurucu orta saha
Kalecinin yakındaki pas seçeneklerini kullanması neyi kolaylaştırır?|Geriden oyun kurmayı|Rakibe taç vermeyi|Ofsayt çizgisini silmeyi|Kale boyunu artırmayı
Kalecinin yüksek topları alırken temel hedefi hangisidir?|Topa güvenli zamanda ve noktada ulaşmak|Gözlerini kapatmak|Her zaman kale çizgisinde kalmak|Rakibin formasını çekmek
Kalecinin görüş açısının kapanmasına ne denir?|Perdelenme|Markaj dışı gol|Santra|Aut çizgisi
Kalecinin bir şutta topun sekmesine dikkat etmesi neden önemlidir?|İkinci pozisyonda rakip topa ulaşabilir|Topun rengi değişir|Şut otomatik gol sayılır|Rakip takım eksilir
Bir kalecinin maçta gol yememesi için kullanılan ifade hangisidir?|Kalesini gole kapatmak|Hat-trick yapmak|Ofsayta düşmek|Taç kazanmak
Kaleci eldivenindeki tutuş yüzeyi çoğunlukla hangi malzemedir?|Lateks|Cam|Beton|Çelik
Kalecinin dalış öncesi dengeli duruşunun amacı nedir?|Farklı yönlere hızlı hareket edebilmek|Topu saklamak|Oyunu durdurmak|Kale direğini taşımak
Kalecinin savunmayla konuşması neye katkı sağlar?|Savunma yerleşimine|Topun ağırlığına|Sahanın boyuna|Maçın süresini keyfî değiştirmeye
Kaleci rakibin açısını daraltmak için genellikle ne yapar?|Kontrollü biçimde öne çıkar|Sırtını döner|Kaleden uzak bir köşeye koşar|Yere oturur
Kalecinin yakın mesafeli şutta hangi becerisi özellikle önemlidir?|Refleks|Taç mesafesi|Korner kullanımı|Santra hızı
Kalecinin sağ ve sol yana uzanarak topa müdahale etmesi hangisidir?|Plonjon|Röveşata|Taç|Santra
Kalecinin uzanışında topu tehlikeli merkeze yerine yana çelmesinin amacı nedir?|İkinci şut riskini azaltmak|Rakibe kolay şut vermek|Kale çizgisini değiştirmek|Hakemin görüşünü kapatmak
Kalecinin ayakla pas kalitesi modern oyunda neden önemlidir?|Baskı altında takımın topu korumasına yardımcı olur|Kaleye elle dokunmayı kaldırır|Rakibin oyuncu sayısını azaltır|Her pası gol yapar
Kalecinin hatalı pası sonrası yeniden pozisyon almasına ne denir?|Pozisyonunu toparlama|Taç kullanma|Ofsayt işareti|Santra yapma
Penaltıda kalecinin tahmin ettiği köşeye atlamasına ne denir?|Köşe seçmek|Markaj kurmak|Taç açmak|Santra bozmak
Kalecinin havadan gelen topu iki eliyle kavraması hangi beceridir?|Yüksek top kontrolü|Serbest vuruş barajı|Ofsayt tuzağı|Köşe vuruşu
Kalecinin kurtarış sonrası topu hızla takım arkadaşına aktarması neyi başlatabilir?|Hızlı hücum|Otomatik penaltı|Zorunlu oyuncu değişikliği|Devre arası
Kalecinin antrenmanda farklı açılardan şut çalışmasının amacı nedir?|Pozisyon alma ve tepki becerisini geliştirmek|Saha ölçülerini ezberlemek|Rakip formasını değiştirmek|Hakem sayısını artırmak
''')
planets=[('Merkür',1,88),('Venüs',2,225),('Dünya',3,365),('Mars',4,687),('Jüpiter',5,4333),('Satürn',6,10759),('Uranüs',7,30687),('Neptün',8,60190)]
for name,order,days in planets:
    add('gezegenler',f'{name}, Güneş\'e uzaklık sıralamasında kaçıncı gezegendir?',str(order),[str(i) for i in range(1,9)])
    add('gezegenler',f'{name}\'ün Güneş çevresindeki bir turu yaklaşık kaç Dünya günü sürer?' if name in ['Merkür','Satürn','Neptün'] else f'{name} gezegeninin bir yılı yaklaşık kaç Dünya günüdür?',str(days),[str(p[2]) for p in planets])
direct('gezegenler','''
Güneş Sistemi'nde kaç gezegen vardır?|8|7|9|12
Güneş'e en yakın gezegen hangisidir?|Merkür|Venüs|Dünya|Mars
Güneş'e en uzak gezegen hangisidir?|Neptün|Uranüs|Satürn|Jüpiter
Güneş Sistemi'nin en büyük gezegeni hangisidir?|Jüpiter|Satürn|Neptün|Dünya
Güneş Sistemi'nin en küçük gezegeni hangisidir?|Merkür|Mars|Venüs|Dünya
Yüzey sıcaklığı ortalama olarak en yüksek gezegen hangisidir?|Venüs|Merkür|Mars|Dünya
Kızıl Gezegen olarak anılan gezegen hangisidir?|Mars|Venüs|Jüpiter|Neptün
Üzerinde yaşam bulunduğu kesin olarak bilinen gezegen hangisidir?|Dünya|Mars|Venüs|Satürn
En belirgin halka sistemiyle tanınan gezegen hangisidir?|Satürn|Mars|Venüs|Merkür
Kendi ekseni çevresinde en hızlı dönen gezegen hangisidir?|Jüpiter|Dünya|Venüs|Mars
Neredeyse yan yatmış ekseniyle dönen gezegen hangisidir?|Uranüs|Jüpiter|Mars|Merkür
Büyük Kırmızı Leke hangi gezegendedir?|Jüpiter|Satürn|Mars|Venüs
Büyük Kırmızı Leke esas olarak nedir?|Dev bir atmosfer fırtınası|Katı bir dağ|Buzlu bir uydu|Sönmüş bir yıldız
Olympus Mons adlı dev volkan hangi gezegendedir?|Mars|Dünya|Merkür|Venüs
Valles Marineris kanyon sistemi hangi gezegendedir?|Mars|Venüs|Merkür|Jüpiter
Dünya'nın doğal uydusu hangisidir?|Ay|Titan|Europa|Triton
Phobos hangi gezegenin uydusudur?|Mars|Dünya|Jüpiter|Uranüs
Deimos hangi gezegenin uydusudur?|Mars|Satürn|Neptün|Venüs
Ganymede hangi gezegenin uydusudur?|Jüpiter|Satürn|Mars|Uranüs
Europa hangi gezegenin uydusudur?|Jüpiter|Neptün|Dünya|Mars
Io hangi gezegenin uydusudur?|Jüpiter|Uranüs|Satürn|Neptün
Callisto hangi gezegenin uydusudur?|Jüpiter|Mars|Uranüs|Satürn
Titan hangi gezegenin uydusudur?|Satürn|Jüpiter|Uranüs|Neptün
Enceladus hangi gezegenin uydusudur?|Satürn|Jüpiter|Mars|Dünya
Triton hangi gezegenin uydusudur?|Neptün|Uranüs|Satürn|Jüpiter
Titania hangi gezegenin uydusudur?|Uranüs|Neptün|Mars|Dünya
Oberon hangi gezegenin uydusudur?|Uranüs|Satürn|Jüpiter|Neptün
Miranda hangi gezegenin uydusudur?|Uranüs|Jüpiter|Mars|Satürn
Güneş Sistemi'ndeki en büyük uydu hangisidir?|Ganymede|Titan|Ay|Europa
Yoğun atmosferi ve yüzeyindeki metan gölleriyle tanınan uydu hangisidir?|Titan|Ay|Phobos|Deimos
Çok etkin volkanlarıyla tanınan Jüpiter uydusu hangisidir?|Io|Callisto|Ganymede|Europa
Buz kabuğunun altında okyanus bulunduğuna güçlü kanıtlar olan Jüpiter uydusu hangisidir?|Europa|Phobos|Titan|Triton
Güney kutbundan buzlu püskürmeler çıkan Satürn uydusu hangisidir?|Enceladus|Ay|Phobos|Io
Hangi gezegenin doğal uydusu yoktur?|Merkür|Dünya|Mars|Jüpiter
Aşağıdakilerden hangisinin doğal uydusu yoktur?|Venüs|Satürn|Uranüs|Neptün
Mars'ın kaç doğal uydusu vardır?|2|1|4|8
Dünya'nın kaç doğal uydusu vardır?|1|2|3|4
Merkür, Venüs, Dünya ve Mars hangi gezegen grubudur?|Karasal gezegenler|Gaz devleri|Buz devleri|Cüce yıldızlar
Jüpiter ve Satürn hangi grupta sınıflandırılır?|Gaz devleri|Karasal gezegenler|Cüce gezegenler|Asteroitler
Uranüs ve Neptün hangi grupta sınıflandırılır?|Buz devleri|Karasal gezegenler|Kırmızı cüceler|Kuyruklu yıldızlar
Plüton, 2006'dan beri hangi sınıfta yer alır?|Cüce gezegen|Gaz devi|Yıldız|Doğal uydu
Ceres nerede bulunur?|Ana asteroit kuşağında|Dünya'nın halkasında|Güneş'in yüzeyinde|Mars'ın atmosferinde
Ana asteroit kuşağı hangi iki gezegen arasındadır?|Mars ve Jüpiter|Dünya ve Mars|Jüpiter ve Satürn|Venüs ve Dünya
Kuiper Kuşağı hangi gezegenin yörüngesinin ötesinde uzanır?|Neptün|Mars|Venüs|Merkür
Plüton'un en büyük uydusu hangisidir?|Charon|Titan|Europa|Io
Güneş bir gezegen değil, nedir?|Yıldız|Uydu|Asteroit|Kuyruklu yıldız
Güneş'in enerjisinin temel kaynağı hangisidir?|Nükleer füzyon|Kömür yanması|Kimyasal pil|Sürtünme
Güneş'te en bol bulunan element hangisidir?|Hidrojen|Demir|Oksijen|Silisyum
Gezegenleri Güneş çevresinde yörüngede tutan kuvvet hangisidir?|Kütle çekimi|Sürtünme|Kaldırma kuvveti|Ses basıncı
Bir gezegenin kendi ekseni etrafındaki hareketine ne denir?|Dönme|Dolanma|Tutulma|Çarpışma
Bir gezegenin Güneş çevresindeki hareketine ne denir?|Dolanma|Dönme|Yoğuşma|Yansıma
Dünya'da mevsimlerin oluşmasındaki temel etken hangisidir?|Eksen eğikliği ve Güneş çevresinde dolanma|Ay'ın renginin değişmesi|Dünya'nın düz olması|Güneş'in her gün sönmesi
Dünya'nın eksen eğikliği yaklaşık kaç derecedir?|23,5°|0°|60°|90°
Astronomik birim yaklaşık olarak hangi uzaklıktır?|Dünya ile Güneş arasındaki ortalama uzaklık|Dünya ile Ay arası|Güneş'in çapı|Samanyolu'nun çapı
Güneş ışığının Dünya'ya ulaşması yaklaşık ne kadar sürer?|8 dakika 20 saniye|1 saniye|1 gün|1 yıl
Işık yılı neyin birimidir?|Uzaklık|Sıcaklık|Kütle|Basınç
Dünya atmosferinde en bol bulunan gaz hangisidir?|Azot|Oksijen|Karbondioksit|Helyum
Venüs atmosferinde baskın gaz hangisidir?|Karbondioksit|Oksijen|Hidrojen|Neon
Mars atmosferinde baskın gaz hangisidir?|Karbondioksit|Oksijen|Azot|Helyum
Mars'ın kırmızı görünümünde hangi madde etkilidir?|Demir oksit|Saf altın|Bakır sülfat|Sıvı cıva
Uranüs ve Neptün atmosferlerinde mavi tonlara katkı yapan gaz hangisidir?|Metan|Oksijen|Neon|Argon
Satürn'ün halkaları ağırlıklı olarak nelerden oluşur?|Buz parçaları ve kayaçlar|Alevler|Bitkiler|Sıvı demir
Hangi gezegenin ortalama yoğunluğu sudan düşüktür?|Satürn|Dünya|Merkür|Venüs
Ay'ın yüzeyindeki koyu düzlüklerin tarihsel adı nedir?|Denizler|Ormanlar|Çöller|Bulutlar
Ay'ın Dünya'ya hep yaklaşık aynı yüzünü göstermesinin nedeni nedir?|Dönme ve dolanma sürelerinin eşit olması|Hiç dönmemesi|Kendi ışığını üretmesi|Dünya'dan büyük olması
Güneş tutulmasında hangi gök cismi Dünya ile Güneş arasına girer?|Ay|Mars|Venüs|Jüpiter
Ay tutulmasında Ay hangi gök cisminin gölgesine girer?|Dünya|Venüs|Mars|Jüpiter
Kuyruklu yıldızın kuyruğu genel olarak hangi yöne uzanır?|Güneş'ten uzağa|Her zaman Güneş'e doğru|Her zaman Dünya'ya doğru|Kuzey Kutbu'na doğru
Dünya atmosferine girip ışık saçarak yanan küçük gök cismine ne denir?|Meteor|Uydu|Gezegen|Nebula
Bir gök cisminin yere ulaşan parçasına ne denir?|Meteorit|Yıldız|Gezegen|Bulutsu
Güneş Sistemi hangi galakside bulunur?|Samanyolu|Andromeda|Üçgen|Sombrero
Gezegenler görünür ışıkta neden parlar?|Yıldız ışığını yansıttıkları için|Hepsi yıldız olduğu için|İçlerinde ampul olduğu için|Hepsi nükleer füzyon yaptığı için
Güneş Sistemi'nin yaşı yaklaşık ne kadardır?|4,6 milyar yıl|46 bin yıl|460 milyon yıl|46 milyar yıl
Neptün'ün keşfinden önce konumu hangi yöntemle öngörüldü?|Matematiksel hesaplarla|Radyo yayını dinleyerek|Ay'a inerek|Dünya'yı kazarak
Uranüs'ü 1781'de keşfeden astronom kimdir?|William Herschel|Isaac Newton|Edwin Hubble|Tycho Brahe
Jüpiter'in dört büyük uydusunu 1610'da gözlemleyen bilim insanı kimdir?|Galileo Galilei|Albert Einstein|Stephen Hawking|Edwin Hubble
Dünya'nın Güneş çevresindeki yörüngesi hangi şekle yakındır?|Elips|Kare|Üçgen|Spiral merdiven
Dünya'nın manyetik alanı Güneş rüzgârıyla karşılaşınca hangi ışık olayına katkı sağlar?|Kutup ışıkları|Gökkuşağı|Şimşek|Serap
Jüpiter'in yaklaşık bir dönüş süresi ne kadardır?|10 saat|24 saat|30 gün|365 gün
Venüs'ün dönüş yönü Dünya'nınkine göre nasıldır?|Ters yöndedir|Aynı yönde ve aynı hızdadır|Hiç dönmez|Her gün yön değiştirir
Merkür'ün yüzeyinde kraterlerin çok belirgin olmasının nedenlerinden biri nedir?|Aşınmaya neden olacak yoğun atmosferin olmaması|Sürekli yağmur yağması|Yüzeyin tamamen okyanus olması|Bitki örtüsünün yoğunluğu
Güneş'e yakınlık sıralamasında Dünya'dan hemen önce hangi gezegen vardır?|Venüs|Mars|Jüpiter|Satürn
Güneş'e yakınlık sıralamasında Mars'tan hemen sonra hangi gezegen vardır?|Jüpiter|Dünya|Venüs|Uranüs
Güneş'e yakınlık sıralamasında Satürn'den hemen sonra hangi gezegen vardır?|Uranüs|Jüpiter|Mars|Venüs
''')
pairs('genel-kultur','''
Mona Lisa tablosu|Leonardo da Vinci
Yıldızlı Gece tablosu|Vincent van Gogh
Guernica tablosu|Pablo Picasso
Çığlık tablosu|Edvard Munch
Belleğin Azmi tablosu|Salvador Dalí
İnci Küpeli Kız tablosu|Johannes Vermeer
Âdem'in Yaratılışı freski|Michelangelo
Düşünen Adam heykeli|Auguste Rodin
Kaplumbağa Terbiyecisi tablosu|Osman Hamdi Bey
Nilüferler resim serisi|Claude Monet
Küçük Prens|Antoine de Saint-Exupéry
Don Kişot|Miguel de Cervantes
Sefiller|Victor Hugo
Suç ve Ceza|Fyodor Dostoyevski
Savaş ve Barış|Lev Tolstoy
Anna Karenina|Lev Tolstoy
Romeo ve Juliet|William Shakespeare
Hamlet|William Shakespeare
Dönüşüm|Franz Kafka
1984 romanı|George Orwell
Hayvan Çiftliği|George Orwell
Gurur ve Önyargı|Jane Austen
Uğultulu Tepeler|Emily Brontë
Jane Eyre|Charlotte Brontë
Moby Dick|Herman Melville
Define Adası|Robert Louis Stevenson
Robinson Crusoe|Daniel Defoe
Seksen Günde Devriâlem|Jules Verne
Denizler Altında Yirmi Bin Fersah|Jules Verne
Alice Harikalar Diyarında|Lewis Carroll
Pinokyo|Carlo Collodi
Peter Pan|J. M. Barrie
Hobbit|J. R. R. Tolkien
Yüzüklerin Efendisi|J. R. R. Tolkien
Harry Potter serisi|J. K. Rowling
Narnia Günlükleri|C. S. Lewis
Şeker Portakalı|José Mauro de Vasconcelos
Simyacı|Paulo Coelho
Yaşlı Adam ve Deniz|Ernest Hemingway
Yüzyıllık Yalnızlık|Gabriel García Márquez
İnce Memed|Yaşar Kemal
Çalıkuşu|Reşat Nuri Güntekin
Kürk Mantolu Madonna|Sabahattin Ali
Saatleri Ayarlama Enstitüsü|Ahmet Hamdi Tanpınar
Tutunamayanlar|Oğuz Atay
Aşk-ı Memnu|Halit Ziya Uşaklıgil
Mai ve Siyah|Halit Ziya Uşaklıgil
Eylül romanı|Mehmet Rauf
Araba Sevdası|Recaizade Mahmut Ekrem
Sinekli Bakkal|Halide Edib Adıvar
''','“{}” adlı eserin yaratıcısı kimdir?')
direct('genel-kultur','''
Suyun kimyasal formülü hangisidir?|H₂O|CO₂|O₂|NaCl
Altının kimyasal sembolü hangisidir?|Au|Ag|Fe|Cu
Gümüşün kimyasal sembolü hangisidir?|Ag|Au|Al|Ar
Demirin kimyasal sembolü hangisidir?|Fe|F|Fr|Fm
Oksijenin kimyasal sembolü hangisidir?|O|Os|Ox|Og
Karbonun kimyasal sembolü hangisidir?|C|Ca|Co|Cu
Sofra tuzunun kimyasal formülü hangisidir?|NaCl|H₂O|CO₂|NH₃
İnsan vücudunda kanı pompalayan organ hangisidir?|Kalp|Akciğer|Mide|Böbrek
Solunumda gaz alışverişinin temel organı hangisidir?|Akciğer|Karaciğer|Dalak|Mide
İnsanın en büyük iç organı hangisidir?|Karaciğer|Kalp|Böbrek|Dalak
Erişkin bir insanda genellikle kaç kemik bulunur?|206|106|306|406
Bitkilerin ışık enerjisiyle besin üretme sürecine ne denir?|Fotosentez|Fermantasyon|Buharlaşma|Yoğuşma
Bitkilere yeşil rengini veren pigment hangisidir?|Klorofil|Hemoglobin|Melanin|Keratin
Kalıtsal bilgiyi taşıyan temel molekül hangisidir?|DNA|Glikoz|Su|Tuz
Hücrenin enerji üretimiyle ilişkilendirilen organeli hangisidir?|Mitokondri|Ribozom|Lizozom|Golgi aygıtı
Protein sentezinde görev alan yapı hangisidir?|Ribozom|Lizozom|Koful|Sentrozom
Ses boşlukta yayılabilir mi?|Hayır, maddesel ortam gerekir|Evet, en hızlı boşlukta yayılır|Yalnızca gece yayılır|Yalnızca kırmızı ses yayılır
Elektrik akımının SI birimi hangisidir?|Amper|Volt|Ohm|Watt
Elektrik direncinin SI birimi hangisidir?|Ohm|Amper|Volt|Joule
Kuvvetin SI birimi hangisidir?|Newton|Pascal|Watt|Kelvin
Enerjinin SI birimi hangisidir?|Joule|Newton|Amper|Metre
Gücün SI birimi hangisidir?|Watt|Joule|Volt|Kelvin
Sıcaklığın SI temel birimi hangisidir?|Kelvin|Santimetre|Litre|Gram
Bir üçgenin iç açılarının toplamı düzlemde kaç derecedir?|180|90|270|360
Bir karenin iç açılarının toplamı kaç derecedir?|360|180|270|540
Bir dik açının ölçüsü kaç derecedir?|90|45|60|180
Bir saatte kaç saniye vardır?|3600|60|600|2400
Bir kilometre kaç metredir?|1000|100|10|10000
Bir düzine kaç adettir?|12|10|20|24
Bir deste kaç adettir?|10|12|20|100
Satranç tahtasında kaç kare vardır?|64|36|49|81
Satrançta L biçiminde hareket eden taş hangisidir?|At|Fil|Kale|Vezir
Satrançta yalnızca çapraz hareket eden taş hangisidir?|Fil|Kale|At|Şah
Standart bir piyanoda kaç tuş bulunur?|88|66|72|100
Kemanın standart olarak kaç teli vardır?|4|5|6|8
Basketbolda bir takım sahada kaç oyuncuyla yer alır?|5|6|7|11
Voleybolda bir takım sahada kaç oyuncuyla yer alır?|6|5|7|9
Olimpiyat sembolünde kaç halka vardır?|5|4|6|7
Maratonun resmî mesafesi kaç kilometredir?|42,195|40|21,1|50
Teniste sıfır puan için kullanılan terim hangisidir?|Love|Ace|Let|Deuce
Modern matbaacılığın gelişiminde hareketli metal harflerle anılan isim kimdir?|Johannes Gutenberg|Isaac Newton|Galileo Galilei|James Watt
Penisilini 1928'de keşfeden bilim insanı kimdir?|Alexander Fleming|Louis Pasteur|Marie Curie|Gregor Mendel
Radyoaktivite çalışmalarıyla tanınan ve iki Nobel kazanan bilim insanı kimdir?|Marie Curie|Rosalind Franklin|Ada Lovelace|Jane Goodall
Bezelyelerle yaptığı deneylerle kalıtımın temellerini atan kişi kimdir?|Gregor Mendel|Charles Darwin|Louis Pasteur|Robert Koch
Görelilik kuramıyla tanınan bilim insanı kimdir?|Albert Einstein|Isaac Newton|Nikola Tesla|Michael Faraday
Yerçekimi ve hareket yasalarıyla tanınan bilim insanı kimdir?|Isaac Newton|Dmitri Mendeleyev|Gregor Mendel|Alexander Fleming
Elementlerin periyodik tablosuyla özdeşleşen bilim insanı kimdir?|Dmitri Mendeleyev|Charles Darwin|James Watt|Louis Pasteur
İlk insanlı Ay inişi hangi Apollo göreviyle gerçekleşti?|Apollo 11|Apollo 8|Apollo 13|Apollo 17
Ay'a ilk ayak basan insan kimdir?|Neil Armstrong|Yuri Gagarin|John Glenn|Alan Shepard
Uzaya çıkan ilk insan kimdir?|Yuri Gagarin|Neil Armstrong|Buzz Aldrin|Michael Collins
''')
from expanded_bank import expand
expand(questions,add,direct,provinces)
flags=json.loads((ROOT/'data/flag-countries.json').read_text())
for flag in flags:
    add('bayraklar',f"{flag['name']} ülkesinin bayrağı hangisidir?",'flag:'+flag['code'],['flag:'+f['code'] for f in flags],f"Doğru bayrak: {flag['name']}.")
from collections import Counter
counts=Counter(q['category'] for q in questions)
expected={cat:100 for cat in ['cografya','dinozor','hayvanlar','ulkeler','gezegenler','futbol','kaleciler','arabalar','genel-kultur','meshur','bayraklar','enler']}
expected.update(turkiye=200,plakalar=81)
assert dict(counts)==expected,(dict(counts),expected)
assert len(questions)==1481
assert len({q['id'] for q in questions})==len(questions)
assert len({q['text'] for q in questions})==len(questions)
assert sum(q['category']=='turkiye' and 'plaka kodu' in q['text'] for q in questions)==20
for q in questions:
    assert len(q['options'])==len(set(q['options']))==4
    assert 0<=q['correct']<=3
serialized=json.dumps(questions,ensure_ascii=False,indent=2)+'\n'
if '--check' in sys.argv:
    assert (ROOT/'data/questions.json').read_text()==serialized,'Question bank differs from generator'
else:(ROOT/'data/questions.json').write_text(serialized)
print(json.dumps(dict(counts),ensure_ascii=False));print(f'{len(questions)} unique questions, four unique options each: OK')
