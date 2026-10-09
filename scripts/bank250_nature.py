from bank250_common import grouped,rows

def expand_nature(questions,add):
    dinosaurs=rows('''
Tyrannosaurus|Zorba kertenkele|Teropod|ABD
Triceratops|Üç boynuzlu yüz|Seratopsiyen|ABD
Stegosaurus|Çatı kertenkele|Stegozor|ABD
Diplodocus|Çift kiriş|Sauropod|ABD
Brachiosaurus|Kol kertenkele|Sauropod|ABD
Allosaurus|Farklı kertenkele|Teropod|ABD
Velociraptor|Hızlı hırsız|Teropod|Moğolistan
Ankylosaurus|Kaynaşmış kertenkele|Ankilozor|ABD
Iguanodon|İguana dişi|Ornitopod|Birleşik Krallık
Parasaurolophus|Saurolophus'a yakın|Ornitopod|Kanada
Pachycephalosaurus|Kalın kafalı kertenkele|Pakisefalozor|ABD
Spinosaurus|Dikenli kertenkele|Teropod|Mısır
Carnotaurus|Etçil boğa|Teropod|Arjantin
Dilophosaurus|İki ibikli kertenkele|Teropod|ABD
Kentrosaurus|Dikenli kertenkele|Stegozor|Tanzanya
Styracosaurus|Dikenli kertenkele|Seratopsiyen|Kanada
Protoceratops|İlk boynuzlu yüz|Seratopsiyen|Moğolistan
Psittacosaurus|Papağan kertenkele|Seratopsiyen|Moğolistan
Corythosaurus|Miğferli kertenkele|Ornitopod|Kanada
Lambeosaurus|Lambe'nin kertenkelesi|Ornitopod|Kanada
Edmontosaurus|Edmonton kertenkelesi|Ornitopod|Kanada
Ceratosaurus|Boynuzlu kertenkele|Teropod|ABD
Deinonychus|Korkunç pençe|Teropod|ABD
Coelophysis|İçi boş biçim|Teropod|ABD
Plateosaurus|Geniş kertenkele|Plateozorid|Almanya
Abelisaurus|Abel'in kertenkelesi|Teropod|Arjantin
Acrocanthosaurus|Yüksek dikenli kertenkele|Teropod|ABD
Aegyptosaurus|Mısır kertenkelesi|Sauropod|Mısır
Albertosaurus|Alberta kertenkelesi|Teropod|Kanada
Amargasaurus|La Amarga kertenkelesi|Sauropod|Arjantin
Argentinosaurus|Arjantin kertenkelesi|Sauropod|Arjantin
Baryonyx|Ağır pençe|Teropod|Birleşik Krallık
Carcharodontosaurus|Köpekbalığı dişli kertenkele|Teropod|Cezayir
Compsognathus|Zarif çene|Teropod|Almanya
Deinocheirus|Korkunç el|Teropod|Moğolistan
Dreadnoughtus|Hiçbir şeyden korkmayan|Sauropod|Arjantin
Patagosaurus|Patagonya kertenkelesi|Sauropod|Arjantin
Euoplocephalus|İyi zırhlanmış baş|Ankilozor|Kanada
Gallimimus|Tavuk taklitçisi|Teropod|Moğolistan
Giganotosaurus|Dev güney kertenkelesi|Teropod|Arjantin
Nodosaurus|Düğümlü kertenkele|Ankilozor|ABD
Edmontonia|Edmonton’dan gelen|Ankilozor|Kanada
Irritator|Rahatsız eden|Teropod|Brezilya
Maiasaura|İyi anne kertenkele|Ornitopod|ABD
Mamenchisaurus|Mamen Deresi kertenkelesi|Sauropod|Çin
Megalosaurus|Büyük kertenkele|Teropod|Birleşik Krallık
Oviraptor|Yumurta hırsızı|Teropod|Moğolistan
Sinosauropteryx|Çin kertenkele kanadı|Teropod|Çin
Therizinosaurus|Tırpan kertenkele|Teropod|Moğolistan
Utahraptor|Utah hırsızı|Teropod|ABD
''')
    for name,meaning,group,country in dinosaurs:
        add('dinozor',f'{name} cins adının Türkçeye yakın anlamı hangisidir?',meaning,[r[1] for r in dinosaurs],f'{name} adı yaklaşık olarak “{meaning.lower()}” anlamına gelir. Bilimsel adlar bazen görünüşü, bir yeri veya bir kişiyi anlatır.')
        add('dinozor',f'{name} aşağıdaki dinozor gruplarından hangisinde sınıflandırılır?',group,[r[2] for r in dinosaurs],f'{name}, {group.lower()} grubundadır. Gruplama fosil anatomisi ve evrimsel akrabalık üzerinden yapılır.')
        add('dinozor',f'{name} cinsinin ilk adlandırılmasına temel olan fosiller hangi ülkeden gelmiştir?',country,[r[3] for r in dinosaurs],f'{name} cinsinin ilk bilimsel tanımlanmasına temel olan buluntuların ülkesi {country}. Daha sonra başka ülkelerde de buluntular olabilir.')
    grouped(add,'hayvanlar','{} adıyla bilinen hayvan hangi sınıfa aittir?', '''
Vombat|Memeli
Tazmanya canavarı|Memeli
Echidna (dikenli karıncayiyen)|Memeli
Quokka|Memeli
Dugong|Memeli
Deniz ineği (manati)|Memeli
Mors|Memeli
Beluga|Memeli
Vaşak|Memeli
Karakulak|Memeli
Serval|Memeli
Fenek tilkisi|Memeli
Tapir|Memeli
Aardvark (yer domuzu)|Memeli
Aye-aye|Memeli
Binturong|Memeli
Kinkaju|Memeli
Saiga antilobu|Memeli
Takin|Memeli
Vigunya|Memeli
Kasuar|Kuş
Emu|Kuş
Kakapo|Kuş
Kea|Kuş
İbibik|Kuş
Yalıçapkını|Kuş
Arı kuşu|Kuş
Kelaynak|Kuş
Kaşıkçı kuşu|Kuş
Sekreter kuşu|Kuş
Harpya kartalı|Kuş
Fırkateyn kuşu|Kuş
Pufla ördeği|Kuş
Kutup sumrusu|Kuş
Bayağı kuzgun|Kuş
Tuatara|Sürüngen
Gila canavarı|Sürüngen
Yeşil iguana|Sürüngen
Kör yılan|Sürüngen
Nil timsahı|Sürüngen
Gavyal|Sürüngen
Cam kertenkele|Sürüngen
Yaprak kuyruklu geko|Sürüngen
Domates kurbağası|İki yaşamlı
Ok kurbağası|İki yaşamlı
Cam kurbağa|İki yaşamlı
Mağara semenderi (olm)|İki yaşamlı
Manta vatozu|Kıkırdaklı balık
Çekiç başlı köpekbalığı|Kıkırdaklı balık
Mersin balığı|Işınsal yüzgeçli balık
''')
    grouped(add,'hayvanlar','{} hangi özelliğiyle tanınır?', '''
Vombat|Küpü andıran dışkı üretmesi
Tazmanya canavarı|Güçlü çeneli etçil bir keseli olması
Echidna|Dikenli gövdesine rağmen yumurtlayan bir memeli olması
Dugong|Deniz çayırlarıyla beslenen deniz memelisi olması
Mors|Üst köpek dişlerinin uzun savunma dişlerine dönüşmesi
Beluga|Erişkinlerinin genellikle beyaz renkte olması
Karakulak|Kulaklarının ucundaki uzun siyah püsküller
Fenek tilkisi|Çöl yaşamına uyum sağlayan çok büyük kulaklar
Tapir|Kısa, hareketli hortum benzeri burun
Aardvark|Termit yuvalarını açmaya uygun güçlü kazıcı pençeler
Aye-aye|Ağaç içindeki böcekleri çıkarmaya yarayan ince uzun orta parmak
Binturong|Tutunmaya yarayan kavrayıcı kuyruk
Saiga antilobu|Aşağı sarkan büyük ve şişkin burun
Vigunya|Andlar'da yaşayan küçük ve ince yünlü bir devegil olması
Kasuar|Başının üstündeki miğfer benzeri yapı
Emu|Avustralya'ya özgü iri ve uçamayan bir kuş olması
Kakapo|Gece etkin olan uçamayan bir papağan olması
Kea|Dağlık Yeni Zelanda'da yaşayan meraklı bir papağan olması
İbibik|Yelpaze gibi açılabilen baş tüyleri
Yalıçapkını|Balık yakalamak için suya dalması
Arı kuşu|Uçarken yakaladığı böceklerle beslenmesi
Kelaynak|Tüysüz başı ve aşağı kıvrık gagası
Kaşıkçı kuşu|Ucu kaşık gibi genişleyen gaga
Sekreter kuşu|Uzun bacaklarla yerde yürüyerek avlanması
Harpya kartalı|Çok güçlü pençelerle orman memelilerini avlaması
Erkek fırkateyn kuşu|Kırmızı boğaz kesesini şişirmesi
Kutup sumrusu|Kuzey ve güney kutup bölgeleri arasında uzun göçler yapması
Tuatara|Günümüzdeki tek yaşayan gaga başlı sürüngen soyunu temsil etmesi
Gila canavarı|Zehirli bir kertenkele olması
Gavyal|Balık yakalamaya uygun çok ince ve uzun çene
Cam kertenkele|Bacaksız olsa da hareketli göz kapakları taşıması
Yaprak kuyruklu geko|Yaprağa benzeyen kuyruğuyla kamufle olması
Cam kurbağa|Bazı türlerinde karın derisinin saydam olması
Mağara semenderi (olm)|Karanlık mağara sularına uyum sağlamış soluk vücut
Çekiç başlı köpekbalığı|Başın yanlara doğru genişlemesi
Mersin balığı|Gövdesindeki sıra halinde kemiksi plakalar
Okçu balığı|Su püskürterek su üstündeki böcekleri düşürmesi
Çamur zıpzıpı|Kıyıda göğüs yüzgeçleriyle hareket edebilmesi
Balon balığı|Tehlike anında vücudunu şişirmesi
Fener balığı|Bazı derin deniz türlerinde ışıklı av cezbedici çıkıntı
Denizkestanesi|Dikenlerle kaplı küresel dış iskelet
Denizyıldızı|Tüp ayaklarla hareket etmesi
Denizhıyarı|Uzamış yumuşak gövdeli bir derisidikenli olması
At nalı yengeci|Mavi renkli hemolenfi ve at nalı biçimli kabuğu
Mantis karidesi|Avına çok hızlı ön uzuv darbeleri vurması
Hindistan cevizi yengeci|Karada yaşayabilen iri bir kabuklu olması
Yaprak kesen karıncalar|Kestikleri yapraklarda besin olarak mantar yetiştirmesi
Gübre böceği|Hayvan dışkısından toplar yapabilmesi
Su yürüyen böceği|Yüzey geriliminden yararlanarak su üzerinde durması
Ağustos böceği|Erkeklerin karın bölgesindeki organlarla güçlü ses çıkarması
''')
    grouped(add,'hayvanlar','Hayvan biyolojisinde {} neyi ifade eder?', '''
Metamorfoz|Başkalaşım
Ekolokasyon|Yankı yardımıyla yer belirleme
Kamuflaj|Çevreyle benzeşerek gizlenme
Mimikri|Başka bir canlıyı ya da onun sinyalini taklit etme
Aposematizm|Tehlikeyi belirgin renklerle haber verme
Hibernasyon|Kış uykusu
Estivasyon|Sıcak ve kurak dönemde etkinliği azaltma
Otçulluk|Bitkisel besinlerle beslenme
Etçillik|Hayvansal besinlerle beslenme
Hepçillik|Hem bitkisel hem hayvansal besin tüketme
Detritivorluk|Çürümüş organik artıklarla beslenme
Parazitlik|Konağa zarar vererek ondan yararlanma
Mutualizm|İki türün de yarar sağladığı ilişki
Kommensalizm|Biri yararlanırken diğerinin belirgin etkilenmediği ilişki
Sürü davranışı|Bireylerin topluluk halinde hareket etmesi
Göç|Yaşam alanları arasında düzenli yer değiştirme
Territoryal davranış|Belirli bir alanı savunma
Kur davranışı|Eşleşme öncesi iletişim ve gösteriler
Feromon|Tür içi iletişimde kullanılan kimyasal sinyal
Tüy değiştirme|Eski tüylerin yerini yenilerinin alması
Deri değiştirme|Dış örtünün büyümeyle birlikte yenilenmesi
Kuluçka|Yumurtanın gelişmesi için uygun koşulların sağlanması
Larva|Başkalaşım geçiren hayvanın erken gelişim evresi
Pupa|Tam başkalaşımda larva ile ergin arasındaki evre
Nimf|Eksik başkalaşımda ergine benzeyen genç evre
Solungaç|Sudaki oksijenin alınmasını sağlayan organ
Hemolenf|Açık dolaşım sistemindeki dolaşım sıvısı
Omurgasız|Omurgası bulunmayan hayvan
Endoskeleton|İç iskelet
Eksoskeleton|Dış iskelet
Radyal simetri|Vücut kısımlarının merkez çevresinde düzenlenmesi
Bilateral simetri|Vücudun sağ ve sol olarak iki benzer yarıya ayrılması
Notokord|Kordalıların gelişiminde bulunan destek çubuğu
Kloak|Sindirim ve üreme gibi yolların ortak çıkış açıklığı
Rumen|Geviş getirenlerin işkembe bölümü
Keratinin boynuzdaki görevi|Sert koruyucu yapıya katılmak
Melaninin derideki görevi|Pigment olarak renk oluşumuna katılmak
Yanal çizgi|Balıklarda su hareketlerini algılayan duyu sistemi
Ampullae of Lorenzini|Köpekbalıklarında elektrik alanını algılayan duyu yapıları
Tüp ayak|Derisidikenlilerde hareket ve tutunma yapısı
Kitin|Eklem bacaklıların dış iskeletinde bulunan yapı maddesi
Radula|Birçok yumuşakçada bulunan kazıyıcı beslenme organı
Manto|Yumuşakçalarda kabuk salgılayabilen doku örtüsü
Knidosit|Sölenterlerdeki yakıcı hücre
Pedipalp|Örümceğimsilerde ağız yakınındaki yardımcı uzuv
Keliser|Örümceğimsilerde ağız önündeki ilk uzuv çifti
Uropigial bez|Birçok kuşun tüy bakımında kullandığı yağ bezi
Siringks|Kuşların ses organı
Vibrissa|Memelilerin duyarlı bıyık kılı
Plasenta|Birçok memelide anne ile embriyo arasında madde alışverişini sağlayan yapı
''')
