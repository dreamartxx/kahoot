"""Replace 50 detail-heavy questions per category with approachable family quiz content."""
import json
from collections import Counter
from pathlib import Path
ROOT=Path(__file__).resolve().parent.parent

def refresh(questions,add):
    replaced=json.loads((ROOT/'data/easy-replacements.json').read_text())
    removed=set(sum(replaced.values(),[]))
    assert len(removed)==900 and removed.issubset({q['id'] for q in questions})
    questions[:]=[q for q in questions if q['id'] not in removed]
    counts=Counter()
    def put(cat,text,answer,options,explanation=''):
        add(cat,text,answer,options,explanation)
        questions[-1]['difficulty']='general'
        counts[cat]+=1
    def direct(cat,raw):
        for line in raw.strip().splitlines():
            text,answer,*wrong=line.split('|')
            assert len(wrong)==3,line
            put(cat,text,answer,[answer,*wrong])
    def pairs(cat,template,raw,pool):
        for line in raw.strip().splitlines():
            clue,answer=line.split('|')
            put(cat,template.format(clue),answer,pool)
    direct('cografya','''
Güneş'in doğduğu yönü karşına alırsan önün hangi yön olur?|Doğu|Batı|Kuzey|Güney
Güneş'in battığı yönün adı nedir?|Batı|Doğu|Kuzey|Güney
Pusulanın renkli ucu genellikle hangi ana yönü gösterir?|Kuzey|Güney|Doğu|Batı
Doğu ile kuzey arasındaki ara yön hangisidir?|Kuzeydoğu|Güneybatı|Güneydoğu|Kuzeybatı
Batı ile güney arasındaki ara yön hangisidir?|Güneybatı|Kuzeydoğu|Güneydoğu|Kuzeybatı
Dünya'nın küçük bir modeline ne ad verilir?|Yer küre|Kronometre|Dürbün|Termometre
Bir yerin kuş bakışı, küçültülmüş çizimine ne denir?|Harita|Portre|Heykel|Takvim
Yeryüzünün büyük bölümünü hangisi kaplar?|Sular|Çöller|Şehirler|Dağ zirveleri
Çevresi tamamen sularla kaplı kara parçası hangisidir?|Ada|Vadi|Ova|Plato
Üç tarafı suyla çevrili kara parçasına ne denir?|Yarımada|Göl|Boğaz|Vadi
Denizin karanın içine sokulan geniş bölümüne ne denir?|Körfez|Tepe|Ova|Zirve
Karalar arasında kalan dar deniz geçidine ne denir?|Boğaz|Dağ|Çöl|Yayla
Çevresine göre yüksek ve eğimli büyük yer şekli hangisidir?|Dağ|Ova|Kıyı|Göl
Dağlar arasında uzanan çukur alana ne denir?|Vadi|Ada|Yarımada|Okyanus
Geniş ve düz tarım alanları genellikle hangi yer şeklinde bulunur?|Ova|Uçurum|Zirve|Boğaz
Bir akarsuyun yüksekten döküldüğü yere ne denir?|Şelale|Çöl|Ada|Körfez
Yer altındaki doğal boşluklardan, içine girilebilen büyük olanı hangisidir?|Mağara|Ova|Tepe|Burun
Çok az yağış alan geniş kurak alanlara ne denir?|Çöl|Orman|Bataklık|Buzul gölü
Yıl boyunca kalın buzlarla kaplı geniş kütleye ne denir?|Buzul|Kumul|Delta|Kanyon
Bir bölgede uzun yıllar görülen hava koşullarının genel adı nedir?|İklim|Gün doğumu|Gelgit|Deprem
Bugün yağmur yağması aşağıdakilerden hangisine örnektir?|Hava durumu|Kıta hareketi|Yer şekli|Nüfus sayımı
Sıcaklığı ölçmek için hangi araç kullanılır?|Termometre|Pusula|Cetvel|Terazi
Havanın yatay yönde hareket etmesine ne denir?|Rüzgâr|Deprem|Gelgit|Heyelan
Bulutlardan sıvı su damlaları düşmesine ne denir?|Yağmur|Kar|Dolu|Kırağı
Bulutlardan yumuşak buz kristallerinin yağmasına ne denir?|Kar|Yağmur|Çiy|Sis
Bulutlardan buz taneleri yağmasına ne denir?|Dolu|Yağmur|Çiy|Rüzgâr
Yere yakın oluşan ve görüşü azaltan su damlacıkları ne oluşturur?|Sis|Deprem|Gölge|Kumul
Yağmurdan sonra Güneş ışığıyla gökyüzünde beliren renkli yay hangisidir?|Gökkuşağı|Kutup yıldızı|Ay tutulması|Samanyolu
Çakan ışıkla birlikte duyduğumuz gök gürültüsü en çok hangi hava olayıyla ilişkilidir?|Şimşek|Kar erimesi|Çiy|Hafif esinti
Uzun süre yağış olmaması hangi soruna yol açabilir?|Kuraklık|Çığ|Gelgit|Buz fırtınası
Aşırı yağışta suyun çevreye taşması hangi afet olabilir?|Sel|Deprem|Çığ|Volkan patlaması
Bir dağ yamacında büyük kar kütlesinin aşağı kaymasına ne denir?|Çığ|Gelgit|Sis|Hortum
Yer kabuğunun sarsılması hangi doğal olaydır?|Deprem|Gökkuşağı|Yağmur|Çiy
Ormanları korumak toprağın hangi yolla kaybını azaltır?|Erozyon|Ay tutulması|Gelgit|Kutup ışığı
Ağaçların yoğun olarak bir arada bulunduğu alana ne denir?|Orman|Çöl|Buzul|Okyanus
Akarsuların sularını döktüğü büyük tuzlu su alanı hangisi olabilir?|Deniz|Dağ|Yayla|Mağara tavanı
Dünya'nın yüzeyindeki suyun buharlaşıp yağışla geri dönmesine ne denir?|Su döngüsü|Besin zinciri|Saat dilimi|Kayaç yaşı
Su donduğunda hangi hâle geçer?|Katı|Gaz|Plazma|Buhar
Buz ısınarak eridiğinde neye dönüşür?|Sıvı su|Taş|Toprak|Tuz
Kuzey Yarımküre'de yaz yaşanırken Güney Yarımküre'de hangi mevsim yaşanır?|Kış|Yaz|İlkbahar|Sonbahar
Bir yıl içinde kaç mevsim sayarız?|Dört|İki|Altı|Sekiz
Yaprak döken birçok ağaç hangi mevsimde yapraklarını kaybeder?|Sonbahar|İlkbahar|Yaz başı|Yaz ortası
Kıştan sonra hangi mevsim gelir?|İlkbahar|Sonbahar|Yaz|Tekrar kış
Bir yerde yaşayan insan sayısına ne denir?|Nüfus|Yüzölçümü|Rakım|Yağış
İnsanların bir yerden başka bir yere yerleşmesine ne denir?|Göç|Gelgit|Erozyon|Buharlaşma
Şehirdeki çok katlı yapılar ve yollar en çok hangi çevre türüne örnektir?|İnsan yapımı çevre|Buzul çevresi|Dokunulmamış orman|Doğal mağara
Tarlada buğday yetiştirmek hangi ekonomik faaliyet türüdür?|Tarım|Madencilik|Balıkçılık|Turizm
Deniz kıyısında ağlarla balık yakalamak hangi faaliyet türüdür?|Balıkçılık|Ormancılık|Madencilik|Dokumacılık
Madenleri yer altından çıkarmak hangi faaliyet türüdür?|Madencilik|Turizm|Arıcılık|Tarım
Tarihi ve doğal yerleri görmek için yapılan geziler hangi faaliyetle ilişkilidir?|Turizm|Madencilik|Hayvancılık|Sanayi üretimi
''')
    pairs('ulkeler','{} hangi kıtada yer alır?', '''
Almanya|Avrupa
Fransa|Avrupa
İtalya|Avrupa
İspanya|Avrupa
Portekiz|Avrupa
Yunanistan|Avrupa
Bulgaristan|Avrupa
Hollanda|Avrupa
Belçika|Avrupa
İsviçre|Avrupa
Avusturya|Avrupa
Polonya|Avrupa
İsveç|Avrupa
Norveç|Avrupa
Finlandiya|Avrupa
Danimarka|Avrupa
İrlanda|Avrupa
Romanya|Avrupa
Macaristan|Avrupa
Hırvatistan|Avrupa
Japonya|Asya
Çin|Asya
Güney Kore|Asya
Hindistan|Asya
Pakistan|Asya
İran|Asya
Irak|Asya
Suudi Arabistan|Asya
Katar|Asya
Tayland|Asya
Vietnam|Asya
Malezya|Asya
Nepal|Asya
Moğolistan|Asya
Ürdün|Asya
Fas|Afrika
Cezayir|Afrika
Tunus|Afrika
Kenya|Afrika
Nijerya|Afrika
Güney Afrika Cumhuriyeti|Afrika
Gana|Afrika
Brezilya|Güney Amerika
Arjantin|Güney Amerika
Şili|Güney Amerika
Peru|Güney Amerika
Kolombiya|Güney Amerika
Uruguay|Güney Amerika
Ekvador|Güney Amerika
Paraguay|Güney Amerika
''',['Avrupa','Asya','Afrika','Güney Amerika'])
    pairs('turkiye','{} hangi coğrafi bölgemizdeki illerdendir?', '''
İstanbul|Marmara
Edirne|Marmara
Kırklareli|Marmara
Tekirdağ|Marmara
Kocaeli|Marmara
Sakarya|Marmara
Yalova|Marmara
Bursa|Marmara
İzmir|Ege
Aydın|Ege
Muğla|Ege
Manisa|Ege
Denizli|Ege
Uşak|Ege
Kütahya|Ege
Afyonkarahisar|Ege
Antalya|Akdeniz
Adana|Akdeniz
Mersin|Akdeniz
Hatay|Akdeniz
Isparta|Akdeniz
Burdur|Akdeniz
Osmaniye|Akdeniz
Ankara|İç Anadolu
Konya|İç Anadolu
Kayseri|İç Anadolu
Eskişehir|İç Anadolu
Sivas|İç Anadolu
Nevşehir|İç Anadolu
Kırşehir|İç Anadolu
Aksaray|İç Anadolu
Niğde|İç Anadolu
Yozgat|İç Anadolu
Kırıkkale|İç Anadolu
Samsun|Karadeniz
Trabzon|Karadeniz
Rize|Karadeniz
Ordu|Karadeniz
Giresun|Karadeniz
Sinop|Karadeniz
Erzurum|Doğu Anadolu
Van|Doğu Anadolu
Kars|Doğu Anadolu
Ağrı|Doğu Anadolu
Erzincan|Doğu Anadolu
Diyarbakır|Güneydoğu Anadolu
Şanlıurfa|Güneydoğu Anadolu
Gaziantep|Güneydoğu Anadolu
Mardin|Güneydoğu Anadolu
Batman|Güneydoğu Anadolu
''',['Marmara','Ege','Akdeniz','İç Anadolu','Karadeniz','Doğu Anadolu','Güneydoğu Anadolu'])
    direct('dinozor','''
Dinozorlar hakkında bilgi edinmek için en çok hangi kalıntılar incelenir?|Fosiller|Plastik oyuncaklar|Yeni yapılmış binalar|Gazete ilanları
Bir dinozorun sert dişleri en çok ne hakkında ipucu verir?|Ne yediği|Hangi sesi çıkardığı|Tam renginin ne olduğu|Adının nasıl yazıldığı
Dinozor iskeletini oluşturan sert parçalar nelerdir?|Kemikler|Yapraklar|Bulutlar|Kum taneleri
Dinozorların yaşadığı çağlarda henüz hangisi yoktu?|İnsanların kurduğu şehirler|Nehirler|Dağlar|Bitkiler
Dinozorlar ile modern insanlar için hangisi doğrudur?|Kuş olmayan dinozorlar insanlardan çok önce yaşadı|İnsanlar dinozorlarla şehir kurdu|Dinozorlar otomobil kullandı|İnsanlar bütün dinozorları evcilleştirdi
Otla ve yapraklarla beslenen bir dinozora ne denir?|Otçul|Etçil|Maden yiyici|Robot
Başka hayvanları yiyen dinozor hangi beslenme grubundadır?|Etçil|Otçul|Bitki|Mantar
Hem bitkisel hem hayvansal besin yiyen canlıya ne denir?|Hepçil|Sadece otçul|Sadece etçil|Cansız
Uzun boyunlu bir dinozorun boynu ona neyi kolaylaştırabilir?|Yüksekteki yapraklara ulaşmayı|Kanat çırpmayı|Ateş püskürtmeyi|Konuşmayı
Kuyruk, birçok dinozorun hareketinde hangi işe yardımcı olurdu?|Denge sağlamaya|Yumurta kabuğu yapmaya|Güneş ışığı üretmeye|Uçak gibi motor çalıştırmaya
Etçil dinozorların sivri dişleri en çok hangi işe uygundur?|Eti parçalamaya|Yapraklardan yuva örmeye|Taşları boyamaya|Su üretmeye
Otçul dinozorların yassı dişleri neyi öğütmeye daha uygundur?|Bitkileri|Demiri|Camı|Plastiği
Bir dinozor ayak izi dizisi bize hangisini gösterebilir?|Yürüdüğü yönü|Kesin deri rengini|Göz rengini|Tam olarak çıkardığı sesi
Bir fosil kazısında küçük fırçalar neden kullanılır?|Kalıntıya zarar vermeden toprağı temizlemek için|Fosili eritmek için|Kemikleri boyamak için|Yeni kemik üretmek için
Fosillerle çalışan araştırmacı bulduğu kemiği neden dikkatle çıkarır?|Kırılgan olabileceği için|Canlanacağı için|Işık saçacağı için|Uçacağı için
Bir müzede dinozor iskeleti sergilenmesinin temel amacı nedir?|Geçmiş canlıları tanıtmak|Canlı dinozor beslemek|Hava sıcaklığını ölçmek|Bitki yetiştirmek
Dinozorların yumurtadan çıkmış küçük bireyine ne denir?|Yavru|Kozalak|Fidan|Kristal
Dinozor yuvasında bulunabilecek fosillerden biri hangisidir?|Yumurta kabuğu|Cep telefonu|Cam şişe|Metal düğme
T. rex adıyla da bilinen güçlü çeneli dinozor hangisidir?|Tyrannosaurus rex|Triceratops|Stegosaurus|Diplodocus
Triceratops'un adını hatırlatan belirgin baş özelliği hangisidir?|Üç boynuzu|Fil hortumu|Ördek kanadı|Geyik gibi dallı boynuzları
Sırtındaki büyük kemik levhalarla çizilen dinozor hangisidir?|Stegosaurus|Tyrannosaurus rex|Velociraptor|Diplodocus
Ankylosaurus'un zırhlı vücudu neye karşı yardımcı olabilirdi?|Yırtıcılara karşı korunmaya|Uzaya uçmaya|Ağaçta meyve üretmeye|Işık yaymaya
Spinosaurus çizimlerinde sırtındaki yüksek yapı neye benzetilir?|Yelkene|Şemsiyenin sapına|Balıkçı ağına|Tekerleğe
Dinozorların yaşadığı karasal ortamlarda hangi bitkiler bulunabiliyordu?|Eğrelti otları|Plastik çiçekler|Metal ağaçlar|Cam çalılar
Bir dinozorun su içmesi hangi temel ihtiyacını karşılar?|Susuzluğunu gidermek|Uçmak|Işık üretmek|Taşa dönüşmek
Bir dinozorun ayakları ve bacakları öncelikle hangi işe yarar?|Hareket etmeye|Fotosenteze|Yumurta kabuğu oluşturmaya|Yağmur üretmeye
Dinozorların gözleri hangi duyu için kullanılırdı?|Görme|İşitme|Tat alma|Dokunma
Dinozorların burunları hangi duyuya yardımcı olurdu?|Koku alma|Renk görme|İşitme|Denge ölçme
Bütün dinozorların boyutları için hangisi doğrudur?|Küçük türler de çok büyük türler de vardı|Hepsi aynı büyüklükteydi|Hepsi bir fil kadar büyüktü|Hepsi bir karınca kadardı
Dinozorların beslenmesi için hangisi doğrudur?|Farklı türler farklı besinlerle beslenirdi|Hepsi sadece et yerdi|Hepsi sadece taş yerdi|Hiçbiri beslenmezdi
Dinozorların çizimlerdeki renkleri neden her zaman kesin bilgi değildir?|Birçok türün rengi fosilden kesin anlaşılamaz|Dinozorlar görünmezdi|Hepsi renksizdi|Gözleri renk üretirdi
Bir dinozorun taşlaşmış kemiği hangi kelimeyle anılır?|Fosil|Tomurcuk|Bulut|Buz sarkıtı
Bir dinozor fosilinin bulunduğu katmanı kaydetmek neden önemlidir?|Yaşı ve yaşadığı çevre hakkında ipucu verdiği için|Fosile yeni renk verdiği için|Kemiği canlı tuttuğu için|Yağmuru durdurduğu için
Bir dinozorun soyu tükenmişse bunun anlamı nedir?|O türün yaşayan bireyi kalmamıştır|Hepsi uyuyordur|Hepsi başka şehre gitmiştir|Hepsi küçülmüştür
Bir canlının yaşadığı doğal çevreyi anlatan kelime hangisidir?|Yaşam alanı|Oyuncak kutusu|Takvim|Pusula
Dinozorlar için bitkilerin bulunması neden önemliydi?|Besin zincirinin temelini oluşturdukları için|Hepsi uçmayı bitkilerden öğrendiği için|Bitkiler metal ürettiği için|Bitkiler zamanı durdurduğu için
Bir otçul dinozorun besin olarak seçmesi en olası olan hangisidir?|Yaprak|Taş parçası|Kemik|Deniz kabuğu
Bir etçil dinozorun av olarak seçmesi en olası olan hangisidir?|Başka bir hayvan|Kaya|Ağaç gövdesi|Bulut
Uzun boyunlu dev dinozorların çoğu kaç ayak üzerinde yürürdü?|Dört|Bir|Altı|Sekiz
T. rex yürürken temel olarak hangi uzuvlarını kullanırdı?|İki arka bacağını|İki kanadını|Sekiz kolunu|Yüzgeçlerini
Dinozorların fosilleri yalnızca tek bir kıtada mı bulunmuştur?|Hayır, farklı kıtalarda bulunmuştur|Evet, yalnız Avrupa'da|Evet, yalnız Afrika'da|Evet, yalnız Asya'da
Dinozorlar hakkında bir bilim müzesinde hangisini görmek beklenir?|İskelet modeli|Canlı T. rex kafesi|Dinozorların yazdığı kitaplar|Dinozorların kullandığı arabalar
Fosil kemikleri birleştirerek oluşturulan iskelet modeli neyi anlamamıza yardım eder?|Hayvanın vücut yapısını|En sevdiği rengi|Tam çıkardığı sesi|Her gün ne düşündüğünü
Dinozorların yaşadığı dönemleri incelemek hangi zamanla ilgilidir?|Çok uzak geçmiş|Yarın sabah|Önümüzdeki hafta|Gelecek yıl
Bir dinozorun dişlerini modern hayvanların dişleriyle karşılaştırmak ne sağlar?|Beslenmesi hakkında ipucu|Kesin göz rengi|Kesin yaşam süresi|Tam doğum günü
Taşlaşmış bir dinozor ayak izi hangi bilgiye daha yakındır?|Ayağının biçimi|Gözlerinin rengi|Çıkardığı ses|Yumurtasının rengi
Dinozorlar da diğer hayvanlar gibi yaşamak için hangisine ihtiyaç duyardı?|Besin ve suya|Elektrik prizine|Benzine|İnternete
Bir dinozorun korunmak için kullanabileceği vücut yapısı hangisidir?|Boynuz|Direksiyon|Pervane|Telefon anteni
Bazı dinozorların tüylerinin bulunması bize neyi gösterir?|Hepsinin derisi aynı yapıda değildi|Hepsi balıktı|Hepsi uçuyordu|Hepsi memeliydi
Dinozor fosilinin fotoğrafını ve bulunduğu yeri kaydetmek hangi çalışmanın parçasıdır?|Bilimsel araştırma|Hava tahmini|Trafik denetimi|Yemek pişirme
''')
    pairs('hayvanlar','{} hangi yaşam ortamıyla en çok ilişkilidir?', '''
Deve|Çöl
Çöl tilkisi|Çöl
Kutup ayısı|Kutup bölgesi
İmparator penguen|Kutup bölgesi
Ren geyiği|Kutup bölgesi
Kutup tilkisi|Kutup bölgesi
Yunus|Deniz
Balina|Deniz
Ahtapot|Deniz
Denizanası|Deniz
Denizatı|Deniz
Palyaço balığı|Deniz
Mercan|Deniz
Denizyıldızı|Deniz
İstiridye|Deniz
Denizkestanesi|Deniz
Köpekbalığı|Deniz
Manta vatozu|Deniz
Sazan|Tatlı su
Alabalık|Tatlı su
Turna balığı|Tatlı su
Su kurbağası|Tatlı su
Kunduz|Tatlı su
Su samuru|Tatlı su
Ağaçkakan|Orman
Sincap|Orman
Orangutan|Orman
Goril|Orman
Tukan|Orman
Tembel hayvan|Orman
''',['Çöl','Kutup bölgesi','Deniz','Tatlı su','Orman'])
    direct('hayvanlar','''
Bal yapmakla tanıdığımız böcek hangisidir?|Arı|Karınca|Çekirge|Sivrisinek
Ağ örerek av yakalayan hayvan hangisidir?|Örümcek|Kelebek|Arı|Sinek
Yumurta veren ve çiftliklerde yetiştirilen kuş hangisidir?|Tavuk|Kedi|Koyun|İnek
Yünüyle tanıdığımız çiftlik hayvanı hangisidir?|Koyun|Tavuk|Ördek|At
Miyavlayarak ses çıkaran evcil hayvan hangisidir?|Kedi|Köpek|Tavşan|Hamster
Havlamasıyla tanınan evcil hayvan hangisidir?|Köpek|Kedi|Muhabbet kuşu|Balık
Kişnemesiyle tanıdığımız hayvan hangisidir?|At|Koyun|Tavuk|Keçi
Ötüşüyle sabahı hatırlatan erkek kümes hayvanı hangisidir?|Horoz|Ördek|Hindi|Kaz
Tırtıl büyüyüp başkalaşım geçirince hangisine dönüşebilir?|Kelebek|Kurbağa|Kedi|Serçe
İribaş büyüyünce hangi hayvana dönüşür?|Kurbağa|Kelebek|Yılan|Kaplumbağa
Balıklar suda ilerlemek için en çok hangi yapılarından yararlanır?|Yüzgeçler|Kanatlar|Boynuzlar|Toynaklar
Kuşların vücudunu kaplayan örtü hangisidir?|Tüy|Pul|Kabuk|Dikenli tel
Kaplumbağanın sert koruyucu yapısına ne denir?|Kabuk|Yele|Hortum|Gaga
Filin uzun burnuna ne ad verilir?|Hortum|Gaga|Boynuz|Yele
Aslanın özellikle erkeklerinde belirgin olan boyun tüylerine ne denir?|Yele|Gaga|Pul|Kanat
Zebranın postundaki belirgin desen hangisidir?|Siyah beyaz çizgiler|Mor noktalar|Yeşil kareler|Turuncu yıldızlar
Sırtındaki hörgüçle tanınan hayvan hangisidir?|Deve|At|İnek|Geyik
Birçok kuşun uçmasını sağlayan uzuv hangisidir?|Kanat|Hortum|Yele|Boynuz
Yavrusunu sütle beslemek hangi hayvan grubunun temel özelliğidir?|Memeliler|Böcekler|Kuşlar|Balıklar
Gece ötüşü ve iri gözleriyle tanıdığımız kuş hangisidir?|Baykuş|Tavuk|Ördek|Flamingo
''')
    direct('gezegenler','''
Gündüz gökyüzünü aydınlatan bize en yakın yıldız hangisidir?|Güneş|Ay|Mars|Venüs
Gece gökyüzünde gördüğümüz Ay neyin çevresinde dolanır?|Dünya'nın|Mars'ın|Jüpiter'in|Neptün'ün
Bir gezegeni çevreleyen gaz tabakasına ne ad verilir?|Atmosfer|Krater|Yörünge|Kayaç
Bir gök cisminin başka bir cisim çevresinde izlediği yola ne denir?|Yörünge|Ekvator|Krater|Ufuk
Ay'ın yüzeyinde görülen çukur oluşumlara ne denir?|Krater|Bulut|Dalga|Orman
Dünya'nın uzaydan mavi görünmesinde en büyük pay hangisindedir?|Okyanuslar|Çöller|Şehir ışıkları|Dağlar
Dünya'da canlılar için gerekli sıvı hâlde bulunan madde hangisidir?|Su|Demir|Tuz|Kömür
Dünya'nın kendi çevresinde dönmesi yaklaşık ne kadar sürer?|24 saat|1 saat|7 gün|30 gün
Dünya'nın Güneş çevresindeki bir turuna ne ad veririz?|Bir yıl|Bir gün|Bir saat|Bir hafta
Güneş ışığı almayan Dünya yarısında hangi zaman yaşanır?|Gece|Öğle|Her zaman sabah|Her zaman ikindi
Dünya'nın bir tarafında gündüzken öbür tarafında ne olabilir?|Gece|Her yerde öğle|Her yerde gün doğumu|Her yerde gün batımı
Ay'ı parlak görmemizin temel nedeni nedir?|Güneş ışığını yansıtması|Kendi içinde ateş yakması|Şehir lambaları|Yıldırım üretmesi
Ay'ın bütünü aydınlık bir daire gibi göründüğünde evresi nedir?|Dolunay|Hilal|İlk dördün|Son dördün
Ay'ın ince bir yay gibi görünen biçimine ne denir?|Hilal|Dolunay|Tutulma|Krater
Ay'ın Dünya'dan bakıldığında farklı biçimlerde görünmesine ne denir?|Ay'ın evreleri|Ay'ın mevsimleri|Ay'ın kıtaları|Ay'ın akarsuları
Gökyüzündeki uzak cisimleri incelemek için hangi araç kullanılır?|Teleskop|Mikroskop|Termometre|Stetoskop
Uzaya yolculuk yapan kişiye genel olarak ne denir?|Astronot|Dalgıç|Arkeolog|Meteorolog
Uzay aracını yerden uzaya taşımak için hangisi kullanılır?|Roket|Yelkenli|Tramvay|Denizaltı
Astronotların uzayda özel giysi giymesinin nedenlerinden biri nedir?|Solunabilir hava ve koruma sağlamak|Yer çekimini artırmak|Güneş'i söndürmek|Ay'ı büyütmek
Dünya çevresine iletişim için yerleştirilen insan yapımı araç hangisidir?|Yapay uydu|Doğal uydu|Kuyruklu yıldız|Meteor
Ay hangisine örnektir?|Doğal uydu|Yapay uydu|Yıldız|Galaksi
Güneş'in çevresinde gezegenlerle birlikte bulunan sistemin adı nedir?|Güneş Sistemi|Samanyolu'nun tamamı|Bütün evren|Dünya atmosferi
Birçok yıldızın ve başka gök cisimlerinin oluşturduğu büyük yapıya ne denir?|Galaksi|Krater|Kıta|Bulut katmanı
İçinde Dünya'nın da bulunduğu galaksinin Türkçe adı nedir?|Samanyolu|Andromeda|Sombrero|Büyük Macellan Bulutu
Dünya dışında canlı yaşamı araştırılırken hangi madde özellikle aranır?|Sıvı su|Plastik|Boya|Benzin
Güneş'e yakın dört gezegenin yüzeyi çoğunlukla hangi yapıdadır?|Kayalık|Tamamen kumaş|Tamamen sıvı metal|Tamamen cam
Merkür ile Venüs'ün arasında hangi gök cismi bulunur sorusunda doğru ifade hangisidir?|Aralarında başka gezegen yoktur|Dünya vardır|Mars vardır|Jüpiter vardır
Dünya'nın Güneş'e göre bir iç komşusu ve bir dış komşusu hangileridir?|Venüs ve Mars|Jüpiter ve Satürn|Uranüs ve Neptün|Merkür ve Jüpiter
Mars ile Satürn arasında hangi büyük gezegenin yörüngesi bulunur?|Jüpiter|Venüs|Merkür|Dünya
Satürn ile Neptün arasında hangi gezegen bulunur?|Uranüs|Mars|Venüs|Merkür
Dünya'ya ışık ve ısı sağlayan gök cismi hangisidir?|Güneş|Ay|Neptün|Plüton
Güneş'e bakmak için hangi yöntem uygundur?|Uygun güneş filtresi bulunan gözlem aracı|Çıplak gözle uzun süre bakmak|Filtresiz dürbün|Normal güneş gözlüğüyle teleskop
İlk insanlı Ay yolculuklarının hedefi hangi gök cismiydi?|Dünya'nın uydusu|Mars|Venüs|Güneş
Uzayda kendi ışığını üreten gök cismi türü hangisidir?|Yıldız|Gezegen|Ay|Asteroit
Gökyüzündeki yıldızların çok küçük görünmesinin temel nedeni nedir?|Çok uzakta olmaları|Hepsinin kum kadar küçük olması|Işık üretmemeleri|Sadece Ay'da bulunmaları
Yer çekimi Dünya'daki cisimleri hangi yöne çeker?|Dünya'nın merkezine doğru|Her zaman kuzeye|Her zaman doğuya|Her zaman Güneş'ten uzağa
Bir topu havaya atınca yere geri düşmesine hangi kuvvet neden olur?|Yer çekimi|Manyetik boya|Ses dalgası|Gökkuşağı
Asteroitler genel olarak nasıl cisimlerdir?|Küçük kayalık gök cisimleri|Büyük yıldızlar|Gaz bulutları içindeki şehirler|Yapay uydular
Kuyruklu yıldızların yapısında hangisi bulunur?|Buz ve toz|Sadece plastik|Sadece cam|Sadece çelik
Geceleri görülen “yıldız kayması” genellikle hangi olaydır?|Küçük bir cismin atmosferde ışık saçması|Bir yıldızın Dünya'ya düşmesi|Ay'ın yer değiştirmesi|Güneş'in sönmesi
Uzay araçlarını araştırma için Mars'a göndermemizin amacı nedir?|Gezegen hakkında bilgi toplamak|Dünya'da deniz seviyesini doğrudan düşürmek|Güneş'i taşımak|Ay'ı yok etmek
Mars yüzeyinde hareket ederek araştırma yapan araca ne denir?|Gezgin robot|Yelkenli|Denizaltı|Planör
Güneş tutulmasını gözlemek için hangisine dikkat edilmelidir?|Gözleri uygun filtreyle korumaya|Filtresiz dürbün kullanmaya|Güneş'e daha uzun bakmaya|Sadece pencere açmaya
Dünya'nın kutupları kaç tanedir?|İki|Üç|Dört|Altı
Dünya'nın Kuzey Kutbu ile Güney Kutbu hangi hayalî çizginin uçlarıdır?|Dönme ekseni|Ekvator|Yörünge|Ufuk çizgisi
Ay'ın çevresinde hava Dünya'daki kadar yoğun mudur?|Hayır, çok seyrektir|Evet, aynıdır|İki kat yoğundur|On kat yoğundur
Uzaya çıkmadan önce astronotların eğitim yapmasının nedeni nedir?|Göreve ve zorlu koşullara hazırlanmak|Güneş'in rengini değiştirmek|Gezegenlerin sayısını artırmak|Yıldızları söndürmek
Uzay istasyonu ne için kullanılabilir?|Uzayda araştırma ve yaşam için|Deniz dibinde balık tutmak için|Dağda kayak yapmak için|Çölde tarım yapmak için
Gezegenlerin Güneş'e olan uzaklıkları için hangisi doğrudur?|Birbirinden farklıdır|Hepsi eşittir|Hepsi Ay'a eşittir|Hiçbiri ölçülemez
Güneş Sistemi'ndeki gezegenleri sıralamaya nereden başlanır?|Güneş'e en yakın olandan|En parlak yıldızdan|Kuzey Kutbu'ndan|Samanyolu'nun merkezinden
''')
    direct('futbol','''
Bir futbol takımında maç başlarken sahada kaleci dahil kaç oyuncu olur?|11|5|7|15
Futbolda kaleyi korumakla görevli oyuncuya ne denir?|Kaleci|Santrfor|Kanat|Hakem
Topu rakip kaleye gönderip sayı kazanmaya ne denir?|Gol|Korner|Taç|Ofsayt
Maçın kurallarını sahada uygulayan görevli kimdir?|Hakem|Spiker|Fotoğrafçı|Tribün lideri
Bir futbol maçında normal oyun kaç devreden oluşur?|İki|Üç|Dört|Beş
Yetişkin futbolunda normal bir devre kaç dakikadır?|45|20|30|60
Yetişkin futbolunda uzatmalar hariç normal maç süresi kaç dakikadır?|90|60|80|120
Hakemin oyuncuya gösterdiği sarı kart ne anlama gelir?|İhtar|Doğrudan gol|Maçın bittiği|Oyuncunun kaptan olduğu
Kırmızı kart gören futbolcu için hangisi doğrudur?|Oyundan çıkarılır|Bir gol kazanır|Kaleye geçmek zorundadır|Rakip takımda oynar
Topun tamamı yan çizgiden dışarı çıktığında oyun genellikle nasıl başlatılır?|Taç atışı|Penaltı|Santra|Hakem atışı
Taç atışı hangi şekilde yapılır?|İki elle|Tek ayakla|Sadece kafayla|Dizle
Topun tamamı gol çizgisini direkler arasından ve üst direğin altından geçerse ne olur?|Gol|Taç|Korner|Ofsayt
Rakip kaleye yakın gol arayan oyuncuya genellikle ne denir?|Forvet|Kaleci|Stoper|Yardımcı hakem
Savunmanın ortasında oynayan oyuncu için kullanılan terim hangisidir?|Stoper|Santrfor|Kanat forvet|Spiker
Takım arkadaşına top göndermeye ne denir?|Pas|Faul|Ofsayt|Kart
Kaleye gol amacıyla vurulan topa ne denir?|Şut|Taç|Santra|Kaptanlık
Bir oyuncunun topu sürerek ilerlemesi hangi terimle anlatılır?|Dripling|Ofsayt|Korner|Penaltı noktası
Rakibe kurallara aykırı müdahaleye ne denir?|Faul|Asist|Gol|Santra
Gol pası için sık kullanılan kelime hangisidir?|Asist|Ofsayt|Korner|Taç
Gol atıldıktan sonra oyun genellikle nereden başlar?|Sahanın ortasından|Köşe bayrağından|Tribünden|Kalecinin arkasından
Sahanın ortasındaki başlangıç vuruşuna ne denir?|Santra|Penaltı|Korner|Taç
Top en son savunmacıya değip kendi kale çizgisinden gol olmadan çıkarsa ne verilir?|Köşe vuruşu|Taç atışı|Santra|Gol
Köşe vuruşunun diğer adı hangisidir?|Korner|Ofsayt|Penaltı|Aut atışı
Top en son hücum oyuncusuna değip rakip kale çizgisinden gol olmadan çıkarsa ne verilir?|Kale vuruşu|Korner|Santra|Taç
Yedek oyuncunun sahadaki oyuncunun yerine girmesine ne denir?|Oyuncu değişikliği|Ofsayt|Gol tekrarı|Korner
Takım kaptanı genellikle kolunda ne taşır?|Kaptanlık bandı|Kaleci eldiveni|Hakem düdüğü|Köşe bayrağı
Futbolcuların ayaklarına giydiği dişli spor ayakkabının adı nedir?|Krampon|Paten|Palet|Terlik
Futbolcuların kaval kemiklerini koruyan ekipman hangisidir?|Tekmelik|Kask|Dirseklik|Can simidi
Bir takımın oyuncularının sahada giydiği ortak üst giysi hangisidir?|Forma|Önlük|Palto|Yağmurluk
Futbol maçının oynandığı geniş alana ne denir?|Saha|Ring|Pist|Kort
Futbolda kalenin üst yatay parçasına ne denir?|Üst direk|Köşe yayı|Taç çizgisi|Santra noktası
Kaleye giren topu tutan file hangi bölümde bulunur?|Kale arkasında|Orta yuvarlakta|Köşe bayrağında|Yedek kulübesinde
Takımını stadyumda destekleyen kişiye ne denir?|Taraftar|Hakem|Kaleci|Gözlemci
Bir maçın sonucunda iki takım eşit gol atmışsa ne olur?|Beraberlik|Her zaman hükmen yenilgi|İki takıma kırmızı kart|Maç hiç oynanmamış sayılır
Liglerde galibiyet genellikle kaç puan getirir?|Üç|Bir|İki|Beş
Liglerde beraberlik genellikle kaç puan getirir?|Bir|Üç|Dört|Sıfır
Takımları çalıştıran ve oyun planını hazırlayan kişinin görevi hangisidir?|Teknik direktör|Hakem|Spiker|Seyirci
Maçı televizyonda anlatan kişiye ne denir?|Spiker|Stoper|Kaleci|Kaptan
Bir takımın kendi sahasında oynadığı maç nasıl adlandırılır?|İç saha maçı|Deplasman maçı|Tarafsız saha maçı|Antrenman yasağı
Rakibin sahasında oynanan maç için kullanılan kelime hangisidir?|Deplasman|Santra|Asist|Korner
Futbolda iki komşu veya ezeli rakip takımın maçına sıkça ne denir?|Derbi|Sprint|Set|Ralli
Bir oyuncunun aynı maçta üç gol atmasına ne denir?|Hat-trick|Ofsayt|Korner|Taç
Topa kafayla vurularak yapılan vuruş hangisidir?|Kafa vuruşu|Taç atışı|Ayak pası|Penaltı kararı
Bir takımın hücumunu kendi kalesi önünde durdurmaya çalışması hangi oyun bölümüdür?|Savunma|Santra|Tribün düzeni|Maç anlatımı
Orta sahadaki oyuncular genel olarak hangi iki bölge arasında bağlantı kurar?|Savunma ve hücum|Tribün ve otopark|Soyunma odası ve gişe|Kale ve skor tabelası
Maç başlamadan önce yapılan hareketler ve kısa koşuların amacı nedir?|Isınmak|Skoru değiştirmek|Rakibe gol yazmak|Maçı bitirmek
Futbolda penaltı hangi noktadan kullanılır?|Penaltı noktasından|Köşe bayrağından|Taç çizgisinden|Orta çizginin kenarından
Dünya Kupası'nda ülkelerini temsil eden takımların adı nedir?|Millî takımlar|Okul kulüpleri|Sadece şehir takımları|Yedek takımlar
Futbolda bir maçta en çok golü atan taraf genellikle ne olur?|Maçı kazanır|Otomatik elenir|Oyuncu kaybeder|Puan alamaz
Maç sonunda rakip oyuncuyla tokalaşmak neye örnektir?|Sportmenlik|Ofsayt|Faul|Korner
''')
    direct('kaleciler','''
Bir kalecinin maçtaki ana görevi hangisidir?|Rakibin gol atmasını önlemek|Köşe bayraklarını taşımak|Maçı anlatmak|Hakemin yerine karar vermek
Kaleciler ellerinde genellikle hangi ekipmanı kullanır?|Eldiven|Tekmelik|Kaptanlık bandı|Gözlük
Kaleci eldiveni hangi konuda yardımcı olur?|Topu kavramada|Daha uzağı görmede|Daha hızlı işitmede|Ofsaytı belirlemede
Kaleci kalesine gelen topu durdurduğunda ne yapmış olur?|Kurtarış|Asist kararı|Taç kararı|Oyuncu değişikliği
Kalecinin koruduğu alanın fileli bölümü hangisidir?|Kale|Yedek kulübesi|Orta yuvarlak|Köşe yayı
Kaleci için topu gözle takip etmek neden önemlidir?|Yönünü ve gelişini anlamak için|Formasının rengini görmek için|Taraftar saymak için|Reklamları okumak için
Kalecinin takım arkadaşına kontrollü top göndermesine ne denir?|Pas|Faul|Ofsayt|Kırmızı kart
Kalecinin topu iki eliyle kontrol altına alması hangi sonucu amaçlar?|Topu güvenle tutmayı|Rakibe pas vermeyi|Korner kullanmayı|Maçı bitirmeyi
Kaleci topu yakalayamadığında tehlikeden uzaklaştırmak için ne yapabilir?|Topu çelebilir|Skoru değiştirebilir|Köşe bayrağını kaldırabilir|Rakibe kart gösterebilir
Kalecinin yandan gelen topa uzanması hangi harekete örnektir?|Kurtarış için dalış|Taç atışı|Santra|Ofsayt işareti
Kalecinin rakip şutunu kaleden uzak bir yana göndermesi neden yararlıdır?|İkinci gol şansı riskini azaltabilir|Rakibe otomatik gol verir|Maçı otomatik bitirir|Takıma oyuncu ekler
Kalecinin savunmadaki arkadaşlarını uyarması hangi beceriyle ilgilidir?|İletişim|Forma tasarımı|Bilet kontrolü|Hakem ataması
Kalecinin şut öncesinde dengeli olması neyi kolaylaştırır?|Farklı yönlere hareket etmeyi|Golü kendi kendine artırmayı|Hakem düdüğünü çalmayı|Sahayı büyütmeyi
Kalecinin dizlerini hafif bükerek hazır beklemesi neye yardım eder?|Hızlı tepki vermeye|Daha az görmeye|Oyundan çıkmaya|Rakibe kart göstermeye
Kaleci, sahanın diğer ucunda oyun varken ne yapmalıdır?|Oyunu takip etmelidir|Sahadan ayrılmalıdır|Maçı izlemeyi bırakmalıdır|Kaleyi boşaltıp oturmalıdır
Kaleci açısından rakibin topa vuracağı ayağı izlemek neye yardımcı olabilir?|Şutu tahmin etmeye|Maç süresini uzatmaya|Topun rengini değiştirmeye|Kendi formasını değiştirmeye
Kalecinin köşeye giden topa ulaşırken kolunu uzatmasının amacı nedir?|Erişebildiği alanı artırmak|Rakibi alkışlamak|Taç atmak|Oyuncu değiştirmek
Kalecinin önündeki oyuncular görüşünü kapatırsa hangi durum zorlaşır?|Topu zamanında görmek|Maçın tarihini bilmek|Taraftarları saymak|Forma numarasını okumak
Kalecinin sahadaki yerini topun bulunduğu yere göre ayarlaması neyle ilgilidir?|Pozisyon alma|Tribün seçme|Forma yıkama|Bilet satma
Bir kaleci neden maçtan önce ısınma yapar?|Vücudunu oyuna hazırlamak için|Skoru artırmak için|Sahayı boyamak için|Hakemi değiştirmek için
Kalecinin eldivenleri avuç içinde nasıl bir yüzeyle tutuşa yardımcı olur?|Topu kavrayan yüzey|Cam yüzey|Sert metal yüzey|Kaygan yağ tabakası
Kalecinin saha oyuncularından farklı renkte forma giymesi ne sağlar?|Kolay ayırt edilmesini|Otomatik gol kazanmasını|Daha fazla oyuncu sayılmasını|Süreyi durdurmasını
Kaleci takım arkadaşlarının attığı gollerden sonra ne yapar?|Takımıyla sevinir ve oyuna hazırlanır|Hakem yerine santra verir|Maçın puanını kendi belirler|Rakibe otomatik kart verir
Penaltı sırasında kalecinin karşısındaki oyuncunun amacı nedir?|Gol atmak|Taç kullanmak|Oyuncu değiştirmek|Köşe bayrağını taşımak
Penaltı kurtaran kaleci neyi başarmıştır?|Rakibin penaltıdan gol atmasını önlemeyi|Takımına otomatik üç gol yazmayı|Maçı otomatik bitirmeyi|Rakibi oyundan atmayı
Kaleci ve savunmacılar neden uyumlu hareket etmelidir?|Rakibin gol şansını azaltmak için|Formaları aynı beden olsun diye|Saha çizgileri silinsin diye|Tribün boşalsın diye
Top kaleciye doğru havadan geliyorsa hangi beceri önem kazanır?|Topun inişini zamanlamak|Bilet kesmek|Taç kararı vermek|Skor tabelasını yazmak
Kalecinin bir kurtarıştan sonra ayağa kalkıp hazır olması neden önemlidir?|Oyun devam edebileceği için|Her kurtarış maçı bitirdiği için|Top artık kullanılamadığı için|Rakipler sahadan çıktığı için
Kalecinin takımına oyun kurarken kullanabileceği uzuvlar hangileridir?|Kurallar dahilinde elleri ve ayakları|Yalnız dirsekleri|Yalnız başı|Yalnız dizleri
Kendi ceza alanı dışında kaleci topu elle oynayabilir mi?|Genel olarak diğer oyuncular gibi elle oynayamaz|İstediği yerde tutabilir|Sadece rakip ceza alanında tutabilir|Orta çizgide sınırsız tutabilir
Kalecinin kendi takımından geri pas aldığında ayağıyla kontrol yapması hangi beceriyi gösterir?|Top kontrolü|Hakemlik|Tribün yönetimi|Forma tasarımı
Kaleci için hızlı karar verme ne zaman önemlidir?|Topa çıkıp çıkmamayı seçerken|Bilet fiyatını belirlerken|Sahanın adını seçerken|Lig takvimini yazarken
Kalecinin hatadan sonra dikkatini yeniden oyuna vermesi neye yardımcı olur?|Sonraki pozisyona hazır olmaya|Önceki golü silmeye|Rakibin puanını düşürmeye|Sahayı değiştirmeye
Kalecinin topu dışarı çelmesi hangi sonucu doğurabilir?|Golü önleyebilir|Her zaman gol sayılır|Her zaman maç biter|Her zaman penaltı olur
Kaleciye yaklaşan hücum oyuncusuna ne denir?|Rakip oyuncu|Takım doktoru|Yardımcı hakem|Spiker
Kalecinin önünde savunma yapan takım arkadaşları hangi hattadır?|Defans|Tribün|Basın|Yedek kulübesi
Kalecinin yaptığı kurtarışları çalıştığı bölüme ne denir?|Kaleci antrenmanı|Basın toplantısı|Hakem toplantısı|Bilet satışı
Kalecinin yerde yuvarlanan topu alçalarak tutması neyi amaçlar?|Topun altından geçmesini önlemek|Topa daha az bakmak|Kaleyi küçültmek|Rakibe gol vermek
Kaygan bir top kaleci için en çok hangi işi zorlaştırabilir?|Topu elde tutmayı|Sahayı görmeyi|Hakemi duymayı|Forma numarasını bilmeyi
Kalecinin uzun bir pası takım arkadaşına ulaştırması neyi başlatabilir?|Hızlı hücumu|Otomatik penaltıyı|Zorunlu oyuncu değişikliğini|Maç tatilini
Kaleci topu ayağıyla oynadığında hangi futbol becerisini kullanır?|Pas ve kontrol|Taç kararı|Kırmızı kart kararı|Tribün düzeni
Bir kalecinin aynı maçta pek çok şutu durdurması nasıl değerlendirilir?|Başarılı kurtarış performansı|Gol atma serisi|Hakemlik başarısı|Oyuncu değişikliği
Kaleci kalesinden uzaklaşarak bir topa müdahale ettiğinde ne yapmış olur?|Kalesinden çıkış|Taç atışı|Köşe vuruşu|Santra
Kaleci için karşıdan gelen topun hızını fark etmek neyi etkiler?|Müdahale zamanını|Saha uzunluğunu|Oyuncu sayısını|Maçın tarihini
Kalecinin kollarını ve gövdesini topun arkasına getirmesi ne amaçlar?|Topu güvenle karşılamak|Rakibe yol vermek|Maçtan ayrılmak|Skor değiştirmek
Kaledeki iki dik direk arasındaki mesafe kaleci için neyi temsil eder?|Korunacak kale genişliğini|Taç alanını|Orta yuvarlağı|Yedek kulübesini
Kaleci antrenmanında farklı yönlerden top gönderilmesi neyi çalıştırır?|Farklı şutlara tepkiyi|Bilet kontrolünü|Saha çizimini|Lig takvimini
Kaleciyle çalışan özel antrenörün temel görevi nedir?|Kalecilik becerilerini geliştirmek|Tribün biletlerini satmak|Hakeme not vermek|Maçı anlatmak
Kalecinin takım arkadaşına seslenerek boşta kalan rakibi göstermesi neye örnektir?|Savunmayı yönlendirme|Gol kararı|Kart kararı|Taç kararı
Gol yemeyen bir kalecinin maç sonunda hangi başarısından söz edilir?|Kalesini gole kapatmasından|Üç gol atmasından|Hakemlik yapmasından|Maçı tek başına kazanmasından
''')
    pairs('arabalar','{} ne işe yarar?', '''
Direksiyon|Araca yön vermeye
Fren pedalı|Aracı yavaşlatmaya
Gaz pedalı|Motorun güç talebini artırmaya
Dikiz aynası|Arkanın görülmesine
Silecek|Ön camı temizlemeye
Korna|Sesli uyarı vermeye
Far|Önü aydınlatmaya
Sinyal lambası|Dönüş niyetini bildirmeye
Emniyet kemeri|Yolcuyu koltuğunda tutmaya
Hava yastığı|Çarpışmada korumaya yardımcı olmaya
Hız göstergesi|Hızı göstermeye
Yakıt göstergesi|Yakıt seviyesini göstermeye
Klima|Kabin sıcaklığını ayarlamaya
Bagaj|Eşya taşımaya
Geri görüş kamerası|Arka tarafı ekranda göstermeye
Park sensörü|Yakındaki engelleri fark etmeye
Lastik|Yolla teması sağlamaya
Vites kolu|Vites seçmeye
El freni|Park halindeki aracı sabitlemeye
Koltuk başlığı|Baş ve boyun desteği sağlamaya
Cam yıkama suyu|Camdaki kiri temizlemeye
Çocuk koltuğu|Çocuğun güvenli taşınmasına
Fren lambası|Arkaya fren yapıldığını bildirmeye
Dörtlü ikaz lambası|Diğer sürücüleri uyarmaya
Tavan bagajı|Ek eşya taşımaya
''',['Motoru soğutmaya','Yakıtı püskürtmeye','Egzoz gazını temizlemeye'])
    direct('arabalar','''
Elektrikli otomobil enerjisinin önemli bölümünü nerede depolar?|Bataryada|Egzoz borusunda|Dikiz aynasında|Cam sileceklerinde
Bir otomobilin yolla temas eden yuvarlak parçaları hangisidir?|Tekerlekler|Farlar|Aynalar|Kapılar
Otomobilin ön camını yağmurda temizleyen parça hangisidir?|Silecek|Egzoz|Korna|Vites
Otomobilin sürücüsü aracın yönünü hangi parçayla değiştirir?|Direksiyon|El freni|Klima düğmesi|Dikiz aynası
Aracın arkasına eşya koymak için hangi bölüm açılır?|Bagaj|Motor kapağı|Torpido kapağı|Yakıt kapağı
Üstü açılabilen otomobil gövde tipine ne denir?|Cabrio|Sedan|Panelvan|Station wagon
Ayrı bir bagaj bölümü olan üç hacimli otomobil tipi hangisidir?|Sedan|Motosiklet|Otobüs|Kamyon
Arka camıyla birlikte açılan bagaj kapağı hangi gövde tipinde yaygındır?|Hatchback|Cabrio|Üstü açık arazi aracı|Motosiklet
Hem elektrik motoru hem içten yanmalı motor kullanabilen otomobil türü hangisidir?|Hibrit|Yalnız dizel|Yalnız benzinli|Pedallı
Şarj kablosuyla enerji alınabilen araç hangisidir?|Elektrikli otomobil|At arabası|Bisiklet|Yelkenli
Aracın içini serinletmek için en sık hangi sistem açılır?|Klima|Egzoz|Korna|El freni
Otomobilin geceleri yolu aydınlatan ön lambaları hangisidir?|Farlar|Sinyal kolu|Fren pedalı|Hız göstergesi
Sürücünün aracın hızını okuduğu gösterge hangisidir?|Hız göstergesi|Yakıt göstergesi|Saat|Hararet göstergesi
Bir otomobilde motorun bulunduğu ön bölümü örten kapak genellikle hangisidir?|Kaput|Bagaj kapağı|Torpido|Sunroof
Aracın üstündeki açılabilen cam bölümüne yaygın olarak ne denir?|Sunroof|Tampon|Jant|Egzoz
Lastiğin ortasında görülen metal tekerlek parçası hangisidir?|Jant|Far|Kaput|Ayna
Otomobilin ön ve arkasındaki dış koruma parçalarına ne denir?|Tampon|Silecek|Debriyaj|Koltuk rayı
Sürücünün yanında küçük eşyalar için kullanılan kapaklı bölme hangisidir?|Torpido gözü|Motor bloğu|Yakıt deposu|Egzoz borusu
Araç yolcularının oturduğu bölümün genel adı nedir?|Kabin|Kaput|Egzoz|Şasi numarası
Bir otomobilin yakıt aldığı kapak genellikle hangi bölüme açılır?|Yakıt deposuna|Bagaj döşemesine|Klima filtresine|Fren diskine
İçten yanmalı araçta yanma gazlarını dışarı taşıyan sistem hangisidir?|Egzoz|Direksiyon|Silecek|Sinyal
Otomobilin kapılarındaki camları açıp kapatan düğme neyi yönetir?|Cam mekanizmasını|Frenleri|Yakıt pompasını|Kornayı
Araçtaki yan aynalar sürücüye hangi konuda yardımcı olur?|Çevresindeki trafiği görmekte|Yakıt doldurmakta|Lastik değiştirmekte|Motoru soğutmakta
Geri vites seçildiğinde otomobil hangi yönde hareket için hazırlanır?|Geriye|Sadece sağa|Sadece sola|Yukarıya
Otomobil kullanırken oturduğumuz ayarlanabilir bölüm hangisidir?|Sürücü koltuğu|Bagaj rafı|Kaput|Torpido gözü
''')
    pairs('meshur','{} hangi ilimizi hatırlatır?', '''
Baklava ve Antep fıstığı|Gaziantep
Dövme dondurma|Kahramanmaraş
Kayısı bahçeleri|Malatya
Çay bahçeleri ve çay üretimi|Rize
İskender kebabı|Bursa
Mantı ve pastırma|Kayseri
Adını şehrinden alan acılı kebap ve şalgam|Adana
Meşhur tava ciğeri|Edirne
Etli ekmek ve Mevlânâ|Konya
Boyoz ve kumru|İzmir
Tantuni ve cezerye|Mersin
Antakya usulü künefe|Hatay
Kaymak ve sucuk|Afyonkarahisar
Pişmaniye ve İzmit|Kocaeli
Leblebi üretimi|Çorum
Lületaşı ve Odunpazarı|Eskişehir
Gül bahçeleri ve gül yağı|Isparta
Uzun ötüşlü horoz ve Pamukkale|Denizli
Karpuz ve surlar|Diyarbakır
Büyük, bol çeşitli kahvaltı ve otlu peynir|Van
Balıklıgöl ve sıra geceleri|Şanlıurfa
Peribacaları ve Göreme|Nevşehir
Safranbolu'nun tarihî evleri|Karabük
Oltu taşı ve cağ kebabı|Erzurum
Kaşar peyniri ve kaz yemekleri|Kars
Akçaabat köftesi ve Sümela|Trabzon
Bafra pidesi ve Bandırma Vapuru Müzesi|Samsun
Misket elması ve yalıboyu evleri|Amasya
Taşköprü sarımsağı|Kastamonu
Susurluk ayranı ve höşmerim|Balıkesir
Ezine peyniri ve Truva Atı|Çanakkale
Mesir macunu şenlikleri|Manisa
Kangal köpeği|Sivas
Devrek bastonu|Zonguldak
Mengenli aşçılar|Bolu
Anıtkabir ve Ankara kedisi|Ankara
Boğaz manzarası ve Kız Kulesi|İstanbul
Kaleiçi ve Düden Şelalesi|Antalya
Bodrum ve Marmaris tatilleri|Muğla
Kuşadası ve incir bahçeleri|Aydın
Çinicilik geleneği ve porselen|Kütahya
Telkâri gümüş işçiliği ve Midyat|Mardin
Fındığıyla tanınan Giresun Adası'nın bulunduğu şehir|Giresun
Adapazarı ıslama köftesi|Sakarya
Adını şehrinden alan meşhur köfte ve Hayrabolu tatlısı|Tekirdağ
Tokat kebabı ve yazmacılık|Tokat
Fındık bahçeleriyle çevrili Boztepe|Ordu
Nemrut Dağı'ndaki dev heykeller|Adıyaman
Ihlara Vadisi|Aksaray
Cevizli Sinop mantısı ve tarihî cezaevi|Sinop
''',['Gaziantep','Kahramanmaraş','Malatya','Rize','Bursa','Kayseri','Adana','Edirne','Konya','İzmir','Mersin','Hatay','Afyonkarahisar','Kocaeli','Çorum','Eskişehir','Isparta','Denizli','Diyarbakır','Van','Şanlıurfa','Nevşehir','Karabük','Erzurum','Kars','Trabzon','Samsun','Amasya','Kastamonu','Balıkesir','Çanakkale','Manisa','Sivas','Zonguldak','Bolu','Ankara','İstanbul','Antalya','Muğla','Aydın','Kütahya','Mardin','Giresun','Sakarya','Tekirdağ','Tokat','Ordu','Adıyaman','Aksaray','Sinop'])
    pairs('plakalar','{} için hangi plaka kodunu seçmelisin?', '''
İstanbul'da kayıtlı bir otomobil|34
Ankara'da kayıtlı bir otomobil|06
İzmir'de kayıtlı bir otomobil|35
Bursa'da kayıtlı bir otomobil|16
Antalya'da kayıtlı bir otomobil|07
Adana'da kayıtlı bir otomobil|01
Konya'da kayıtlı bir otomobil|42
Gaziantep'te kayıtlı bir otomobil|27
Şanlıurfa'da kayıtlı bir otomobil|63
Diyarbakır'da kayıtlı bir otomobil|21
Mersin'de kayıtlı bir otomobil|33
Kocaeli'de kayıtlı bir otomobil|41
Samsun'da kayıtlı bir otomobil|55
Trabzon'da kayıtlı bir otomobil|61
Eskişehir'de kayıtlı bir otomobil|26
Kayseri'de kayıtlı bir otomobil|38
Erzurum'da kayıtlı bir otomobil|25
Malatya'da kayıtlı bir otomobil|44
Manisa'da kayıtlı bir otomobil|45
Aydın'da kayıtlı bir otomobil|09
Muğla'da kayıtlı bir otomobil|48
Denizli'de kayıtlı bir otomobil|20
Balıkesir'de kayıtlı bir otomobil|10
Hatay'da kayıtlı bir otomobil|31
Tekirdağ'da kayıtlı bir otomobil|59
Sakarya'da kayıtlı bir otomobil|54
Kahramanmaraş'ta kayıtlı bir otomobil|46
Van'da kayıtlı bir otomobil|65
Mardin'de kayıtlı bir otomobil|47
Ordu'da kayıtlı bir otomobil|52
Edirne'de kayıtlı bir otomobil|22
Çanakkale'de kayıtlı bir otomobil|17
Rize'de kayıtlı bir otomobil|53
Giresun'da kayıtlı bir otomobil|28
Kars'ta kayıtlı bir otomobil|36
Sivas'ta kayıtlı bir otomobil|58
Bolu'da kayıtlı bir otomobil|14
Zonguldak'ta kayıtlı bir otomobil|67
Isparta'da kayıtlı bir otomobil|32
Afyonkarahisar'da kayıtlı bir otomobil|03
Nevşehir'de kayıtlı bir otomobil|50
Çorum'da kayıtlı bir otomobil|19
Kastamonu'da kayıtlı bir otomobil|37
Tokat'ta kayıtlı bir otomobil|60
Amasya'da kayıtlı bir otomobil|05
Sinop'ta kayıtlı bir otomobil|57
Kütahya'da kayıtlı bir otomobil|43
Yalova'da kayıtlı bir otomobil|77
Karabük'te kayıtlı bir otomobil|78
Düzce'de kayıtlı bir otomobil|81
''',['01','03','05','06','07','09','10','14','16','17','19','20','21','22','25','26','27','28','31','32','33','34','35','36','37','38','41','42','43','44','45','46','47','48','50','52','53','54','55','57','58','59','60','61','63','65','67','77','78','81'])
    flags='''
Türkiye: kırmızı zemin üzerinde beyaz ay ve yıldız|tr
Almanya: yatay siyah, kırmızı ve sarı şeritler|de
Fransa: dikey mavi, beyaz ve kırmızı şeritler|fr
İtalya: dikey yeşil, beyaz ve kırmızı şeritler|it
İspanya: kırmızı-sarı-kırmızı şeritler ve arma|es
Portekiz: yeşil ve kırmızı alanlar üzerinde arma|pt
Birleşik Krallık: üst üste gelen kırmızı ve beyaz haçlar|gb
İrlanda: dikey yeşil, beyaz ve turuncu şeritler|ie
Belçika: dikey siyah, sarı ve kırmızı şeritler|be
Hollanda: yatay kırmızı, beyaz ve mavi şeritler|nl
İsviçre: kırmızı zemin üzerinde beyaz haç|ch
Avusturya: yatay kırmızı-beyaz-kırmızı şeritler|at
Polonya: üstte beyaz, altta kırmızı iki şerit|pl
Yunanistan: mavi-beyaz çizgiler ve köşede haç|gr
Danimarka: kırmızı zemin üzerinde beyaz İskandinav haçı|dk
Norveç: kırmızı zemin üzerinde beyaz kenarlı mavi haç|no
İsveç: mavi zemin üzerinde sarı haç|se
Finlandiya: beyaz zemin üzerinde mavi haç|fi
İzlanda: mavi zemin üzerinde beyaz kenarlı kırmızı haç|is
Ukrayna: üstte mavi, altta sarı iki şerit|ua
Rusya: yatay beyaz, mavi ve kırmızı şeritler|ru
Azerbaycan: mavi-kırmızı-yeşil şeritler, ay ve yıldız|az
Japonya: beyaz zemin üzerinde kırmızı daire|jp
Çin: kırmızı zemin üzerinde sarı yıldızlar|cn
Güney Kore: beyaz zemin üzerinde kırmızı-mavi daire ve siyah işaretler|kr
Hindistan: turuncu-beyaz-yeşil şeritler ve mavi tekerlek|in
Pakistan: yeşil alan üzerinde beyaz ay ve yıldız, yanda beyaz şerit|pk
Bangladeş: yeşil zemin üzerinde kırmızı daire|bd
Nepal: üst üste iki üçgen biçimindeki bayrak|np
Vietnam: kırmızı zemin üzerinde sarı yıldız|vn
Kanada: beyaz alanda kırmızı akçaağaç yaprağı|ca
Amerika Birleşik Devletleri: çizgiler ve mavi köşede yıldızlar|us
Brezilya: yeşil zemin, sarı eşkenar dörtgen ve mavi daire|br
Arjantin: açık mavi-beyaz-açık mavi şeritler ve güneş|ar
Meksika: yeşil-beyaz-kırmızı şeritler ve ortada kartallı arma|mx
Şili: beyaz-mavi-kırmızı alanlar ve beyaz yıldız|cl
Avustralya: mavi zemin, köşede Birleşik Krallık bayrağı ve beyaz yıldızlar|au
Yeni Zelanda: mavi zemin üzerinde beyaz kenarlı kırmızı yıldızlar|nz
Tunus: kırmızı zemin üzerinde beyaz dairede ay ve yıldız|tn
Fas: kırmızı zemin üzerinde yeşil yıldız|ma
Cezayir: yeşil ve beyaz alan üzerinde kırmızı ay ve yıldız|dz
Mısır: kırmızı-beyaz-siyah şeritler ve ortada kartal|eg
Lübnan: beyaz şerit üzerinde yeşil sedir ağacı|lb
İsrail: beyaz zemin üzerinde mavi çizgiler ve altı köşeli yıldız|il
Suudi Arabistan: yeşil zemin üzerinde beyaz yazı ve kılıç|sa
Katar: beyaz ile bordo alanları ayıran dişli çizgi|qa
Bahreyn: beyaz ile kırmızı alanları ayıran dişli çizgi|bh
Jamaika: sarı çapraz şeritlerle ayrılan yeşil ve siyah alanlar|jm
Arnavutluk: kırmızı zemin üzerinde siyah çift başlı kartal|al
Gürcistan: beyaz zemin üzerinde beş kırmızı haç|ge
'''
    flag_pool=['flag:'+x['code'] for x in json.loads((ROOT/'data/flag-countries.json').read_text())]
    for line in flags.strip().splitlines():
        clue,code=line.split('|')
        put('bayraklar',f'{clue}. Bu tarife uyan bayrak hangisidir?', 'flag:'+code,flag_pool)
    direct('genel-kultur','''
Kırmızı ile sarı boyayı karıştırınca hangi renk elde edilir?|Turuncu|Mor|Mavi|Siyah
Mavi ile sarı boyayı karıştırınca hangi renk elde edilir?|Yeşil|Turuncu|Kırmızı|Mor
Kırmızı ile mavi boyayı karıştırınca hangi renk elde edilir?|Mor|Yeşil|Sarı|Turuncu
Bir haftada kaç gün vardır?|Yedi|Beş|Altı|Sekiz
Bir yılda kaç ay vardır?|On iki|On|On bir|On dört
Yılın ilk ayı hangisidir?|Ocak|Mart|Haziran|Aralık
Yılın son ayı hangisidir?|Aralık|Kasım|Eylül|Ocak
Pazartesiden sonra hangi gün gelir?|Salı|Pazar|Cuma|Cumartesi
Cumadan sonra hangi gün gelir?|Cumartesi|Perşembe|Çarşamba|Salı
Bir saatin yarısı kaç dakikadır?|30|15|45|60
Çeyrek saat kaç dakikadır?|15|10|20|25
Trafik lambasında hangi renk durmayı belirtir?|Kırmızı|Yeşil|Mavi|Mor
Trafik lambasında geçişe izin veren renk hangisidir?|Yeşil|Kırmızı|Mor|Mavi
Kâğıt kesmek için kullanılan araç hangisidir?|Makas|Cetvel|Silgi|Kalem
Yazıyı silmek için hangi kırtasiye aracı kullanılır?|Silgi|Zımba|Dosya|Cetvel
Uzunluğu ölçmek için kullanılan araç hangisidir?|Cetvel|Saat|Terazi|Pusula
Ağırlık tartmak için hangisi kullanılır?|Terazi|Pusula|Termometre|Dürbün
Kitap ödünç alabileceğimiz yer hangisidir?|Kütüphane|Stadyum|Otogar|Manav
Resim ve tarihî eşyaların sergilendiği yer hangisidir?|Müze|Fırın|Otopark|Eczane
Oyuncuların sahnede bir eseri canlandırdığı sanat hangisidir?|Tiyatro|Heykel|Fotoğrafçılık|Mimarlık
Notalarla ve seslerle yapılan sanat hangisidir?|Müzik|Heykel|Dokuma|Mimarlık
Siyah ve beyaz tuşları olan büyük müzik aleti hangisidir?|Piyano|Keman|Davul|Flüt
Yayla çalınan telli çalgı hangisidir?|Keman|Flüt|Davul|Zil
Üflenerek çalınan çalgı hangisidir?|Flüt|Piyano|Gitar|Davul
Bagetlerle vurularak çalınan çalgı hangisidir?|Davul|Keman|Ud|Flüt
Fotoğraf çekmek için kullanılan araç hangisidir?|Fotoğraf makinesi|Mikroskop|Terazi|Yazıcı
Bilgisayarda harfleri yazmak için kullanılan parça hangisidir?|Klavye|Hoparlör|Ekran|Yazıcı
Bilgisayardan kâğıda çıktı almak için hangisi kullanılır?|Yazıcı|Fare|Klavye|Mikrofon
Sesi bilgisayara aktarmak için hangi araç kullanılır?|Mikrofon|Ekran|Yazıcı|Fare
Görüntüyü gösteren bilgisayar parçası hangisidir?|Ekran|Klavye|Mikrofon|Hoparlör
Trenler hangi yol üzerinde hareket eder?|Raylar|Deniz dalgaları|Hava koridorları|Sadece kum
Uçakların kalkıp indiği yer hangisidir?|Havalimanı|Liman|Tren garı|Otobüs durağı
Gemilerin yanaştığı yer hangisidir?|Liman|Havalimanı|Kayak pisti|Metro istasyonu
Yaya geçidindeki çizgiler genellikle hangi desenle anılır?|Zebra|Leopar|Benekli inek|Kaplumbağa
Satranç oyununda korunması gereken en önemli taş hangisidir?|Şah|Piyon|At|Kale
Futbol, basketbol ve voleybolda ortak kullanılan nesne hangisidir?|Top|Raket|Mekik|Disk
Tenis oynamak için elde tutulan araç hangisidir?|Raket|Sopa|Kürek|Yay
Yüzmek için hangi ortam gerekir?|Su|Kum|Kar|Çim
Kışın karlı yamaçlarda yapılan spor hangisidir?|Kayak|Yelken|Sörf|Kürek
Basketbolda sayı kazanmak için top nereye atılır?|Potaya|Kaleye|File altına|Köşe bayrağına
Bir hikâyeyi kitap olarak yazan kişiye ne denir?|Yazar|Heykeltıraş|Mimar|Sporcu
Bir yapının tasarımını hazırlayan meslek hangisidir?|Mimar|Aşçı|Terzi|Müzisyen
Kumaştan giysi diken kişiye ne denir?|Terzi|Marangoz|Manav|Çiftçi
Ahşapla mobilya yapan ustaya ne denir?|Marangoz|Fırıncı|Berber|Balıkçı
Ekmek pişirip satan iş yeri hangisidir?|Fırın|Manav|Kırtasiye|Nalbur
Meyve ve sebze satan dükkân hangisidir?|Manav|Kasap|Kırtasiye|Terzi
Doğum gününde pastanın üstüne çoğunlukla ne konur?|Mum|Pusula|Cetvel|Vida
Bir mektubu göndermek için hangi hizmet kullanılır?|Posta|İtfaiye|Su dağıtımı|Elektrik sayacı
Bir dairenin kenarları ve köşeleri için hangisi doğrudur?|Köşesi yoktur|Üç köşesi vardır|Dört köşesi vardır|Beş köşesi vardır
Üç kenarı olan geometrik şekil hangisidir?|Üçgen|Kare|Dikdörtgen|Beşgen
''')
    def grouped_direct(cat,raw):
        rows=[line.split('|') for line in raw.strip().splitlines()]
        for kind,text,answer in rows:
            pool=list(dict.fromkeys(r[2] for r in rows if r[0]==kind))
            assert len(pool)>=4,(cat,kind)
            put(cat,text,answer,pool)
    grouped_direct('turkiye-tarihi','''
kişi|Cumhuriyet'in kurucusu olarak tanıdığımız Mustafa Kemal'in soyadı nedir?|Atatürk
kişi|Millî marşımızı yazan Mehmet Âkif'in soyadı nedir?|Ersoy
kişi|İstanbul'u fetheden ve Fatih adıyla tanınan Osmanlı hükümdarı kimdir?|II. Mehmed
kişi|Selimiye ve Süleymaniye gibi camileriyle tanınan büyük mimar kimdir?|Mimar Sinan
kişi|Türkçe şiirlerinde sevgi ve hoşgörüyü anlatan “Yunus” kimdir?|Yunus Emre
kişi|Konya ve semazenlerle birlikte anılan ünlü düşünür kimdir?|Mevlânâ
kişi|Seyahatnâme adlı eserinde gezdiği yerleri anlatan seyyah kimdir?|Evliya Çelebi
kişi|Dünya haritasıyla tanınan Osmanlı denizcisi Pîrî kimdir?|Pîrî Reis
kişi|Atatürk'ten sonra Türkiye'nin ikinci cumhurbaşkanı olan İsmet kimdir?|İsmet İnönü
kişi|Türkiye'nin ilk kadın savaş pilotu olarak bilinen Sabiha kimdir?|Sabiha Gökçen
şehir|Türkiye Cumhuriyeti'nin yönetim merkezi ve başkenti hangi şehirdir?|Ankara
şehir|19 Mayıs yolculuğunda Bandırma Vapuru'nun ulaştığı şehir hangisidir?|Samsun
şehir|Atatürk'ün doğduğu, bugün Yunanistan'da kalan şehir hangisidir?|Selanik
şehir|Atatürk'ün vefat ettiği Dolmabahçe Sarayı hangi büyük şehirdedir?|İstanbul
şehir|9 Eylül kurtuluş günüyle tanıdığımız Ege şehri hangisidir?|İzmir
şehir|Anıtkabir'i ziyaret etmek için hangi şehre gidilir?|Ankara
şehir|Millî Mücadele'nin önemli kongrelerinden Sivas Kongresi hangi şehirde yapıldı?|Sivas
şehir|Millî Mücadele'nin önemli kongrelerinden Erzurum Kongresi hangi şehirde yapıldı?|Erzurum
şehir|Çanakkale Deniz Zaferi hangi şehrin adını taşır?|Çanakkale
şehir|Mevlânâ'nın türbesiyle tanınan tarihî başkent hangi şehirdir?|Konya
kavram|Geçmişte insanların yaşadığı olayları inceleyen alana ne denir?|Tarih
kavram|Tarih üzerine araştırma yapan kişiye ne denir?|Tarihçi
kavram|Olayları zaman sırasına dizmeye ne denir?|Kronoloji
kavram|Geçmişten kalmış değerli insan yapımı nesneye ne denir?|Tarihî eser
kavram|Tarihî eşyaların korunup sergilendiği kuruma ne denir?|Müze
kavram|Geçmiş uygarlıkların kalıntılarını kazılarla inceleyen bilim dalı hangisidir?|Arkeoloji
kavram|Tarihî belgelerin düzenlenip saklandığı yere ne denir?|Arşiv
kavram|Eski bir yapıyı aslına uygun biçimde onarma çalışması hangisidir?|Restorasyon
kavram|Bir toplumun geçmişten devraldığı eser ve gelenekler hangi kavramla anlatılır?|Kültürel miras
kavram|Bir kişi ya da olayın hatırası için yapılan büyük yapıya ne denir?|Anıt
bayram|Çocuklara armağan edilen, 23 Nisan'da kutlanan bayram hangisidir?|Ulusal Egemenlik ve Çocuk Bayramı
bayram|Gençlere armağan edilen, 19 Mayıs'ta kutlanan bayram hangisidir?|Atatürk'ü Anma, Gençlik ve Spor Bayramı
bayram|Büyük zaferi anmak için 30 Ağustos'ta kutlanan bayram hangisidir?|Zafer Bayramı
bayram|Cumhuriyet'in ilanını kutladığımız 29 Ekim bayramının adı nedir?|Cumhuriyet Bayramı
kavram|Bir ülkenin bağımsızlığını temsil eden ve göndere çekilen simge hangisidir?|Bayrak
kavram|Bir ülkenin resmî törenlerde söylenen ortak şarkısına ne denir?|Millî marş
kavram|Halkın yöneticilerini seçim yoluyla belirlediği yönetim düşüncesi hangisidir?|Demokrasi
kavram|Egemenliğin millete ait olması hangi kavramla anlatılır?|Millî egemenlik
kavram|Bir ülkenin başka devletlerin yönetimi altında olmamasına ne denir?|Bağımsızlık
kavram|Devletin temel kurallarını belirleyen en üst hukuk metni hangisidir?|Anayasa
kurum|Türkiye'de milletvekillerinin toplanıp kanunları görüştüğü kurum hangisidir?|Türkiye Büyük Millet Meclisi
kurum|Türk diliyle ilgili sözlük çalışmaları yapan kurum hangisidir?|Türk Dil Kurumu
kurum|Türk tarihini araştıran, adında da tarih bulunan kurum hangisidir?|Türk Tarih Kurumu
kurum|Millî Mücadele haberlerini duyurmak üzere kurulan haber ajansı hangisidir?|Anadolu Ajansı
eser|Atatürk'ün “Söylev” adıyla da bilinen kitabı hangisidir?|Nutuk
eser|Türkiye'nin bağımsızlık mücadelesini anlatan millî marş hangisidir?|İstiklal Marşı
eser|Evliya Çelebi'nin gezilerini anlattığı kitap hangisidir?|Seyahatnâme
eser|Pîrî Reis'in denizcilikle ilgili, adında “bahriye” geçen eseri hangisidir?|Kitâb-ı Bahriye
kavram|Ülkemizin işgaline karşı verilen Kurtuluş Savaşı'nın diğer yaygın adı nedir?|Millî Mücadele
kavram|Bir savaşı durdurmak için yapılan ateş kesme anlaşmasına ne denir?|Ateşkes
''')
    grouped_direct('osmanli-tarihi','''
kişi|Osmanlı Devleti adını kurucusu olan hangi beyden alır?|Osman Bey
kişi|Osman Bey'den sonra beyliğin başına geçen oğlu kimdir?|Orhan Bey
kişi|İstanbul'un fethinden sonra Fatih diye anılan hükümdar kimdir?|II. Mehmed
kişi|Kanûnî unvanıyla tanınan Osmanlı padişahının adı nedir?|Süleyman
kişi|Yavuz unvanıyla tanınan Osmanlı padişahının adı nedir?|Selim
kişi|Selimiye Camii'ni yapan ve adı Sinan olan mimar kimdir?|Mimar Sinan
kişi|Osmanlı coğrafyasını gezip Seyahatnâme'yi yazan Evliya kimdir?|Evliya Çelebi
kişi|Ünlü dünya haritasını çizen Osmanlı denizcisi kimdir?|Pîrî Reis
kişi|Barbaros adıyla tanınan Osmanlı denizcisi kimdir?|Hayreddin Paşa
kişi|İstanbul'da Türkçe matbaacılıkla anılan İbrahim kimdir?|İbrahim Müteferrika
şehir|Topkapı Sarayı'nı görmek isteyen biri hangi şehre gitmelidir?|İstanbul
şehir|Selimiye Camii'nin bulunduğu eski Osmanlı başkenti hangisidir?|Edirne
şehir|Osmanlı'nın ilk başkentlerinden olup Yeşil Türbe'yi barındıran şehir hangisidir?|Bursa
şehir|Osmanlı'nın kuruluşuyla anılan Söğüt hangi ilimizdedir?|Bilecik
şehir|Süleymaniye ve Sultanahmet camileri hangi şehirdedir?|İstanbul
şehir|Osmanlı padişahlarının son dönemlerde yaşadığı Dolmabahçe Sarayı hangi şehirdedir?|İstanbul
şehir|Osmanlı'nın “Edirne Sarayı” adını taşıyan sarayı hangi şehirdedir?|Edirne
şehir|Tarihî Osmanlı evleriyle tanınan Safranbolu hangi ilimizdedir?|Karabük
şehir|Yeşil Cami ve Ulu Cami ile tanınan Osmanlı başkentlerinden biri hangisidir?|Bursa
şehir|Rumeli Hisarı hangi şehrin Boğaz kıyısındadır?|İstanbul
kavram|Osmanlı Devleti'nin hükümdarına yaygın olarak ne denirdi?|Padişah
kavram|Padişahın erkek çocuğu için kullanılan unvan hangisidir?|Şehzade
kavram|Padişahın annesinin saraydaki unvanı hangisidir?|Valide sultan
kavram|Osmanlı'da padişahtan sonra devlet işlerini yöneten baş görevli kimdi?|Sadrazam
kavram|Osmanlı mahkemelerinde davalara bakan görevliye ne denirdi?|Kadı
kavram|Osmanlı'nın deniz kuvvetlerinin genel adı nedir?|Donanma
kavram|Osmanlı'nın kara askerî kuvvetleri için kullanılan genel kelime hangisidir?|Ordu
kavram|Osmanlı'da padişahın yazılı buyruğu hangi adla anılırdı?|Ferman
kavram|Padişahın imza yerine kullandığı süslü işaretin adı nedir?|Tuğra
kavram|Tarihî belgelerde Osmanlı'nın resmî madeni para örneklerinden biri hangisidir?|Akçe
kavram|Padişahların yaşadığı büyük yönetim yapısına ne denir?|Saray
yaşam|Osmanlı çarşılarında malları alıp satan kişinin işi hangisidir?|Tüccarlık
yaşam|Seyahat edenlerin konakladığı hanların önemli olduğu yolculuk türü hangisidir?|Ticaret yolculuğu
yaşam|Ahşap, taş ve çiniyi kullanarak yapı yapma sanatı hangisidir?|Mimarlık
yaşam|Güzel yazı yazma sanatı Osmanlı kültüründe hangi adla bilinir?|Hat sanatı
yaşam|Küçük ve ayrıntılı resimlerle kitapları süsleme sanatı hangisidir?|Minyatür
yaşam|Sırlı ve renkli seramiklerle yapılan süsleme sanatı hangisidir?|Çini sanatı
yaşam|Suyun üzerinde oluşturulan desenin kâğıda aktarılması hangi sanattır?|Ebru
yaşam|Kumaşı ipliklerle üretme işi hangi adla anılır?|Dokumacılık
yaşam|Misafire kahve sunmak hangi kültürel davranışın örneğidir?|Misafirperverlik
yaşam|Ramazan akşamlarında iftar sofralarının kurulması neyle ilgilidir?|Oruç geleneği
yaşam|Bayramlarda büyükleri ziyaret edip ellerini öpmek hangi davranışa örnektir?|Bayramlaşma
kavram|Bir ailenin kuşaklar boyunca hükümdarlık yapması hangi kavramla anlatılır?|Hanedan
kavram|Devletin yönetildiği merkez şehre ne denir?|Başkent
kavram|Halkın kamusal ihtiyaçları için kurulan hayır kurumunun adı nedir?|Vakıf
kavram|Osmanlı'da devlet işlerinin görüşüldüğü kurul hangi adla anılır?|Divan
yaşam|Osmanlı'da gemileri kullanan ve denizde görev yapan kişilerin mesleği hangisidir?|Denizcilik
yaşam|Kumaş üzerine iğne ve iplikle yapılan süsleme işi hangisidir?|Nakış
yaşam|Bir olayı veya kişiyi şiirle anlatan edebî üretim hangisidir?|Şiir yazma
yaşam|Osmanlı çarşısında el emeğiyle meslek ürünü yapan kişinin işi hangi kavramla anlatılır?|Zanaatkârlık
''')
    grouped_direct('islam-tarihi','''
kişi|İslâm dininin peygamberi olan Hz. Muhammed'in ilk eşinin adı nedir?|Hz. Hatice
kişi|İlk halife olarak tanınan ve hicrette Hz. Muhammed'e eşlik eden kişi kimdir?|Hz. Ebû Bekir
kişi|Dört halifenin ikincisi kimdir?|Hz. Ömer
kişi|Dört halifenin üçüncüsü kimdir?|Hz. Osman
kişi|Dört halifenin sonuncusu ve Hz. Muhammed'in damadı olan kişi kimdir?|Hz. Ali
kişi|Hz. Muhammed'in kızı ve Hz. Ali'nin eşi olan kişi kimdir?|Hz. Fâtıma
kişi|İlk müezzin olarak bilinen Bilâl kimdir?|Bilâl-i Habeşî
kişi|Hz. Muhammed'in amcası, Uhud'da şehit olan kişi kimdir?|Hz. Hamza
kişi|Hz. Muhammed'in torunlarından, Kerbelâ olayıyla anılan kişi kimdir?|Hz. Hüseyin
kişi|Kudüs'ü Haçlılardan geri almasıyla tanınan Selâhaddîn kimdir?|Selâhaddîn Eyyûbî
şehir|Kâbe'nin bulunduğu kutsal şehir hangisidir?|Mekke
şehir|Hz. Muhammed'in hicret ettiği ve Mescid-i Nebevî'nin bulunduğu şehir hangisidir?|Medine
şehir|Mescid-i Aksâ ile tanınan şehir hangisidir?|Kudüs
şehir|Abbâsîlerin bilim ve kültür merkezi olan Irak başkenti hangisidir?|Bağdat
şehir|Emevî Devleti'nin başkenti olan Suriye şehri hangisidir?|Şam
şehir|Ezher eğitim kurumu ve camisiyle tanınan Mısır şehri hangisidir?|Kahire
şehir|İstanbul'un fethinden sonra Osmanlı başkenti olan şehir hangisidir?|İstanbul
şehir|Mevlânâ Müzesi'ni ve semazenleri görmek için gidilen Anadolu şehri hangisidir?|Konya
şehir|Hz. Muhammed'in doğduğu şehir hangisidir?|Mekke
şehir|Hz. Muhammed'in kabrinin bulunduğu şehir hangisidir?|Medine
kavram|Hz. Muhammed'in Mekke'den Medine'ye göç etmesine verilen ad nedir?|Hicret
kavram|Mekke'den Medine'ye göç eden Müslümanlar hangi adla anılır?|Muhacir
kavram|Medine'ye gelen Müslümanlara yardım eden Medinelilere ne denir?|Ensar
kavram|Hz. Muhammed'in hayatını anlatan eserlerin ve araştırmaların alanı hangisidir?|Siyer
kavram|Hz. Muhammed'in sözlerinin aktarıldığı rivayetlere ne denir?|Hadis
kavram|Hz. Muhammed'i görüp ona iman etmiş yakın çevresindeki kişilere ne denir?|Sahâbe
kavram|Hz. Muhammed'den sonraki ilk dört halifenin zamanı hangi adla anılır?|Dört Halife Dönemi
kavram|İslâm tarihinde ihtiyaç sahiplerine yardım için kurulan hayır yapısı hangisidir?|Vakıf
kavram|Geleneksel İslâm eğitim kurumuna ne denir?|Medrese
kavram|Müslümanların toplu ibadet için kullandığı büyük yapı hangisidir?|Cami
kavram|Camilerde ezan okunan yüksek kuleye ne denir?|Minare
kavram|Camide kıble yönünü gösteren duvar bölümünün adı nedir?|Mihrap
kavram|Camide cuma hutbesinin okunduğu basamaklı yere ne denir?|Minber
kavram|Müslümanları namaza çağıran davetin adı nedir?|Ezan
kavram|Ezan okuyan görevliye ne denir?|Müezzin
kavram|Cemaatle namazda önde duran görevliye ne denir?|İmam
kavram|İslâm kültüründe güzel yazı sanatının adı nedir?|Hat
kavram|İhtiyaç sahipleri için yemek hazırlanan tarihî hayır yapısı hangisidir?|İmaret
kavram|Yolcuların konaklayabildiği tarihî ticaret yapısı hangisidir?|Kervansaray
kavram|Geleneksel şehirlerde dükkânların bir arada bulunduğu alışveriş alanı hangisidir?|Çarşı
olay|Medine savunmasında kazılan hendekle anılan savaş hangisidir?|Hendek Savaşı
olay|Hz. Muhammed'in son haccı hangi adla anılır?|Veda Haccı
olay|Müslümanlarla Mekkeliler arasındaki Hudeybiye barışının türü nedir?|Barış antlaşması
olay|Hz. Muhammed döneminde Mekke'nin Müslümanların yönetimine girmesi hangi olaydır?|Mekke'nin Fethi
eser|Müslümanların kutsal kitabı hangisidir?|Kur'an-ı Kerîm
eser|İbn Sînâ'nın tıp alanındaki ünlü eseri hangisidir?|El-Kānûn fi't-Tıb
eser|İbn Haldûn'un toplum ve tarih üzerine tanınan eseri hangisidir?|Mukaddime
eser|Kaşgarlı Mahmud'un Türk dillerini tanıtan sözlüğü hangisidir?|Dîvânu Lugāti't-Türk
kavram|İslâm tarihinde insanların kutsal yerleri görmek için yaptığı ibadet yolculuğu hangisidir?|Hac
kavram|Hicret olayını başlangıç kabul eden takvimin adı nedir?|Hicrî takvim
''')
    grouped_direct('peygamberler-tarihi','''
kişi|İslâm inancında insanlığın ilk atası ve ilk peygamber kimdir?|Hz. Âdem
kişi|İslâm inancında büyük tufan için gemi yapmasıyla tanınan peygamber kimdir?|Hz. Nûh
kişi|İslâm inancında ateşe atıldığı halde korunan peygamber kimdir?|Hz. İbrâhim
kişi|İslâm inancında Kâbe'nin yapımında babası İbrâhim'e yardım eden peygamber kimdir?|Hz. İsmâil
kişi|Kur'an'daki anlatımda kuyuya atılan ve sonradan Mısır'da önemli göreve gelen peygamber kimdir?|Hz. Yûsuf
kişi|Kur'an'da oğlunun hasretiyle anılan, Yûsuf'un babası kimdir?|Hz. Ya‘kūb
kişi|İslâm inancında Firavun'a karşı duran ve asâsıyla tanınan peygamber kimdir?|Hz. Mûsâ
kişi|İslâm inancında Mûsâ'nın kardeşi olan peygamber kimdir?|Hz. Hârûn
kişi|İslâm inancında balığın karnında duasıyla anılan peygamber kimdir?|Hz. Yûnus
kişi|İslâm inancında hastalık karşısındaki sabrıyla örnek verilen peygamber kimdir?|Hz. Eyyûb
kişi|İslâm inancında kuşların dilini bilmesiyle tanınan peygamber kimdir?|Hz. Süleyman
kişi|İslâm inancında Zebur'un verildiği peygamber kimdir?|Hz. Dâvûd
kişi|İslâm inancında annesi Hz. Meryem olan peygamber kimdir?|Hz. Îsâ
kişi|İslâm inancında son peygamber olarak kabul edilen kişi kimdir?|Hz. Muhammed
kişi|Kur'an'da Medyen halkına dürüst ölçü ve tartıyı öğütleyen peygamber kimdir?|Hz. Şuayb
kişi|Kur'an'da Âd halkına gönderilen peygamber kimdir?|Hz. Hûd
kişi|Kur'an'da Semûd halkına gönderilen ve dişi deve kıssasıyla anılan peygamber kimdir?|Hz. Sâlih
kişi|İslâm inancında Yahyâ'nın babası olan peygamber kimdir?|Hz. Zekeriyyâ
kişi|İslâm inancında Zekeriyyâ'nın oğlu olan peygamber kimdir?|Hz. Yahyâ
kişi|İslâm inancında İbrâhim'in oğullarından olup Ya‘kūb'un babası olan peygamber kimdir?|Hz. İshak
değer|Hz. Eyyûb'un sıkıntılara dayanması en çok hangi değerle anlatılır?|Sabır
kişi|Hz. Muhammed'in annesinin adı hangisidir?|Hz. Âmine
kişi|Hz. Muhammed'in babasının adı hangisidir?|Abdullah
kişi|Hz. Muhammed'in ilk evlendiği kişinin adı nedir?|Hz. Hatice
kişi|Hz. Hasan ile Hz. Hüseyin'in annesi olan peygamber kızı kimdir?|Hz. Fâtıma
kişi|Hz. Muhammed'in dedesi, adında Muttalib geçen kişi kimdir?|Abdülmuttalib
kişi|Hz. Muhammed'in dedesinden sonra yanında büyüdüğü amcası kimdir?|Ebû Tâlib
kişi|Siyer kaynaklarında Hz. Muhammed'in sütannesi olarak anılan kişi kimdir?|Halîme
kişi|Hz. Îsâ'nın annesi, Kur'an'da adına sûre bulunan kişi kimdir?|Hz. Meryem
kişi|Hicret sırasında Hz. Muhammed'e yol arkadaşlığı yapan kişi kimdir?|Hz. Ebû Bekir
yaşam|Hz. Muhammed'in doğduğu ve Kâbe'nin bulunduğu şehir hangisidir?|Mekke
yaşam|Hz. Muhammed'in hicret ettiği şehrin adı nedir?|Medine
yaşam|Hz. Muhammed'in güvenilirliği nedeniyle kullanılan unvanı hangisidir?|El-Emîn
yaşam|Hz. Muhammed'in örnek söz ve davranışlarının yolu hangi adla anılır?|Sünnet
yaşam|Hz. Muhammed'in hayatını anlatan araştırma alanının adı nedir?|Siyer
nesne|Hz. Nûh'un tufana hazırlanırken yaptığı büyük araç hangisidir?|Gemi
nesne|Hz. Mûsâ'nın elinde taşımasıyla tanınan eşya hangisidir?|Asâ
nesne|Hz. İbrâhim'in karşı çıktığı, kavminin taptığı heykeller neydi?|Putlar
nesne|Hz. Yûsuf'un kardeşlerinin babalarına kan sürüp gösterdiği giysi hangisidir?|Gömlek
hayvan|Hz. Yûnus kıssasında onu yutan canlı nasıl anılır?|Balık
hayvan|Hz. Süleyman kıssasında arkadaşlarını yuvalarına çağıran küçük canlı hangisidir?|Karınca
hayvan|Hz. Sâlih kıssasında bir işaret olarak anlatılan hayvan hangisidir?|Dişi deve
hayvan|Hz. Yûsuf'un kardeşlerinin onu yediğini iddia ettiği hayvan hangisidir?|Kurt
değer|Hz. Şuayb'ın ölçü ve tartıda hile yapmamayı öğütlemesi hangi değerle ilgilidir?|Dürüstlük
değer|Hz. Yûsuf'un kardeşlerini bağışlaması hangi davranışa örnektir?|Affedicilik
değer|Peygamberlerin ihtiyaç sahiplerine destek olmayı öğütlemesi hangi davranıştır?|Yardımlaşma
kitap|İslâm inancında Hz. Mûsâ'ya verilen kitabın adı nedir?|Tevrat
kitap|İslâm inancında Hz. Îsâ'ya verilen kitabın adı nedir?|İncil
kitap|İslâm inancında Hz. Dâvûd'a verilen kitabın adı nedir?|Zebur
kitap|İslâm inancında Hz. Muhammed'e vahyedilen kitabın adı nedir?|Kur'an-ı Kerîm
''')
    records='''
Bu hayvanlardan hangisi yetişkin hâlinde genellikle en büyük kütleye ulaşır?|Fil|Kedi|Tavşan|Keçi
Bu kara hayvanlarından hangisinin boynu en uzundur?|Zürafa|At|Koyun|Aslan
Bu kuşlardan hangisi yetişkin hâlinde en büyüktür?|Devekuşu|Serçe|Güvercin|Muhabbet kuşu
Bu hayvanlardan hangisi kısa mesafede en hızlı koşabilir?|Çita|Kaplumbağa|Tembel hayvan|Kirpi
Bu deniz canlılarından hangisi en büyük vücuda ulaşır?|Mavi balina|Denizatı|Palyaço balığı|Denizyıldızı
Bu gezegenlerden hangisi çap olarak en büyüktür?|Jüpiter|Dünya|Mars|Merkür
Bu gezegenlerden hangisi çap olarak en küçüktür?|Merkür|Dünya|Jüpiter|Satürn
Bu gezegenlerden hangisi Güneş'e en yakındır?|Merkür|Mars|Jüpiter|Neptün
Bu gezegenlerden hangisi Güneş'e en uzaktır?|Neptün|Venüs|Dünya|Mars
Bu gök cisimlerinden hangisi Dünya'ya en yakındır?|Ay|Güneş|Jüpiter|Neptün
Bu dağlardan hangisinin zirvesi deniz seviyesinden en yüksektir?|Everest|Uludağ|Erciyes|Kaz Dağı
Bu Türk dağlarından hangisinin zirvesi en yüksektir?|Ağrı Dağı|Uludağ|Ilgaz Dağı|Kaz Dağı
Bu göllerden hangisinin yüzey alanı en büyüktür?|Van Gölü|Abant Gölü|Uzungöl|Sapanca Gölü
Bu su alanlarından hangisi yüzölçümü olarak en büyüktür?|Pasifik Okyanusu|Akdeniz|Marmara Denizi|Karadeniz
Bu kıtalardan hangisinin yüzölçümü en büyüktür?|Asya|Avrupa|Avustralya|Antarktika
Bu ülkelerden hangisinin yüzölçümü en büyüktür?|Rusya|Türkiye|Yunanistan|İtalya
Bu ülkelerden hangisinin yüzölçümü en küçüktür?|Vatikan|Almanya|Fransa|Brezilya
Bu ülkelerden hangisinin yüzölçümü en büyüktür: Kanada ve üç Avrupa ülkesi?|Kanada|Portekiz|Belçika|Hollanda
Bu ülkelerden hangisinin yüzölçümü en büyüktür: Brezilya ve üç Güney Amerika ülkesi?|Brezilya|Uruguay|Ekvador|Paraguay
Bu ülkelerden hangisinin yüzölçümü en küçüktür: Türkiye ve üç komşusu?|Ermenistan|Türkiye|İran|Irak
Bu organlardan hangisi tüm vücudun dışını kapladığı için en geniş yüzeye sahiptir?|Deri|Kalp|Mide|Dalak
Bu malzemelerden hangisi Mohs sertlik ölçeğinde en serttir?|Elmas|Talk|Jips|Kalsit
Bu dört uzunluk biriminden hangisi en büyük mesafeyi ifade eder?|Kilometre|Metre|Santimetre|Milimetre
Bu dört uzunluk biriminden hangisi en küçük mesafeyi ifade eder?|Milimetre|Santimetre|Metre|Kilometre
Bu zaman dilimlerinden hangisi en uzundur?|Yıl|Ay|Hafta|Gün
Bu zaman birimlerinden hangisi en kısadır?|Saniye|Dakika|Saat|Gün
Bu kütle birimlerinden hangisi en büyüktür?|Ton|Kilogram|Gram|Miligram
Bu kütle birimlerinden hangisi en küçüktür?|Miligram|Gram|Kilogram|Ton
Bu mevsimlerden hangisinde Türkiye'de sıcaklıklar genel olarak en yüksektir?|Yaz|Kış|İlkbahar|Sonbahar
Bu mevsimlerden hangisinde Türkiye'de sıcaklıklar genel olarak en düşüktür?|Kış|Yaz|İlkbahar|Sonbahar
Bu canlılardan hangisi yetişkin hâlinde genellikle en küçüktür?|Karınca|Tavşan|Kedi|Koyun
Bu evcil hayvanlardan hangisi yetişkin hâlinde genellikle en ağırdır?|At|Hamster|Kedi|Muhabbet kuşu
Bu hayvanlardan hangisi uçuş sırasında en yüksek hızlara ulaşabilir?|Doğan|Tavuk|Devekuşu|Penguen
Bu araçlardan hangisi havada en hızlı yolculuk yapar?|Yolcu uçağı|Sıcak hava balonu|Planör|Paraşüt
Bu ulaşım araçlarından hangisi yük taşıma kapasitesi bakımından genellikle en büyüktür?|Büyük yük gemisi|Binek otomobil|Motosiklet|Bisiklet
Bu dört doğal oluşumdan hangisi suyun en yüksekten serbestçe dökülmesine örnektir?|Şelale|Durgun göl|Kumsal|Ova
Bu bitkilerden hangisi yetişkin hâlinde genellikle en yüksek olur?|Çam ağacı|Papatya|Çim|Menekşe
Bu meyvelerden hangisi tipik bir meyve olarak en büyük kütleye ulaşır?|Karpuz|Kiraz|Üzüm tanesi|Erik
Bu geometrik şekillerden hangisinin köşe sayısı en fazladır?|Altıgen|Üçgen|Kare|Beşgen
Bu geometrik şekillerden hangisinin kenar sayısı en azdır?|Üçgen|Kare|Beşgen|Altıgen
Bu ayların hangisi normal bir yılda en kısa sürer?|Şubat|Ocak|Mart|Mayıs
Bu bölgelerimizden hangisi yüzölçümü bakımından en büyüktür?|Doğu Anadolu|Marmara|Ege|Güneydoğu Anadolu
Bu bölgelerimizden hangisi yüzölçümü bakımından en küçüktür?|Güneydoğu Anadolu|Doğu Anadolu|İç Anadolu|Karadeniz
Bu adalardan hangisinin yüzölçümü en büyüktür?|Grönland|Gökçeada|Bozcaada|Büyükada
Bu dört su birikintisinden hangisi en büyük ölçeği anlatır?|Okyanus|Su birikintisi|Küçük gölet|Bahçe havuzu
Bu sıcaklıkları anlatan ifadelerden hangisi en soğuk koşulu belirtir?|Dondurucu soğuk|Serin|Ilık|Sıcak
Bu kitap bölümlerinden hangisi bir kitabı açınca en önce görülür?|Ön kapak|Son sayfa|Arka kapak|Kaynakça
Bu alfabetik kelimelerden hangisi Türk alfabesine göre en önce gelir?|Armut|Elma|Kiraz|Muz
Bu alfabetik kelimelerden hangisi Türk alfabesine göre en sonra gelir?|Zeytin|Armut|Elma|Kiraz
Bu yaşam evrelerinden hangisi insan hayatında en önce gelir?|Bebeklik|Çocukluk|Gençlik|Yetişkinlik
'''
    for line in records.strip().splitlines():
        text,answer,*wrong=line.split('|')
        explanation=f'{text} Bu karşılaştırmada doğru seçenek {answer}. Değerlendirme yalnızca soruda verilen dört seçenek ve belirtilen ölçüt içindir.'
        put('enler',text,answer,[answer,*wrong],explanation)
    assert set(counts)==set(replaced),counts
    assert all(n==50 for n in counts.values()),dict(counts)
