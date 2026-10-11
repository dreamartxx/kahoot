"""Original, four-choice Turkish cinema quiz; fixed film editions and award years."""
import hashlib
import random
from collections import Counter


def film_questions():
    rng = random.Random(20261011)
    out = []

    def add(text, answer, choices, explanation, topic, difficulty='general', source=None):
        wrong = list(dict.fromkeys(x for x in choices if x != answer))
        assert len(wrong) >= 3, text
        options = [answer] + rng.sample(wrong, 3)
        rng.shuffle(options)
        q = dict(id='film-'+hashlib.sha256(text.encode()).hexdigest()[:14], category='film',
                 text=text, options=options, correct=options.index(answer),
                 explanation=explanation, topic=topic, difficulty=difficulty)
        if source:
            q['source'] = source
        out.append(q)

    def rows(topic, raw):
        for line in raw.strip().splitlines():
            p = line.split('|')
            assert len(p) in (6, 7), (topic, line)
            add(p[0], p[1], p[1:5], p[5], topic, p[6] if len(p) == 7 else 'general')

    # Character + film edition prevent ambiguous casting questions about remakes.
    turkish_cast = '''Hababam Sınıfı (1975)|İnek Şaban|Kemal Sunal
Hababam Sınıfı (1975)|Mahmut Hoca|Münir Özkul
Hababam Sınıfı (1975)|Hafize Ana|Adile Naşit
Hababam Sınıfı (1975)|Güdük Necmi|Halit Akçatepe
Hababam Sınıfı (1975)|Damat Ferit|Tarık Akan
Çöpçüler Kralı (1977)|Hacer|Ayşen Gruda
Tosun Paşa (1976)|Lütfü|Şener Şen
Sultan (1978)|Sultan|Türkan Şoray
Selvi Boylum Al Yazmalım (1977)|İlyas|Kadir İnanır
Eşkıya (1996)|Baran|Şener Şen
Eşkıya (1996)|Cumali|Uğur Yücel
G.O.R.A. (2004)|Arif|Cem Yılmaz
G.O.R.A. (2004)|Ceku|Özge Özberk
G.O.R.A. (2004)|216|Ozan Güven
Recep İvedik (2008)|Recep İvedik|Şahan Gökbakar
Vizontele (2001)|Deli Emin|Yılmaz Erdoğan
Vizontele (2001)|Siti Ana|Demet Akbağ
Organize İşler (2005)|Asım Noyan|Yılmaz Erdoğan
Babam ve Oğlum (2005)|Sadık|Fikret Kuşkan
Babam ve Oğlum (2005)|Hüseyin|Çetin Tekindor
Issız Adam (2008)|Alper|Cemal Hünal
Ayla (2017)|genç Süleyman Astsubay|İsmail Hacıoğlu
7. Koğuştaki Mucize (2019)|Memo|Aras Bulut İynemli
Aile Arasında (2017)|Fikret|Engin Günaydın
Aile Arasında (2017)|Solmaz|Demet Evgar'''
    world_cast = '''Titanic (1997)|Jack Dawson|Leonardo DiCaprio
Titanic (1997)|genç Rose DeWitt Bukater|Kate Winslet
Forrest Gump (1994)|Forrest Gump|Tom Hanks
Karayip Korsanları: Siyah İnci'nin Laneti (2003)|Jack Sparrow|Johnny Depp
Matrix (1999)|Neo|Keanu Reeves
Harry Potter ve Felsefe Taşı (2001)|Harry Potter|Daniel Radcliffe
Harry Potter ve Felsefe Taşı (2001)|Hermione Granger|Emma Watson
Harry Potter ve Felsefe Taşı (2001)|Ron Weasley|Rupert Grint
Yüzüklerin Efendisi: Yüzük Kardeşliği (2001)|Frodo|Elijah Wood
Yüzüklerin Efendisi: Yüzük Kardeşliği (2001)|Gandalf|Ian McKellen
Yüzüklerin Efendisi: Yüzük Kardeşliği (2001)|Aragorn|Viggo Mortensen
Gladyatör (2000)|Maximus|Russell Crowe
Kara Şövalye (2008)|Joker|Heath Ledger
Joker (2019)|Arthur Fleck|Joaquin Phoenix
Iron Man (2008)|Tony Stark|Robert Downey Jr.
Thor (2011)|Thor|Chris Hemsworth
Kaptan Amerika: İlk Yenilmez (2011)|Steve Rogers|Chris Evans
Kara Panter (2018)|T'Challa|Chadwick Boseman
Wonder Woman (2017)|Diana|Gal Gadot
Örümcek-Adam (2002)|Peter Parker|Tobey Maguire
Açlık Oyunları (2012)|Katniss Everdeen|Jennifer Lawrence
Rocky (1976)|Rocky Balboa|Sylvester Stallone
Indiana Jones: Kutsal Hazine Avcıları (1981)|Indiana Jones|Harrison Ford
Terminatör (1984)|T-800|Arnold Schwarzenegger
Esaretin Bedeli (1994)|Andy Dufresne|Tim Robbins'''
    for topic, raw in [('yesilcam-ve-turk-oyuncular', turkish_cast), ('dunya-sinemasi-oyuncular', world_cast)]:
        table = [line.split('|') for line in raw.splitlines()]
        for film, character, actor in table:
            add(f'{film} filminde {character} karakterini hangi oyuncu canlandırdı?', actor,
                [r[2] for r in table], f'{film} filmindeki {character} rolünde {actor} yer alır.', topic)

    directors = '''Titanic (1997)|James Cameron|general
Avatar (2009)|James Cameron|general
Jurassic Park (1993)|Steven Spielberg|general
E.T. (1982)|Steven Spielberg|general
Başlangıç / Inception (2010)|Christopher Nolan|general
Yıldızlararası / Interstellar (2014)|Christopher Nolan|general
Ucuz Roman / Pulp Fiction (1994)|Quentin Tarantino|general
Baba / The Godfather (1972)|Francis Ford Coppola|general
Yüzüklerin Efendisi: Yüzük Kardeşliği (2001)|Peter Jackson|general
Ruhların Kaçışı / Spirited Away (2001)|Hayao Miyazaki|general
Parazit / Parasite (2019)|Bong Joon-ho|general
Gladyatör / Gladiator (2000)|Ridley Scott|expert
Geleceğe Dönüş / Back to the Future (1985)|Robert Zemeckis|expert
Amélie (2001)|Jean-Pierre Jeunet|expert
Büyük Budapeşte Oteli (2014)|Wes Anderson|expert
Piyanist / The Pianist (2002)|Roman Polanski|expert
Yumurcak / The Kid (1921)|Charlie Chaplin|expert
Yedi Samuray / Seven Samurai (1954)|Akira Kurosawa|expert
Hayat Güzeldir / Life Is Beautiful (1997)|Roberto Benigni|expert
Barbie (2023)|Greta Gerwig|general
Hababam Sınıfı (1975)|Ertem Eğilmez|general
Babam ve Oğlum (2005)|Çağan Irmak|general
Kış Uykusu (2014)|Nuri Bilge Ceylan|general
Eşkıya (1996)|Yavuz Turgul|expert
G.O.R.A. (2004)|Ömer Faruk Sorak|expert'''
    director_table = [line.split('|') for line in directors.splitlines()]
    for film, director, difficulty in director_table:
        add(f'{film} filmini kim yönetti?', director, [r[1] for r in director_table],
            f'{film} filminin yönetmeni {director}.', 'yonetmenler', difficulty)

    rows('animasyon', '''Oyuncak Hikâyesi'ndeki Woody nasıl bir oyuncaktır?|Kovboy|Robot köpek|Oyuncak tren|Korsan gemisi|Woody, şerif kıyafetli bir kovboy oyuncağıdır.
Oyuncak Hikâyesi'nde Buzz Lightyear hangi tür kahramanı temsil eder?|Uzay korucusu|Deniz korsanı|Orta Çağ şövalyesi|Dedektif|Buzz, uzay maceraları için tasarlanmış bir aksiyon oyuncağıdır.
Kayıp Balık Nemo'da Nemo'yu okyanusta arayan babasının adı nedir?|Marlin|Bruce|Crush|Nigel|Marlin, oğlunu bulmak için Dory ile yola çıkar.
Kayıp Balık Nemo'da Dory'nin yaşadığı temel güçlük hangisidir?|Kısa süreli hafıza kaybı|Uçamamak|Renkleri görememek|Yüzememek|Dory yeni bilgileri hatırlamakta güçlük çeker.
Ratatuy / Ratatouille filmindeki Remy hangi hayvandır?|Fare|Tavşan|Kedi|Sincap|Remy, yemek yapma yeteneği olan bir faredir.
Ratatuy / Ratatouille filminde Remy'nin hayali hangi mesleği yapmaktır?|Aşçılık|Pilotluk|Avukatlık|Terzilik|Remy iyi bir şef olmanın peşinden gider.
WALL-E'nin Dünya'daki işi nedir?|Çöpleri toplamak ve sıkıştırmak|Ormanları sulamak|Tren kullanmak|Gazete dağıtmak|WALL-E, kirlenmiş Dünya'yı temizlemek için üretilmiştir.
WALL-E'nin peşinden uzaya gittiği robotun adı nedir?|EVE|Dory|Jessie|Merida|EVE'nin gelişi WALL-E'nin hayatını değiştirir.
Yukarı Bak / Up filminde Carl'ın evi nasıl havalanır?|Balonlarla|Roket motoruyla|Dev kanatlarla|Sihirli halıyla|Carl evine çok sayıda helyum balonu bağlar.
Yukarı Bak / Up filminde Carl'a eşlik eden genç izcinin adı nedir?|Russell|Miguel|Andy|Hiro|Russell, evle birlikte maceraya katılan izcidir.
Coco filminde Miguel'in büyük tutkusu nedir?|Müzik|Boks|Arkeoloji|Resim ticareti|Miguel müzisyen olmayı hayal eder.
Coco filminin kültürel dünyası hangi ülkeye dayanır?|Meksika|İtalya|Japonya|Norveç|Film Meksika'nın Ölüler Günü geleneği çevresinde gelişir.
Ters Yüz / Inside Out filminde Neşe, Üzüntü ve Öfke neyi temsil eder?|Duyguları|Gezegenleri|Mevsimleri|Müzik aletlerini|Bu karakterler Riley'nin zihnindeki duygulardır.
Ters Yüz / Inside Out filmindeki duygular hangi çocuğun zihninde yaşar?|Riley|Elsa|Moana|Rapunzel|Riley'nin taşınmayla değişen hayatı duyguların macerasını başlatır.
Arabalar / Cars filmlerinin kırmızı yarış arabası kimdir?|Şimşek McQueen|Mater|Doc Hudson|Luigi|Şimşek McQueen serinin yarışçı kahramanıdır.
Arabalar / Cars filmindeki Mater ne tür bir araçtır?|Çekici|İtfaiye aracı|Ambulans|Otobüs|Mater, arkadaş canlısı eski bir çekicidir.
Canavarlar, Inc. filminde Mike Wazowski'nin kaç gözü vardır?|Bir|İki|Üç|Dört|Mike tek gözlü, yeşil bir canavardır.
Canavarlar, Inc. filminde Sulley'nin yakın arkadaşı kimdir?|Mike Wazowski|Buzz Lightyear|Woody|Lightning McQueen|Sulley ve Mike birlikte çalışan iki arkadaştır.
İnanılmaz Aile'deki Elastigirl'ün belirgin gücü nedir?|Vücudunu esnetmek|Zamanı durdurmak|Taşa dönüşmek|Suyla konuşmak|Helen Parr, Elastigirl kimliğiyle esnekliğini kullanır.
İnanılmaz Aile'deki Dash hangi yeteneğiyle öne çıkar?|Çok hızlı koşmak|Görünmez olmak|Zihin okumak|Buz üretmek|Dash'in süper gücü hızdır.
Cesur / Brave filmindeki Merida hangi silahı kullanmakta ustadır?|Yay ve ok|Işın kılıcı|Sapan|Üç dişli mızrak|Merida okçuluk yeteneğiyle tanınır.
Luca filminde Luca ve Alberto'nun sakladığı kimlik nedir?|Deniz canavarı olmaları|Uzaylı olmaları|Robot olmaları|Hayalet olmaları|İki arkadaş karada insan görünümüne bürünebilir.
Soul filmindeki Joe Gardner hangi müzik türüne tutkuyla bağlıdır?|Caz|Heavy metal|Opera|Tekno|Joe Gardner piyano çalan bir caz müzisyenidir.
Kırmızı / Turning Red filminde Mei heyecanlanınca neye dönüşür?|Kırmızı pandaya|Beyaz kurda|Mavi kuşa|Sarı tavşana|Mei güçlü duygular yaşadığında büyük bir kırmızı pandaya dönüşür.
Karlar Ülkesi / Frozen filmindeki Elsa'nın kız kardeşi kimdir?|Anna|Ariel|Belle|Jasmine|Anna ve Elsa, Arendelle'in iki kız kardeşidir.
Karlar Ülkesi / Frozen filmindeki Olaf nasıl bir karakterdir?|Kardan adam|Ren geyiği|Kurt|Buz devi|Olaf, Elsa'nın sihriyle canlanan bir kardan adamdır.
Aslan Kral'da Simba'nın babası kimdir?|Mufasa|Scar|Timon|Zazu|Mufasa, Simba'nın babası ve sürünün kralıdır.
Aslan Kral'da Timon'un yaban domuzu arkadaşı kimdir?|Pumbaa|Rafiki|Nala|Scar|Timon ve Pumbaa Simba'ya dost olur.
Aladdin'deki Cin hangi nesneden çıkar?|Sihirli lamba|Altın taç|Gümüş ayna|Kristal küre|Cin, sihirli lambanın içinde yaşar.
Aladdin filmindeki prensesin adı nedir?|Jasmine|Aurora|Elsa|Merida|Jasmine, Agrabah'ın prensesidir.
Küçük Deniz Kızı'nın deniz kızı kahramanı kimdir?|Ariel|Belle|Mulan|Elsa|Ariel, insanların dünyasını merak eder.
Güzel ve Çirkin'de Şato'ya gelen genç kadının adı nedir?|Belle|Cinderella|Anna|Moana|Belle, Çirkin'in şatosunda yaşamaya başlar.
Rapunzel'in hikâyesini anlatan Karmakarışık / Tangled filminde kahramanın belirgin özelliği nedir?|Çok uzun saçları|Metal kanatları|Görünmez olması|Buzdan elleri|Rapunzel'in uzun ve sihirli saçları öyküde önemli rol oynar.
Moana'ya okyanus yolculuğunda eşlik eden yarı tanrı kimdir?|Maui|Hades|Zeus|Herkül|Maui, Moana'nın yolculuğundaki güçlü ama inatçı yol arkadaşıdır.
Zootropolis / Zootopia filmindeki polis Judy Hopps hangi hayvandır?|Tavşan|Tilki|Aslan|Su aygırı|Judy, polis olma hayalini gerçekleştiren bir tavşandır.
Zootropolis / Zootopia filmindeki Nick Wilde hangi hayvandır?|Tilki|Kurt|Tavşan|Kaplan|Nick, Judy ile ortak çalışan kurnaz bir tilkidir.
6 Süper Kahraman / Big Hero 6 filminde Baymax ne için tasarlanmış bir robottur?|Sağlık hizmeti|Yarış pilotluğu|Tarım|Uzay madenciliği|Baymax, insanların sağlığına yardımcı olmak için yapılmıştır.
Encanto: Sihirli Dünya'daki ailenin soyadı nedir?|Madrigal|Parr|Addams|Banks|Mirabel ve ailesi Madrigal soyadını taşır.
Şrek nasıl bir masal yaratığıdır?|Yeşil bir dev|Kanatlı bir at|Deniz kızı|Cüce|Şrek, bataklıkta yaşayan yeşil bir devdir.
Şrek'in prenses sevgilisinin adı nedir?|Fiona|Rapunzel|Aurora|Belle|Fiona, Şrek'in macerasının merkezindeki prensestir.
Kung Fu Panda'daki Po hangi hayvandır?|Panda|Kaplan|Turna|Maymun|Po, kung fu öğrenmek isteyen bir pandadır.
Ejderhanı Nasıl Eğitirsin'de Hıçkıdık'ın ejderhasının adı nedir?|Dişsiz|Smaug|Mushu|Saphira|Hıçkıdık, Gece Öfkesi türündeki Dişsiz ile dost olur.
Madagaskar filmlerindeki Alex hangi hayvandır?|Aslan|Zebra|Zürafa|Su aygırı|Alex, New York hayvanat bahçesinden gelen aslandır.
Buz Devri'ndeki Manny hangi hayvandır?|Mamut|Kaplan|Tembel hayvan|Sincap|Manny, grubun iri mamutudur.
Buz Devri'ndeki Diego hangi hayvandır?|Kılıç dişli kaplan|Kutup ayısı|Mamut|Timsah|Diego, sürünün kılıç dişli kaplanıdır.
Çılgın Hırsız filmlerindeki Gru'nun küçük sarı yardımcılarına ne denir?|Minyonlar|Şirinler|Ewoklar|Troller|Minyonlar, Gru'ya yardım eden sarı karakterlerdir.
Minyonların özellikle sevdiği meyve hangisidir?|Muz|Karpuz|Limon|Kiraz|Muz, Minyonların filmlerdeki favori yiyeceklerindendir.
Otel Transilvanya'nın otelini işleten ünlü canavar kimdir?|Drakula|Frankenstein'ın canavarı|Mumya|Kurt adam|Drakula, canavarların otelinin sahibidir.
Komşum Totoro filminde kız kardeşlerin karşılaştığı büyük orman ruhunun adı nedir?|Totoro|Ponyo|Howl|Haku|Totoro, kız kardeşlerin dost olduğu orman ruhudur.
Ruhların Kaçışı filmindeki Chihiro'nun macerası ağırlıklı olarak hangi dünyada geçer?|Ruhlar dünyası|Bir bilgisayar oyunu|Mars kolonisi|Denizaltı krallığı|Chihiro, ruhların yaşadığı dünyada ailesini kurtarmaya çalışır.''')

    rows('filmler-ve-karakterler', '''Harry Potter filmlerindeki büyücülük okulunun adı nedir?|Hogwarts|Narnia|Wakanda|Gotham|Harry büyücülük eğitimini Hogwarts'ta alır.
Harry Potter'ın alnındaki yara izi hangi biçimdedir?|Şimşek|Yıldız|Ay|Kalp|Harry'nin alnında şimşek biçiminde bir iz vardır.
Harry Potter filmlerindeki Quidditch maçlarında oyuncular neyle uçar?|Süpürge|Halı|Kanatlı bisiklet|Roket|Quidditch, uçan süpürgeler üzerinde oynanır.
Yüzüklerin Efendisi'nde yok edilmesi gereken nesne nedir?|Tek Yüzük|Kristal küre|Altın anahtar|Sihirli ayna|Sauron'un gücüne bağlı Tek Yüzük yok edilmelidir.
Yüzüklerin Efendisi'nde Frodo hangi halktandır?|Hobbit|Elf|Cüce|İnsan|Frodo, Shire'dan gelen bir hobbittir.
Yüzüklerin Efendisi'nde Legolas hangi halktandır?|Elf|Hobbit|Cüce|Ork|Legolas, okçuluğuyla tanınan bir elftir.
Yıldız Savaşları'nda Jedi'ların kullandığı ünlü silah nedir?|Işın kılıcı|Bumerang|Yay|Balta|Işın kılıçları Jedi ve Sith karakterleriyle özdeşleşir.
Yıldız Savaşları'nda Luke Skywalker'ın babası kimdir?|Darth Vader|Han Solo|Obi-Wan Kenobi|Yoda|Darth Vader'ın eski kimliği Anakin Skywalker'dır.
Yıldız Savaşları'ndaki R2-D2 ve C-3PO ne tür varlıklardır?|Droid|Ejderha|Jedi ustası|Wookiee|İkisi de farklı görevleri olan droidlerdir.
Avatar (2009) filmindeki mavi tenli halkın adı nedir?|Na'vi|Hobbitler|Ewoklar|Klingonlar|Na'vi, Pandora'da yaşayan halktır.
Avatar (2009) filminin büyük bölümü nerede geçer?|Pandora|Tatooine|Krypton|Arrakis|Pandora, filmin ormanlarla kaplı uydusudur.
Matrix (1999) filminde Neo gerçeği öğrenmek için hangi hapı seçer?|Kırmızı|Mavi|Sarı|Yeşil|Kırmızı hap, Neo'nun simülasyonun dışındaki gerçeğe uyanmasını sağlar.
Geleceğe Dönüş'te zaman makinesi hangi otomobil modeliyle yapılmıştır?|DeLorean|Volkswagen Beetle|Mini Cooper|Ford Mustang|Doc Brown zaman makinesini bir DeLorean'a kurar.
Geleceğe Dönüş filmlerinin genç kahramanı kimdir?|Marty McFly|Peter Parker|Harry Potter|Luke Skywalker|Marty, Doc Brown ile zamanda yolculuk eder.
Jurassic Park'taki tema parkının başlıca canlıları hangileridir?|Dinozorlar|Ejderhalar|Dev böcekler|Deniz kızları|Parkta genetik yöntemlerle yeniden üretilen dinozorlar vardır.
Jaws / Denizin Dişleri filminde kıyı halkını tehdit eden hayvan hangisidir?|Köpekbalığı|Timsah|Ahtapot|Balina|Filmin tehlikesi büyük beyaz köpekbalığıdır.
E.T. filmindeki E.T. nasıl bir varlıktır?|Uzaylı|Robot|Hayalet|Büyücü|Elliott, Dünya'da kalan bir uzaylıyla arkadaş olur.
Evde Tek Başına (1990) filmindeki evde unutulan çocuğun adı nedir?|Kevin|Charlie|Billy|Dennis|Kevin McCallister, ailesi tatile giderken evde kalır.
Karayip Korsanları'ndaki Jack Sparrow'un ünlü gemisi hangisidir?|Siyah İnci|Titanic|Nautilus|Enterprise|Jack Sparrow, Siyah İnci adlı korsan gemisiyle özdeşleşir.
Indiana Jones'un asıl mesleği nedir?|Arkeolog|Doktor|Pilot|Gazeteci|Indiana Jones, arkeoloji profesörü ve maceracıdır.
Rocky filmlerinin merkezinde hangi spor vardır?|Boks|Güreş|Basketbol|Tenis|Rocky Balboa bir boksördür.
Harry Potter filmlerinde konuşma yeteneğiyle bilinen Seçmen Şapka ne yapar?|Öğrencileri binalara ayırır|Maçları yönetir|Yemek pişirir|Mektup taşır|Şapka, yeni öğrencilerin hangi Hogwarts binasına katılacağını belirler.
Açlık Oyunları'nda Katniss'in en çok kullandığı silah hangisidir?|Yay ve ok|Işın kılıcı|Trident|Sapan|Katniss okçuluk becerisiyle öne çıkar.
Batman'in yaşadığı ve koruduğu şehir hangisidir?|Gotham|Metropolis|Atlantis|Wakanda|Gotham, Batman hikâyelerinin ana şehridir.
Superman'in doğduğu gezegen hangisidir?|Krypton|Mars|Pandora|Vulcan|Superman, Krypton'dan Dünya'ya gönderilir.
Marvel filmlerinde Tony Stark hangi kahramanın kimliğidir?|Iron Man|Thor|Hulk|Ant-Man|Tony Stark, geliştirdiği zırhla Iron Man olur.
Marvel filmlerinde Bruce Banner hangi yeşil kahramana dönüşür?|Hulk|Vision|Loki|Groot|Bruce Banner'ın dönüşümü Hulk'u ortaya çıkarır.
Kara Panter filmlerindeki gelişmiş Afrika ülkesinin adı nedir?|Wakanda|Genovia|Narnia|Latveria|Wakanda, Kara Panter'in ülkesidir.
Marvel filmlerinde Thor'un çekici hangi adla anılır?|Mjölnir|Excalibur|Andúril|Sting|Mjölnir, Thor'un büyülü çekicidir.
Galaksinin Koruyucuları'ndaki Groot neye benzeyen bir varlıktır?|Ağaca|Kayaya|Ahtapota|Kuşa|Groot, ağaç benzeri bir canlıdır.
Görevimiz Tehlike filmlerinin ajan kahramanının adı nedir?|Ethan Hunt|James Bond|Jason Bourne|Jack Ryan|Ethan Hunt, IMF ekibinin ajanıdır.
James Bond hangi numarayla tanınır?|007|001|009|013|007, James Bond'un ajan numarasıdır.
Titanic (1997) filmindeki büyük yolculuk hangi araçta yapılır?|Yolcu gemisi|Tren|Uçak|Zeplin|Jack ve Rose'un hikâyesi Titanic gemisinde gelişir.
Yüzüklerin Efendisi'nde Frodo'nun en yakın yol arkadaşı hangi hobbittir?|Sam|Pippin|Merry|Bilbo|Samwise Gamgee, yüzüğü taşıma yolculuğunda Frodo'ya eşlik eder.
Charlie'nin Çikolata Fabrikası'ndaki fabrikanın sahibi kimdir?|Willy Wonka|Ebenezer Scrooge|Mr. Bean|Doc Brown|Willy Wonka, sıra dışı çikolata fabrikasının sahibidir.
Narnia Günlükleri: Aslan, Cadı ve Dolap'ta çocuklar Narnia'ya nereden geçer?|Gardırop|Buzdolabı|Asansör|Tren tüneli|Çocuklar bir gardırobun içinden Narnia'ya ulaşır.
Narnia filmlerindeki Aslan ne tür bir hayvandır?|Aslan|Kaplan|Kurt|Ayı|Aslan, Narnia'nın bilge ve güçlü aslanıdır.
Paddington filmlerindeki Paddington hangi hayvandır?|Ayı|Panda|Koala|Rakun|Paddington, Peru'dan Londra'ya gelen bir ayıdır.
Karate Kid (1984) filminde Bay Miyagi hangi dövüş sanatını öğretir?|Karate|Judo|Eskrim|Boks|Bay Miyagi, Daniel'e karate öğretir.
Marslı / The Martian filminde astronot Mark Watney nerede mahsur kalır?|Mars|Venüs|Ay|Jüpiter|Watney Mars'ta tek başına hayatta kalmaya çalışır.
Başlangıç / Inception filmindeki ekip hangi alana girerek görev yapar?|Rüyalara|Denizaltı mağaralarına|Volkanlara|Tarihî resimlere|Ekip, başkalarının rüyalarına girer.
Truman Show'da Truman'ın habersiz olduğu durum nedir?|Hayatının bir televizyon programı olması|Bir astronot olması|Bir kral olması|Görünmez olması|Truman'ın yaşamı gizlice kurulan bir televizyon dünyasında geçer.
Esaretin Bedeli'nin öyküsünün büyük bölümü nerede geçer?|Hapishane|Uzay gemisi|Lise|Sirk|Andy ve Red'in dostluğu Shawshank Hapishanesi'nde gelişir.
Gladyatör (2000) filmi hangi uygarlık çevresinde geçer?|Antik Roma|Antik Mısır|Aztekler|Vikingler|Maximus'un hikâyesi Roma İmparatorluğu döneminde geçer.
Amélie filminin ana şehri hangisidir?|Paris|Roma|Madrid|Berlin|Amélie'nin öyküsü Paris'in Montmartre çevresinde geçer.
La La Land'de Sebastian'ın tutkusu hangi müzik türüdür?|Caz|Opera|Rap|Country|Sebastian, caz piyanisti olarak kendi yolunu arar.
Slumdog Millionaire / Milyoner filminde Jamal hangi tür programa katılır?|Bilgi yarışması|Yemek yarışması|Dans yarışması|Moda yarışması|Jamal'ın geçmişi, bilgi yarışmasındaki cevaplarla bağlantılıdır.
Baba / The Godfather filmindeki ailenin soyadı nedir?|Corleone|Soprano|Addams|McCallister|Filmin merkezinde Corleone ailesi vardır.
Barbie (2023) filminde Barbie'ye gerçek dünya yolculuğunda kim eşlik eder?|Ken|Woody|Kristoff|Aladdin|Ken, Barbie'nin gerçek dünyaya gidişine katılır.
Dune (2021) filmindeki çöl gezegeninin adı nedir?|Arrakis|Pandora|Krypton|Naboo|Arrakis, baharat üretimi nedeniyle çok önemlidir.''')

    rows('turk-filmleri', '''Hababam Sınıfı filmlerindeki olaylar temel olarak nerede geçer?|Lisede|Hastanede|Karakolda|Uzay üssünde|Öykü, haylaz öğrencilerin okul hayatını anlatır.
Hababam Sınıfı filmleri hangi yazarın eserinden uyarlanmıştır?|Rıfat Ilgaz|Yaşar Kemal|Aziz Nesin|Orhan Kemal|Rıfat Ilgaz'ın Hababam Sınıfı eseri sinemaya uyarlanmıştır.
Tosun Paşa (1976) filminde uşak Şaban hangi kimliğe bürünür?|Paşa|Doktor|Öğretmen|Avukat|Şaban, gerçek Tosun Paşa gibi davranmak zorunda kalır.
Süt Kardeşler filminde konağı korkutan yaratık hangi adla anılır?|Gulyabani|Tepegöz|Şahmeran|Anka|Konağa gelenlerin korkusu Gulyabani etrafında gelişir.
Kibar Feyzo'da Feyzo'nun karşı çıktığı evlilik uygulaması hangisidir?|Başlık parası|Balayı yolculuğu|Nikâh şekeri|Düğün fotoğrafı|Film, başlık parası ve ağalık düzenini hicveder.
Çöpçüler Kralı'nda Apti'nin başlangıçtaki işi nedir?|Çöpçülük|Terzilik|Berberlik|Marangozluk|Apti mahallede temizlik işçisi olarak çalışır.
Kapıcılar Kralı'nda Seyit'in mesleği nedir?|Apartman görevlisi|Otobüs şoförü|Kasap|Postacı|Seyit bir apartmanın kapıcısıdır.
Çiçek Abbas filminde Abbas geçimini hangi araçla taşımacılık yaparak sağlamaya çalışır?|Minibüs|Tramvay|Gemi|Uçak|Film minibüsçüler arasındaki rekabeti anlatır.
Neşeli Günler filmindeki aile hangi yiyeceği satar?|Turşu|Dondurma|Baklava|Simit|Ailenin turşuculuk işi ve yaşadığı ayrılık öykünün merkezindedir.
Bizim Aile (1975) filminde Yaşar Usta'yı hangi oyuncu canlandırır?|Münir Özkul|Kemal Sunal|Tarık Akan|Zeki Alasya|Münir Özkul, ailenin emekçi babası Yaşar Usta rolündedir.
Selvi Boylum Al Yazmalım'da İlyas hangi araçla çalışır?|Kamyon|Taksi|Tren|Traktör|İlyas bir kamyon şoförüdür.
Züğürt Ağa filmindeki ağa, köyünü sattıktan sonra hangi büyük şehre gider?|İstanbul|Ankara|İzmir|Bursa|Ağa İstanbul'da yeni bir hayat kurmaya çalışır.
Muhsin Bey filmindeki Muhsin Bey'in işi hangi alanla ilgilidir?|Müzik organizasyonu|Denizcilik|İnşaat|Hayvancılık|Muhsin Bey, müzik dünyasında çalışan bir organizatördür.
G.O.R.A.'da Arif'i Dünya'dan kimler kaçırır?|Uzaylılar|Korsanlar|Büyücüler|Zaman yolcuları|Arif uzaylılar tarafından Gora gezegenine götürülür.
A.R.O.G.'da Arif hangi döneme gönderilir?|Taş Devri|Osmanlı dönemi|Orta Çağ Avrupası|Uzak gelecek|Arif tarih öncesi dönemde yaşamaya çalışır.
Yahşi Batı'da iki Osmanlı görevlisinin macerası hangi ülkede geçer?|ABD|Japonya|Brezilya|Mısır|Aziz ve Lemi'nin yolculuğu Amerikan Vahşi Batısı'nda geçer.
Vizontele'de kasabaya gelen ve büyük merak uyandıran cihaz nedir?|Televizyon|Cep telefonu|Çamaşır makinesi|Fotokopi makinesi|Kasabaya televizyonun gelişi olayları başlatır.
Babam ve Oğlum'da Sadık'ın oğlunun adı nedir?|Deniz|Ege|Arda|Mert|Deniz, babasıyla dedesinin çiftliğine gelir.
Ayla (2017) filmindeki asker ile küçük kızın tanışması hangi savaş sırasında olur?|Kore Savaşı|Kurtuluş Savaşı|Çanakkale Savaşı|Vietnam Savaşı|Süleyman Astsubay, Kore Savaşı'nda küçük kıza sahip çıkar.
7. Koğuştaki Mucize'de Memo'nun kızının adı nedir?|Ova|Ada|Eylül|Deniz|Ova, babası Memo'nun masumiyetine inanır.
Düğün Dernek filminde hazırlıklar hangi tören için yapılır?|Düğün|Mezuniyet|Ödül töreni|Açılış|İsmail ve arkadaşları Tarık'ın düğününü hazırlamaya çalışır.
Aile Arasında'da Fikret bir düğün sürecinde hangi aile rolünü üstlenir?|Gelinin babası|Damadın kardeşi|Gelinin dayısı|Damadın dedesi|Fikret, Zeynep'in babasıymış gibi davranır.
İftarlık Gazoz filminde Adem kimin yanında çıraklık yapar?|Gazozcu|Fırıncı|Balıkçı|Ayakkabıcı|Adem, gazozcu Cibar Kemal'in yanında çalışır.
Nefes: Vatan Sağolsun filminin merkezindeki grup kimlerden oluşur?|Askerlerden|Müzisyenlerden|Aşçılardan|Futbolculardan|Film sınır bölgesindeki bir askerî birliğin yaşadıklarını anlatır.
Kelebeğin Rüyası filmindeki iki genç kahramanın ortak uğraşı nedir?|Şiir yazmak|Otomobil yarışı|Dalgıçlık|Heykeltıraşlık|Rüştü Onur ve Muzaffer Tayyip Uslu iki genç şairdir.''')

    rows('sinema-dili', '''Bir filmin oyuncularını ve sahnelerini yöneten kişiye ne denir?|Yönetmen|Suflör|Eleştirmen|Biletçi|Yönetmen, filmin yaratıcı anlatımını ve oyunculuk çalışmalarını yönlendirir.
Filmin olay örgüsünü ve diyaloglarını yazan kişi kimdir?|Senarist|Işık teknisyeni|Kostümcü|Makinist|Senarist, filmin senaryosunu yazar.
Çekilmiş görüntülerin seçilip birleştirilmesine ne denir?|Kurgu|Dublaj|Makyaj|Kostüm|Kurgu, görüntü ve seslerin anlatıya uygun biçimde birleştirilmesidir.
Bir filmde konuşmaların başka bir dilde yeniden seslendirilmesine ne denir?|Dublaj|Fragman|Kurgu|Galası|Dublajda konuşmalar yeni ses kayıtlarıyla değiştirilir.
Film konuşmalarının ekranda yazıyla gösterilen çevirisine ne denir?|Altyazı|Afiş|Jenerik|Senaryo|Altyazı, diyalogların yazılı biçimde izlenmesini sağlar.
Bir filmi tanıtmak için hazırlanan kısa videonun adı nedir?|Fragman|Uzun metraj|Perde|Kamera arkası|Fragman, filmin hikâyesinden kısa bir önizleme sunar.
Filmin başında ya da sonunda emeği geçenlerin listelendiği bölüme ne denir?|Jenerik|Kulis|Prova|Set|Jenerik, oyuncu ve yapım ekibinin adlarını gösterir.
Gerçek olayları veya yaşamı araştırıp anlatan film türü hangisidir?|Belgesel|Fantastik|Romantik komedi|Uzay operası|Belgeseller gerçek dünya konularını ele alır.
İzleyiciyi güldürmeyi amaçlayan temel film türü hangisidir?|Komedi|Korku|Gerilim|Belgesel|Komedi, mizahı ve gülmeyi öne çıkarır.
Şarkı ve dansların hikâyenin anlatımında önemli yer tuttuğu film türü nedir?|Müzikal|Western|Polisiye|Sessiz film|Müzikallerde şarkılar ve danslar anlatının parçasıdır.
Vahşi Batı, kovboylar ve sınır kasabalarıyla ilişkilendirilen tür hangisidir?|Western|Bilim kurgu|Animasyon|Melodram|Western filmleri Amerikan Batısı çevresindeki öykülerle tanınır.
Uzay yolculuğu ve geleceğin teknolojilerini konu edinen tür hangisidir?|Bilim kurgu|Western|Romantik komedi|Biyografi|Bilim kurgu, bilimsel ve teknolojik olasılıklar üzerine öyküler kurar.
Gerçek bir kişinin hayatını anlatan filme ne denir?|Biyografik film|Devam filmi|Parodi|Tanıtım filmi|Biyografik filmler bir kişinin yaşamını dramatize eder.
Bir önceki filmin öyküsünü sürdüren filme ne denir?|Devam filmi|Ön gösterim|Kısa film|Sessiz film|Devam filmi, daha önceki yapımın ardından gelişen olayları anlatır.
Önceki bir filmin olaylarından daha erken dönemi anlatan yapıma ne denir?|Öncül film|Fragman|Jenerik|Belgesel|Öncül film, bilinen hikâyenin öncesine döner.
Daha önce çekilmiş bir filmin yeni oyuncular ve yeni çekimle yeniden yapılmasına ne denir?|Yeniden çevrim|Devam filmi|Kamera arkası|Gala|Yeniden çevrim, eski bir yapımın yeni yorumudur.
Bir eseri mizah yoluyla taklit eden filmin yaklaşımı hangisidir?|Parodi|Biyografi|Belgesel|Haber|Parodi, tanınan tür ve eserlerle mizahi biçimde oynar.
Çizim veya modelleri hareket ediyormuş gibi gösteren sinema tekniği nedir?|Animasyon|Dublaj|Altyazı|Kostüm|Animasyon, art arda gösterilen görüntülerle hareket izlenimi oluşturur.
Kukla ya da nesnelerin küçük hareketlerle tek tek fotoğraflandığı animasyon tekniği nedir?|Stop-motion|Ağır çekim|Dublaj|Canlı yayın|Stop-motion'da nesneler her kare için biraz hareket ettirilir.
Oyuncunun yüzünü kadrajda büyük gösteren çekim hangisidir?|Yakın plan|Genel plan|Havadan çekim|Uzak plan|Yakın plan, yüz gibi bir ayrıntıyı öne çıkarır.
Görüntünün normalden daha yavaş hareket ettiği gösterime ne denir?|Ağır çekim|Hızlı kurgu|Dublaj|Atlamalı çekim|Ağır çekim, hareketin ayrıntılarını yavaşlatarak gösterir.
Hikâyede daha önce yaşanmış bir olaya dönülen sahneye ne denir?|Geriye dönüş|Gala|Fragman|Son jenerik|Geriye dönüş, anlatıyı geçici olarak geçmişe taşır.
Oyuncu yerine tehlikeli hareketleri gerçekleştiren kişiye ne denir?|Dublör|Senarist|Yapımcı|Eleştirmen|Dublörler özel eğitim gerektiren fiziksel sahnelerde görev alır.
Ünlü bir kişinin filmde çok kısa görünmesine ne denir?|Cameo|Dublaj|Kurgu|Monolog|Cameo, kısa ve dikkat çekici bir konuk görünümüdür.
Bir romandaki hikâyenin filme dönüştürülmesine ne denir?|Uyarlama|Dublaj|Renklendirme|Montaj hatası|Uyarlama, bir eseri başka bir anlatım ortamına taşır.''')

    # Ceremony years (not release years) are explicit in every Oscar question.
    winners = '''1995|Forrest Gump
1998|Titanic
2001|Gladyatör / Gladiator
2002|Akıl Oyunları / A Beautiful Mind
2003|Chicago
2004|Yüzüklerin Efendisi: Kralın Dönüşü
2005|Milyon Dolarlık Bebek / Million Dollar Baby
2007|Köstebek / The Departed
2008|İhtiyarlara Yer Yok / No Country for Old Men
2009|Milyoner / Slumdog Millionaire
2011|Zoraki Kral / The King's Speech
2012|The Artist
2013|Argo
2014|12 Yıllık Esaret / 12 Years a Slave
2015|Birdman
2016|Spotlight
2017|Ay Işığı / Moonlight
2018|Suyun Sesi / The Shape of Water
2019|Yeşil Rehber / Green Book
2020|Parazit / Parasite'''
    awards = [line.split('|') for line in winners.splitlines()]
    for year, film in awards:
        add(f'{year} Oscar töreninde En İyi Film ödülünü hangi yapım kazandı?', film,
            [r[1] for r in awards], f'{year} töreninin En İyi Film kazananı {film} oldu. Tören yılı ile filmin gösterim yılı farklı olabilir.',
            'oscar-ve-festivaller', 'general' if year in ['1995', '1998', '2001', '2004', '2020'] else 'expert',
            f'https://www.oscars.org/oscars/ceremonies/{year}')
    rows('oscar-ve-festivaller', '''Cannes Film Festivali'nin büyük ödülü hangi adla anılır?|Altın Palmiye|Altın Portakal|Altın Ayı|Altın Aslan|Cannes'ın büyük ödülü Palme d'Or, Türkçede Altın Palmiye olarak bilinir.
Berlin Film Festivali'nin en iyi film ödülünün simgesi hangi hayvandır?|Ayı|Aslan|Kartal|Kaplan|Berlinale'nin büyük ödülü Altın Ayı'dır.
Venedik Film Festivali'nin büyük ödülü hangisidir?|Altın Aslan|Altın Palmiye|Altın Ayı|Altın Portakal|Venedik'te en iyi film Altın Aslan ile ödüllendirilir.
Altın Portakal Film Festivali hangi Türk şehriyle özdeşleşir?|Antalya|Adana|İzmir|Ankara|Altın Portakal, Antalya'da düzenlenen film festivalidir.
Altın Koza Film Festivali hangi Türk şehrinde düzenlenir?|Adana|Antalya|Eskişehir|Bursa|Altın Koza, Adana'nın film festivalidir.''')
    # Link specific official references only where they support the question.
    references = {
        'Oyuncak Hikâyesi': 'https://www.pixar.com/toy-story',
        'Ratatuy / Ratatouille': 'https://www.pixar.com/ratatouille',
        'WALL-E': 'https://www.pixar.com/wall-e',
        'Coco': 'https://www.pixar.com/coco',
        'Yumurcak / The Kid': 'https://www.charliechaplin.com/en/films/1',
    }
    for q in out:
        for prefix, url in references.items():
            if q['text'].startswith(prefix):
                q['source'] = url
    expected = {'yesilcam-ve-turk-oyuncular': 25, 'dunya-sinemasi-oyuncular': 25, 'yonetmenler': 25,
                'animasyon': 50, 'filmler-ve-karakterler': 50, 'turk-filmleri': 25, 'sinema-dili': 25,
                'oscar-ve-festivaller': 25}
    assert dict(Counter(q['topic'] for q in out)) == expected, Counter(q['topic'] for q in out)
    assert len(out) == len({q['text'] for q in out}) == 250
    return out

if __name__ == '__main__':
    print(Counter(q['difficulty'] for q in film_questions()))
