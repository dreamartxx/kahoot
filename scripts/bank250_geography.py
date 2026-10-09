from bank250_common import grouped

def expand_geography(questions,add):
    grouped(add,'cografya','{} hangi ülkede bulunur?', '''
Etna Yanardağı|İtalya
Vezüv Yanardağı|İtalya
Stromboli Yanardağı|İtalya
Fuji Dağı|Japonya
Aso Kalderası|Japonya
Krakatau Yanardağı|Endonezya
Tambora Yanardağı|Endonezya
Merapi Yanardağı|Endonezya
Mayon Yanardağı|Filipinler
Pinatubo Yanardağı|Filipinler
Taranaki Dağı|Yeni Zelanda
Ruapehu Yanardağı|Yeni Zelanda
Hekla Yanardağı|İzlanda
Eyjafjallajökull Yanardağı|İzlanda
Mauna Loa Yanardağı|ABD
Kīlauea Yanardağı|ABD
St. Helens Dağı|ABD
Popocatépetl Yanardağı|Meksika
Cotopaxi Yanardağı|Ekvador
Chimborazo Dağı|Ekvador
Arenal Yanardağı|Kosta Rika
Nyiragongo Yanardağı|Demokratik Kongo Cumhuriyeti
Erta Ale Yanardağı|Etiyopya
Ol Doinyo Lengai Yanardağı|Tanzanya
Table Mountain (Masa Dağı)|Güney Afrika
Uluru kaya kütlesi|Avustralya
Ayers Rock adıyla da bilinen Uluru'nun yakınındaki Kata Tjuta|Avustralya
Büyük Kanyon|ABD
Antelope Kanyonu|ABD
Bryce Kanyonu|ABD
Verdon Kanyonu|Fransa
Tara Kanyonu'nun büyük bölümü|Karadağ
Samaria Geçidi|Yunanistan
Colca Kanyonu|Peru
Fish River Kanyonu|Namibya
Jiuzhaigou vadisi|Çin
Zhangjiajie'nin kumtaşı sütunları|Çin
Ha Long Körfezi|Vietnam
Phong Nha mağaraları|Vietnam
Waitomo mağaraları|Yeni Zelanda
Postojna Mağarası|Slovenya
Škocjan Mağaraları|Slovenya
Mammoth Cave mağara sistemi|ABD
Plitvice Gölleri|Hırvatistan
Banff Millî Parkı'ndaki Louise Gölü|Kanada
Bled Gölü|Slovenya
Como Gölü|İtalya
Loch Ness|Birleşik Krallık
Balaton Gölü|Macaristan
Turkana Gölü'nün büyük bölümü|Kenya
''')
    grouped(add,'cografya','{} hangi coğrafi kavramın açıklamasıdır?', '''
Yer kabuğunu oluşturan büyük hareketli parçalar|Tektonik levhalar
İki levhanın birbirinden uzaklaştığı sınır|Iraksak levha sınırı
İki levhanın birbirine yaklaştığı sınır|Yakınsak levha sınırı
Levhaların birbirine paralel kaydığı sınır|Transform sınır
Bir levhanın diğerinin altına dalması|Dalma-batma
Okyanus tabanında levhaların ayrıldığı uzun yükselti|Okyanus ortası sırtı
Yerkabuğunun altında yer alan kalın katman|Manto
Dünya'nın sıvı haldeki demir ağırlıklı çekirdek katmanı|Dış çekirdek
Depremin yer altında başladığı nokta|Hiposantr
Deprem odağının yeryüzündeki izdüşümü|Episantr
Kayaçların birbirine göre yer değiştirdiği kırık|Fay
Volkanın zirvesindeki çukur|Krater
Volkanın çökmesiyle oluşan geniş çanak|Kaldera
Buharın basıncıyla aralıklı sıcak su fışkırtan kaynak|Gayzer
Sıcaklık ve basınç etkisiyle değişen kayaç türü|Başkalaşım kayaçları
Magma ya da lavın katılaşmasıyla oluşan kayaç türü|Magmatik kayaçlar
Tortulların birikip taşlaşmasıyla oluşan kayaç türü|Tortul kayaçlar
Granitin yüzeydeki iri yuvarlak bloklara ayrılması|Tor topografyası
Rüzgârın kaya yüzeyini kumlarla aşındırması|Korazyon
Rüzgârın gevşek malzemeyi uzaklaştırması|Deflasyon
Rüzgârla taşınmış ince toz birikimi|Lös
Akarsuyun yatağında çizdiği geniş kıvrım|Menderes
Menderesin kopmasıyla oluşan hilal göl|Kopuk menderes gölü
Akarsuyun topladığı suların yayıldığı alan|Drenaj havzası
Komşu akarsu havzalarını ayıran yüksek çizgi|Su bölümü çizgisi
Akarsuyun taşıdığı su hacminin zamana oranı|Debi
Akarsu yatağının zaman içinde aşağı doğru oyulması|Derine aşındırma
Buzulun dağ yamacında oyduğu çanak|Sirk
Bir buzulun bıraktığı uzun oval tortul tepe|Drumlin
Buzul altında akan suyun oluşturduğu kıvrımlı tortul sırt|Esker
Buzul vadisinin denizle dolması|Fiyort oluşumu
Kalkerli arazide oluşan küçük kapalı çukur|Dolin
Karstik çukurların birleştiği daha büyük çanak|Uvala
Karstik alanlardaki geniş düz tabanlı kapalı ova|Polye
Yeraltı boşluğu tavanının çökmesiyle oluşan derin çukur|Obruk
Kalker yüzeyindeki çözünme olukları|Lapya
Kumlu kıyıda dalgaların oluşturduğu ince çıkıntı|Kıyı oku
Bir akarsu vadisinin deniz sularıyla dolduğu kıyı|Ria kıyı
Mercanların halka biçiminde çevrelediği lagünlü ada|Atol
Rüzgârın sürekli estiği yön|Hâkim rüzgâr yönü
Hava kütlesinin sıcaklık farkıyla dikey yükselmesi|Konveksiyon
Bir hava kütlesinin dağ boyunca yükselmesiyle oluşan yağış|Orografik yağış
Sıcak ve soğuk hava kütlelerinin karşılaştığı sınır|Cephe
Yükseğe çıkıldıkça sıcaklığın arttığı sıra dışı durum|Sıcaklık terselmesi
Atmosferin hava olaylarının çoğunun yaşandığı alt katmanı|Troposfer
Ozon tabakasının yoğunlaştığı atmosfer katmanı|Stratosfer
Belirli sıcaklıkta havanın taşıyabileceği su buharına göre doluluk oranı|Bağıl nem
Havanın doygunluğa ulaştığı sıcaklık|Çiy noktası
Bölgenin uzun yıllar boyunca gözlenen ortalama hava özellikleri|İklim
Dar bir alanın çevresinden farklı iklim koşulları|Mikroklima
''')
    grouped(add,'cografya','{} kentinden geçen akarsu hangisidir?', '''
Paris|Sen
Londra|Thames
Roma|Tiber
Floransa|Arno
Verona|Adige
Prag|Vltava
Varşova|Vistül
Kraków|Vistül
Budapeşte|Tuna
Viyana|Tuna
Bratislava|Tuna
Belgrad|Tuna
Lizbon|Tejo
Porto|Douro
Sevilla|Guadalquivir
Zaragoza|Ebro
Lyon|Rhône
Toulouse|Garonne
Bordeaux|Garonne
Nantes|Loire
Köln|Ren
Dresden|Elbe
Hamburg|Elbe
Frankfurt am Main|Main
Bremen|Weser
Münih|Isar
Berlin|Spree
Dublin|Liffey
Glasgow|Clyde
Kiev|Dinyeper
Riga|Daugava
Kaunas|Nemunas
Tiflis|Kura
Bağdat|Dicle
Musul|Dicle
Kahire|Nil
Hartum|Nil
Niamey|Nijer
Bamako|Nijer
Kinşasa|Kongo
Brazzaville|Kongo
Bangkok|Chao Phraya
Phnom Penh|Mekong
Vientiane|Mekong
Şanghay|Huangpu
Nankin|Yangtze
Seul|Han
Delhi|Yamuna
Varanasi|Ganj
Montreal|St. Lawrence
''')
