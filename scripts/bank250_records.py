from bank250_common import rows

def expand_records(questions,add):
    peaks=rows('''
Almanya|Zugspitze|2962
Avusturya|Grossglockner|3798
İsviçre|Dufourspitze|4634
İspanya (Kanarya Adaları dâhil)|Teide|3715
Portekiz (Azorlar dâhil)|Pico|2351
Yunanistan|Olimpos'un Mytikas zirvesi|2918
Bulgaristan|Musala|2925
Romanya|Moldoveanu|2544
Polonya|Rysy'nin kuzeybatı zirvesi|2499
Çekya|Sněžka|1603
Slovakya|Gerlachovský štít|2655
Slovenya|Triglav|2864
Hırvatistan|Dinara|1831
Bosna-Hersek|Maglić|2386
Arnavutluk|Korab|2764
Kuzey Makedonya|Korab|2764
Norveç|Galdhøpiggen|2469
İsveç|Kebnekaise'nin kuzey zirvesi|2097
İzlanda|Hvannadalshnúkur|2110
Birleşik Krallık|Ben Nevis|1345
İrlanda|Carrauntoohil|1039
Macaristan|Kékes|1014
Ukrayna|Hoverla|2061
Gürcistan|Şhara|5193
Ermenistan|Aragats|4090
Azerbaycan|Bazardüzü|4466
İran|Demavend|5610
Belarus|Dzyarzhynskaya Tepesi|345
Lübnan|Kurnet es-Sevda|3088
Japonya|Fuji|3776
Güney Kore|Hallasan|1947
Malezya|Kinabalu|4095
Filipinler|Apo|2954
Tayland|Doi Inthanon|2565
Vietnam|Fansipan|3143
Sri Lanka|Pidurutalagala|2524
Pakistan|K2|8611
Afganistan|Noşak|7492
Tacikistan|İsmail Somoni Zirvesi|7495
Kırgızistan|Cengiş Çokusu|7439
Moğolistan|Hüiten Zirvesi|4374
Fas|Toubkal|4167
Cezayir|Tahat|2908
Etiyopya|Ras Daşen|4550
Güney Afrika|Mafadi|3450
Kanada|Logan|5959
Meksika|Pico de Orizaba|5636
Brezilya|Pico da Neblina|2995
Peru|Huascarán|6768
Yeni Zelanda|Aoraki / Cook Dağı|3724
''')
    for country,peak,height in peaks:
        add('enler',f'{country} sınırları içindeki en yüksek zirve hangisidir?',peak,[r[1] for r in peaks],f'{peak}, {country} için deniz seviyesinden yüksekliğe göre en üst noktadır. Zirvenin yüksekliği yaklaşık {height} metredir; ölçüm ve yuvarlama yöntemine göre küçük farklar görülebilir.')
    islands=rows('''
Azor Adaları|São Miguel|Portekiz’e bağlı bu takımadada São Miguel, Terceira ve Pico’dan daha geniş bir yüzölçümüne sahiptir.
Kanarya Adaları|Tenerife|İspanya’ya bağlı takımadada Tenerife yüzölçümü bakımından Fuerteventura ve Gran Canaria’nın önündedir.
Balear Adaları|Mallorca|İspanya’ya bağlı Balear grubunda Mallorca; Menorca, İbiza ve Formentera’dan daha geniştir.
Kiklad Adaları|Naksos|Ege Denizi’ndeki Kiklad grubunda Naksos, Andros ve Paros’un önünde yüzölçümü bakımından ilk sıradadır.
On İki Ada grubu|Rodos|Ege’nin güneydoğusundaki bu ada grubunda Rodos yüzölçümü bakımından Kos ve Kerpe’den büyüktür.
İyon Adaları|Kefalonya|Yunanistan’ın batı kıyısındaki İyon Adaları içinde Kefalonya, Korfu ve Zakintos’tan daha geniştir.
Svalbard takımadası|Spitsbergen|Norveç yönetimindeki Svalbard’ın en büyük adası Spitsbergen’dir; grubun ana yerleşimleri burada bulunur.
Faroe Adaları|Streymoy|Kuzey Atlas Okyanusu’ndaki Faroe grubunda Streymoy en geniş adadır; başkent Tórshavn da bu adadadır.
Orkney Adaları|Mainland (Orkney)|İskoçya’nın kuzeyindeki Orkney grubunda Mainland, Hoy ve diğer adalardan daha geniş alan kaplar.
Shetland Adaları|Mainland (Shetland)|İskoçya’ya bağlı Shetland grubunun en büyük adası Mainland’dir; Lerwick yerleşimi burada bulunur.
İç Hebridler|Skye|İskoçya’nın batısındaki İç Hebridler grubunda Skye, Mull ve Islay’dan daha geniş yüzölçümüne sahiptir.
Dış Hebridler|Lewis ve Harris|Lewis ve Harris iki bölge adı olmasına rağmen tek kara parçasıdır ve Dış Hebridler’in en büyük adasını oluşturur.
Galápagos Adaları|Isabela|Ekvador’a bağlı Galápagos grubunda Isabela, takımadanın toplam kara alanının yarısından fazlasını kaplar.
Hawaii takımadası|Hawaii (Büyük Ada)|Büyük Ada adıyla da bilinen Hawaii, takımadadaki diğer adaların her birinden daha geniş yüzölçümüne sahiptir.
Society Adaları|Tahiti|Fransız Polinezyası’ndaki Society grubunda Tahiti en büyük adadır; Papeete bu adada yer alır.
Markiz Adaları|Nuku Hiva|Fransız Polinezyası’nın Markiz grubunda Nuku Hiva yüzölçümü bakımından Hiva Oa’nın önündedir.
Cook Adaları|Rarotonga|Güney Pasifik’teki Cook Adaları içinde Rarotonga en geniş kara alanına sahip tek adadır; Avarua buradadır.
Samoa bağımsız devleti|Savai'i|Samoa devletindeki Savai'i, Upolu’dan daha geniştir; buna karşılık başkent Apia Upolu üzerindedir.
Tonga Krallığı|Tongatapu|Tonga’nın en büyük adası Tongatapu’dur. Başkent Nukuʻalofa da bu alçak mercan adasında bulunur.
Fiji|Viti Levu|Fiji’nin yüzölçümü en büyük adası Viti Levu’dur. Vanua Levu ikinci sıradadır ve Suva Viti Levu üzerindedir.
Vanuatu|Espiritu Santo|Vanuatu takımadasında Espiritu Santo, Malakula ve başkentin bulunduğu Efate’den daha geniştir.
Solomon Adaları devleti|Guadalcanal|Solomon Adaları devletinin en büyük adası Guadalcanal’dır; Bougainville başka bir devletin sınırlarındadır.
Bismarck Takımadaları|Yeni Britanya|Papua Yeni Gine’ye bağlı Bismarck grubunun en büyük adası Yeni Britanya’dır; Yeni İrlanda daha küçüktür.
Filipinler|Luzon|Filipinler’in yüzölçümü en büyük adası Luzon’dur. Başkent Manila burada bulunur; Mindanao ikinci sıradadır.
Güney Kore|Jeju|Kore Yarımadası’nın güneyindeki Jeju, Güney Kore’nin yüzölçümü en büyük adasıdır ve Hallasan volkanını barındırır.
Mauritius Cumhuriyeti|Mauritius Adası|Mauritius Cumhuriyeti'nin en büyük adası Mauritius'tur. Rodrigues ve ülkeye bağlı diğer adalar daha küçük kara alanlarına sahiptir.
Seyşeller|Mahé|Seyşeller’in en büyük adası Mahé’dir. Başkent Victoria burada bulunur; Praslin ve La Digue daha küçüktür.
Komorlar Birliği|Grande Comore|Komorlar Birliği’nin en büyük adası Grande Comore, Ngazidja adıyla da bilinir; Moroni bu adada bulunur.
Maskaren Adaları|Réunion|Hint Okyanusu’ndaki Maskaren grubunda Réunion, Mauritius ve Rodrigues’ten daha geniş yüzölçümüne sahiptir.
Yeşil Burun (Cabo Verde)|Santiago|Cabo Verde’nin en büyük adası Santiago’dur. Başkent Praia burada bulunur; Santo Antão ikinci sıradadır.
São Tomé ve Príncipe|São Tomé|Gine Körfezi’ndeki devletin iki ana adasından São Tomé, Príncipe’den çok daha geniş bir kara alanına sahiptir.
Bahamalar|Andros|Bahamalar’da Andros, tek ada grubu olarak en geniş kara alanını oluşturur; Nassau’nun bulunduğu New Providence daha küçüktür.
Cayman Adaları|Grand Cayman|Karayipler’deki Cayman grubunda Grand Cayman en geniş adadır; Cayman Brac ve Little Cayman daha küçüktür.
Britanya Virjin Adaları|Tortola|Tortola, Britanya Virjin Adaları’nın yüzölçümü en büyük adasıdır. Yönetim merkezi Road Town da buradadır.
ABD Virjin Adaları|Saint Croix|ABD Virjin Adaları arasında Saint Croix, Saint Thomas ve Saint John’dan daha geniş yüzölçümüne sahiptir.
Antigua ve Barbuda|Antigua|Karayipler’deki devletin iki ana adasından Antigua, Barbuda’dan daha geniştir; başkent St. John's buradadır.
Trinidad ve Tobago|Trinidad|Güney Karayipler’deki devletin adalarından Trinidad, Tobago’dan çok daha büyüktür; başkent Port of Spain buradadır.
Saint Kitts ve Nevis|Saint Kitts|İki adadan oluşan devletin daha büyük adası Saint Kitts’tir; başkent Basseterre de burada bulunur.
Estonya|Saaremaa|Baltık Denizi’ndeki Saaremaa, Estonya’nın en büyük adasıdır; Hiiumaa yüzölçümü bakımından ikinci sıradadır.
İsveç|Gotland|Baltık Denizi’ndeki Gotland, İsveç’in yüzölçümü en büyük adasıdır. Öland daha küçüktür; Visby Gotland üzerindedir.
Danimarka (Grönland ve Faroe hariç)|Sjælland|Danimarka’nın asıl ülke sınırları içinde en büyük ada Sjælland’dır; Kopenhag’ın büyük kısmı bu adadadır.
Yeni Zelanda'nın ana adaları|Güney Adası|Yeni Zelanda’nın iki ana adasından Güney Adası daha geniştir; Kuzey Adası ise daha fazla nüfusa sahiptir.
Avustralya'ya bağlı adalar (ana kara hariç)|Tasmanya|Avustralya ana karası ada sıralamasına katılmadığında ülkenin en büyük adası Tasmanya’dır; Hobart bu adadadır.
Kanada Arktik Takımadaları|Baffin Adası|Baffin Adası, Kanada Arktik Takımadaları’nın ve Kanada’nın yüzölçümü en büyük adasıdır; Victoria Adası daha küçüktür.
ABD'nin Alaska eyaleti|Kodiak|Alaska sınırları içinde Kodiak en büyük adadır. Hawaii farklı bir eyalette olduğu için bu karşılaştırmaya katılmaz.
Aleut Adaları|Unimak|Alaska açıklarındaki Aleut zincirinin en büyük adası Unimak’tır. Unalaska ve Unimak farklı adalardır; en geniş olan Unimak’tır.
Kuril Adaları|Iturup|Kuzeybatı Pasifik’teki Kuril zincirinin yüzölçümü en büyük adası Iturup’tur; Japoncada Etorofu adıyla da anılır.
Rusya|Sahalin|Rusya’nın tek ada olarak en büyük adası Sahalin’dir; Novaya Zemlya birden fazla ana adadan oluşan takımadadır.
Çin'in Hainan eyaleti|Hainan Adası|Hainan eyaletinin ana kara parçası olan Hainan Adası, eyaletin diğer küçük adalarından çok daha geniştir.
Hong Kong|Lantau|Hong Kong’un en büyük adası Lantau’dur; Hong Kong Adası daha küçüktür. Uluslararası havalimanı Lantau yakınındadır.
''')
    for group,island,note in islands:
        add('enler',f'{group} içinde yüzölçümü en büyük ada hangisidir?',island,[r[1] for r in islands],note)
    data=rows('''
Yaşayan köpek balıkları içinde en büyük yırtıcı tür hangisidir?|Büyük beyaz köpek balığı|Balina köpek balığı~Büyük camgöz~Hemşire köpek balığı|Büyük beyaz, aktif olarak büyük avları yakalayan köpek balıkları içinde en büyük türdür. Daha büyük olan balina köpek balığı ve büyük camgöz süzerek beslenir.
Yaşayan kedigillerin en iri türü hangisidir?|Kaplan|Aslan~Leopar~Jaguar|Kaplanlar, özellikle iri erkek bireyler dikkate alındığında yaşayan kedigillerin en büyük türüdür. Bireylerin ölçüleri alt türe ve beslenmeye göre değişir.
Amerika kıtalarında yaşayan en iri kedigil hangisidir?|Jaguar|Puma~Vaşak~Oselo|Jaguar, Amerika'nın en iri kedigilidir. Puma daha geniş yayılış gösterebilir; ancak bu sorudaki ölçüt yayılış değil vücut büyüklüğüdür.
Yaşayan kuşlar içinde en küçük tür hangisidir?|Arı sinek kuşu|Ev serçesi~Çalıkuşu~Saka|Küba'ya özgü arı sinek kuşu, yaklaşık birkaç gramlık vücuduyla yaşayan kuşların en küçüğüdür. Küçük boyutuyla nektarla beslenmeye uyumludur.
Yaşayan penguenler içinde en küçük tür hangisidir?|Küçük mavi penguen|Adelie pengueni~Gentoo pengueni~Kral penguen|Küçük mavi penguen, Avustralya ve Yeni Zelanda kıyılarında görülür. Yaklaşık otuz santimetrelik boyuyla penguenler arasındaki en küçük türdür.
Yaşayan ayılar içinde karadaki en büyük etçil olarak öne çıkan tür hangisidir?|Kutup ayısı|Güneş ayısı~Tembel ayı~Amerikan kara ayısı|Kutup ayısının iri erkekleri karada yaşayan en büyük etçiller arasındadır. Kodiak boz ayıları da benzer büyüklüklere ulaşabildiğinden şıklarda yer almamıştır.
Yaşayan ayı türleri arasında en küçük olan hangisidir?|Güneş ayısı|Kutup ayısı~Boz ayı~Amerikan kara ayısı|Güneydoğu Asya'da yaşayan güneş ayısı, diğer yaşayan ayı türlerinden daha küçüktür. Göğsündeki açık renkli hilal benzeri iz karakteristiktir.
Yaşayan köpekgiller arasında en iri tür hangisidir?|Gri kurt|Çakal~Kızıl tilki~Afrika yaban köpeği|Gri kurt, özellikle kuzeydeki iri popülasyonlarıyla yaşayan köpekgillerin en büyük türüdür. Evcil köpek ırkları bu yabani tür karşılaştırmasına katılmaz.
Yaşayan kemirgenlerin en irisi hangisidir?|Kapibara|Kunduz~Oklu kirpi~Marmot|Güney Amerika'daki kapibara, yaşayan kemirgenlerin en büyüğüdür. Yarı sucul yaşamıyla bilinir ve onlarca kilogramlık kütleye ulaşabilir.
Yaşayan keselilerin en iri türü hangisidir?|Kızıl kanguru|Koala~Vombat~Tasmanya canavarı|Kızıl kangurunun erkekleri, yaşayan keseliler arasında en büyük gövde ölçülerine ulaşır. Avustralya'nın kurak ve yarı kurak bölgelerine uyumludur.
Yaşayan fokgiller içinde en iri tür hangisidir?|Güney deniz fili|Liman foku~Grönland foku~Halkalı fok|Güney deniz filinin erkekleri birkaç ton ağırlığa ulaşabilir. Burada fokgiller karşılaştırılır; balinalar ve yunuslar bu gruba girmez.
Yaşayan yunusgillerin en iri üyesi hangisidir?|Orka|Şişe burunlu yunus~Tırtak~Çizgili yunus|Katil balina adıyla da bilinen orka, bilimsel sınıflamada yunusgiller ailesindedir. Bu ailenin diğer üyelerinden belirgin biçimde daha iridir.
Dünyanın en uzun göç rotalarından birini her yıl iki kutup çevresi arasında izleyen kuş hangisidir?|Kutup sumrusu|Ev serçesi~Tavus kuşu~Keklik|Kutup sumrusu, Arktik üreme alanları ile Antarktika çevresi arasında göç eder. İzlenen dolambaçlı rotalar yıllık on binlerce kilometreye ulaşabilir.
Yaşayan kaplumbağalar arasında karada yaşayan en iri tür grubu hangisidir?|Galápagos dev kaplumbağaları|Hermann kaplumbağası~Mahmuzlu kaplumbağa~Kırmızı yanaklı su kaplumbağası|Galápagos dev kaplumbağaları yaşayan en iri kara kaplumbağalarıdır. Deniz kaplumbağaları bu soruda karada yaşayan gruba dâhil edilmez.
Yaşayan kertenkeleler arasında kütlesiyle en iri zehirli tür hangisidir?|Komodo ejderi|Gila canavarı~Boncuklu kertenkele~Sakallı ejder|Komodo ejderi hem iri gövdesi hem de zehir bezleriyle tanınır. Sorudaki zehirli tür koşulu Gila canavarı gibi diğer türlerle karşılaştırma yapar.
Balıklar içinde bilinen en uzun yaşayan omurgalılardan biri hangisidir?|Grönland köpek balığı|Palyaço balığı~Lepistes~Japon balığı|Grönland köpek balıklarının yaşları göz merceği analiziyle yüzyıllar ölçeğinde tahmin edilir. Yaş değerleri belirsizlik aralığıyla raporlanır.
Aşağıdaki fil türlerinden hangisi ortalama gövde büyüklüğü bakımından daha iridir?|Afrika savan fili|Afrika orman fili~Asya fili~Borneo fili|Afrika savan fili, ortalama boy ve kütle bakımından diğer yaşayan fil gruplarından büyüktür. Borneo filleri Asya fili kapsamında değerlendirilir.
Bu Afrika büyük otçullarından hangisi ortalama kütle bakımından daha iridir?|Beyaz gergedan|Zebra~Zürafa~Afrika mandası|Beyaz gergedanın iri yetişkinleri genellikle iki ton civarına veya üzerine çıkabilir. Diğer seçeneklerin tipik yetişkin kütleleri daha düşüktür.
Bu kuşlardan hangisi karada koşarken en yüksek hıza ulaşabilir?|Devekuşu|Kivi~Tavuk~Hindi|Devekuşu uçamaz fakat uzun bacaklarıyla çok hızlı koşar. Saatte yaklaşık yetmiş kilometreye ulaşan kısa süreli hızlarıyla tanınır.
Yaşayan papağanlar arasında kütlesi en yüksek tür hangisidir?|Kakapo|Muhabbet kuşu~Sultan papağanı~Cennet papağanı|Yeni Zelanda'nın uçamayan kakaposu, yaşayan papağanların en ağırıdır. Sümbül ara papağanı daha uzun olabilse de ölçüt burada kütledir.
Bir atomda kütlesi en küçük temel parçacık, bu seçenekler arasında hangisidir?|Elektron|Proton~Nötron~Alfa parçacığı|Elektronun kütlesi protonun yaklaşık binde biri mertebesindedir. Alfa parçacığı ise iki proton ile iki nötrondan oluşan bir çekirdektir.
Periyodik tablodaki en hafif metal hangisidir?|Lityum|Demir~Bakır~Alüminyum|Lityum, hem atom kütlesi hem de oda sıcaklığındaki yoğunluğu bakımından metaller arasında en hafif olanıdır; yoğunluğu sudan düşüktür.
Elementler arasında normal basınçta kaynama noktası en düşük olan hangisidir?|Helyum|Azot~Oksijen~Hidrojen|Helyum yaklaşık eksi iki yüz altmış dokuz santigrat derecede kaynar. Bu sıcaklık mutlak sıfıra çok yakındır ve diğer elementlerden düşüktür.
Halojenler arasında elektronegatifliği en yüksek element hangisidir?|Flor|Klor~Brom~İyot|Flor yalnızca halojenler arasında değil, Pauling ölçeğinde tüm elementler arasında en yüksek elektronegatifliğe sahiptir.
Elektromanyetik tayfta bu ışınımlardan hangisinin foton enerjisi en yüksektir?|Gama ışını|Radyo dalgası~Kızılötesi~Görünür ışık|Foton enerjisi frekansla artar. Gama ışınları bu seçenekler arasında en yüksek frekanslı, en kısa dalga boylu bölgede yer alır.
Elektromanyetik tayfta bu dalgaların hangisinin dalga boyu en uzundur?|Radyo dalgası|Morötesi~X ışını~Görünür ışık|Radyo dalgaları elektromanyetik tayfın uzun dalga boylu ucundadır. Görünür, morötesi ve X ışınlarının dalga boyları çok daha kısadır.
Dünya atmosferinde hacimce en çok bulunan gaz hangisidir?|Azot|Oksijen~Argon~Karbondioksit|Kuru atmosferin yaklaşık yüzde yetmiş sekizi azottur. Oksijen yaklaşık yüzde yirmi bir oranıyla ikinci sırada yer alır.
Yer kabuğunda kütlece en çok bulunan element hangisidir?|Oksijen|Silisyum~Demir~Alüminyum|Yer kabuğunun yaklaşık yarısını kütlece oksijen oluşturur. Bu oksijen büyük ölçüde silikat ve oksit minerallerinin yapısına bağlıdır.
Yer kabuğunda kütlece en çok bulunan metal hangisidir?|Alüminyum|Demir~Bakır~Altın|Alüminyum yer kabuğunda en bol bulunan metaldir. Oksijen ve silisyum toplam bollukta daha üsttedir, ancak metal değildir.
Güneş'in kütlesinde en büyük payı hangi element taşır?|Hidrojen|Helyum~Karbon~Demir|Güneş'in kütlesinin büyük kısmı hidrojendir; helyum ikinci sıradadır. Çekirdekte hidrojenin helyuma dönüşmesi enerji açığa çıkarır.
İnsan vücudunda kütlece en fazla bulunan element hangisidir?|Oksijen|Karbon~Hidrojen~Kalsiyum|Vücudun su ve organik molekülleri nedeniyle kütlece en büyük pay oksijene aittir. Atom sayısı bakımından yapılan sıralama farklı olabilir.
Bu bulut türlerinden hangisi genellikle en büyük dikey gelişimi gösterir?|Kümülonimbus|Sirüs~Stratus~Sirrostratus|Kümülonimbus güçlü yükselici hava hareketleriyle kilometrelerce dikey gelişebilir. Gök gürültülü sağanaklarla ilişkilidir.
Bu yağış türlerinden hangisi buz tabakaları hâlinde büyüyen en iri taneleri oluşturabilir?|Dolu|Çisenti~Kırağı~Sis|Dolu taneleri fırtına bulutlarının içinde tekrarlanan donma süreçleriyle büyür. Çisenti çok küçük sıvı damlalardan, sis ise asılı damlacıklardan oluşur.
Katı gezegenlerde yüzey, gaz devlerinde bulut tepesi esas alındığında hangisinin yerçekimi daha büyüktür?|Jüpiter|Dünya~Mars~Merkür|Jüpiter'in bulut tepeleri düzeyindeki yerçekimi Dünya'nın yaklaşık iki buçuk katıdır. Gaz devi olduğu için katı yüzey karşılaştırması yapılmaz.
Bu doğal uydulardan hangisi çap bakımından daha büyüktür?|Titan|Ay~Europa~Triton|Satürn'ün uydusu Titan, bu seçeneklerin en büyüğüdür. Güneş Sistemi'nin tamamında ise Ganymede'den sonra ikinci sıradadır.
Bu cüce gezegenlerden hangisi kütle bakımından daha büyüktür?|Eris|Plüton~Ceres~Haumea|Eris'in ölçülen kütlesi Plüton'unkinden daha büyüktür. Plüton çap bakımından biraz daha büyük olduğundan ölçütün kütle olduğu önemlidir.
Asteroit kuşağındaki en büyük cisim hangisidir?|Ceres|Vesta~Pallas~Hygiea|Ceres, Mars ile Jüpiter arasındaki ana asteroit kuşağının en büyük cismidir. Yaklaşık küresel şekli nedeniyle cüce gezegen olarak sınıflandırılır.
Asteroit kuşağının Ceres'ten sonraki en büyük kütleli cismi hangisidir?|Vesta|Pallas~Hygiea~Eros|Vesta, ana kuşakta Ceres'ten sonra kütle bakımından ikinci sıradadır. Boyut, şekil ve kütle farklı ölçütler olduğundan soru kütleyi belirtir.
Güneş Sistemi'ndeki en büyük volkan olarak bilinen dağ hangisidir?|Olympus Mons|Etna~Fuji~Vezüv|Mars'taki Olympus Mons, tabanından itibaren çok büyük yüksekliğe ve yüzlerce kilometrelik genişliğe ulaşan bir kalkan volkanıdır.
Bu Ay evrelerinden hangisinde Dünya'dan görülen aydınlık alan en büyüktür?|Dolunay|Yeni ay~İlk dördün~Son dördün|Dolunayda Ay'ın Dünya'ya bakan yüzünün hemen hemen tamamı aydınlıktır. Bu ifade Ay'ın fiziksel büyüklüğünün değiştiği anlamına gelmez.
2024 Paris Oyunları sonuna kadar en çok olimpiyat altını kazanan sporcu kimdir?|Michael Phelps|Usain Bolt~Carl Lewis~Mark Spitz|Michael Phelps yirmi üç olimpiyat altını kazanmıştır. Soru, değişebilecek spor rekorunu Paris 2024 sonundaki kayıtlarla sınırlar.
2024 sonuna kadar erkekler futbol Dünya Kupası'nı en çok kazanan ülke hangisidir?|Brezilya|Almanya~İtalya~Arjantin|Brezilya, 1958, 1962, 1970, 1994 ve 2002 şampiyonluklarıyla beş kez kazanmıştır. Karşılaştırmanın son tarihi 2024 olarak sabitlenmiştir.
2024 sonuna kadar erkekler Dünya Kupası finallerinde en çok gol atan oyuncu kimdir?|Miroslav Klose|Ronaldo Nazário~Gerd Müller~Lionel Messi|Miroslav Klose, Dünya Kupası finallerinde toplam on altı gole ulaşmıştır. Soru eleme karşılaşmalarını değil final turnuvalarını kapsar.
2024 sonuna kadar erkekler teklerde Roland-Garros'yu en çok kazanan tenisçi kimdir?|Rafael Nadal|Roger Federer~Novak Djokovic~Björn Borg|Rafael Nadal, Roland-Garros erkekler teklerde on dört şampiyonluk kazanmıştır. Burada tüm Grand Slam turnuvaları değil bu turnuva sorulur.
2024 sonuna kadar Formula 1'de en çok yarış galibiyeti bulunan pilot kimdir?|Lewis Hamilton|Michael Schumacher~Max Verstappen~Sebastian Vettel|Lewis Hamilton, 2024 sonu itibarıyla Formula 1 yarış galibiyetleri sıralamasında ilk sıradadır. Soru dünya şampiyonluğu sayısını sormaz.
2024 sonuna kadar erkekler Ballon d'Or ödülünü en çok kazanan futbolcu kimdir?|Lionel Messi|Cristiano Ronaldo~Johan Cruyff~Michel Platini|Lionel Messi 2023'te sekizinci Ballon d'Or ödülünü kazanmıştır. Karşılaştırma 2024 sonuna kadar verilmiş erkekler ödüllerini kapsar.
2024 sonuna kadar erkekler yüz metre dünya rekorunu taşıyan atlet kimdir?|Usain Bolt|Tyson Gay~Yohan Blake~Justin Gatlin|Usain Bolt, 2009 Berlin Dünya Şampiyonası'nda yüz metreyi 9,58 saniyede koşmuştur. Bu soru rekoru 2024 sonundaki duruma göre sorar.
2024 sonuna kadar erkekler sırıkla atlamada en yüksek dünya rekorunu taşıyan atlet kimdir?|Armand Duplantis|Sergey Bubka~Renaud Lavillenie~Thiago Braz|Armand Duplantis 2024'te dünya rekorunu birden fazla kez geliştirmiştir. Soru güncel yüksekliği değil belirtilen tarihteki rekor sahibini sorar.
2024 sonuna kadar erkekler uzun atlama dünya rekorunu taşıyan atlet kimdir?|Mike Powell|Carl Lewis~Bob Beamon~Jesse Owens|Mike Powell 1991 Tokyo Dünya Şampiyonası'nda 8,95 metreye ulaşmıştır. Bu derece 2024 sonuna kadar erkekler açık hava dünya rekorudur.
2024 sonuna kadar erkekler üç adım atlama dünya rekorunu taşıyan atlet kimdir?|Jonathan Edwards|Christian Taylor~Kenny Harrison~Pedro Pichardo|Jonathan Edwards 1995 Göteborg Dünya Şampiyonası'nda 18,29 metre atlamıştır. Soru 2024 sonuna kadar geçerli erkekler açık hava rekorunu esas alır.
''')
    for text,answer,wrong,note in data:
        add('enler',text,answer,[answer]+wrong.split('~'),note)
