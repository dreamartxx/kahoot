"""Curated, reproducible extra quiz pools. Numeric facts are not calculations."""
import json, hashlib, sys
from pathlib import Path
from collections import Counter
ROOT=Path(__file__).resolve().parents[1]
estimate=[]
def numeric(group,rows,source=None):
    for line in rows.strip().splitlines():
        text,value,unit,note=line.split('|')
        estimate.append(dict(id=f'estimate-{len(estimate)+1:03}',category=group,text=text,answer=float(value) if '.' in value else int(value),unit=unit,explanation=note,**({'source':source} if source else {})))
# Distances and diameters are rounded reference values, not changing satellite counts.
planets=[('Merkür',4879,57.9,88),('Venüs',12104,108.2,224.7),('Dünya',12756,149.6,365.2),('Mars',6792,228,687),('Jüpiter',142984,778.5,4331),('Satürn',120536,1432,10747),('Uranüs',51118,2867,30589),('Neptün',49528,4515,59800)]
for name,diameter,distance,year in planets:
    numeric('uzay',f"{name} gezegeninin ekvator çapı yaklaşık kaç kilometredir?|{diameter}|km|NASA'nın metrik gezegen tablosundaki yaklaşık ekvator çapı esas alınır.\n{name}, Güneş'ten ortalama yaklaşık kaç milyon kilometre uzaktadır?|{distance}|milyon km|Uzaklık yörünge boyunca değişir; tablodaki ortalama değer kullanılır.\n{name} Güneş çevresinde bir turunu yaklaşık kaç Dünya gününde tamamlar?|{year}|Dünya günü|NASA'nın gezegen tablosundaki yaklaşık yörünge süresi esas alınır.", 'https://nssdc.gsfc.nasa.gov/planetary/factsheet/')
numeric('uzay','''Ay'ın Dünya'ya ortalama uzaklığı yaklaşık kaç kilometredir?|384400|km|Ay'ın uzaklığı yörüngesi boyunca değişir; ortalama uzaklık yaklaşık 384.400 km'dir.
Ay'ın çapı yaklaşık kaç kilometredir?|3475|km|NASA tablosunda Ay'ın çapı yaklaşık 3.475 km olarak verilir.
Güneş'in görünür yüzeyinin sıcaklığı yaklaşık kaç santigrat derecedir?|5500|°C|Fotosfer sıcaklığı yaklaşık 5.500 °C'dir; çekirdek çok daha sıcaktır.
Güneş ışığı Dünya'ya yaklaşık kaç saniyede ulaşır?|499|saniye|Ortalama uzaklık için yolculuk yaklaşık 8 dakika 19 saniyedir.
Apollo görevleri sırasında Ay yüzeyinde toplam kaç insan yürüdü?|12|kişi|1969–1972 arasında altı Apollo inişinde 12 astronot Ay'da yürüdü.
İnsanların Ay'a ilk ayak bastığı yıl kaçtır?|1969|yıl|Apollo 11'in Ay yürüyüşü 1969 yılında gerçekleşti.
Uzaya çıkan ilk insan Yuri Gagarin hangi yıl uçtu?|1961|yıl|Vostok 1 uçuşu 12 Nisan 1961'de yapıldı.
Uluslararası Uzay İstasyonu Dünya çevresinde yaklaşık kaç dakikada döner?|90|dakika|Yörünge yüksekliğine göre değişen süre yaklaşık 90 dakikadır.
Halley Kuyruklu Yıldızı Güneş çevresinde ortalama yaklaşık kaç yılda döner?|76|yıl|Yörünge süresi değişse de yaygın yaklaşık değer 76 yıldır.
Mars'ın Phobos ve Deimos adlı toplam kaç doğal uydusu vardır?|2|uydu|Mars'ın iki uydusu Phobos ve Deimos'tur.
''')
numeric('yapilar','''Eyfel Kulesi'nin metal iskeleti yaklaşık kaç ton ağırlığındadır?|7300|ton|Kulenin metal iskeletinin ağırlığı yaklaşık 7.300 tondur.
Eyfel Kulesi'nin yapımında yaklaşık kaç perçin kullanılmıştır?|2500000|perçin|Kulenin demir parçaları yaklaşık 2,5 milyon perçinle birleştirilmiştir.
Eyfel Kulesi'nin iskeletinde kaç demir parça bulunur?|18038|parça|Resmî verilere göre 18.038 demir parça kullanılmıştır.
Eyfel Kulesi ilk açıldığında kaç yıl ayakta kalması planlanmıştı?|20|yıl|Başlangıçta 20 yıllık bir yapı olarak düşünülmüştü.
Eyfel Kulesi hangi yıl açıldı?|1889|yıl|1889 Paris Dünya Fuarı için inşa edildi.
''','https://www.toureiffel.paris/en/the-monument/key-figures')
numeric('yapilar','''Özgürlük Heykeli'nin tacında kaç pencere vardır?|25|pencere|Tacın içinde 25 pencere bulunur.
Özgürlük Heykeli'nin tacında kaç ışın vardır?|7|ışın|Tacın yedi ışını vardır.
Özgürlük Heykeli'nin zeminden meşalenin ucuna yüksekliği yaklaşık kaç metredir?|93|metre|Kaidesi dahil yüksekliği 92,99 metredir; oyunda 93 metre esas alınır.
Özgürlük Heykeli'nin işaret parmağı yaklaşık kaç santimetredir?|244|cm|Heykelin işaret parmağının uzunluğu 2,44 metredir.
Özgürlük Heykeli'nin burnu yaklaşık kaç santimetredir?|137|cm|Burnunun uzunluğu yaklaşık 1,37 metredir.
''','https://www.nps.gov/stli/learn/historyculture/statue-statistics.htm')
numeric('yapilar','''Burç Halife'nin mimari yüksekliği kaç metredir?|828|metre|Dubai'deki yapının mimari yüksekliği 828 metredir.
Burç Halife'de kaç kat vardır?|163|kat|Resmî kat sayısı 163'tür; teknik kat sayma yöntemleri farklı olabilir.
Pisa Kulesi'nin yapımına hangi yıl başlandı?|1173|yıl|Yapım 1173'te başladı ve uzun aralarla devam etti.
Tac Mahal'in ana türbesini çevreleyen kaç minare vardır?|4|minare|Ana türbenin dört köşesinde birer minare bulunur.
Gize'deki Büyük Piramit'in ilk yapıldığındaki yüksekliği yaklaşık kaç metreydi?|147|metre|Başlangıçtaki yükseklik yaklaşık 146,6 metredir; tam metreye yuvarlanmıştır.
Sydney Opera Binası hangi yıl resmen açıldı?|1973|yıl|Resmî açılışı 20 Ekim 1973'te yapıldı.
Londra'daki London Eye dönme dolabının yüksekliği kaç metredir?|135|metre|London Eye 135 metre yüksekliğindedir.
London Eye'da kaç yolcu kapsülü vardır?|32|kapsül|Dönme dolapta 32 kapsül bulunur.
Golden Gate Köprüsü'nün ana açıklığı yaklaşık kaç metredir?|1280|metre|İki ana kule arasındaki açıklık yaklaşık 1.280 metredir.
Golden Gate Köprüsü hangi yıl açıldı?|1937|yıl|San Francisco'daki köprü 1937'de hizmete açıldı.
Empire State Binası'nda kaç kat vardır?|102|kat|New York'taki yapının kat sayısı 102'dir.
Empire State Binası hangi yıl açıldı?|1931|yıl|Bina 1 Mayıs 1931'de açıldı.
Anıtkabir'in Aslanlı Yol'unda kaç aslan heykeli vardır?|24|heykel|Yolun iki yanında toplam 24 aslan heykeli yer alır.
Anıtkabir'de kaç kule bulunur?|10|kule|Anıtkabir kompleksinde on kule yer alır.
Sultanahmet Camii'nin kaç minaresi vardır?|6|minare|Sultanahmet Camii altı minaresiyle tanınır.
Selimiye Camii'nin kaç minaresi vardır?|4|minare|Edirne'deki Selimiye Camii'nin dört minaresi bulunur.
1915 Çanakkale Köprüsü'nün ana açıklığı kaç metredir?|2023|metre|Ana açıklığı 2.023 metredir.
Yerebatan Sarnıcı'nda kaç sütun vardır?|336|sütun|Sarnıç 336 sütunla taşınır.
Moai heykelleriyle tanınan Paskalya Adası'ndaki Ahu Tongariki'de kaç moai yan yana durur?|15|heykel|Ahu Tongariki'nin platformunda 15 moai bulunur.
Kurtarıcı İsa Heykeli'nin kaide hariç yüksekliği kaç metredir?|30|metre|Rio'daki heykel 30 metre, kaidesi yaklaşık 8 metredir.
''')
numeric('insan','''Yetişkin bir insanın iskeletinde genellikle kaç kemik vardır?|206|kemik|Kemik sayısında kişisel farklılıklar olabilir; standart yetişkin sayısı 206'dır.
Yirmilik dişleri de tamamlanmış yetişkin ağızda kaç kalıcı diş bulunur?|32|diş|Yirmilik dişlerle birlikte tam kalıcı diş dizisi 32 diştir.
Bir çocuğun tam süt dişi dizisinde kaç diş bulunur?|20|diş|Tam süt dişi dizisi 20 dişten oluşur.
İnsan kalbinde kaç odacık vardır?|4|odacık|İki kulakçık ve iki karıncık bulunur.
İnsanların boynunda genellikle kaç omur vardır?|7|omur|Boyun omurgasında yedi servikal omur bulunur.
Bir insan elinde bilek dahil kaç kemik vardır?|27|kemik|Bir elde sekiz el bileği, beş tarak ve on dört parmak kemiği bulunur.
Bir insan ayağında genellikle kaç kemik vardır?|26|kemik|Standart anatomik sayımda bir ayakta 26 kemik bulunur.
İnsanlarda genellikle kaç çift kaburga bulunur?|12|çift|Standart insan iskeletinde 12 çift kaburga vardır.
Her bir insan kulağının orta bölümünde kaç işitme kemikçiği vardır?|3|kemikçik|Çekiç, örs ve üzengi üç küçük kemikçiktir.
İnsan vücut hücrelerinde genellikle kaç kromozom bulunur?|46|kromozom|Çekirdekli somatik hücrelerde tipik sayı 23 çift, yani 46'dır.
İnsanlarda ABO sisteminin kaç ana kan grubu vardır?|4|grup|A, B, AB ve O ana gruplardır; Rh ayrı bir sınıflamadır.
İnsanların toplam kaç akciğeri vardır?|2|akciğer|Sağ ve sol olmak üzere iki akciğer bulunur.
Sağ insan akciğeri kaç lobdan oluşur?|3|lob|Sağ akciğer üç, sol akciğer iki lobludur.
Sol insan akciğeri kaç lobdan oluşur?|2|lob|Kalbe yer açan sol akciğer iki lobludur.
İnsan dilinde yaygın kabul gören kaç temel tat duyusu vardır?|5|tat|Tatlı, tuzlu, ekşi, acı ve umami beş temel tattır.
Tipik insan kafatası, kulak kemikçikleri hariç kaç kemikten oluşur?|22|kemik|Sekiz kafatası ve on dört yüz kemiği toplam 22 eder.
İnsan vücudunun en küçük kemiği üzengi yaklaşık kaç milimetre uzunluğundadır?|3|mm|Üzengi yaklaşık 3 milimetredir; kişiden kişiye değişebilir.
Bir yetişkinin ince bağırsağı ders kitaplarında yaklaşık kaç metre uzunluğunda anlatılır?|6|metre|Ölçüm koşullarına göre değişir; yaygın anatomik yaklaşık değer 6 metredir.
Normal gebelik süresi, son adet tarihinden itibaren yaklaşık kaç hafta sayılır?|40|hafta|Standart gebelik hesabı son adet başlangıcından yaklaşık 40 haftadır.
İnsanların kaç çift kraniyal siniri vardır?|12|çift|Kraniyal sinirler geleneksel olarak 12 çift olarak sınıflanır.
''')
numeric('hayvanlar','''Bir ahtapotun kaç kalbi vardır?|3|kalp|İki kalp solungaçlara, biri vücudun geri kalanına kan pompalar.
Bir ahtapotun kaç kolu vardır?|8|kol|Ahtapotlar sekiz kollu kafadanbacaklılardır.
Bir kalamarın sekiz koluna ek olarak kaç uzun yakalama dokunacı vardır?|2|dokunaç|Kalamarların sekiz kolu ve iki uzun yakalama dokunacı vardır.
Bir örümceğin kaç bacağı vardır?|8|bacak|Örümcekler sekiz bacaklı eklembacaklılardır.
Bir böceğin yetişkin halinde kaç bacağı vardır?|6|bacak|Böceklerin üç çift bacağı vardır.
Bir bal arısının kaç kanadı vardır?|4|kanat|İki çift kanadı bulunur; uçuşta kancalarla birlikte hareket ederler.
Bir bal arısının basit ve bileşik gözleri dahil toplam kaç gözü vardır?|5|göz|İki bileşik ve üç basit göz bulunur.
Bir yusufçuğun kaç kanadı vardır?|4|kanat|Yusufçuklar iki çift kanat taşır.
Bir zürafanın uzun boynunda genellikle kaç omur vardır?|7|omur|Zürafaların da çoğu memeli gibi yedi boyun omuru vardır.
Bir ineğin midesi kaç bölmeden oluşur?|4|bölme|İşkembe, börkenek, kırkbayır ve şirden dört bölmedir.
Bir devenin üst ve alt göz kapaklarına ek koruyucu kapakla toplam kaç göz kapağı vardır?|3|kapak|Her gözde üst, alt ve üçüncü koruyucu göz kapağı bulunur.
Bir çift hörgüçlü devenin kaç hörgücü vardır?|2|hörgüç|Baktriya devesi iki hörgüçlüdür.
Bir tek hörgüçlü devenin kaç hörgücü vardır?|1|hörgüç|Dromedary olarak bilinen deve tek hörgüçlüdür.
Tipik bir denizyıldızında kaç kol görülür?|5|kol|Pek çok tanıdık tür beş kolludur; daha fazla kollu türler de vardır.
Bir deniz kestanesinin Aristoteles feneri denen ağzında kaç diş vardır?|5|diş|Aristoteles fenerinde beş sert diş bulunur.
Bir devekuşunun her ayağında kaç parmak vardır?|2|parmak|Devekuşları iki parmaklı ayaklarıyla tanınır.
Bir köpeğin tam yetişkin diş dizisinde kaç diş vardır?|42|diş|Yetişkin köpeklerin standart kalıcı diş sayısı 42'dir.
Bir kedinin tam yetişkin diş dizisinde kaç diş vardır?|30|diş|Yetişkin kedilerin standart kalıcı diş sayısı 30'dur.
Bir tavşanın üst ön bölümünde arkadaki küçük çift dahil kaç kesici diş vardır?|4|diş|Tavşanların üst çenesinde iki büyük ve arkalarında iki küçük kesici vardır.
Kelebeklerin yaşam döngüsü yumurta, larva, pupa ve yetişkin olmak üzere kaç ana aşamalıdır?|4|aşama|Tam başkalaşım dört temel aşamada anlatılır.
''')
numeric('dunya','''Dünya yüzeyinin yaklaşık yüzde kaçı okyanuslarla kaplıdır?|71|yüzde|Okyanuslar Dünya yüzeyinin yaklaşık yüzde 71'ini kaplar.
Okyanusların ortalama derinliği NOAA'nın 2010 tahminine göre kaç metredir?|3682|metre|NOAA ve WHOI'nin 2010 tahmini yaklaşık 3.682 metredir.
NOAA'nın verdiği Challenger Deep derinliği yaklaşık kaç metredir?|10935|metre|Ölçümlere göre değerler değişir; bu soruda NOAA'nın 10.935 metrelik değeri esas alınır.
Everest'in 2020 ortak ölçümünde açıklanan yüksekliği yaklaşık kaç metredir?|8849|metre|Nepal ve Çin'in açıkladığı 8.848,86 metre tam metreye yuvarlanmıştır.
Ağrı Dağı'nın yaygın kabul gören yüksekliği kaç metredir?|5137|metre|Büyük Ağrı'nın yaygın verilen yüksekliği 5.137 metredir.
Kilimanjaro'nun Uhuru zirvesi kaç metre yüksekliğindedir?|5895|metre|Afrika'nın en yüksek zirvesi 5.895 metredir.
Fuji Dağı'nın yüksekliği kaç metredir?|3776|metre|Japonya'nın simge dağı 3.776 metredir.
Baykal Gölü'nün en büyük derinliği yaklaşık kaç metredir?|1642|metre|Baykal Gölü'nün en derin noktası yaklaşık 1.642 metredir.
Dünya'nın Ekvator çevresi yaklaşık kaç kilometredir?|40075|km|Ekvator çevresi yaklaşık 40.075 kilometredir.
Dünya atmosferindeki kuru havanın yaklaşık yüzde kaçı azottur?|78|yüzde|Kuru havanın yaklaşık yüzde 78'i azottur.
Dünya atmosferindeki kuru havanın yaklaşık yüzde kaçı oksijendir?|21|yüzde|Oksijenin oranı yaklaşık yüzde 21'dir.
Türkiye'de kaç coğrafi bölge vardır?|7|bölge|Türkiye yedi coğrafi bölgeye ayrılır.
Türkiye'de kaç il vardır?|81|il|Türkiye'nin il sayısı 81'dir.
Yedi kıtalı modele göre Dünya'da kaç kıta vardır?|7|kıta|Asya, Avrupa, Afrika, Kuzey Amerika, Güney Amerika, Okyanusya ve Antarktika sayılır.
Günümüzde yaygın beş okyanuslu sınıflamada kaç okyanus vardır?|5|okyanus|Pasifik, Atlantik, Hint, Arktik ve Güney okyanusları sayılır.
Türkiye'nin kaç ülkeyle kara sınırı vardır?|8|ülke|Bulgaristan, Yunanistan, Gürcistan, Ermenistan, Azerbaycan, İran, Irak ve Suriye.
ABD bayrağında kaç yıldız vardır?|50|yıldız|Her yıldız bir eyaleti temsil eder.
ABD bayrağında kaç şerit vardır?|13|şerit|On üç şerit ilk on üç koloniyi temsil eder.
Avrupa Birliği bayrağında kaç yıldız vardır?|12|yıldız|On iki yıldız üye sayısını değil, birlik ve bütünlüğü simgeler.
Kanada bayrağındaki akçaağaç yaprağı kaç uçludur?|11|uç|Bayraktaki stilize yaprak on bir uçludur.
''')
numeric('spor','''Bir maratonun resmî uzunluğu kaç metredir?|42195|metre|Maraton mesafesi 42 kilometre 195 metredir.
Standart açık hava atletizm pistinin iç kulvarında bir tur kaç metredir?|400|metre|Standart pistte ölçüm çizgisinden bir tur 400 metredir.
Olimpik uzun kulvar yüzme havuzu kaç metre uzunluğundadır?|50|metre|Uzun kulvar olimpik havuz uzunluğu 50 metredir.
Basketbol potasının çemberi yerden kaç santimetre yüksektir?|305|cm|Standart çember yüksekliği 3,05 metredir.
Futbol kalesinin iki direği arasındaki iç genişlik kaç santimetredir?|732|cm|Standart kale genişliği 7,32 metredir.
Futbol kalesinin üst direğinin yerden yüksekliği kaç santimetredir?|244|cm|Üst direğin alt kenarı yerden 2,44 metredir.
Futbolda penaltı noktası kale çizgisinden kaç metre uzaktadır?|11|metre|Penaltı noktası kale çizgisine 11 metre uzaklıktadır.
Bir futbol takımı kaleci dahil sahaya kaç oyuncuyla çıkar?|11|oyuncu|Saha futbolunda başlangıç kadrosu 11 oyuncudur.
FIFA Dünya Kupası'nı 2022 sonu itibarıyla Brezilya kaç kez kazanmıştır?|5|şampiyonluk|Brezilya 1958, 1962, 1970, 1994 ve 2002'de kazandı.
Bir voleybol takımı sahada kaç oyuncuyla oynar?|6|oyuncu|Salon voleybolunda aynı anda altı oyuncu bulunur.
Bir basketbol takımı sahada kaç oyuncuyla oynar?|5|oyuncu|Bir takım aynı anda beş oyuncuyla oynar.
Olimpiyat simgesinde kaç halka vardır?|5|halka|Olimpiyat simgesi birbirine geçen beş halkadan oluşur.
Dekatlon kaç atletizm dalından oluşur?|10|dal|Dekatlon on farklı atletizm yarışmasını birleştirir.
Heptatlon kaç atletizm dalından oluşur?|7|dal|Heptatlon yedi farklı atletizm yarışmasından oluşur.
Bir snooker oyununda başlangıçta kaç kırmızı top vardır?|15|top|Başlangıç düzeninde 15 kırmızı top bulunur.
Standart bowlingde devrilmeye çalışılan kaç lobut vardır?|10|lobut|Tenpin bowling on lobutla oynanır.
Bir curling takımının standart dört kişilik oyunda bir end boyunca toplam kaç taşı vardır?|8|taş|Dört oyuncu ikişer taş atar; takımın toplam sekiz taşı vardır.
Masa tenisi masasının uzunluğu kaç santimetredir?|274|cm|Standart masa uzunluğu 2,74 metredir.
Hentbol kalesinin genişliği kaç metredir?|3|metre|Standart hentbol kalesi üç metre genişliğindedir.
Usain Bolt'un 2009'da koştuğu 100 metre dünya rekoru kaç saniyedir?|9.58|saniye|Berlin'de 16 Ağustos 2009'da 9,58 saniye koştu.
Michael Phelps olimpiyat kariyerinde toplam kaç altın madalya kazandı?|23|altın madalya|Phelps olimpiyatlarda 23 altın madalya kazandı.
Michael Phelps olimpiyat kariyerinde toplam kaç madalya kazandı?|28|madalya|Toplamı 23 altın, üç gümüş ve iki bronzla 28'dir.
Nadia Comăneci Montreal 1976'da tam puan aldığında kaç yaşındaydı?|14|yaş|Comăneci 1976 Olimpiyatları sırasında 14 yaşındaydı.
Bir golf sahasının standart tam turunda kaç delik oynanır?|18|delik|Standart tam golf turu 18 delikten oluşur.
Standart bir dart tahtasında en dıştaki numaralı bölmeler kaç farklı sayıyı gösterir?|20|sayı|Tahtanın numaralı dilimleri 1'den 20'ye kadardır.
''')
numeric('kultur','''Modern standart bir piyanoda kaç tuş vardır?|88|tuş|Standart piyanoda 52 beyaz ve 36 siyah tuş bulunur.
Standart piyanoda kaç siyah tuş vardır?|36|tuş|88 tuşlu piyanodaki siyah tuş sayısı 36'dır.
Klasik bir gitarın kaç teli vardır?|6|tel|Standart klasik gitar altı tellidir.
Bir kemanın kaç teli vardır?|4|tel|Kemanın standart akordu dört tel üzerinde yapılır.
Standart bir satranç oyununda başlangıçta toplam kaç taş vardır?|32|taş|İki oyuncunun on altışar taşı vardır.
Bir oyuncunun satranç başlangıcında kaç piyonu vardır?|8|piyon|Her oyuncu sekiz piyonla başlar.
Jokersiz standart bir iskambil destesinde kaç kart vardır?|52|kart|Dört türün her birinde on üç kart bulunur.
Standart çift altılı domino takımında kaç taş vardır?|28|taş|Sıfırdan altıya değerler taşıyan çift altılı takım 28 taştır.
Standart okey takımında sahte okeyler dahil kaç taş vardır?|106|taş|104 numaralı taşın yanında iki sahte okey bulunur.
Standart bir tavlada toplam kaç pul vardır?|30|pul|Her oyuncunun 15 pulu vardır.
Klasik 3×3 Rubik küpünün dış yüzlerinde toplam kaç küçük renkli kare görünür?|54|kare|Altı yüzün her birinde dokuz renkli kare vardır.
Bir Rubik küpü standart renk düzeninde kaç farklı renge sahiptir?|6|renk|Klasik küp altı farklı renk kullanır.
Pamuk Prenses masalında kaç cüce vardır?|7|cüce|Masal yedi cüceyle tanınır.
J. K. Rowling'in ana Harry Potter roman serisi kaç kitaptır?|7|kitap|Ana roman serisi yedi kitaptan oluşur.
Yüzüklerin Efendisi'nin Peter Jackson imzalı ana film serisi kaç filmdir?|3|film|Yüzük Kardeşliği, İki Kule ve Kralın Dönüşü üçlemedir.
The Beatles grubunun klasik kadrosunda kaç kişi vardı?|4|kişi|John Lennon, Paul McCartney, George Harrison ve Ringo Starr.
Beethoven tamamlanmış ve numaralandırılmış kaç senfoni yazdı?|9|senfoni|Bestecinin tamamlanmış dokuz numaralı senfonisi vardır.
Vivaldi'nin Dört Mevsim eseri kaç konçertodan oluşur?|4|konçerto|İlkbahar, Yaz, Sonbahar ve Kış için birer konçerto vardır.
Türk alfabesinde kaç harf vardır?|29|harf|1928'de kabul edilen Türk alfabesi 29 harften oluşur.
İstiklâl Marşı'nın yazılı tam metni kaç kıtadır?|10|kıta|Marşın tam şiir metni on kıtadır; genellikle ilk ikisi söylenir.
''')
numeric('tarih','''Titanic'in ilk seferinde battığı yıl kaçtır?|1912|yıl|Titanic 15 Nisan 1912'de battı.
Titanic'te kaç baca vardı?|4|baca|Dört bacadan biri görünüm ve havalandırma amacıyla kullanılıyordu.
İlk modern Olimpiyat Oyunları Atina'da hangi yıl yapıldı?|1896|yıl|Modern Olimpiyatların ilk organizasyonu 1896 Atina'dır.
Berlin Duvarı'nın geçişlere açıldığı yıl kaçtır?|1989|yıl|Duvar 9 Kasım 1989'da geçişlere açıldı.
Türkiye Cumhuriyeti hangi yıl ilan edildi?|1923|yıl|Cumhuriyet 29 Ekim 1923'te ilan edildi.
Türkiye Büyük Millet Meclisi hangi yıl açıldı?|1920|yıl|TBMM 23 Nisan 1920'de açıldı.
İstanbul'un Osmanlılar tarafından fethedildiği yıl kaçtır?|1453|yıl|İstanbul 29 Mayıs 1453'te fethedildi.
Türk harflerinin kabul edildiği yıl kaçtır?|1928|yıl|Yeni Türk harfleri 1928'de kabul edildi.
Çanakkale Deniz Zaferi hangi yıl kazanıldı?|1915|yıl|18 Mart 1915, Çanakkale Deniz Zaferi'nin tarihidir.
İnsanlığın ilk yapay uydusu Sputnik 1 hangi yıl fırlatıldı?|1957|yıl|Sputnik 1, 4 Ekim 1957'de fırlatıldı.
Wright kardeşlerin motorlu ve kontrollü ilk başarılı uçuşu hangi yıl yapıldı?|1903|yıl|Kitty Hawk yakınlarındaki uçuş 17 Aralık 1903'te gerçekleşti.
''')
numeric('gunluk','''Standart bir trafik ışığında kaç ana renk vardır?|3|renk|Kırmızı, sarı ve yeşil ana renklerdir.
Bir uçak kara kutusunun yaygın dış rengi turuncudur; standart uçuş kayıt sistemi kaç temel kayıt cihazından oluşur?|2|cihaz|Geleneksel sistemde uçuş verisi ve kokpit ses kayıt cihazları bulunur; birleşik modeller de vardır.
Bir yetişkin bisikletinin standart tekerlek sayısı kaçtır?|2|tekerlek|Standart bisiklet iki tekerleklidir.
Mors alfabesindeki SOS işaretinde toplam kaç kısa ve uzun sinyal bulunur?|9|sinyal|Üç kısa, üç uzun, üç kısa sinyal kullanılır.
Bir standart 35 mm fotoğraf makinesi film rulosunun yaygın uzun versiyonu kaç pozluktur?|36|poz|Yaygın uzun fotoğraf filmi 36 poz olarak satılır.
Bir saat kadranındaki klasik Roma rakamı XII hangi sayıyı gösterir?|12|saat|XII, on ikiyi gösterir.
Bir standart tam boy bilgisayar klavyesinde F1'den başlayan işlev tuşları genellikle kaç tanedir?|12|tuş|Klasik tam boy klavyelerde F1–F12 işlev tuşları vardır.
Bir standart QR kodun üç köşesinde kaç büyük konum belirleme karesi bulunur?|3|kare|Standart QR kodda üç büyük köşe işareti vardır; Micro QR farklıdır.
Bir müzik CD'sinin standart çapı kaç santimetredir?|12|cm|Tam boy CD'nin çapı 12 santimetredir.
Bir vinil uzunçaların yaygın büyük formatı kaç inç çapındadır?|12|inç|LP plakların yaygın büyük formatı 12 inçtir.
Bir standart A4 kâğıdının kısa kenarı kaç milimetredir?|210|mm|A4 boyutu 210 × 297 milimetredir.
Bir standart A4 kâğıdının uzun kenarı kaç milimetredir?|297|mm|A4 boyutu 210 × 297 milimetredir.
Bir standart LEGO 2×4 tuğlanın üstünde kaç çıkıntı vardır?|8|çıkıntı|İki sıra halinde dörder çıkıntı bulunur.
Bir tenis topunun yüzeyini oluşturan keçe örtü geleneksel olarak kaç parçadır?|2|parça|Kavisli iki keçe parçası topun çevresinde birleşir.
Satrançta bir at taşının oyun başında bulunduğu karelerin toplam sayısı kaçtır?|4|kare|Her oyuncunun iki atı vardır; başlangıçta dört at karesi doludur.
Bir standart dart tahtasının merkezindeki iç boğa gözü kaç puandır?|50|puan|İç boğa gözü 50, dış halka 25 puandır.
Bir Scrabble oyununun İngilizce standart setinde kaç harf taşı vardır?|100|taş|İngilizce standart Scrabble seti iki boş taş dahil 100 taştır.
Bir standart Monopoly tahtasının çevresinde kaç durak vardır?|40|durak|Klasik Monopoly tahtası 40 kareden oluşur.
Bir standart langırtta iki takımın toplam kaç oyuncu figürü bulunur?|22|figür|Yaygın tek kalecili düzende takımlar on birer figürdür; farklı masa tipleri de vardır.
Bir klasik İskambil destesindeki resimli vale, kız ve papaz kartlarının toplam sayısı kaçtır?|12|kart|Dört türün her birinde vale, kız ve papaz bulunur.
''')
# Binary bank is maintained as direct yes/no claims, with an explanation for both answers.
binary=[]
def yesno(group,rows):
    for line in rows.strip().splitlines():
        text,answer,explanation=line.split('|')
        binary.append(dict(id=f'binary-{len(binary)+1:03}',category=group,text=text,options=['Evet','Hayır'],correct=0 if answer=='E' else 1,explanation=explanation,difficulty='general'))
yesno('hayvanlar','''Ahtapotların üç kalbi var mıdır?|E|İki kalp solungaçlara, bir kalp vücudun geri kalanına kan pompalar.
Ahtapotların kanı insan kanı gibi kırmızı mıdır?|H|Oksijen taşıyan hemosiyanin nedeniyle ahtapot kanı mavimsi görünür.
Yarasalar tamamen kör müdür?|H|Yarasalar görebilir; birçok tür ayrıca yankıyla yön bulur.
Penguenler kuş olmalarına rağmen doğal olarak uçamaz mı?|E|Penguenler uçamayan, yüzmeye uyum sağlamış kuşlardır.
Kutup ayıları doğal yaşam alanlarında penguenlerle birlikte yaşar mı?|H|Kutup ayıları Arktik'te, penguenler doğal olarak Güney Yarımküre'de yaşar; doğal dağılımları çakışmaz.
Balinalar yavrularını sütle besler mi?|E|Balinalar memelidir ve yavrularını sütle besler.
Yunuslar solungaçlarıyla suyun altında nefes alır mı?|H|Yunuslar akciğerleriyle hava solur, bu nedenle yüzeye çıkar.
Köpekbalıklarının iskeleti büyük ölçüde kıkırdaktan mı oluşur?|E|Köpekbalıkları kıkırdaklı balıklar grubundadır.
Bir örümcek biyolojik olarak böcek sayılır mı?|H|Örümcekler örümceğimsidir; böcekler ayrı bir eklembacaklı sınıfıdır.
Böceklerin yetişkin halinde genellikle altı bacağı var mıdır?|E|Böceklerde üç çift bacak bulunur.
Zürafanın boyun omuru sayısı genellikle insanınkiyle aynı mıdır?|E|Her ikisinde de genellikle yedi boyun omuru bulunur.
Develer hörgüçlerinde su mu depolar?|H|Hörgüçlerde su değil yağ depolanır.
Erkek denizatları yavruları taşıyan bireyler olabilir mi?|E|Dişinin bıraktığı yumurtalar erkeğin kuluçka kesesinde gelişir.
Devekuşları tehlikeden kaçmak için başlarını kuma gömer mi?|H|Bu yaygın bir efsanedir; yuvadaki yumurtalara eğilmeleri yanlış yorumlanabilir.
Flamingoların pembe rengi besinleriyle ilişkili midir?|E|Besinlerdeki karotenoid pigmentler tüylerin pembe renginde rol oynar.
Koalalar ayı ailesinin bir üyesi midir?|H|Koalalar ayı değil keseli memelidir.
Ornitorenk yumurtlayan bir memeli midir?|E|Ornitorenk, yumurtlayan tek delikli memelilerden biridir.
Bütün memeliler canlı yavru mu doğurur?|H|Ornitorenk ve ekidneler gibi tek delikli memeliler yumurtlar.
Bir kelebek yaşamına tırtıl olarak mı başlar, yani hiç yumurta dönemi yok mudur?|H|Kelebek yaşam döngüsü yumurtayla başlar; tırtıl larva evresidir.
Kelebekler başkalaşım sırasında pupa evresinden geçer mi?|E|Tam başkalaşım yumurta, larva, pupa ve yetişkin evrelerinden oluşur.
Karıncalar da böcek midir?|E|Karıncalar altı bacaklı böceklerdir.
Bir salyangozun kabuğu büyüdükçe kendisi tarafından oluşturulur mu?|E|Manto dokusu kabuğun büyümesine katılan maddeleri salgılar.
Bütün denizyıldızları mutlaka beş kollu mudur?|H|Beş kollu türler yaygındır ama daha fazla kollu türler de vardır.
Denizanalarının insanlardaki gibi bir kalbi var mıdır?|H|Denizanalarında insanlardaki gibi kalp ve damar sistemi bulunmaz.
Deniz süngerleri bitki değil hayvan mıdır?|E|Süngerler hayvanlar âleminde sınıflandırılır.
Mercanlar temelde hayvansal canlılardan mı oluşur?|E|Mercan polipleri hayvandır; birçok mercan fotosentetik ortaklarla birlikte yaşar.
Yılanların göz kapaklarını kapatarak göz kırpması mümkün müdür?|H|Yılanların gözleri saydam bir pulla örtülüdür; hareketli göz kapakları yoktur.
Kaplumbağalar kabuklarından çıkıp başka bir kabuğa taşınabilir mi?|H|Kabuk iskeletlerinin bir parçasıdır; çıkarılabilir bir ev değildir.
Yengeçler büyürken dış iskeletlerini değiştirebilir mi?|E|Kabuk değiştirme, eklembacaklıların büyümesine olanak sağlar.
Istakozlar da kabuk değiştiren eklembacaklılar mıdır?|E|Istakozlar büyüme sürecinde dış iskeletlerini değiştirir.
Bir bal arısının yalnızca iki gözü mü vardır?|H|İki bileşik gözüne ek olarak üç basit gözü bulunur.
Ahtapotlar omurgalı hayvanlar mıdır?|H|Ahtapotlar omurgasız yumuşakçalardır.
Güvercinler yavrularını kursak sütü denen bir salgıyla besleyebilir mi?|E|Hem dişi hem erkek güvercin kursak sütü üretir.
Bütün kuş türleri uçabilir mi?|H|Devekuşu ve penguen gibi uçamayan kuşlar vardır.
Yarasalar aktif uçabilen memeliler midir?|E|Yarasalar kanat çırparak sürdürülebilir aktif uçuş yapabilen memelilerdir.
Uçan sincaplar yarasalar gibi kanat çırparak mı uçar?|H|Uçan sincaplar deri zarlarıyla süzülür, yarasalar gibi aktif uçmaz.
Kurbağalar yaşamlarının bazı evrelerinde başkalaşım geçirir mi?|E|Birçok kurbağa türünde iribaş evresi yetişkin forma dönüşür.
Timsahlar sıcakkanlı birer memeli midir?|H|Timsahlar vücut ısısı çevreden etkilenen sürüngenlerdir.
Bütün köpekbalıkları yumurtlayarak mı çoğalır?|H|Bazı türler yumurtlar, bazıları canlı yavru doğurur.
Ahtapotlar vücut renklerini değiştirebilir mi?|E|Derilerindeki pigment hücreleri ve diğer yapılar renk değiştirmeyi sağlar.
''')
yesno('uzay','''Venüs'teki bir eksen dönüşü, Güneş çevresindeki bir turundan daha uzun mudur?|E|Venüs yaklaşık 243 Dünya gününde döner, yaklaşık 225 günde yörüngesini tamamlar.
Güneş Sistemi'nin en sıcak gezegeni Güneş'e en yakın olan Merkür müdür?|H|Güçlü sera etkisi nedeniyle Venüs'ün ortalama yüzeyi daha sıcaktır.
Venüs, Dünya'ya göre ters yönde dönen gezegenlerden biri midir?|E|Venüs'ün eksen dönüşü geriye doğrudur.
Satürn Güneş Sistemi'nde halkası olan tek gezegen midir?|H|Jüpiter, Uranüs ve Neptün'ün de halkaları vardır.
Jüpiter katı yüzeyli bir kaya gezegeni midir?|H|Jüpiter bir gaz devidir; Dünya'daki gibi belirgin katı yüzeyi yoktur.
Güneş bir yıldız mıdır?|E|Güneş, Güneş Sistemi'nin merkezindeki yıldızdır.
Ay kendi ışığını üreterek mi parlar?|H|Ay çoğunlukla Güneş'ten aldığı ışığı yansıtır.
Ay'ın evreleri genellikle Dünya'nın gölgesinin Ay'a düşmesinden mi oluşur?|H|Evreler aydınlanan yarının bize görünen kısmıyla ilgilidir; Dünya'nın gölgesi Ay tutulmasında rol oynar.
Ay'ın Dünya'ya yaklaşık hep aynı yüzünü göstermesi, kendi ekseninde döndüğü anlamına gelir mi?|E|Ay'ın dönüş süresi yörünge süresine eşittir; bu eşzamanlı dönüştür.
Ay'ın uzak yüzü her zaman karanlıkta mı kalır?|H|Uzak yüz de Güneş ışığı alır; uzak yüz ile karanlık yüz aynı kavram değildir.
Mars'ta günbatımı çevresinde Güneş'in yakınındaki gökyüzü mavi görünebilir mi?|E|Mars tozu ışığı Dünya'dakinden farklı saçar; Güneş çevresinde mavilik görülebilir.
Uzay boşluğunda ses, hava olmadan normal biçimde yayılır mı?|H|Ses mekanik dalgadır ve yayılmak için maddesel bir ortam gerekir.
Uzay istasyonundaki astronotlar Dünya'nın kütleçekimi tamamen bittiği için mi ağırlıksız görünür?|H|İstasyon ve astronotlar birlikte sürekli serbest düşüş halindedir.
Dünya Güneş çevresinde dolanırken kendi ekseninde de döner mi?|E|Dünya hem günlük eksen dönüşü hem yıllık yörünge hareketi yapar.
Plüton günümüzde sekiz ana gezegenden biri olarak mı sınıflandırılır?|H|Plüton cüce gezegen olarak sınıflandırılır.
Kuyruklu yıldızların kuyrukları genel olarak Güneş'ten uzak yöne uzanır mı?|E|Güneş rüzgârı ve ışınım basıncı kuyrukları Güneş'ten uzağa yöneltir.
Bir meteor göktaşı olarak yere ulaşmadan önce atmosferde ışık izi oluşturabilir mi?|E|Atmosfere girişte oluşan ışık olayı meteordur; yere ulaşan parçaya meteorit denir.
Bir ışık yılı zaman değil uzaklık birimi midir?|E|Işık yılı, ışığın bir yılda aldığı uzaklıktır.
Kutup Yıldızı gökyüzündeki en parlak yıldız mıdır?|H|Gece gökyüzündeki en parlak yıldız Sirius'tur; Kutup Yıldızı yön bulmadaki konumuyla tanınır.
Güneş tutulmasında Ay, Dünya ile Güneş arasına girer mi?|E|Ay'ın uygun hizalanmada Güneş'i örtmesi Güneş tutulması oluşturur.
Ay tutulmasında Güneş, Dünya ile Ay arasına mı girer?|H|Ay tutulmasında Dünya, Güneş ile Ay arasındadır.
Uranüs çok eğik dönme ekseni nedeniyle yan yatmış gibi mi döner?|E|Yaklaşık 98 derecelik eksen eğikliği bu benzetmeye yol açar.
Mars'ın Phobos ve Deimos adlı iki uydusu var mıdır?|E|Mars'ın iki doğal uydusu bu adları taşır.
Merkür'ün Dünya gibi büyük bir doğal uydusu var mıdır?|H|Merkür'ün doğal uydusu yoktur.
Samanyolu yalnızca Güneş ve sekiz gezegenden mi oluşur?|H|Samanyolu çok sayıda yıldız, gaz ve toz içeren bir galaksidir; Güneş Sistemi onun küçük bir parçasıdır.
''')
yesno('dunya','''Antarktika, az yağış aldığı için bir çöl sayılır mı?|E|Çöl tanımı yalnızca sıcaklığa değil yağış azlığına dayanır; Antarktika kutup çölüdür.
Dünya'daki bütün çöller sürekli sıcak mıdır?|H|Soğuk ve kutupsal çöller de vardır.
Pasifik Okyanusu Atlantik Okyanusu'ndan daha büyük müdür?|E|Pasifik, Dünya'nın en büyük okyanus havzasıdır.
Dünya'nın en derin gölü Baykal mıdır?|E|Baykal Gölü yaklaşık 1.642 metrelik derinliğiyle bilinir.
Ölü Deniz'in suyu tatlı mıdır?|H|Ölü Deniz çok tuzlu bir göldür.
Hazar Denizi coğrafi olarak dünyanın en büyük kapalı gölü kabul edilir mi?|E|Adında deniz geçse de kapalı bir iç su kütlesidir.
İstanbul hem Avrupa hem Asya kıtalarında yer alır mı?|E|İstanbul Boğazı'nın iki yakasında kentin Avrupa ve Asya bölümleri bulunur.
İstanbul Türkiye'nin başkenti midir?|H|Türkiye'nin başkenti Ankara'dır.
Avustralya'nın başkenti Sydney midir?|H|Başkent Canberra'dır.
Brezilya'nın resmî dili Portekizce midir?|E|Brezilya'nın resmî dili Portekizcedir.
Brezilya'nın başkenti Rio de Janeiro mudur?|H|Brezilya'nın başkenti Brasília'dır.
İsviçre'nin denize kıyısı var mıdır?|H|İsviçre denize kıyısı olmayan bir Avrupa ülkesidir.
Nepal bayrağı alışılmış dörtgen ulusal bayraklardan farklı bir şekle sahip midir?|E|Nepal bayrağı birleşik iki üçgen biçimindedir.
Kanada bayrağında meşe yaprağı mı vardır?|H|Kanada bayrağında stilize akçaağaç yaprağı vardır.
Avrupa Birliği bayrağındaki yıldız sayısı üye ülke sayısıyla birlikte değişir mi?|H|Bayraktaki yıldız sayısı sabit olarak on ikidir.
ABD bayrağında yıldızlar eyaletleri temsil eder mi?|E|Bayraktaki elli yıldız elli eyaleti temsil eder.
Kuzey Kutbu bir kara kıtasının üzerinde midir?|H|Coğrafi Kuzey Kutbu Arktik Okyanusu üzerindedir.
Güney Kutbu Antarktika kıtası üzerinde midir?|E|Coğrafi Güney Kutbu Antarktika'nın buz örtüsü üzerindedir.
Dünya'nın eksen eğikliği mevsimlerin oluşmasında temel etken midir?|E|Eksen eğikliği yıl boyunca ışınların gelişini ve gün uzunluğunu değiştirir.
Kuzey ve Güney Yarımküre aynı anda genellikle aynı mevsimi mi yaşar?|H|Yarımkürelerde mevsimler ters zamanlarda yaşanır.
Ekvator Dünya'yı kuzey ve güney yarımkürelere ayırır mı?|E|Ekvator sıfır derece enlemdir ve iki yarımküreyi ayırır.
Başlangıç meridyeni enlem ölçmek için mi kullanılır?|H|Başlangıç meridyeni boylam için referanstır; enlem Ekvator'a göre ölçülür.
Dünya'nın yüzeyi kusursuz bir küre biçiminde midir?|H|Dünya kutuplardan basık, Ekvator çevresinde şişkin bir şekle yakındır.
Volkanlar okyanus tabanında da oluşabilir mi?|E|Denizaltı volkanları okyanuslarda yaygındır.
Buzdağları yalnızca donmuş deniz suyundan mı oluşur?|H|Buzdağları çoğunlukla karada oluşmuş tatlı su buzul buzunun kopmasıyla oluşur.
Gelgitlerin oluşmasında Ay'ın çekimi önemli bir rol oynar mı?|E|Ay ve Güneş'in kütleçekimi gelgitleri etkiler; Ay'ın katkısı başlıcadır.
Tsunami sıradan biçimde rüzgârın oluşturduğu bir dalga mıdır?|H|Tsunamiler çoğunlukla deniz tabanının ani yer değiştirmesinden kaynaklanır.
Pamukkale'nin beyaz travertenleri mineral çökelmesiyle mi oluşur?|E|Kalsiyum karbonatın çökelmesi beyaz travertenleri oluşturur.
Kapadokya'daki peribacaları yalnızca insanlar tarafından oyularak mı oluşturuldu?|H|Ana şekiller volkanik malzemelerin aşınmasıyla doğal olarak oluşmuştur; bazıları sonradan oyulmuştur.
Van Gölü'nün suyu sodalı ve tuzlu mudur?|E|Van Gölü sodalı, tuzlu bir kapalı havza gölüdür.
''')
yesno('insan','''İnsan vücudunun en büyük organı deri midir?|E|Deri vücudu kaplayan en büyük organdır.
İnsanların sağ ve sol akciğerleri eşit sayıda loba mı sahiptir?|H|Sağ akciğer üç, sol akciğer iki lobludur.
İnsanların normalde iki çift, yani dört akciğeri mi vardır?|H|İnsanlarda sağ ve sol olmak üzere iki akciğer bulunur.
Dilin farklı bölgeleri yalnızca tek bir tadı algılar biçimindeki keskin tat haritası doğru mudur?|H|Tat duyuları dilin geniş bölgelerinde algılanabilir; keskin bölgelere ayrılmış harita doğru değildir.
Umami temel tatlardan biri midir?|E|Umami tatlı, tuzlu, ekşi ve acıyla birlikte beş temel tattandır.
Diş minesi insan vücudundaki en sert dokulardan biri midir?|E|Diş minesi yoğun mineral yapısıyla vücudun en sert dokusudur.
İnsan iskeletindeki bütün kemikler ömür boyunca aynı sayıda ayrı parça olarak mı kalır?|H|Büyüme sırasında bazı kemikler birleşir; sayı yaşla değişebilir.
Orta kulakta çekiç, örs ve üzengi adlı kemikçikler var mıdır?|E|Bu üç küçük kemik ses titreşimlerinin iletimine katılır.
Kırmızı kan hücreleri oksijen taşımada görev alır mı?|E|Hemoglobin içeren kırmızı kan hücreleri oksijen taşır.
İnsanların yalnızca yüzde onluk beyin bölümünü kullandığı iddiası doğru mudur?|H|Bu bir efsanedir; farklı görevlerde beynin çok sayıda bölgesi etkinleşir.
Göz bebeği kas dokusundan yapılmış siyah bir disk midir?|H|Göz bebeği irisin ortasındaki açıklıktır.
Gözün renkli bölümü iris midir?|E|İris, göz bebeğinin çevresindeki renkli bölümdür.
İnsanların kalbi dört odacıklı mıdır?|E|İki kulakçık ve iki karıncıktan oluşur.
İnsan kalbi göğüs kafesinin bütünüyle sağ tarafında mı bulunur?|H|Normal anatomide kalp göğsün orta bölümünde, büyük kısmı sola uzanacak biçimdedir.
İnsanların doğal dişleri kırıldıktan sonra köpekbalığı dişleri gibi sürekli yeniden çıkar mı?|H|İnsanlar süt ve kalıcı diş dizilerine sahiptir; kalıcı dişler sürekli yenilenmez.
''')
yesno('bitki-gida','''Mantarlar biyolojik sınıflamada bitki sayılır mı?|H|Mantarlar bitkilerden ayrı bir âlem oluşturur.
Bambu bir çimen akrabası, yani buğdaygiller üyesi midir?|E|Bambular buğdaygiller ailesindendir.
Yer fıstığı botanik olarak baklagil midir?|E|Yer fıstığı fasulye ve mercimekle aynı ailede bir baklagildir.
Yer fıstığının meyveleri genellikle ağacın dallarında mı olgunlaşır?|H|Yer fıstığının meyveleri toprağın altında gelişir.
Kakao çekirdekleri bir ağacın meyvelerinin içinde mi büyür?|E|Kakao çekirdekleri kakao ağacının meyvelerindeki tohumlardır.
Beyaz çikolata mutlaka koyu renk veren kakao kuru maddesini içerir mi?|H|Beyaz çikolatada kakao yağı bulunur; koyu renkli kakao kuru maddesi bulunmaz.
Vanilya bir orkide türünden mi elde edilir?|E|Ticari vanilya bazı Vanilla cinsi orkidelerin meyvelerinden elde edilir.
Tarçın bitkinin iç kabuğundan mı elde edilir?|E|Tarçın ağacının iç kabuğu baharat olarak kullanılır.
Safran bitkinin kökünden mi elde edilir?|H|Safran çiçeğinin tepeciklerinden elde edilir.
Karanfil baharatı kurutulmuş çiçek tomurcuğu mudur?|E|Karanfil ağacının açılmamış çiçek tomurcukları kurutulur.
Zencefil mutfakta kök dense de botanik olarak bir rizom mudur?|E|Yenen bölüm yer altında büyüyen bir gövde, yani rizomdur.
Patatesin yediğimiz kısmı bitkinin meyvesi midir?|H|Patatesin yenen yumrusu değişime uğramış gövdedir.
Domates botanik açıdan meyve midir?|E|Çiçeğin yumurtalığından gelişen, tohum içeren bir meyvedir.
Salatalık botanik açıdan meyve sayılır mı?|E|Mutfakta sebze sayılsa da botanik olarak meyvedir.
Çileğin dışındaki küçük noktalar botanik açıdan ayrı küçük meyvecikler midir?|E|Dıştaki akenler küçük meyvelerdir; her birinin içinde bir tohum bulunur.
Bütün kaktüslerin yaprakları geniş ve yassı mıdır?|H|Çoğu kaktüste yapraklar dikenlere dönüşmüştür; fotosentezin büyük kısmını gövde yapar.
Bitkiler yalnızca gündüz mü solunum yapar?|H|Canlı bitki hücreleri hem gündüz hem gece solunum yapar.
Yeşil bitkilerde fotosentez için ışık gerekli midir?|E|Fotosentezin ışığa bağlı tepkimeleri ışık enerjisini kullanır.
Siyah ve yeşil çay aynı bitki türünden elde edilebilir mi?|E|Her ikisi de Camellia sinensis'ten elde edilir; işleme biçimleri farklıdır.
Kahve çekirdeği aslında kahve meyvesinin tohumu mudur?|E|Kavrulan kahve çekirdekleri meyvenin içindeki tohumlardır.
Ananas yüksek bir ağacın dallarında mı büyür?|H|Ananas yere yakın otsu bir bitkinin üzerinde gelişir.
Olgunlaşmış ayçiçeği başları gün boyunca sürekli Güneş'i takip eder mi?|H|Genç bitkiler takip hareketi yapar; olgun çiçek başları çoğunlukla doğuya yönelir.
Bir ağacın bütün yaş halkaları her koşulda kusursuz birer takvim yılına eşit midir?|H|İklim ve büyüme koşulları eksik ya da yalancı halkalar oluşturabilir.
Acı biberin yakıcılığında kapsaisin etkili midir?|E|Kapsaisin ısı ve ağrı algısıyla ilişkili reseptörleri uyarır.
Nane ferahlığı ağızdaki sıcaklığı mutlaka gerçekten düşürdüğü için mi hissedilir?|H|Mentol soğuk algısıyla ilişkili reseptörleri uyarır; duyum gerçek sıcaklık düşüşü gerektirmez.
''')
yesno('bilim-teknoloji','''Uçakların kara kutuları genellikle siyah renkte midir?|H|Kolay bulunmaları için çoğunlukla parlak turuncudur.
Standart bir QR kodun üç köşesinde büyük konum işaretleri var mıdır?|E|Bu üç işaret tarayıcının kodu yönlendirmesine yardım eder.
Bir barkodla QR kodu aynı tek boyutlu biçim midir?|H|Klasik çizgili barkod bir boyutlu, QR kod iki boyutludur.
Bluetooth adı tarihî bir kralın lakabından mı gelir?|E|Ad, Danimarka kralı Harald Bluetooth'un lakabından gelir.
Bluetooth'un çalışması için mutlaka internet bağlantısı gerekir mi?|H|Bluetooth cihazlar arasında kısa mesafeli kablosuz bağlantı kurabilir; internet şart değildir.
GPS konum belirlemede uydulardan gelen sinyallerden yararlanır mı?|E|GPS alıcısı uydu sinyalleriyle konumunu hesaplar.
Wi-Fi ile internet tamamen aynı şey midir?|H|Wi-Fi yerel kablosuz bağlantı teknolojisidir; internet ayrı bir ağlar bütünüdür.
Bir termosta vakum kullanılması ısı aktarımını azaltabilir mi?|E|Vakum, iletim ve taşınım yoluyla ısı geçişini azaltır.
Bir mıknatıs bütün metal türlerini aynı biçimde güçlüce çeker mi?|H|Demir gibi bazı metaller güçlü tepki verir; bütün metaller aynı özelliği göstermez.
Paslanmaz çelik, koşullar ne olursa olsun asla paslanmaz mı?|H|Uygunsuz koşullarda paslanmaz çelikte de korozyon oluşabilir.
Cam normal oda sıcaklığında yavaşça akan sıradan bir sıvı mıdır?|H|Cam amorf katıdır; eski camların kalınlığı normal oda sıcaklığında akmayla açıklanmaz.
Cam üretiminde silis kumu önemli bir hammadde midir?|E|Birçok cam türünün ana hammaddesi silistir.
Elektrik kablolarında bakır kullanılması iyi iletken olmasıyla ilişkili midir?|E|Bakır iyi elektrik iletkenliği nedeniyle yaygın kullanılır.
Gökkuşağı oluşumunda ışığın su damlalarında kırılması ve yansıması rol oynar mı?|E|Işık damlada kırılır, içten yansır ve renklerine ayrılır.
Gökkuşağı tam olarak yedi ayrı ve keskin renk şeridinden mi oluşur?|H|Görünür tayf süreklidir; yedi renk geleneksel bir sınıflamadır.
Şimşeği gök gürültüsünden önce görmemizin nedeni ışığın daha hızlı olması mıdır?|E|Işık sesten çok daha hızlı yayıldığı için önce ışık görülür.
Bir yıldırım aynı yere birden fazla kez düşebilir mi?|E|Yıldırım aynı yapıya veya noktaya tekrar tekrar düşebilir.
Saf su normal basınçta her sıcaklıkta mutlaka sıvı halde midir?|H|Sıcaklığa göre katı, sıvı ya da gaz halde bulunabilir.
Su donduğunda genellikle hacmi küçülür mü?|H|Normal buz yapısı sıvı sudan daha düşük yoğunluktadır; donarken hacim artar.
Buzun suda yüzmesi, buzun sıvı sudan daha düşük yoğunlukta olmasıyla açıklanır mı?|E|Buzun daha düşük yoğunluğu yüzmesini sağlar.
''')
yesno('kultur','''Standart modern piyanoda 88 tuş var mıdır?|E|Yaygın standart 52 beyaz ve 36 siyah tuştur.
Piyanodaki siyah tuş sayısı beyaz tuş sayısından fazla mıdır?|H|Standart piyanoda 36 siyah, 52 beyaz tuş vardır.
Keman yayla çalınan telli bir çalgı mıdır?|E|Keman yaylı çalgılar ailesindedir.
Klarnet yaylı çalgılar ailesinde midir?|H|Klarnet tek kamışlı bir üflemeli çalgıdır.
The Beatles'ın klasik kadrosu dört kişiden mi oluşur?|E|Lennon, McCartney, Harrison ve Starr klasik dörtlüdür.
Beethoven'ın Dokuzuncu Senfonisi'nde insan sesi kullanılır mı?|E|Son bölüm koro ve solistlerle ünlüdür.
Vivaldi'nin Dört Mevsim'i bir resim dizisi midir?|H|Dört Mevsim dört keman konçertosundan oluşan müzik eseridir.
Mona Lisa tablosunu Leonardo da Vinci mi yaptı?|E|Mona Lisa, Leonardo da Vinci'nin eseridir.
Mona Lisa günümüzde Roma'daki Kolezyum'da mı sergilenir?|H|Tablo Paris'teki Louvre Müzesi'nde sergilenir.
Michelangelo'nun Davut heykeli mermerden yapılmış mıdır?|E|Ünlü Davut heykeli mermerden oyulmuştur.
Satrançta bir piyon son sıraya ulaşınca başka bir taşa dönüşebilir mi?|E|Piyon vezir, kale, fil veya ata terfi edebilir.
Satrançta şah normal bir hamlede üç kare ilerleyebilir mi?|H|Şah normal hamlede bir kare gider; rok özel bir hamledir.
Satrançta rok hem şahın hem kalenin hareket ettiği özel bir hamle midir?|E|Rokta şah ve kale belirli koşullarla birlikte hareket eder.
Bir satranç oyununa her oyuncu iki vezirle mi başlar?|H|Başlangıçta her oyuncunun bir veziri vardır.
Harry Potter'ın ana roman serisi yedi kitaptan mı oluşur?|E|Ana roman serisi yedi kitaptır.
Sherlock Holmes gerçek bir tarihî polis memuru mudur?|H|Sherlock Holmes, Arthur Conan Doyle'un kurmaca dedektifidir.
Küçük Prens'in yazarı Antoine de Saint-Exupéry aynı zamanda pilot muydu?|E|Saint-Exupéry yazarlığının yanında havacılık yaptı.
Don Kişot romanını William Shakespeare mi yazdı?|H|Don Kişot'un yazarı Miguel de Cervantes'tir.
İstiklâl Marşı'nın sözlerini Mehmet Âkif Ersoy mu yazdı?|E|Marşın şairi Mehmet Âkif Ersoy'dur.
Türk alfabesinde Q, W ve X resmî harfler arasında mıdır?|H|Türk alfabesinin 29 harfi arasında bu üç harf bulunmaz.
''')
yesno('tarih','''Eyfel Kulesi başlangıçta kalıcı olması kesinleşmiş bir yapı olarak mı planlandı?|H|İlk plan 20 yıl ayakta kalmasıydı; bilimsel ve iletişim amaçları korunmasına katkı sağladı.
Eyfel Kulesi 1889 Dünya Fuarı için mi yapıldı?|E|Kule Paris'teki 1889 Dünya Fuarı için inşa edildi.
Özgürlük Heykeli Fransa'dan ABD'ye bir armağan mıydı?|E|Heykel Fransız halkının ABD'ye armağanı olarak tasarlandı.
Özgürlük Heykeli'nin dış yüzeyi katı altından mı yapılmıştır?|H|Heykelin dış kaplaması bakırdır; meşalede altın varak vardır.
Titanic'in dört bacasının tümü aynı işlevde kazan dumanı mı atıyordu?|H|Dördüncü baca esas olarak havalandırma ve görünüm amacı taşıyordu.
Titanic ilk seferinde mi battı?|E|Titanic 1912'deki ilk transatlantik seferinde battı.
Berlin Duvarı'nın geçişlere açılması 1989 yılında mı oldu?|E|Geçişler 9 Kasım 1989'da açıldı.
İlk modern Olimpiyatlar Paris'te mi düzenlendi?|H|İlk modern Olimpiyatlar 1896'da Atina'da yapıldı.
Ay'a ilk ayak basan insan Neil Armstrong muydu?|E|Armstrong, Apollo 11 göreviyle Ay'a ilk adımı attı.
Uzaya çıkan ilk insan Neil Armstrong muydu?|H|İlk insan Yuri Gagarin'dir; 1961'de Vostok 1 ile uçtu.
Ankara, Cumhuriyet ilanından önce başkent ilan edilmiş miydi?|E|Ankara 13 Ekim 1923'te, Cumhuriyet ise 29 Ekim'de ilan edildi.
TBMM Cumhuriyet ilanından sonra mı açıldı?|H|TBMM 23 Nisan 1920'de, Cumhuriyet'ten önce açıldı.
Türk alfabesi reformu 1928 yılında mı gerçekleşti?|E|Yeni Türk harfleri 1928'de kabul edildi.
İstanbul'un 1453'teki fethini Kanuni Sultan Süleyman mı gerçekleştirdi?|H|İstanbul'u Fatih Sultan Mehmet fethetti.
Anıtkabir İstanbul'da mıdır?|H|Anıtkabir Ankara'dadır.
''')
yesno('spor','''Bir maraton tam olarak 40 kilometre midir?|H|Resmî maraton mesafesi 42,195 kilometredir.
Olimpiyat simgesinde beş halka var mıdır?|E|Birbirine geçen beş halka Olimpiyatların simgesidir.
Futbolda kaleci dahil bir takım sahaya normalde on bir kişiyle çıkar mı?|E|Standart saha futbolunda takım on bir oyuncudan oluşur.
Futbolda kaleciler ellerini sahanın her yerinde serbestçe kullanabilir mi?|H|Kalecilerin el kullanma ayrıcalığı kendi ceza alanlarıyla sınırlıdır ve ek kurallara tabidir.
Basketbolda bir takım sahada aynı anda altı oyuncuyla mı oynar?|H|Bir basketbol takımı sahada beş oyuncuyla oynar.
Voleybolda normal salon takımının sahada altı oyuncusu olur mu?|E|Salon voleybolunda sahadaki oyuncu sayısı altıdır.
Teniste sıfır puan için İngilizce 'love' sözcüğü kullanılır mı?|E|Tenis puanlamasında sıfır 'love' olarak söylenir.
Bir bowling oyununda standart düzende on lobut bulunur mu?|E|Tenpin bowling on lobutla oynanır.
Usain Bolt'un 2009'daki 100 metre rekoru on saniyenin üzerinde miydi?|H|Bolt 9,58 saniye koştu; bu on saniyenin altındadır.
Michael Phelps olimpiyat madalyalarını atletizmde mi kazandı?|H|Phelps olimpiyat madalyalarını yüzme branşında kazandı.
''')
# The dedicated mixed pool is a stable, balanced selection of existing general questions.
bank=json.loads((ROOT/'data/questions.json').read_text())
levels=json.loads((ROOT/'data/question-levels.json').read_text())
general={id for ids in levels['generalQuestionIds'].values() for id in ids}
cats=list(dict.fromkeys(q['category'] for q in bank))
mixed=[]
for i,cat in enumerate(cats):
    pool=[q for q in bank if q['category']==cat and (q['id'] in general or q.get('difficulty')=='general')]
    pool.sort(key=lambda q:hashlib.sha256(('mixed-v1:'+q['id']).encode()).hexdigest())
    for q in pool[:14 if i<16 else 13]:
        mixed.append(dict(q,difficulty='general'))
assert len(estimate)==200,len(estimate)
assert len(binary)==200,len(binary)
assert len(mixed)==250,len(mixed)
for name,pool in [('estimate',estimate),('binary',binary),('mixed',mixed)]:
    assert len({q['id'] for q in pool})==len(pool)
    assert len({q['text'] for q in pool})==len(pool)
    content=json.dumps(pool,ensure_ascii=False,indent=2)+'\n'
    path=ROOT/f'data/quiz-{name}.json'
    if '--check' in sys.argv: assert path.read_text()==content,f'{name} pool differs from generator'
    else:path.write_text(content)
    print(name,len(pool),dict(Counter(q['category'] for q in pool)))
print('Binary answer balance:',dict(Counter(q['correct'] for q in binary)))
