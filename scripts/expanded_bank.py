"""Additional curated categories. Keep legacy IDs and option order unchanged."""
MAJOR_PROVINCES = {'İstanbul','Ankara','İzmir','Bursa','Antalya','Adana','Konya','Gaziantep','Şanlıurfa','Mersin','Kocaeli','Diyarbakır','Hatay','Manisa','Kayseri','Samsun','Balıkesir','Kahramanmaraş','Aydın','Tekirdağ'}
# One distinctive product, craft, celebration or landmark for every province.
SPECIALTIES = '''
Adana|Adana kebabı|Zırhta çekilen etin şişe geçirilmesiyle yapılan ünlü kebap
Adıyaman|Besni üzümü|Besni ilçesinin adıyla anılan üzüm
Afyonkarahisar|Afyon kaymağı|Manda sütünden de yapılan, şehrin adıyla tescilli kaymak
Ağrı|Abdigör köftesi|Doğubayazıt mutfağının dövülmüş etle hazırlanan Abdigör köftesi
Amasya|Misket elması|Amasya misketi adıyla tanınan kokulu elma
Ankara|Tiftik keçisi|Angora adıyla dünyada tanınan tiftik keçisi
Antalya|Tahinli piyaz|Tahinli tarator sosuyla hazırlanan coğrafi işaretli piyaz
Artvin|Kafkasör şenlikleri|Kafkasör Yaylası'nda boğa güreşleriyle tanınan şenlikler
Aydın|Aydın inciri|Kurutmalık Sarılop çeşidiyle ünlü, ilin adıyla tescilli incir
Balıkesir|Höşmerim|Peynir ve irmikle hazırlanan, Balıkesir adıyla tescilli höşmerim
Bilecik|Pazaryeri bozası|Pazaryeri ilçesiyle tanınan boza
Bingöl|Yüzen Adalar|Solhan'daki Hazarşah köyü yakınında bulunan Yüzen Adalar
Bitlis|Büryan kebabı|Bitlis adıyla tescilli, kuyuda pişirilen büryan kebabı
Bolu|Mengen aşçılık geleneği|Mengen ilçesinin kuşaktan kuşağa aktarılan aşçılık geleneği
Burdur|Ceviz ezmesi|Burdur adıyla tescilli, ceviz ve irmikle yapılan ezme
Bursa|İskender kebap|Dönerin pide üzerinde yoğurt ve tereyağıyla sunulduğu İskender kebap
Çanakkale|Ezine peyniri|Ezine ilçesinin adıyla tanınan peynir
Çankırı|Kaya tuzu mağarası|Yer altında dev galeriler oluşturan, Çankırı adıyla bilinen tuz mağarası
Çorum|Çorum leblebisi|Çifte kavrulmuş çeşidiyle de tanınan, Çorum adıyla tescilli leblebi
Denizli|Denizli horozu|Uzun ötüşüyle tanınan ve ilin adını taşıyan horoz
Diyarbakır|Diyarbakır karpuzu|İri meyveleriyle tanınan, Diyarbakır adıyla tescilli karpuz
Edirne|Tava ciğeri|İncecik kesilip kızartılan, Edirne adıyla tescilli tava ciğeri
Elazığ|Orcik|Cevizlerin üzüm şıralı karışıma batırılmasıyla yapılan yöresel orcik
Erzincan|Erzincan tulum peyniri|Erzincan adıyla tescilli tulum peyniri
Erzurum|Oltu taşı|Tespih ve takı yapımında kullanılan siyah Oltu taşı
Eskişehir|Lületaşı|Pipo ve süs eşyası yapımında kullanılan beyaz lületaşı
Gaziantep|Antep baklavası|Antep fıstığıyla hazırlanan ve Antep adıyla tescilli baklava
Giresun|Giresun tombul fındığı|Giresun adıyla tanınan tombul fındık
Gümüşhane|Köme ve pestil|Gümüşhane adıyla tescilli dut pestili ve köme
Hakkâri|Hakkâri kilimleri|Gül, yayla ve aşiret adlarıyla anılan motifleri olan Hakkâri kilimleri
Hatay|Antakya künefesi|Tuzsuz peynir ve kadayıfla yapılan Antakya künefesi
Isparta|Yağ gülü|Gül yağı üretimiyle şehri simgeleyen yağ gülü
Mersin|Tantuni|Sacda pişirilen ince doğranmış etle hazırlanan tantuni
İstanbul|Kanlıca yoğurdu|Kanlıca semtinin adıyla tanınan yoğurt
İzmir|Boyoz|Özellikle kahvaltıda tüketilen, İzmir adıyla tescilli boyoz
Kars|Kars kaşarı|Kars adıyla coğrafi işaret almış kaşar peyniri
Kastamonu|Taşköprü sarımsağı|Taşköprü ilçesinin adıyla tanınan sarımsak
Kayseri|Kayseri mantısı|Küçük hamur bohçalarıyla hazırlanan, Kayseri adıyla tescilli mantı
Kırklareli|Hardaliye|Üzüm ve hardal tohumu kullanılarak hazırlanan hardaliye
Kırşehir|Ahilik kültürü|Ahi Evran'ın türbesinin bulunduğu şehirle özdeşleşen Ahilik kültürü
Kocaeli|İzmit pişmaniyesi|İzmit adıyla tanınan tel tel pişmaniye
Konya|Etliekmek|İnce hamur üzerinde kıymayla pişirilen, Konya adıyla tescilli etliekmek
Kütahya|Çini sanatı|Kütahya adıyla tanınan geleneksel çini sanatı
Malatya|Malatya kayısısı|Kurutulmuş çeşidiyle dünyaca tanınan, Malatya adıyla tescilli kayısı
Manisa|Mesir macunu|Şenliklerde halka saçılmasıyla tanınan mesir macunu
Kahramanmaraş|Maraş dondurması|Salep ve keçi sütüyle yapılan, dövülerek hazırlanan Maraş dondurması
Mardin|Telkâri|Midyat ilçesinde gümüş tellerle yapılan telkâri işçiliği
Muğla|Bodrum mandalinası|Bodrum ilçesinin adıyla tanınan mandalina
Muş|Muş lalesi|İlkbaharda ovayı renklendiren, ilin adıyla bilinen Muş lalesi
Nevşehir|Avanos çömlekçiliği|Kızılırmak'ın kilinden yararlanan Avanos çömlekçiliği
Niğde|Niğde gazozu|Niğde adıyla bilinen geleneksel gazoz
Ordu|Ordu pidesi|Ordu yağlısı olarak da bilinen, ilin adıyla tescilli pide
Rize|Rize çayı|Doğu Karadeniz'de şehrin simgelerinden olan Rize çayı
Sakarya|Adapazarı ıslama köftesi|Kemik suyuyla ıslatılmış ekmekle sunulan Adapazarı ıslama köftesi
Samsun|Bafra pidesi|Bafra ilçesinin adıyla tescilli kapalı pide
Siirt|Perde pilavı|İç pilavın hamurla kaplanarak pişirildiği Siirt perde pilavı
Sinop|Sinop mantısı|Cevizle sunulan çeşidiyle tanınan Sinop mantısı
Sivas|Kangal köpeği|Kangal ilçesinin adıyla tanınan çoban köpeği
Tekirdağ|Tekirdağ köftesi|Tekirdağ adıyla tescilli yöresel köfte
Tokat|Tokat kebabı|Et ve sebzelerin özel ocakta pişirildiği Tokat kebabı
Trabzon|Akçaabat köftesi|Akçaabat ilçesinin adıyla tanınan köfte
Tunceli|Munzur Vadisi|Munzur Gözeleri ve millî parkıyla tanınan Munzur Vadisi
Şanlıurfa|Sıra gecesi geleneği|Şanlıurfa ile özdeşleşmiş müzikli sıra gecesi geleneği
Uşak|Uşak tarhanası|Uşak adıyla tescilli, fermente edilerek hazırlanan tarhana
Van|Van otlu peyniri|Yöresel otlarla hazırlanan Van otlu peyniri
Yozgat|Yozgat arabaşısı|Çorbası ve ayrı hazırlanan hamuruyla sunulan Yozgat arabaşısı
Zonguldak|Devrek bastonu|Devrek ilçesinin el işçiliğiyle ünlü bastonu
Aksaray|Ihlara Vadisi|Melendiz Çayı'nın şekillendirdiği Ihlara Vadisi
Bayburt|Ehram dokumacılığı|Bayburt adıyla tescilli geleneksel ehram dokumacılığı
Karaman|Divle Obruğu tulum peyniri|Divle Obruğu'nda olgunlaştırılan tulum peyniri
Kırıkkale|Keskin tava|Keskin ilçesinin adıyla anılan etli tava yemeği
Batman|Sason cevizi|Sason ilçesinde yetiştirilen ünlü ceviz
Şırnak|Şal şapik dokuması|Şırnak adıyla tescilli geleneksel şal şapik dokuması
Bartın|Tel kırma|Bartın işi olarak da bilinen, metal telle yapılan tel kırma işlemesi
Ardahan|Damal bebeği|Damal ilçesinin geleneksel giysilerini taşıyan el yapımı bebek
Iğdır|Şalağı kayısısı|Iğdır kayısısı adıyla da tanınan Şalağı kayısısı
Yalova|Yürüyen Köşk|Bir ağacı korumak için raylar üzerinde kaydırılan Yürüyen Köşk
Karabük|Safranbolu evleri|UNESCO Dünya Mirası Listesi'ndeki Safranbolu evleri
Kilis|Kilis tava|Kıyma ve sebzelerle hazırlanan Kilis tava
Osmaniye|Osmaniye yer fıstığı|Osmaniye adıyla tescilli yer fıstığı
Düzce|Akçakoca melengücceği|Akçakoca ilçesine özgü melengücceği tatlısı
'''
EXTRA_SPECIALTIES = '''
Bursa|Kestane şekeri|Bursa adıyla tescilli kestane şekeri
Eskişehir|Çibörek|Eskişehir mutfağıyla özdeşleşen, kıymalı harçla yağda kızartılan çibörek
Gaziantep|Beyran|Pirinç, et ve et suyuyla hazırlanan Antep beyranı
Erzurum|Cağ kebabı|Oltu adıyla tescilli, yatık şişte pişirilen cağ kebabı
Trabzon|Hamsiköy sütlacı|Hamsiköy'ün sütlacı
Çanakkale|Bayramiç beyazı|Bayramiç beyazı adıyla tescilli nektarin
Balıkesir|Susurluk ayranı|Susurluk adıyla tanınan köpüklü ayran
Manisa|Akhisar köftesi|Akhisar ilçesinin adıyla tescilli köfte
Samsun|Çarşamba pidesi|Çarşamba ilçesinin adıyla tescilli pide
Ankara|Beypazarı kurusu|Beypazarı ilçesinin adıyla tanınan, iki kez pişirilen kuru
Kayseri|Develi cıvıklısı|Develi ilçesinin adıyla tanınan cıvıklı pide
Hatay|Antakya sürkü|Antakya adıyla tescilli, baharatlı çökelekten yapılan sürk
Mersin|Cezerye|Mersin adıyla tescilli havuçlu cezerye
Aydın|Memecik zeytinyağı|Aydın adıyla tescilli Memecik zeytinyağı
Kastamonu|Çekme helva|Kastamonu adıyla tescilli çekme helva
Kırklareli|Demirköy balı|Demirköy ilçesinin adıyla tescilli bal
Konya|Höşmerim|Konya adıyla tescilli yöresel höşmerim tatlısı
Afyonkarahisar|Kaymaklı ekmek kadayıfı|Afyon adıyla tescilli kaymaklı ekmek kadayıfı
İzmir|Kumru|İzmir adıyla tescilli kumru sandviçi
'''

def expand(questions, add, direct, provinces):
    # Retain exactly 20 metropolitan plates in Türkiye; all 81 move into their own pool.
    questions[:] = [q for q in questions if not (q['category']=='turkiye' and 'plaka kodu' in q['text'] and q['options'][q['correct']] not in MAJOR_PROVINCES)]
    codes=[f'{i:02d}' for i in range(1,82)]
    for i,province in enumerate(provinces,1):
        add('plakalar',f'{province} ilinin trafik plaka kodu hangisidir?',f'{i:02d}',codes,f'{province}: {i:02d}.')
    rows=[line.split('|') for line in SPECIALTIES.strip().splitlines()]
    assert len(rows)==81 and {r[0] for r in rows}==set(provinces)
    for (province,product,clue), prompt in zip(rows,FAMOUS_CLUES.strip().splitlines()):
        add('turkiye',f'{prompt} tanınan şehrimiz hangisidir?',province,provinces,f'{product}, {province} ilinin tanınmış değerlerindendir.')
    all_rows=rows+[line.split('|') for line in EXTRA_SPECIALTIES.strip().splitlines()]
    assert len(all_rows)==100
    clues=FAMOUS_CLUES.strip().splitlines()
    extra_clues=FAMOUS_EXTRA_CLUES.strip().splitlines()
    assert len(clues)==81 and len(extra_clues)==19
    for (province,product,clue), prompt in zip(all_rows,clues+extra_clues):
        text=f'{prompt} tanınan ilimiz hangisidir?' if prompt in clues else f'{prompt} hangi ilimizle özdeşleşmiştir?'
        add('meshur',text,province,provinces,f'{product}, {province} ilinin tanınmış değerlerindendir.')
    direct('turkiye',TURKEY_GENERAL)
    direct('enler',SUPERLATIVES)
    records=[q for q in questions if q['category']=='enler']
    details=SUPERLATIVE_DETAILS.strip().splitlines()
    assert len(records)==len(details)==100
    for q,detail in zip(records,details):
        q['explanation']=f"Doğru cevap: {q['options'][q['correct']]}. {detail}"


TURKEY_GENERAL = '''
23 Nisan'da kutlanan millî bayramın adı nedir?|Ulusal Egemenlik ve Çocuk Bayramı|Zafer Bayramı|Cumhuriyet Bayramı|Atatürk'ü Anma Gençlik ve Spor Bayramı
19 Mayıs'ta hangi millî bayram kutlanır?|Atatürk'ü Anma Gençlik ve Spor Bayramı|Cumhuriyet Bayramı|Zafer Bayramı|Ulusal Egemenlik ve Çocuk Bayramı
30 Ağustos'ta kutlanan bayram hangisidir?|Zafer Bayramı|Cumhuriyet Bayramı|Ulusal Egemenlik ve Çocuk Bayramı|Atatürk'ü Anma Gençlik ve Spor Bayramı
29 Ekim'de kutlanan millî bayram hangisidir?|Cumhuriyet Bayramı|Zafer Bayramı|Ulusal Egemenlik ve Çocuk Bayramı|Atatürk'ü Anma Gençlik ve Spor Bayramı
Atatürk, 19 Mayıs 1919'da hangi şehre çıktı?|Samsun|İstanbul|İzmir|Antalya
23 Nisan, tarihimizde hangi kurumun açılışını simgeler?|Türkiye Büyük Millet Meclisi|Türk Dil Kurumu|Türkiye İş Bankası|Türk Tarih Kurumu
30 Ağustos Zafer Bayramı hangi zaferin anısına kutlanır?|Başkomutanlık Meydan Muharebesi|Çanakkale Deniz Zaferi|Birinci İnönü Muharebesi|Sakarya Meydan Muharebesi
Cumhuriyet Bayramı'nın dayandığı tarih hangi yıldadır?|1923|1919|1920|1938
Büyük Taarruz hangi tarihte başladı?|26 Ağustos 1922|19 Mayıs 1919|23 Nisan 1920|29 Ekim 1923
Atatürk'ün Samsun'a gittiği vapurun adı nedir?|Bandırma|Savarona|Ertuğrul|Nusret
İstiklal Marşı hangi tarihte kabul edildi?|12 Mart 1921|23 Nisan 1920|29 Ekim 1923|30 Ağustos 1922
İstiklal Marşı'nın bugün kullanılan bestesini kim yaptı?|Osman Zeki Üngör|Ahmet Adnan Saygun|Cemal Reşit Rey|Zeki Müren
Ankara hangi tarihte başkent oldu?|13 Ekim 1923|29 Ekim 1923|23 Nisan 1920|19 Mayıs 1919
Mustafa Kemal Atatürk hangi şehirde doğdu?|Selanik|Sofya|Manastır|İstanbul
Atatürk'ün doğum yılı hangisidir?|1881|1876|1890|1901
Atatürk'ün annesinin adı nedir?|Zübeyde Hanım|Latife Hanım|Makbule Hanım|Halide Hanım
Atatürk'ün babasının adı nedir?|Ali Rıza Efendi|Ziya Bey|Hüseyin Avni Paşa|Ahmet Muhtar Paşa
Atatürk'ün 1919–1927 dönemini anlattığı eseri hangisidir?|Nutuk|Safahat|Çalıkuşu|Kutadgu Bilig
Millî Mücadele'de Erzurum Kongresi hangi yılda toplandı?|1919|1920|1921|1923
Sivas Kongresi hangi tarihte başladı?|4 Eylül 1919|23 Nisan 1920|29 Ekim 1923|30 Ağustos 1922
Amasya Genelgesi hangi yılda yayımlandı?|1919|1915|1922|1924
10 Kasım'da saat 09.05'te Türkiye'de kim anılır?|Mustafa Kemal Atatürk|Mehmet Akif Ersoy|İsmet İnönü|Fatih Sultan Mehmet
Türkiye Cumhuriyeti'nin ilk cumhurbaşkanı kimdir?|Mustafa Kemal Atatürk|İsmet İnönü|Celal Bayar|Cemal Gürsel
Türk bayrağının zemini hangi renktir?|Kırmızı|Beyaz|Mavi|Yeşil
Türk bayrağında hangi iki şekil bulunur?|Ay ve yıldız|Güneş ve kartal|Çınar ve hilal|Aslan ve güneş
Türkiye'nin para birimi hangisidir?|Türk lirası|Euro|Dinar|Manat
Türkiye'nin uluslararası telefon kodu nedir?|+90|+49|+44|+39
Türkiye'nin internet ülke uzantısı hangisidir?|.tr|.de|.fr|.it
Türkiye kaç coğrafi bölgeye ayrılır?|7|5|6|8
Türkiye'nin kaç ili vardır?|81|67|80|82
Türkiye hangi iki kıtada topraklara sahiptir?|Asya ve Avrupa|Avrupa ve Afrika|Asya ve Afrika|Avrupa ve Amerika
Türkiye'nin Avrupa'da kalan topraklarına genel olarak ne denir?|Trakya|Anadolu|Mezopotamya|Kafkasya
Türkiye'nin Asya'daki topraklarının büyük bölümüne ne ad verilir?|Anadolu|Trakya|Balkanlar|İberya
Türkiye'nin kuzey kıyıları hangi denize bakar?|Karadeniz|Akdeniz|Ege Denizi|Kızıldeniz
Türkiye'nin güney kıyılarındaki deniz hangisidir?|Akdeniz|Karadeniz|Baltık Denizi|Hazar Denizi
Türkiye'nin batısında, Yunanistan ile arasında hangi deniz vardır?|Ege Denizi|Karadeniz|Marmara Denizi|Adriyatik Denizi
Tamamı Türkiye sınırları içinde kalan deniz hangisidir?|Marmara Denizi|Ege Denizi|Karadeniz|Akdeniz
Marmara Denizi'ni Ege Denizi'ne bağlayan geçit hangisidir?|Çanakkale Boğazı|İstanbul Boğazı|Süveyş Kanalı|Bering Boğazı
Türkiye'nin batıdaki kara komşuları hangi iki ülkedir?|Yunanistan ve Bulgaristan|Gürcistan ve Ermenistan|İran ve Irak|Suriye ve Ürdün
Sarp Sınır Kapısı Türkiye'yi hangi ülkeye bağlar?|Gürcistan|Bulgaristan|İran|Irak
Kapıkule Sınır Kapısı hangi ülkeye açılır?|Bulgaristan|Yunanistan|Gürcistan|Suriye
Gürbulak Sınır Kapısı hangi ülkeyle sınırdadır?|İran|Irak|Ermenistan|Bulgaristan
Habur Sınır Kapısı hangi ülkeye geçiş sağlar?|Irak|İran|Suriye|Gürcistan
Türkiye'nin başkentinin içinden geçen ve şehre adını veren akarsu hangisidir?|Ankara Çayı|Gediz Nehri|Asi Nehri|Çoruh Nehri
Peribacaları ve yer altı şehirleriyle tanınan turizm bölgesi hangisidir?|Kapadokya|Çukurova|Trakya|Biga Yarımadası
Hattuşa antik kentinin kalıntıları hangi ilimizdedir?|Çorum|Ankara|Yozgat|Amasya
Hattuşa hangi uygarlığın başkentiydi?|Hititler|Urartular|Lidyalılar|İyonlar
Lidyalıların başkenti Sardes bugün hangi ilimizdedir?|Manisa|İzmir|Aydın|Uşak
Urartuların başkenti Tuşpa hangi günümüz şehrindedir?|Van|Kars|Erzurum|Bitlis
Zeugma Mozaik Müzesi hangi ilimizdedir?|Gaziantep|Şanlıurfa|Hatay|Adana
Çingene Kızı adlı ünlü mozaik hangi antik kentten çıkarılmıştır?|Zeugma|Efes|Troya|Hattuşa
Topkapı Sarayı hangi ilimizdedir?|İstanbul|Edirne|Bursa|Ankara
Dolmabahçe Sarayı hangi su yolunun kıyısındadır?|İstanbul Boğazı|Çanakkale Boğazı|Haliç|Sakarya Nehri
Anıtkabir'in bulunduğu tepenin eski adı nedir?|Rasattepe|Çamlıca|Adatepe|Hıdırlık
Aspendos Antik Tiyatrosu hangi ilimizdedir?|Antalya|Muğla|İzmir|Aydın
Düden Şelaleleri hangi ilimizdedir?|Antalya|Bolu|Bursa|Sakarya
Salda Gölü hangi ilimizin sınırları içindedir?|Burdur|Isparta|Denizli|Afyonkarahisar
Uzungöl hangi ilimizdeki turistik göldür?|Trabzon|Rize|Artvin|Giresun
Abant Gölü hangi ilimizdedir?|Bolu|Düzce|Sakarya|Zonguldak
Tuz Gölü'ne kıyısı olan il grubu hangisidir?|Ankara, Konya ve Aksaray|İzmir, Manisa ve Aydın|Bursa, Balıkesir ve Çanakkale|Van, Bitlis ve Muş
Erciyes Dağı hangi ilimizle özdeşleşmiştir?|Kayseri|Konya|Niğde|Nevşehir
Uludağ kayak merkezi hangi ilimizdedir?|Bursa|Bolu|Erzurum|Kastamonu
Palandöken kayak merkezi hangi ilimizdedir?|Erzurum|Kars|Erzincan|Ağrı
Kuş cennetiyle tanınan Manyas Gölü hangi ilimizdedir?|Balıkesir|Bursa|Çanakkale|Tekirdağ
Dalyan'daki İztuzu Plajı hangi ilimizdedir?|Muğla|Antalya|Aydın|İzmir
Caretta caretta hangi hayvanın bilimsel adıdır?|İribaş deniz kaplumbağası|Akdeniz foku|Şişe burunlu yunus|Yeşil iguana
Karagöz ve Hacivat hangi geleneksel gösteriyle tanınır?|Gölge oyunu|Meddahlık|Kuklasız bale|Opera
Tek kişinin taklit ve anlatımıyla gerçekleşen geleneksel sanat hangisidir?|Meddahlık|Karagöz|Orta oyunu|Kanto
Türk kahvesi geleneksel olarak hangi kapta pişirilir?|Cezve|Güveç|Sahan|İbrik
Ebru sanatında renkli desenler önce hangi yüzeyde oluşturulur?|Yoğunlaştırılmış su üzerinde|Kuru taş üzerinde|Camın içinde|Kumaşın altında
Âşık Veysel hangi çalgıyla özdeşleşmiştir?|Bağlama|Keman|Piyano|Klarnet
Uzun İnce Bir Yoldayım türküsünün ozanı kimdir?|Âşık Veysel|Karacaoğlan|Neşet Ertaş|Dadaloğlu
Neşet Ertaş hangi lakapla tanınır?|Bozkırın Tezenesi|Sanat Güneşi|Barış Elçisi|Türkü Baba
Kırkpınar yağlı güreşleri hangi ilimizde düzenlenir?|Edirne|Bursa|Balıkesir|Kırklareli
Yağlı güreşte pehlivanların giydiği deri giysinin adı nedir?|Kispet|Şalvar|Cepken|Potur
Mevlevîlerin dönerek yaptığı törene ne denir?|Semâ|Horon|Zeybek|Halay
Horon hangi bölgemizle özellikle özdeşleşmiştir?|Karadeniz|İç Anadolu|Güneydoğu Anadolu|Akdeniz
Zeybek oyunları hangi bölgemizle özellikle özdeşleşmiştir?|Ege|Karadeniz|Doğu Anadolu|Güneydoğu Anadolu
Çanakkale Deniz Zaferi hangi tarihte kazanıldı?|18 Mart 1915|30 Ağustos 1922|23 Nisan 1920|29 Ekim 1923
Türkiye'de Türkçenin yazım kuralları ve sözlük çalışmalarıyla tanınan kurum hangisidir?|Türk Dil Kurumu|Türk Tarih Kurumu|Türkiye İstatistik Kurumu|Türk Patent ve Marka Kurumu
'''

SUPERLATIVES = '''
Yeryüzündeki beş okyanus arasında en geniş alanı kaplayan hangisidir?|Pasifik Okyanusu|Atlas Okyanusu|Hint Okyanusu|Arktik Okyanusu
Yeryüzündeki beş okyanusun en küçüğü hangisidir?|Arktik Okyanusu|Hint Okyanusu|Atlas Okyanusu|Pasifik Okyanusu
Dünya okyanuslarının bilinen en derin noktası hangisidir?|Challenger Çukuru|Java Çukuru|Porto Riko Çukuru|Tonga Çukuru
Challenger Çukuru hangi okyanusta yer alır?|Pasifik Okyanusu|Atlas Okyanusu|Hint Okyanusu|Arktik Okyanusu
Kıtaları yüzölçümüne göre sıraladığımızda ilk sırada hangisi gelir?|Asya|Afrika|Kuzey Amerika|Antarktika
Yedi kıta modelinde yüzölçümü en küçük kıta hangisidir?|Avustralya|Avrupa|Antarktika|Güney Amerika
Yüzölçümü bakımından en büyük egemen devlet hangisidir?|Rusya|Kanada|Çin|Brezilya
Yüzölçümü bakımından en küçük bağımsız devlet hangisidir?|Vatikan|Monako|San Marino|Lihtenştayn
Afrika'da yüzölçümü en büyük ülke hangisidir?|Cezayir|Sudan|Çad|Libya
Güney Amerika'da yüzölçümü en büyük ülke hangisidir?|Brezilya|Arjantin|Peru|Kolombiya
Kuzey Amerika'da yüzölçümü en büyük ülke hangisidir?|Kanada|ABD|Meksika|Guatemala
Güney Amerika'nın yüzölçümü en küçük bağımsız ülkesi hangisidir?|Surinam|Uruguay|Guyana|Ekvador
Orta Amerika'nın yedi ülkesi arasında yüzölçümü en büyük olan hangisidir?|Nikaragua|Honduras|Guatemala|Panama
Orta Amerika'nın yedi ülkesi arasında yüzölçümü en küçük olan hangisidir?|El Salvador|Belize|Kosta Rika|Panama
Kıtalar dışarıda tutulduğunda dünyanın en büyük adası hangisidir?|Grönland|Yeni Gine|Borneo|Madagaskar
Akdeniz'in yüzölçümü en büyük adası hangisidir?|Sicilya|Sardinya|Kıbrıs|Girit
Karayipler'in yüzölçümü en büyük adası hangisidir?|Küba|Hispanyola|Jamaika|Porto Riko
Japonya'nın yüzölçümü en büyük adası hangisidir?|Honşu|Hokkaido|Kyuşu|Şikoku
Dünyada yüzölçümü en geniş çöl, soğuk çöller de sayılırsa hangisidir?|Antarktika Çölü|Sahra Çölü|Gobi Çölü|Arabistan Çölü
Dünyanın en geniş sıcak çölü hangisidir?|Sahra|Arabistan|Kalahari|Thar
Deniz seviyesine göre Dünya'nın en yüksek zirvesi hangisidir?|Everest|K2|Kangchenjunga|Lhotse
Deniz seviyesine göre Dünya'nın ikinci en yüksek dağı hangisidir?|K2|Kilimanjaro|Mont Blanc|Aconcagua
Afrika kıtasının en yüksek dağı hangisidir?|Kilimanjaro|Kenya Dağı|Ruwenzori|Atlas Dağları
Güney Amerika'nın deniz seviyesine göre en yüksek zirvesi hangisidir?|Aconcagua|Chimborazo|Huascarán|Illimani
Kuzey Amerika'nın en yüksek dağı hangisidir?|Denali|Logan|Rainier|Whitney
Antarktika'nın en yüksek zirvesi hangisidir?|Vinson|Erebus|Sidley|Kirkpatrick
Alp Dağları'nın en yüksek zirvesi hangisidir?|Mont Blanc|Matterhorn|Zugspitze|Eiger
Karalar üzerindeki en uzun kıtasal sıradağ sistemi hangisidir?|Andlar|Himalayalar|Alpler|Atlas Dağları
Azami derinliğine göre dünyanın en derin gölü hangisidir?|Baykal|Tanganika|Hazar|Malavi
Yüzey alanı ölçütüyle dünyanın en büyük kapalı gölü hangisidir?|Hazar Denizi|Superior Gölü|Victoria Gölü|Baykal Gölü
Afrika'nın yüzey alanı en büyük gölü hangisidir?|Victoria Gölü|Tanganika Gölü|Malavi Gölü|Çad Gölü
Güney Amerika'nın yüzey alanı en büyük tatlı su gölü hangisidir?|Titicaca|Poopó|Argentino|Llanquihue
Ortalama su debisiyle dünyanın en büyük nehri hangisidir?|Amazon|Nil|Tuna|Volga
Avrupa'nın en uzun nehri hangisidir?|Volga|Tuna|Ren|Sen
Asya'nın en uzun nehri hangisidir?|Yangtze|Sarı Irmak|Mekong|Ganj
Dünyanın en geniş tropikal yağmur ormanı hangi havzadadır?|Amazon Havzası|Kongo Havzası|Mekong Havzası|Tuna Havzası
Dünyanın en büyük mercan resifi sistemi hangisidir?|Büyük Set Resifi|Belize Set Resifi|Ningaloo Resifi|Apo Resifi
Yeryüzündeki en büyük canlı hayvan türü hangisidir?|Mavi balina|Afrika savan fili|Balina köpekbalığı|İspermeçet balinası
Yaşayan kara hayvanları arasında kütlesi en büyük tür hangisidir?|Afrika savan fili|Asya fili|Su aygırı|Beyaz gergedan
Yaşayan kara hayvanları arasında boyu en uzun olan hangisidir?|Zürafa|Afrika fili|Deve|Gergedan
Kısa mesafede koşma hızıyla en hızlı kara memelisi hangisidir?|Çita|Aslan|Zebra|Gri kurt
Avına dalış sırasında ulaştığı hızla rekor kıran kuş hangisidir?|Gökdoğan|Devekuşu|Akbaba|Pelikan
Yaşayan kuşlar arasında en büyük tür hangisidir?|Devekuşu|İmparator penguen|Emu|Tepeli pelikan
Yaşayan penguenler arasında en iri tür hangisidir?|İmparator penguen|Kral penguen|Adelie pengueni|Küçük penguen
Yaşayan balıklar arasında en büyük tür hangisidir?|Balina köpekbalığı|Büyük beyaz köpekbalığı|Mavi yüzgeçli orkinos|Dev orfoz
Yaşayan sürüngenler arasında en iri tür hangisidir?|Tuzlu su timsahı|Nil timsahı|Komodo ejderi|Yeşil anakonda
Yaşayan kertenkelelerin en büyüğü hangisidir?|Komodo ejderi|Yeşil iguana|Gila canavarı|Sakallı ejder
Yaşayan primatların en iri türü hangisidir?|Doğu gorili|Şempanze|Orangutan|Babun
Kanat açıklığı en geniş yaşayan kuş türü hangisidir?|Gezgin albatros|And kondoru|Altın kartal|Bayağı leylek
Yaşayan deniz kaplumbağalarının en büyüğü hangisidir?|Deri sırtlı deniz kaplumbağası|İribaş deniz kaplumbağası|Yeşil deniz kaplumbağası|Atmaca gagalı deniz kaplumbağası
Güneş Sistemi'nin çapı en büyük gezegeni hangisidir?|Jüpiter|Satürn|Uranüs|Neptün
Güneş Sistemi'nin sekiz gezegeni arasında çapı en küçük olan hangisidir?|Merkür|Mars|Venüs|Dünya
Güneş'e ortalama uzaklığı en az olan gezegen hangisidir?|Merkür|Venüs|Dünya|Mars
Sekiz gezegen arasında Güneş'e ortalama uzaklığı en fazla olan hangisidir?|Neptün|Uranüs|Satürn|Jüpiter
Ortalama yüzey sıcaklığı en yüksek gezegen hangisidir?|Venüs|Merkür|Mars|Dünya
Güneş Sistemi'ndeki gezegenlerin çapı en büyük doğal uydusu hangisidir?|Ganymede|Titan|Callisto|Ay
Güneş Sistemi'nin ortalama yoğunluğu en düşük gezegeni hangisidir?|Satürn|Jüpiter|Uranüs|Neptün
Güneş Sistemi'nin ortalama yoğunluğu en yüksek gezegeni hangisidir?|Dünya|Merkür|Venüs|Mars
Güneş çevresindeki bir turunu en kısa sürede tamamlayan gezegen hangisidir?|Merkür|Venüs|Dünya|Mars
Güneş çevresindeki bir turunu en uzun sürede tamamlayan gezegen hangisidir?|Neptün|Uranüs|Satürn|Jüpiter
Kendi ekseni etrafındaki dönüşü en kısa süren gezegen hangisidir?|Jüpiter|Dünya|Mars|Venüs
Kendi ekseni etrafındaki yıldızıl dönüşü en uzun süren gezegen hangisidir?|Venüs|Merkür|Mars|Neptün
Dünya'ya en yakın yıldız hangisidir?|Güneş|Proxima Centauri|Sirius|Vega
Güneş'ten sonra bize en yakın yıldız hangisidir?|Proxima Centauri|Sirius|Vega|Kutup Yıldızı
Güneş hariç gece gökyüzünün görünür parlaklığı en yüksek yıldızı hangisidir?|Sirius|Vega|Betelgeuse|Kutup Yıldızı
Türkiye'deki illeri yüzölçümüne göre sıralarsak en geniş olan hangisidir?|Konya|Sivas|Ankara|Erzurum
Türkiye'de yüzölçümü en küçük il hangisidir?|Yalova|Kilis|Bartın|Düzce
Türkiye'nin coğrafi bölgeleri içinde yüzölçümü en büyük olan hangisidir?|Doğu Anadolu|İç Anadolu|Karadeniz|Akdeniz
Türkiye'nin coğrafi bölgeleri içinde yüzölçümü en küçük olan hangisidir?|Marmara|Güneydoğu Anadolu|Ege|Akdeniz
Türkiye'nin en yüksek zirvesi hangi dağdadır?|Ağrı Dağı|Cilo Dağı|Kaçkar Dağı|Erciyes
Türkiye sınırları içindeki göller arasında en geniş yüzey alanına sahip olan hangisidir?|Van Gölü|Tuz Gölü|Beyşehir Gölü|Eğirdir Gölü
Türkiye'nin tamamen kendi sınırları içinde akan en uzun akarsuyu hangisidir?|Kızılırmak|Sakarya|Yeşilırmak|Gediz
Türkiye'nin yüzölçümü en büyük adası hangisidir?|Gökçeada|Marmara Adası|Bozcaada|Cunda
Türkiye'nin yüzey alanı en büyük doğal tatlı su gölü hangisidir?|Beyşehir Gölü|Eğirdir Gölü|İznik Gölü|Sapanca Gölü
Türkiye'nin en kuzeydeki kara noktası hangi burundur?|İnceburun|Baba Burnu|Anamur Burnu|Hopa Burnu
İnsan vücudunun yüzey alanı en büyük organı hangisidir?|Deri|Karaciğer|Akciğer|Kalp
İnsan vücudunun en büyük iç organı hangisidir?|Karaciğer|Kalp|Dalak|Böbrek
İnsan vücudundaki en uzun kemik hangisidir?|Uyluk kemiği|Kaval kemiği|Kol kemiği|Köprücük kemiği
İnsan vücudundaki en küçük kemik hangisidir?|Üzengi kemiği|Çekiç kemiği|Örs kemiği|Burun kemiği
İnsan vücudundaki en büyük atardamar hangisidir?|Aort|Şah damarı|Akciğer atardamarı|Uyluk atardamarı
İnsan vücudundaki en uzun sinir hangisidir?|Siyatik sinir|Optik sinir|Yüz siniri|İşitme siniri
İnsan vücudundaki en büyük eklem hangisidir?|Diz eklemi|Dirsek eklemi|El bileği|Ayak bileği
Atom numarası en küçük element hangisidir?|Hidrojen|Helyum|Lityum|Karbon
Mohs sertlik ölçeğinde en üstte yer alan mineral hangisidir?|Elmas|Korindon|Topaz|Kuvars
Mohs sertlik ölçeğinde en altta yer alan mineral hangisidir?|Talk|Jips|Kalsit|Florit
Saf metaller arasında oda sıcaklığında elektrik iletkenliği en yüksek olan hangisidir?|Gümüş|Bakır|Altın|Alüminyum
Saf metaller arasında erime sıcaklığı en yüksek olan hangisidir?|Tungsten|Demir|Bakır|Altın
Saf elementler arasında oda sıcaklığında yoğunluğu en yüksek kabul edilen hangisidir?|Osmiyum|Kurşun|Altın|Cıva
Sesin aynı koşullarda yayıldığı bu ortamlardan hangisinde hızı en yüksektir?|Çelik|Su|Hava|Helyum gazı
Görünür ışık tayfında dalga boyu en uzun renk hangisidir?|Kırmızı|Mor|Mavi|Yeşil
Görünür ışık tayfında dalga boyu en kısa renk hangisidir?|Mor|Kırmızı|Turuncu|Sarı
Gövde hacmiyle dünyanın en büyük yaşayan tek gövdeli ağacı hangisidir?|General Sherman|General Grant|Hyperion|Methuselah
Dünyanın en uzun ağaçlarını barındıran tür hangisidir?|Sahil sekoyası|Dev sekoya|Baobab|Sarıçam
Tek çiçek olarak dünyanın en büyük çiçeğini açan tür hangisidir?|Rafflesia arnoldii|Ayçiçeği|Manolya|Lotus
Bitkiler arasında en büyük tohumu üreten tür hangisidir?|Seyşeller palmiyesi|Hindistan cevizi palmiyesi|Hurma palmiyesi|Yağ palmiyesi
Dünyanın en geniş mangrov ormanı olarak tanınan alan hangisidir?|Sundarbans|Daintree|Kara Orman|Belgrad Ormanı
Dünyanın yüzölçümü en büyük yarımadası hangisidir?|Arabistan Yarımadası|İber Yarımadası|İtalya Yarımadası|Kore Yarımadası
Denize kıyısı olmayan ülkeler arasında yüzölçümü en büyük olan hangisidir?|Kazakistan|Moğolistan|Çad|Nijer
Buzla örtülü alanlar hariç, karaların deniz seviyesine göre en alçak yüzeyi hangi su kütlesinin kıyısındadır?|Ölü Deniz|Hazar Denizi|Tuz Gölü|Baykal Gölü
Dünyanın yüzölçümü en büyük tuz düzlüğü hangisidir?|Salar de Uyuni|Salar de Atacama|Bonneville Tuz Düzlüğü|Etosha Tavası
'''

# Province-free clues for the dedicated local-specialties category, in plate order.
FAMOUS_CLUES = '''
Zırh kıymasıyla hazırlanan acılı kebabı ve şalgamıyla
Besni üzümü ve Nemrut Dağı'ndaki heykelleriyle
Kaymağı, sucuğu ve kaymaklı ekmek kadayıfıyla
Doğubayazıt'ın Abdigör köftesiyle
Misket elması ve Yeşilırmak kıyısındaki yalıboyu evleriyle
Tiftik keçisi ve Beypazarı kurusuyla
Tahinli piyazı ve Kaleiçi semtiyle
Kafkasör şenlikleri ve boğa güreşleriyle
Sarılop inciri ve Kuşadası ilçesiyle
Peynirli höşmerimi ve Susurluk ayranıyla
Pazaryeri bozası ve Söğüt ilçesiyle
Solhan ilçesindeki Yüzen Adalar'ıyla
Kuyuda pişen büryan kebabı ve Ahlat mezar taşlarıyla
Mengen aşçılık geleneğiyle
Ceviz ezmesi ve Sagalassos antik kentiyle
İskender kebabı ve kestane şekeriyle
Ezine peyniri ve Troya antik kentiyle
Yer altındaki büyük kaya tuzu mağarasıyla
Leblebisi ve Hattuşa antik kentiyle
Uzun ötüşlü horozu ve Pamukkale travertenleriyle
İri karpuzları ve Hevsel Bahçeleri'yle
Tava ciğeri ve Kırkpınar güreşleriyle
Orcik tatlısı ve Harput mahallesiyle
Tulum peyniri ve bakırcılık geleneğiyle
Oltu taşı ve cağ kebabıyla
Lületaşı ve Odunpazarı evleriyle
Antep fıstıklı baklavası ve beyranıyla
Tombul fındığı ve kıyısındaki ada turizmiyle
Dut pestili ve kömesiyle
Aşiret, çiçek ve yayla adları taşıyan geleneksel kilimleriyle
Antakya künefesi ve sürk peyniriyle
Gül yağı ve yağ gülü yetiştiriciliğiyle
Tantunisi ve cezeryesiyle
Kanlıca yoğurdu ve Vefa bozasıyla
Boyozu ve kumrusuyla
Kaşar peyniri, kaz yemekleri ve Ani ören yeriyle
Taşköprü sarımsağı ve çekme helvasıyla
Küçük taneli mantısı ve pastırmasıyla
Hardaliyesi ve İğneada longozlarıyla
Ahi Evran'ın türbesi ve Ahilik kültürüyle
İzmit pişmaniyesiyle
Etliekmeği ve Mevlânâ Müzesi'yle
Geleneksel çinileri ve porselen üretimiyle
Kurutmalık kayısısı ve Arslantepe Höyüğü'yle
Mesir macunu şenliğiyle
Dövme dondurması ve tarhanasıyla
Midyat telkâri sanatı ve taş evleriyle
Bodrum mandalinası ve Milas halısıyla
İlkbaharda ovasını kaplayan laleleri ve Malazgirt ilçesiyle
Avanos çömlekçiliği ve Göreme peribacalarıyla
Adını taşıyan gazozu ve Bor ilçesiyle
Yağlı adı da verilen yöresel pidesi ve Boztepe'siyle
Çayı ve Anzer balıyla
Adapazarı ıslama köftesiyle
Bafra ve Çarşamba pideleriyle
Perde pilavı ve Pervari balıyla
Cevizli mantısı ve tarihî cezaeviyle
Kangal köpeği ve Divriği Ulu Camii'yle
Yöresel köftesi ve Hayrabolu tatlısıyla
Özel ocakta et ve sebzeyle pişirilen kebabı ve yazmacılığıyla
Akçaabat köftesi ve Hamsiköy sütlacıyla
Munzur Vadisi ve Munzur Gözeleri'yle
Sıra geceleri ve Balıklıgöl'üyle
Tarhanası ve tarihî halıcılık geleneğiyle
Otlu peyniri ve farklı renkli gözleri olabilen kedisiyle
Arabaşısı ve Çamlık Millî Parkı'yla
Devrek bastonuyla
Ihlara Vadisi ve Güzelyurt ilçesiyle
Ehram dokumacılığı ve Baksı Müzesi'yle
Divle Obruğu tulum peyniriyle
Keskin tava yemeğiyle
Sason cevizi ve Hasankeyf'iyle
Şal şapik dokumasıyla
Metal telle yapılan tel kırma işlemesiyle
Geleneksel kıyafetli Damal bebekleriyle
Şalağı kayısısı ve Aras vadisiyle
Ağacı korumak için raylar üzerinde taşınan Yürüyen Köşk'üyle
Safranbolu evleri ve safranıyla
Kıymalı tava yemeği ve cennet çamuru tatlısıyla
Yer fıstığı ve Karatepe-Aslantaş ören yeriyle
Akçakoca melengücceği tatlısıyla
'''
FAMOUS_EXTRA_CLUES = '''
Kestane şekeri ve İnegöl köftesi
Tatar mutfak geleneğinden gelen çibörek ve met helvası
Et, pirinç ve sarımsakla hazırlanan beyran
Oltu'da yatık şişte pişirilen cağ kebabı
Maçka ilçesindeki Hamsiköy sütlacı
Bayramiç beyazı nektarini
Susurluk'un köpüklü ayranı
Akhisar köftesi
Çarşamba'nın coğrafi işaretli pidesi
Beypazarı'nın iki kez pişirilen kurusu
Develi cıvıklısı
Antakya'nın baharatlı sürk peyniri
Havuçla yapılan cezerye ve Tarsus humusu
Memecik zeytinyağı ve Bozdoğan pidesi
Taşköprü sarımsağının yanında çekme helva
Demirköy'ün yöresel balı
Etliekmeğin yanında yöresel höşmerim
Kaymakla servis edilen meşhur ekmek kadayıfı ve Şuhut keşkeği
Kumru sandviçi ve Bergama tulum peyniri
'''

SUPERLATIVE_DETAILS = '''
Pasifik, Dünya yüzeyinin yaklaşık üçte birini kaplar; aynı zamanda okyanuslar arasında en derinidir.
Arktik Okyanusu, Kuzey Kutbu çevresinde yer alır. Burada karşılaştırılan ölçüt su yüzeyinin alanıdır.
Challenger Çukuru, Mariana Çukuru'nun güney kesimindedir. NOAA yaklaşık 10.935 metre derinlik verir; ölçümler yönteme göre biraz değişebilir.
Mariana Çukuru, Guam'ın güneybatısında, batı Pasifik'te yer alır.
Asya yaklaşık 44,6 milyon kilometrekarelik alanıyla diğer kıtalardan büyüktür.
Bu soruda Avustralya'nın ayrı bir kıta sayıldığı yedi kıtalı model kullanılır; Okyanusya daha geniş bir coğrafi bölge adıdır.
Rusya yaklaşık 17,1 milyon kilometrekarelik yüzölçümüyle Asya ve Avrupa'ya yayılır.
Vatikan, Roma şehrinin içinde bulunan bağımsız bir devlettir; yüzölçümü bir kilometrekareden küçüktür.
Cezayir, Kuzey Afrika'dadır. Sudan'ın bölünmesinden sonra Afrika'nın alan bakımından en büyük ülkesi olmuştur.
Brezilya yaklaşık 8,5 milyon kilometrekarelik alanıyla Güney Amerika'nın büyük bölümünü kaplar.
Kanada'nın toplam yüzölçümü yaklaşık 10 milyon kilometrekaredir; bu karşılaştırma nüfusla ilgili değildir.
Surinam, Güney Amerika'nın kuzey kıyısındadır. Burada yalnızca bağımsız ülkeler karşılaştırılır.
Nikaragua yaklaşık 130 bin kilometrekarelik toplam alanıyla Orta Amerika ülkeleri arasında ilk sıradadır.
El Salvador, Pasifik kıyısında yer alır ve yaklaşık 21 bin kilometrekarelik yüzölçümüne sahiptir.
Grönland yaklaşık 2,16 milyon kilometrekaredir. Avustralya kıta kabul edildiği için ada sıralamasına alınmaz.
Sicilya, İtalya'ya bağlıdır ve yaklaşık 25.700 kilometrekarelik yüzölçümüne sahiptir.
Küba adası, Hispanyola, Jamaika ve Porto Riko'dan daha geniştir.
Honşu, Tokyo, Kyoto ve Osaka gibi şehirlerin bulunduğu Japonya'nın ana adasıdır.
Çöl tanımı sıcaklığa değil yağışın azlığına dayanır. Antarktika bu nedenle bir kutup çölüdür.
Sahra yaklaşık 9 milyon kilometrekareyi aşan alanıyla Kuzey Afrika boyunca uzanır.
Everest, Himalayalar'da Nepal ile Çin sınırındadır. 2020 ortak ölçümüne göre yüksekliği deniz seviyesinden 8.848,86 metredir.
K2, Karakurum sıradağlarındadır ve yaklaşık 8.611 metre yüksekliğe ulaşır.
Kilimanjaro Tanzanya'dadır. Uhuru zirvesi yaklaşık 5.895 metre yüksekliğindedir.
Aconcagua, Arjantin'deki And Dağları'nda bulunur; yüksekliği yaklaşık 6.961 metredir.
Denali, Alaska'dadır ve yaklaşık 6.190 metre yüksekliğe ulaşır.
Vinson, Antarktika'daki Ellsworth Dağları'nda yer alır; yüksekliği yaklaşık 4.892 metredir.
Mont Blanc, Fransa-İtalya sınırındaki Alp sistemindedir. Kar örtüsüne göre ölçümü değişmekle birlikte yaklaşık 4.806 metre yüksekliğindedir.
Andlar, Güney Amerika'nın batısı boyunca yaklaşık 7.000 kilometre uzanır. Deniz altındaki sırtlar bu karşılaştırmaya dahil değildir.
Baykal Gölü Sibirya'dadır. Bilinen en büyük derinliği yaklaşık 1.642 metredir.
Hazar Denizi yaklaşık 371 bin kilometrekarelik alanıyla yüzey alanı en büyük göldür; adı deniz olsa da okyanus bağlantısı yoktur.
Victoria Gölü, Tanzanya, Uganda ve Kenya arasında yer alır. Derinlik bakımından Afrika'nın birincisi değildir.
Titicaca, Peru ile Bolivya arasındadır. Yaklaşık 3.812 metre rakımda bulunur; yüzey alanı yaklaşık 8.300 kilometrekaredir.
Amazon'un denize taşıdığı ortalama su miktarı diğer nehirlerden fazladır. Burada uzunluk değil su debisi karşılaştırılır.
Volga yaklaşık 3.530 kilometre boyunca Rusya'da akar ve Hazar Denizi'ne dökülür.
Yangtze, Çin'de yaklaşık 6.300 kilometre boyunca akar ve Doğu Çin Denizi'ne ulaşır.
Amazon yağmur ormanları birden fazla Güney Amerika ülkesine yayılır; en büyük bölümü Brezilya'dadır.
Büyük Set Resifi, Avustralya'nın kuzeydoğusunda yer alır ve kıyı boyunca yaklaşık 2.300 kilometre uzanır.
Mavi balina yaklaşık 30 metre uzunluğa ulaşabilir. Bu sıralamada esas alınan ölçüt hayvanın kütlesidir.
Afrika savan fili, yaşayan kara hayvanlarının en ağırıdır. Deniz memelileri bu karşılaştırmaya dahil değildir.
Yetişkin erkek zürafaların boyu yaklaşık 5–6 metreye ulaşabilir; karşılaştırma ağırlığa göre değildir.
Çita çok kısa sürelerle saatte 100 kilometrenin üzerine çıkabilir; uzun mesafede aynı hızı koruyamaz.
Gökdoğan dalışta saatte 300 kilometreyi aşabilir. Düz uçuş ile dalış hızı aynı ölçüt değildir.
Devekuşu uçamaz; yetişkin erkeklerin boyu 2,5 metreyi aşabilir ve ağırlıkları 100 kilogramın üzerine çıkabilir.
İmparator penguenler yaklaşık 1,2 metre boyuna ulaşabilir. Antarktika'da ürerler.
Balina köpekbalığı bir balıktır ve solungaçları vardır. Mavi balina ise memeli olduğu için bu sıralamaya girmez.
Tuzlu su timsahının iri erkekleri 6 metreyi aşabilir. Hem tatlı hem tuzlu suda görülebilir.
Komodo ejderi Endonezya'nın bazı adalarında yaşar ve yaklaşık 3 metre uzunluğa ulaşabilir.
Doğu gorilleri iri vücutlarıyla diğer yaşayan primat türlerini geride bırakır; insan dışı primatlar karşılaştırılır.
Gezgin albatrosun kanat açıklığı 3,5 metreyi aşabilir. Burada kuşun boyu değil iki kanat ucu arasındaki uzaklık ölçülür.
Deri sırtlı deniz kaplumbağası sert plakalı bir kabuk yerine deri benzeri bir sırt yüzeyine sahiptir; yüzlerce kilogram ağırlığa ulaşabilir.
Jüpiter'in ekvator çapı yaklaşık 143 bin kilometredir. Dünya'nın çapının yaklaşık 11 katıdır.
Merkür'ün çapı yaklaşık 4.879 kilometredir. Cüce gezegenler sekiz gezegen sıralamasına dahil değildir.
Merkür'ün Güneş'e ortalama uzaklığı yaklaşık 58 milyon kilometredir.
Neptün'ün Güneş'e ortalama uzaklığı yaklaşık 4,5 milyar kilometredir. Plüton cüce gezegen olarak sınıflandırılır.
Venüs'ün kalın atmosferinin sera etkisi, yüzeyi yaklaşık 465 santigrat dereceye kadar ısıtır; Güneş'e en yakın gezegen değildir.
Ganymede, Jüpiter'in uydusudur. Yaklaşık 5.268 kilometrelik çapıyla Merkür gezegeninden de geniştir.
Satürn'ün ortalama yoğunluğu suyun yoğunluğundan düşüktür. Bu bilgi gezegenin gaz ağırlıklı bileşimiyle ilişkilidir.
Dünya'nın ortalama yoğunluğu yaklaşık 5,5 gram/santimetreküptür; yoğun metal çekirdeği bu değerde etkilidir.
Merkür bir Güneş turunu yaklaşık 88 Dünya gününde tamamlar.
Neptün'ün bir yılı yaklaşık 165 Dünya yılı sürer.
Jüpiter kendi ekseni etrafında yaklaşık 10 saatte döner. Bu ölçüm gezegenin yörünge süresinden farklıdır.
Venüs'ün yıldızlara göre bir dönüşü yaklaşık 243 Dünya günüdür. Güneş günüyle yıldızıl dönüş süresi farklı kavramlardır.
Güneş bize yaklaşık 150 milyon kilometre uzaklıktadır. Güneş ışığı Dünya'ya yaklaşık 8 dakika 20 saniyede ulaşır.
Proxima Centauri, Güneş'e yaklaşık 4,24 ışık yılı uzaklıktadır ve Alpha Centauri sistemiyle ilişkilidir.
Sirius, Büyük Köpek takımyıldızındadır. Burada yıldızın bize görünen parlaklığı karşılaştırılır, gerçek enerji üretimi değil.
Konya'nın yüzölçümü yaklaşık 41 bin kilometrekaredir; sıralama il sınırlarının kapladığı alana göre yapılır.
Yalova'nın yüzölçümü yaklaşık 850 kilometrekaredir. İlçe ya da merkez nüfusu bu karşılaştırmada kullanılmaz.
Doğu Anadolu yüksek platoları ve geniş dağlık alanlarıyla Türkiye'nin en geniş coğrafi bölgesidir.
Marmara yaklaşık 67 bin kilometrekarelik alanıyla yedi coğrafi bölgenin en küçüğüdür; nüfusu ve ekonomik ağırlığı ise yüksektir.
Büyük Ağrı zirvesi yaklaşık 5.137 metre yüksekliğindedir. Bu değer deniz seviyesine göre ölçülür.
Van Gölü yaklaşık 3.700 kilometrekarelik alana sahiptir ve suyu sodalıdır; göl seviyesiyle alanı değişebilir.
Kızılırmak yaklaşık 1.355 kilometre boyunca akar. Fırat daha uzundur fakat Türkiye dışına da çıkar.
Gökçeada, Çanakkale'ye bağlıdır ve yaklaşık 279 kilometrekarelik alana sahiptir.
Beyşehir Gölü, Konya ile Isparta arasında yer alır. Tuzlu ve sodalı göller tatlı su gölü sıralamasına dahil edilmez.
İnceburun, Sinop ilindedir. Türkiye'nin Karadeniz'e en çok uzanan kuzey kara noktasıdır.
Deri bütün vücudu örter; yetişkinlerde alanı yaklaşık 1,5–2 metrekare olabilir.
Karaciğer yetişkinlerde yaklaşık 1,5 kilogram ağırlığındadır. Deri dış organ sayıldığı için iç organ karşılaştırmasında yer almaz.
Uyluk kemiğinin bilimsel adı femurdur. Kalça ile diz arasında uzanır.
Üzengi kemiği orta kulaktadır ve yalnızca birkaç milimetre uzunluğundadır; ses titreşimlerinin iletilmesine katılır.
Aort kalbin sol karıncığından çıkar ve oksijenli kanın vücuda dağıtılmasını sağlar.
Siyatik sinir bel bölgesinden başlayıp kalçadan ve bacağın arkasından aşağı uzanır.
Diz, uyluk ve kaval kemiklerinin birleştiği, diz kapağının da katıldığı büyük bir eklemdir.
Hidrojenin atom numarası 1'dir; çekirdeğinde tek proton bulunur.
Elmasın Mohs sertliği 10'dur. Bu ölçek çizilmeye karşı dayanımı karşılaştırır, kırılmaya dayanımı değil.
Talkın Mohs sertliği 1'dir; tırnakla bile çizilebilecek kadar yumuşaktır.
Gümüş oda sıcaklığında saf metaller arasında elektriği en iyi iletir. Kablolarda daha çok bakır kullanılması maliyetle de ilgilidir.
Tungstenin erime noktası yaklaşık 3.422 santigrat derecedir; ısıya dayanıklı uygulamalarda kullanılır.
Osmiyumun oda sıcaklığındaki yoğunluğu yaklaşık 22,6 gram/santimetreküptür. İridyumun değeri de buna çok yakındır.
Ses çelikte yaklaşık saniyede 5.000 metre hızla ilerleyebilir. Hız; sıcaklık, bileşim ve dalga türüne göre değişir.
Kırmızı ışığın dalga boyu görünür tayfın uzun dalga ucundadır; yaklaşık 620–750 nanometre aralığı kullanılır.
Mor ışık görünür tayfın kısa dalga ucundadır; yaklaşık 380–450 nanometre aralığı kullanılır.
General Sherman, Kaliforniya'daki Sequoia Millî Parkı'nda bulunan bir dev sekoyadır. Rekoru boyuna değil gövde hacmine dayanır.
Sahil sekoyaları 100 metreyi aşabilir. Hacim rekorunu taşıyan dev sekoya ile aynı tür değildir.
Rafflesia arnoldii'nin tek çiçeği yaklaşık 1 metre çapa ulaşabilir. Çok sayıda küçük çiçekten oluşan çiçek kurulları ayrı değerlendirilir.
Seyşeller palmiyesi Lodoicea maldivica, coco de mer adıyla da tanınır. Çok iri çift loplu tohumlar üretir.
Sundarbans, Ganj-Brahmaputra-Meghna deltası çevresinde, Bangladeş ile Hindistan arasında uzanır.
Arabistan Yarımadası yaklaşık 3 milyon kilometrekareyi aşar; Asya'nın güneybatısında yer alır.
Kazakistan'ın Hazar Denizi'ne kıyısı vardır fakat açık denizlere çıkışı yoktur; Hazar kapalı bir su kütlesidir.
Ölü Deniz kıyıları deniz seviyesinin 400 metreden fazla altındadır. Su düzeyi değiştiği için kıyı yüksekliği de zamanla değişir.
Salar de Uyuni Bolivya'dadır ve yaklaşık 10.500 kilometrekarelik alan kaplar; kurumuş göllerden kalan bir tuz düzlüğüdür.
'''
