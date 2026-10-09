from bank250_common import grouped

def expand_turkey(questions,add):
    grouped(add,'turkiye','{} ilçesi hangi ilimizin sınırları içindedir?','''
Şile|İstanbul
Polatlı|Ankara
Seferihisar|İzmir
Mudanya|Bursa
Kaş|Antalya
Kozan|Adana
Akşehir|Konya
Nizip|Gaziantep
Halfeti|Şanlıurfa
Silifke|Mersin
Kandıra|Kocaeli
Ergani|Diyarbakır
Samandağ|Hatay
Salihli|Manisa
Talas|Kayseri
Vezirköprü|Samsun
Edremit (Ege kıyısındaki)|Balıkesir
Elbistan|Kahramanmaraş
Didim|Aydın
Şarköy|Tekirdağ
Tirebolu|Giresun
Ardeşen|Rize
Ünye|Ordu
Gerze|Sinop
Cide|Kastamonu
Eskipazar|Karabük
Amasra|Bartın
Ereğli (Karadeniz kıyısındaki)|Zonguldak
Gölyaka|Düzce
Mudurnu|Bolu
İskilip|Çorum
Merzifon|Amasya
Niksar|Tokat
Divriği|Sivas
Gemerek|Sivas
Şebinkarahisar|Giresun
Tortum|Erzurum
Kemaliye|Erzincan
Ahlat|Bitlis
Gevaş|Van
Erciş|Van
Doğubayazıt|Ağrı
Sarıkamış|Kars
Arhavi|Artvin
Köyceğiz|Muğla
Ula|Muğla
Gelibolu|Çanakkale
İpsala|Edirne
Vize|Kırklareli
Karasu|Sakarya
''')
    grouped(add,'meshur','{} ile tanınan gezi noktamız hangi ilimizdedir?','''
Varda Köprüsü|Adana
Taşköprü'nün Seyhan üzerindeki tarihî kemerleri|Adana
Anavarza Antik Kenti|Adana
Karakuş Tümülüsü|Adıyaman
Cendere Köprüsü|Adıyaman
Perre Antik Kenti|Adıyaman
Frig kaya anıtlarıyla Aslantaş|Afyonkarahisar
Emre Gölü çevresindeki peri bacaları|Afyonkarahisar
İshak Paşa Sarayı|Ağrı
Diyadin'in jeotermal kaplıcaları|Ağrı
Harşena Dağı'ndaki kral kaya mezarları|Amasya
Borabay Gölü|Amasya
Anadolu Medeniyetleri Müzesi|Ankara
Augustus Tapınağı|Ankara
Karain Mağarası|Antalya
Düden Şelaleleri|Antalya
Aspendos Antik Tiyatrosu|Antalya
Manavgat Şelalesi|Antalya
Karagöl-Sahara Millî Parkı|Artvin
Mençuna Şelalesi|Artvin
Karacasu'daki Aphrodisias Antik Kenti|Aydın
Priene Antik Kenti|Aydın
Dilek Yarımadası-Büyük Menderes Deltası Millî Parkı|Aydın
Cunda Adası'nın taş sokakları|Balıkesir
Manyas Kuş Cenneti|Balıkesir
Şeyh Edebali Türbesi|Bilecik
Söğüt'teki Ertuğrul Gazi Türbesi|Bilecik
Çır Şelalesi|Bingöl
Karlıova'nın Bingöl Dağları'na bakan yaylaları|Bingöl
Ahlat Selçuklu Mezarlığı|Bitlis
Nemrut Krater Gölü|Bitlis
Abant Gölü|Bolu
Gölcük Tabiat Parkı|Bolu
Sagalassos Antik Kenti|Burdur
İnsuyu Mağarası|Burdur
Salda Gölü|Burdur
Cumalıkızık köyü|Bursa
Yeşil Türbe|Bursa
Gölyazı'nın Uluabat kıyısındaki yerleşimi|Bursa
Assos Antik Kenti|Çanakkale
Alexandria Troas Antik Kenti|Çanakkale
Bozcaada Kalesi|Çanakkale
Ilgaz Dağı'nın güney eteklerindeki Yıldıztepe|Çankırı
Ilgaz ilçesindeki Salman Höyük|Çankırı
Hattuşa'nın Aslanlı Kapısı|Çorum
Alacahöyük Sfenksli Kapı|Çorum
Laodikeia Antik Kenti|Denizli
Kaklık Mağarası|Denizli
Hevsel Bahçeleri|Diyarbakır
Malabadi Köprüsü|Diyarbakır
On Gözlü Köprü|Diyarbakır
Meriç Köprüsü|Edirne
II. Bayezid Külliyesi Sağlık Müzesi|Edirne
Harput Kalesi|Elazığ
Hazar Gölü|Elazığ
Girlevik Şelalesi|Erzincan
Kemaliye Karanlık Kanyon|Erzincan
Çifte Minareli Medrese (Yakutiye)|Erzurum
Tortum Şelalesi|Erzurum
Rüstem Paşa Kervansarayı (Taşhan)|Erzurum
Odunpazarı'nın tarihî evleri|Eskişehir
Porsuk Çayı üzerindeki kent köprüleri|Eskişehir
Zeugma Mozaik Müzesi|Gaziantep
Rumkale'nin Fırat'a bakan surları|Gaziantep
Tirebolu Kalesi|Giresun
Kuzalan Şelalesi|Giresun
Karaca Mağarası|Gümüşhane
Santa Harabeleri|Gümüşhane
Cilo Dağları'nın buzulları|Hakkâri
Mergabütan kayak alanı|Hakkâri
Titus Tüneli|Hatay
St. Pierre Kilisesi|Hatay
Davraz kayak merkezi|Isparta
Eğirdir Gölü'nün Yeşilada yerleşimi|Isparta
Kızkalesi'nin deniz içindeki kalesi|Mersin
Cennet ve Cehennem obrukları|Mersin
Yerebatan Sarnıcı|İstanbul
Galata Kulesi|İstanbul
Çırağan Sarayı|İstanbul
Şirince'nin tarihî köy dokusu|İzmir
Agora Örenyeri (Konak)|İzmir
Birgi'nin tarihî evleri|İzmir
Ani Örenyeri|Kars
Fethiye Camii'nin eski kilise mimarisi|Kars
Valla Kanyonu|Kastamonu
Horma Kanyonu|Kastamonu
Gevher Nesibe Darüşşifası|Kayseri
Sultan Sazlığı|Kayseri
Dupnisa Mağarası|Kırklareli
İğneada Longoz Ormanları|Kırklareli
Cacabey Medresesi|Kırşehir
Seyfe Gölü|Kırşehir
Ballıkayalar Tabiat Parkı|Kocaeli
Seka Kâğıt Müzesi|Kocaeli
Eşrefoğlu Camii|Konya
Kilistra Antik Kenti|Konya
Aizanoi Antik Kenti|Kütahya
Frig Vadisi'ndeki Deliktaş Kalesi|Kütahya
Arslantepe Höyüğü|Malatya
Levent Vadisi|Malatya
Spil Dağı Millî Parkı|Manisa
Sardes Antik Kenti|Manisa
Eshab-ı Kehf Külliyesi (Afşin)|Kahramanmaraş
Yedikuyular kayak merkezi|Kahramanmaraş
Dara Antik Kenti|Mardin
Deyrulzafaran Manastırı|Mardin
Kayaköy'ün terk edilmiş taş evleri|Muğla
Ölüdeniz lagünü|Muğla
Sedir Adası|Muğla
Malazgirt Kalesi|Muş
Muradiye Şelalesi|Van
Derinkuyu Yeraltı Şehri|Nevşehir
Kaymaklı Yeraltı Şehri|Nevşehir
Niğde'deki Alaeddin Camii'nin taş kapısı|Niğde
Gümüşler Manastırı|Niğde
Perşembe Yaylası'nın menderesleri|Ordu
Yason Burnu|Ordu
Zilkale|Rize
Palovit Şelalesi|Rize
Acarlar Longozu|Sakarya
Taraklı'nın tarihî evleri|Sakarya
Şahinkaya Kanyonu|Samsun
Amisos Tepesi|Samsun
Tillo'nun İbrahim Hakkı ışık düzeneği|Siirt
Botan Vadisi Millî Parkı|Siirt
Hamsilos koyu|Sinop
Erfelek Tatlıca Şelaleleri|Sinop
Divriği Ulu Camii ve Darüşşifası|Sivas
Gök Medrese|Sivas
Uçmakdere'nin yamaç paraşütü rotaları|Tekirdağ
Rakoczi Müzesi|Tekirdağ
Ballıca Mağarası|Tokat
Zile Kalesi|Tokat
Sümela Manastırı|Trabzon
Çal Mağarası|Trabzon
Ovacık'taki Munzur Gözeleri|Tunceli
Göbeklitepe Örenyeri|Şanlıurfa
Harran'ın konik kubbeli evleri|Şanlıurfa
Ulubey Kanyonu|Uşak
Blaundos Antik Kenti|Uşak
Akdamar Adası'ndaki tarihî kilise|Van
Sarıkaya Roma Hamamı|Yozgat
Gökgöl Mağarası|Zonguldak
Sultanhanı Kervansarayı|Aksaray
Baksı Müzesi|Bayburt
Binbir Kilise kalıntıları|Karaman
Hasankeyf'teki Zeynel Bey Türbesi|Batman
Cehennem Deresi Kanyonu (Ardanuç)|Artvin
Kibyra Antik Kenti|Burdur
Tlos Antik Kenti|Muğla
''')
