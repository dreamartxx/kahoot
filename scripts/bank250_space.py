from bank250_common import grouped

def expand_space(questions,add):
    grouped(add,'gezegenler','{} adlı yüzey oluşumu hangi gök cismindedir?', '''
Caloris Havzası|Merkür
Rembrandt Havzası|Merkür
Beethoven Havzası|Merkür
Rachmaninoff krateri|Merkür
Hokusai krateri|Merkür
Maxwell Montes|Venüs
Ishtar Terra|Venüs
Aphrodite Terra|Venüs
Maat Mons|Venüs
Lakshmi Planum|Venüs
Gula Mons|Venüs
Sif Mons|Venüs
Ovda Regio|Venüs
Atla Regio|Venüs
Alpha Regio|Venüs
Gale Krateri|Mars
Jezero Krateri|Mars
Hellas Planitia|Mars
Utopia Planitia|Mars
Elysium Planitia|Mars
Ascraeus Mons|Mars
Pavonis Mons|Mars
Arsia Mons|Mars
Alba Mons|Mars
Syrtis Major|Mars
Acidalia Planitia|Mars
Meridiani Planum|Mars
Noctis Labyrinthus|Mars
Gusev Krateri|Mars
Ares Vallis|Mars
Mare Tranquillitatis|Ay
Mare Imbrium|Ay
Mare Serenitatis|Ay
Mare Crisium|Ay
Oceanus Procellarum|Ay
Tycho krateri|Ay
Copernicus krateri|Ay
Schrödinger Havzası|Ay
Clavius krateri|Ay
Shackleton krateri|Ay
Sputnik Planitia|Plüton
Tombaugh Regio|Plüton
Wright Mons|Plüton
Cthulhu Macula|Plüton
Occator Krateri|Ceres
Ahuna Mons|Ceres
Rheasilvia Havzası|Vesta
Kraken Mare|Titan
Ligeia Mare|Titan
Mordor Macula|Charon
''')
    grouped(add,'gezegenler','Uzay biliminde {} ne demektir?', '''
Perihel|Güneş'e yörüngedeki en yakın konum
Aphel|Güneş'e yörüngedeki en uzak konum
Perigee (yerberi)|Dünya'ya yörüngedeki en yakın konum
Apogee (yeröte)|Dünya'ya yörüngedeki en uzak konum
Yörünge dışmerkezliği|Yörüngenin dairesellikten sapma ölçüsü
Yörünge eğikliği|Yörünge düzleminin bir referans düzlemle yaptığı açı
Ekliptik|Dünya'nın Güneş çevresindeki yörünge düzlemi
Retrograd dönme|Yaygın dönüş yönünün tersine eksen dönüşü
Kütle çekim kilitlenmesi|Dönme ile dolanmanın eşzamanlı hale gelmesi
Yörünge rezonansı|Dolanım süreleri arasında basit tam sayılı oran bulunması
Lagrange noktası|İki büyük cisimle birlikte dengeli yörünge konumu sağlayan bölge
Kaçış hızı|Bir cismin çekiminden ek itki olmadan uzaklaşmak için gereken asgari hız
Albedo|Yüzeyin gelen ışığı yansıtma oranı
Regolit|Bir gök cisminin yüzeyindeki gevşek taş ve toz örtüsü
Magnetosfer|Bir gök cisminin manyetik etkisinin baskın olduğu uzay bölgesi
İyonosfer|Atmosferin önemli ölçüde iyonlaşmış bölümü
Ekzosfer|Atmosferin parçacıkların çok seyrek olduğu en dış bölgesi
Fotosfer|Güneş'in görünür yüzeyi sayılan katman
Kromosfer|Güneş fotosferinin üzerindeki atmosfer katmanı
Korona|Güneş atmosferinin dıştaki sıcak tacı
Güneş rüzgârı|Güneş'ten yayılan yüklü parçacık akışı
Koronal kütle atımı|Güneş'ten büyük plazma ve manyetik alan fırlaması
Güneş lekesi|Fotosferde çevresine göre daha soğuk ve koyu bölge
Güneş çevrimi|Güneş etkinliğinin yaklaşık dönemsel değişimi
Heliosfer|Güneş rüzgârının yıldızlararası ortama karşı etkili olduğu bölge
Heliopoz|Güneş rüzgârıyla yıldızlararası ortam arasındaki sınır
Roche sınırı|Gelgit etkisinin bir uyduyu parçalayabileceği yakınlık sınırı
Hill küresi|Bir cismin uydu tutmada baskın olduğu çekim bölgesi
Kavuşum|Gök cisimlerinin gökyüzünde aynı doğrultuya yakın görünmesi
Karşı konum|Dış gezegenin gökyüzünde Güneş'in ters yönünde görünmesi
Elongasyon|Bir gök cisminin Güneş'ten görünen açısal uzaklığı
Transit|Küçük bir gök cisminin daha büyük cismin önünden geçişi
Örtülme|Öndeki gök cisminin arkadakini gizlemesi
Umbra|Tutulmada oluşan tam gölge bölgesi
Penumbra|Tutulmada oluşan yarı gölge bölgesi
Parsek|Yıldız paralaksına dayanan astronomik uzaklık birimi
Paralaks|Gözlem yerinin değişmesiyle oluşan görünür konum kayması
Kırmızıya kayma|Işığın daha uzun dalga boylarına kayması
Tayf|Işığın dalga boylarına ayrılmış dağılımı
Tayfölçer|Işığı dalga boylarına ayırıp inceleyen aygıt
Fotometri|Gök cisimlerinden gelen ışık miktarını ölçme
Astrometri|Gök cisimlerinin konum ve hareketlerini hassas ölçme
Astrobiyoloji|Evrende yaşamın kökeni ve olasılığını inceleme
Öngezegen diski|Genç yıldız çevresindeki gezegen oluşum malzemesi
Gezegenimsiler|Gezegen oluşumunda birleşen küçük katı cisimler
Akreasyon|Maddenin çekim etkisiyle birikerek büyümesi
Kriyo-volkanizma|Su ve benzeri uçucu maddelerin soğuk volkanik püskürmesi
Ötegezegen|Güneş dışındaki yıldızların çevresindeki gezegen
Yaşanabilir bölge|Uygun atmosferle sıvı suya elverişli yıldız çevresi kuşağı
Cüce gezegen|Yaklaşık küresel olup yörünge çevresini temizlememiş gök cismi
''')
    grouped(add,'gezegenler','Şu uzay araştırması hangi gök cismini hedeflemiştir: {}?', '''
Mariner 2'nin 1962 yakın geçişi|Venüs
Mariner 4'ün 1965 yakın geçişi|Mars
Mariner 5'in 1967 yakın geçişi|Venüs
Mariner 9'un 1971 yörünge görevi|Mars
Viking 1'in 1976 inişi|Mars
Viking 2'nin 1976 inişi|Mars
Mars Pathfinder'ın 1997 inişi|Mars
Spirit gezgininin 2004 inişi|Mars
Opportunity gezgininin 2004 inişi|Mars
Curiosity gezgininin 2012 inişi|Mars
Perseverance gezgininin 2021 inişi|Mars
InSight'ın 2018 inişi|Mars
Phoenix'in 2008 kutup inişi|Mars
Mars Global Surveyor yörünge aracının çalışması|Mars
MAVEN atmosfer araştırması|Mars
Mars Express yörünge araştırması|Mars
Mangalyaan yörünge araştırması|Mars
Hope (Emirates Mars Mission) yörünge görevi|Mars
Tianwen-1 yörünge ve iniş görevi|Mars
MESSENGER'ın 2011'de yörüngeye girişi|Merkür
Magellan'ın radar haritalaması|Venüs
Venus Express'in atmosfer araştırması|Venüs
Akatsuki'nin atmosfer araştırması|Venüs
Venera 7'nin 1970 yüzey inişi|Venüs
Venera 9'un 1975 yüzey fotoğrafları|Venüs
Venera 13'ün 1982 renkli yüzey fotoğrafları|Venüs
Galileo'nun 1995'te ulaştığı gezegen yörüngesi|Jüpiter
Juno'nun 2016'da ulaştığı gezegen yörüngesi|Jüpiter
Cassini'nin 2004'te ulaştığı gezegen yörüngesi|Satürn
Huygens'in 2005'te indiği uydu|Titan
New Horizons'ın 2015 cüce gezegen yakın geçişi|Plüton
Luna 2'nin 1959'da ulaştığı yüzey|Ay
Luna 3'ün 1959 uzak yüz fotoğrafları|Ay
Luna 9'un 1966 yumuşak inişi|Ay
Luna 16'nın 1970 örnek dönüşü|Ay
Lunokhod 1'in 1970 yüzey gezisi|Ay
Apollo 12'nin insanlı inişi|Ay
Apollo 14'ün insanlı inişi|Ay
Apollo 15'in insanlı gezgin kullanımı|Ay
Apollo 16'nın insanlı inişi|Ay
Apollo 17'nin insanlı inişi|Ay
Clementine'in 1994 haritalama görevi|Ay
Lunar Prospector'ın 1998 yörünge görevi|Ay
SMART-1'in yörünge araştırması|Ay
Kaguya'nın 2007'de ulaştığı yörünge|Ay
Chandrayaan-1'in 2008 yörünge görevi|Ay
Chang'e 3'ün 2013 inişi|Ay
Chang'e 4'ün 2019 uzak yüz inişi|Ay
Chang'e 5'in 2020 örnek dönüşü|Ay
Chandrayaan-3'ün 2023 inişi|Ay
''')
