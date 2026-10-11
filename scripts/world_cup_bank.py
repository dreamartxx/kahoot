"""Original Turkish men's World Cup archive; historical scope ends at Qatar 2022."""
import hashlib, random
SOURCES = {
 'history':'https://www.fifa.com/en/tournaments/mens/worldcup/articles/world-cup-champions-1930-1978-uruguay-italy-germany-brazil-england-argentina',
 'modern':'https://www.fifa.com/en/tournaments/mens/worldcup/articles/world-cup-champions-1982-2026-italy-argentina-germany-brazil-france-spain',
 'scorers':'https://www.fifa.com/it/tournaments/mens/worldcup/canadamexicousa2026/articles/fontaine-mbappe-ronaldo-e-tutti-i-capocannoniere-della-storia-della-coppa',
 'turkey':'https://www.tff.org/default.aspx?pageID=314',
 'mascots':'https://www.fifa.com/en/articles/world-cup-mascots-in-history',
 'balls':'https://www.fifa.com/en/tournaments/mens/worldcup/canadamexicousa2026/articles/ball-balls-history',
 'finals':'https://www.fifa.com/es/tournaments/mens/worldcup/articles/todas-las-finales-de-la-copa-mundial-de-la-fifa',
 'music':'https://inside.fifa.com/tournaments/mens/worldcup/2018russia/media-releases/2018-fifa-world-cup-russiatm-official-song-live-it-up-to-be-performed-by-all-sta',
 'awards':'https://inside.fifa.com/en/tournaments/mens/worldcup/2018russia/news/157-awards-piece-2986294',
 'rules':'https://www.theifab.com/laws/latest/',
}
# Year, hosts, champions, runners-up, top scorer (qualified where tied).
EDITIONS='''1930|Uruguay|Uruguay|Arjantin|Guillermo Stábile
1934|İtalya|İtalya|Çekoslovakya|Oldřich Nejedlý
1938|Fransa|İtalya|Macaristan|Leônidas
1950|Brezilya|Uruguay|Brezilya|Ademir
1954|İsviçre|Batı Almanya|Macaristan|Sándor Kocsis
1958|İsveç|Brezilya|İsveç|Just Fontaine
1962|Şili|Brezilya|Çekoslovakya|Garrincha
1966|İngiltere|İngiltere|Batı Almanya|Eusébio
1970|Meksika|Brezilya|İtalya|Gerd Müller
1974|Batı Almanya|Batı Almanya|Hollanda|Grzegorz Lato
1978|Arjantin|Arjantin|Hollanda|Mario Kempes
1982|İspanya|İtalya|Batı Almanya|Paolo Rossi
1986|Meksika|Arjantin|Batı Almanya|Gary Lineker
1990|İtalya|Batı Almanya|Arjantin|Salvatore Schillaci
1994|ABD|Brezilya|İtalya|Hristo Stoichkov
1998|Fransa|Fransa|Brezilya|Davor Šuker
2002|Güney Kore ve Japonya|Brezilya|Almanya|Ronaldo
2006|Almanya|İtalya|Fransa|Miroslav Klose
2010|Güney Afrika|İspanya|Hollanda|Thomas Müller
2014|Brezilya|Almanya|Arjantin|James Rodríguez
2018|Rusya|Fransa|Hırvatistan|Harry Kane
2022|Katar|Arjantin|Fransa|Kylian Mbappé'''
LEGENDS='''Pelé|1970|Brezilya
Diego Maradona|1986|Arjantin
Zinedine Zidane|1998|Fransa
Lionel Messi|2022|Arjantin
Ronaldo|2002|Brezilya
Cristiano Ronaldo|2018|Portekiz
Miroslav Klose|2014|Almanya
Kylian Mbappé|2018|Fransa
Luka Modrić|2018|Hırvatistan
Johan Cruyff|1974|Hollanda
Eusébio|1966|Portekiz
Diego Forlán|2010|Uruguay
Luis Suárez|2014|Uruguay
James Rodríguez|2014|Kolombiya
Carlos Valderrama|1994|Kolombiya
Didier Drogba|2010|Fildişi Sahili
Samuel Eto'o|2010|Kamerun
Roger Milla|1990|Kamerun
Sadio Mané|2018|Senegal
El Hadji Diouf|2002|Senegal
Son Heung-min|2022|Güney Kore
Park Ji-sung|2002|Güney Kore
Hidetoshi Nakata|2002|Japonya
Keisuke Honda|2010|Japonya
Landon Donovan|2010|ABD
Clint Dempsey|2014|ABD
Javier Hernández|2014|Meksika
Guillermo Ochoa|2014|Meksika
Keylor Navas|2014|Kosta Rika
Tim Cahill|2014|Avustralya
Salem Al-Dawsari|2022|Suudi Arabistan
Sami Al-Jaber|1998|Suudi Arabistan
Ali Daei|1998|İran
Gheorghe Hagi|1994|Romanya
Hristo Stoichkov|1994|Bulgaristan
Davor Šuker|1998|Hırvatistan
Robert Lewandowski|2022|Polonya
Andriy Shevchenko|2006|Ukrayna
Gareth Bale|2022|Galler
Christian Eriksen|2018|Danimarka'''

def world_cup_questions():
    rng=random.Random(202210); out=[]
    def add(text, answer, options, explanation, topic, level='general', source='modern'):
        choices=list(dict.fromkeys([answer]+options));assert len(choices)>=4,(text,choices)
        choices=[answer]+rng.sample([x for x in choices if x!=answer],3);rng.shuffle(choices)
        out.append(dict(id='dunya-kupasi-'+hashlib.sha256(text.encode()).hexdigest()[:14],category='dunya-kupasi',text=text,options=choices,correct=choices.index(answer),explanation=explanation,difficulty=level,topic=topic,source=SOURCES[source]))
    editions=[line.split('|') for line in EDITIONS.splitlines()]
    countries=list(dict.fromkeys(x for row in editions for x in row[1:4]))
    scorers=[r[4] for r in editions]
    for year,host,winner,runner,scorer in editions:
        source='history' if int(year)<1982 else 'modern'
        # Never offer Germany and West Germany together as competing answers.
        def cp(answer):return [c for c in countries if c==answer or not (answer in ['Almanya','Batı Almanya'] and c in ['Almanya','Batı Almanya'])]
        add(f'{year} FIFA Dünya Kupası şampiyonluğunu hangi millî takım kazandı?',winner,cp(winner),f'{year} şampiyonu {winner} oldu.','sampiyonlar','general' if int(year)>=1966 or year in ['1930','1958'] else 'expert',source)
        add(f'{year} FIFA Dünya Kupası hangi ülkede veya ülkelerde düzenlendi?',host,cp(host),f'{year} turnuvasının ev sahibi: {host}.','ev-sahipleri','general',source)
        add(f'{year} FIFA Dünya Kupası final sıralamasında ikinci olan takım hangisiydi?',runner,cp(runner),f'{year}: {winner} birinci, {runner} ikinci oldu.','finalistler','general' if int(year)>=1998 else 'expert',source)
        if year=='1962':
            text='1962 Dünya Kupası’nda gol krallığını paylaşan oyunculardan biri hangisiydi?'
            explanation='Garrincha dört golle altı ortak gol kralından biriydi; Vavá da bu gruptaydı.'
        elif year=='1994':
            text='1994 Dünya Kupası’nda Oleg Salenko ile gol krallığını paylaşan Bulgar oyuncu kimdi?';explanation='Hristo Stoichkov ve Oleg Salenko altışar gol attı.'
        elif year=='2010':
            text='2010 Dünya Kupası’nda eşitlik kriterleri sonunda Altın Ayakkabı ödülünü kim aldı?';explanation='Beş gol atan Thomas Müller, asist kriteriyle ödülü aldı.'
        else:text=f'{year} FIFA Dünya Kupası’nın gol kralı kimdi?';explanation=f'{year} turnuvasının en golcü oyuncusu {scorer} oldu.'
        add(text,scorer,scorers,explanation,'gol-krallari','general' if int(year)>=1998 else 'expert','scorers')
    legend_rows=[r.split('|') for r in LEGENDS.splitlines()]
    for name,year,country in legend_rows:
        add(f'{year} Dünya Kupası’nda {name} hangi millî takımın formasını giydi?',country,[r[2] for r in legend_rows],f'{name}, {year} turnuvasına {country} millî takımıyla katıldı.','yildizlar')
    def rows(topic,raw,source='modern'):
        for line in raw.strip().splitlines():
            p=line.split('|');assert len(p) in [6,7],(len(p),line)
            reference=source
            if topic=='kupa-kulturu':
                if 'şarkı' in p[0]: reference='music'
                elif 'stadyum' in p[0]: reference='finals'
                elif 'Vuvuzela'==p[1]: reference='modern'
            elif topic=='temel-bilgiler':
                if 'ödülü' in p[0]: reference='awards'
                elif not any(word in p[0] for word in ['süre','oyuncu','kart','uzatma','Uzatma','VAR']): reference='modern'
            add(p[0],p[1],p[1:5],p[5],topic,p[6] if len(p)==7 else 'general',reference)
    rows('turkiye','''Türkiye 2002 Dünya Kupası’nı hangi dereceyle bitirdi?|Üçüncü|Birinci|İkinci|Dördüncü|Türkiye bronz madalyayla döndü.
2002 Dünya Kupası’nda Türkiye’nin teknik direktörü kimdi?|Şenol Güneş|Fatih Terim|Mustafa Denizli|Ersun Yanal|Takımı Şenol Güneş çalıştırıyordu.
Türkiye, 2002 Dünya Kupası üçüncülük maçında kimi yendi?|Güney Kore|Japonya|Senegal|İngiltere|Türkiye ev sahibi Güney Kore’yi 3-2 yendi.
Türkiye’nin 2002 Dünya Kupası yarı finalindeki rakibi hangisiydi?|Brezilya|Almanya|Fransa|İtalya|Türkiye yarı finalde Brezilya ile karşılaştı.
Türkiye 2002 Dünya Kupası çeyrek finalinde hangi takımı eledi?|Senegal|Kamerun|Nijerya|Gana|İlhan Mansız’ın altın golüyle Senegal elendi.
Türkiye 2002 Dünya Kupası son 16 turunda hangi ev sahibini eledi?|Japonya|Güney Kore|Brezilya|Meksika|Ümit Davala’nın golü Japonya karşısında turu getirdi.
Türkiye adına 2002’de Senegal’e altın golü kim attı?|İlhan Mansız|Hakan Şükür|Nihat Kahveci|Arif Erdem|İlhan Mansız uzatmada attığı golle maçı bitirdi.
Türkiye’nin 2002 Dünya Kupası Japonya maçındaki golünü kim attı?|Ümit Davala|Emre Belözoğlu|Tugay Kerimoğlu|Yıldıray Baştürk|Ümit Davala’nın kafa golüyle maç 1-0 bitti.
2002 Dünya Kupası’nda Türkiye’nin kalesini ağırlıklı olarak kim korudu?|Rüştü Reçber|Volkan Demirel|Uğurcan Çakır|Altay Bayındır|Rüştü Reçber turnuvada Türkiye’nin kalecisiydi.
2002 Dünya Kupası üçüncülük maçının ilk saniyelerinde Türkiye adına kim gol attı?|Hakan Şükür|Hasan Şaş|İlhan Mansız|Ümit Davala|Hakan Şükür yaklaşık 11. saniyede gol buldu.
2002 Dünya Kupası üçüncülük maçında Türkiye’nin diğer iki golünü kim attı?|İlhan Mansız|Nihat Kahveci|Emre Belözoğlu|Tugay Kerimoğlu|Hakan Şükür’ün açılış golünü İlhan Mansız’ın iki golü izledi.
Türkiye’nin 2002 Dünya Kupası grubunda hangi Güney Amerika takımı vardı?|Brezilya|Arjantin|Uruguay|Paraguay|Brezilya ve Türkiye C Grubu’nda yer aldı.
Türkiye’nin 2002 Dünya Kupası grubundaki Orta Amerika temsilcisi hangisiydi?|Kosta Rika|Meksika|Panama|Honduras|Türkiye, Kosta Rika ile 1-1 berabere kaldı.
Türkiye, 2002 Dünya Kupası grup aşamasında hangi Asya takımını 3-0 yendi?|Çin|Japonya|Güney Kore|Suudi Arabistan|Çin karşısındaki galibiyet gruptan çıkışa katkı sağladı.
Türkiye’nin 2002 Dünya Kupası’ndaki ilk golünü hangi futbolcu attı?|Hasan Şaş|Hakan Şükür|İlhan Mansız|Bülent Korkmaz|Hasan Şaş ilk maçta Brezilya ağlarını buldu.
2002 Dünya Kupası’nda Türkiye yarı finale gelene kadar hangi iki takımı eleme turunda yendi?|Japonya ve Senegal|Fransa ve İtalya|İngiltere ve Almanya|İspanya ve Portekiz|Son 16’da Japonya, çeyrek finalde Senegal elendi.
Türkiye’nin fiilen katıldığı ilk Dünya Kupası finalleri hangi yıl oynandı?|1954|1930|1966|1982|Türkiye ilk kez 1954 İsviçre’de sahaya çıktı.
Türkiye 1954 Dünya Kupası’nda hangi Asya takımını 7-0 yendi?|Güney Kore|Japonya|Çin|İran|Bu maç Türkiye’nin Dünya Kupası tarihindeki büyük galibiyetlerindendir.
Türkiye, 2002 Dünya Kupası finallerine gitmek için barajda hangi ülkeyi eledi?|Avusturya|İsveç|Polonya|İskoçya|Avusturya iki maç sonunda elendi.
Türkiye’nin 2002 Dünya Kupası kadrosunda kaptanlık yapan savunma oyuncusu hangisiydi?|Bülent Korkmaz|Servet Çetin|Çağlar Söyüncü|Merih Demiral|Bülent Korkmaz 2002 kadrosunun tecrübeli liderlerindendi.''','turkey')
    rows('unutulmaz-anlar','''1986 Dünya Kupası’ndaki “Tanrı’nın Eli” golü kiminle özdeşleşir?|Diego Maradona|Pelé|Zico|Michel Platini|Maradona bu golü İngiltere’ye karşı attı.
Maradona’nın 1986’da art arda rakiplerini geçerek attığı ünlü gol hangi ülkeye karşıydı?|İngiltere|İtalya|İspanya|Portekiz|Arjantin–İngiltere çeyrek finali iki ünlü gole sahne oldu.
1998 Dünya Kupası finalinde iki kafa golü atan Fransız yıldız kimdi?|Zinedine Zidane|Thierry Henry|David Trezeguet|Nicolas Anelka|Zidane finalde iki kez kafa vuruşuyla gol attı.
2002 Dünya Kupası finalinde Brezilya’nın iki golünü kim attı?|Ronaldo|Ronaldinho|Rivaldo|Kaká|Ronaldo’nun golleri Almanya karşısında 2-0’ı getirdi.
2010 Dünya Kupası finalinde İspanya’ya kupayı getiren golü kim attı?|Andrés Iniesta|Xavi|David Villa|Fernando Torres|Iniesta uzatmada finalin tek golünü attı.
2014 Dünya Kupası finalinde Almanya’nın galibiyet golünü kim attı?|Mario Götze|Mesut Özil|Thomas Müller|Miroslav Klose|Götze uzatmada Arjantin’e karşı gol attı.
2022 Dünya Kupası finalinde üç gol atan Fransız yıldız kimdi?|Kylian Mbappé|Olivier Giroud|Antoine Griezmann|Karim Benzema|Mbappé finalde hat-trick yaptı.
1966 Dünya Kupası finalinde hat-trick yapan İngiliz futbolcu kimdi?|Geoff Hurst|Bobby Charlton|Bobby Moore|Gary Lineker|Geoff Hurst finalde üç gol attı.
2014 Dünya Kupası yarı finalinde Brezilya’yı 7-1 yenen takım hangisiydi?|Almanya|Hollanda|Arjantin|Fransa|Almanya Belo Horizonte’de tarihi bir galibiyet aldı.
2014 Dünya Kupası’nda James Rodríguez’in ünlü göğüs kontrolü ve vole golü hangi ülkeye karşıydı?|Uruguay|Brezilya|Almanya|İtalya|Kolombiyalı yıldız bu golü son 16 turunda attı.
2014 Dünya Kupası’nda Robin van Persie’nin uçan kafa golü hangi takıma karşıydı?|İspanya|Şili|Arjantin|Meksika|Hollanda’nın İspanya’yı 5-1 yendiği maçta geldi.
2006 Dünya Kupası finalinde kırmızı kartla oyundan atılan Fransız kaptan kimdi?|Zinedine Zidane|Patrick Vieira|Thierry Henry|Lilian Thuram|Zidane uzatma bölümünde oyundan atıldı.
1994 Dünya Kupası finalini penaltılarda kazanan takım hangisiydi?|Brezilya|İtalya|Arjantin|Almanya|Brezilya, golsüz biten finalin ardından penaltılarda kazandı.
2022 Dünya Kupası finalinin galibi hangi yöntemle belirlendi?|Penaltı atışlarıyla|Altın golle|Kura çekimiyle|Tekrar maçıyla|Uzatma sonunda skor 3-3 olunca penaltılara geçildi.
2006 Dünya Kupası finalinde kupayı kazanan İtalya’nın kalecisi kimdi?|Gianluigi Buffon|Gianluigi Donnarumma|Dino Zoff|Walter Zenga|İtalya’nın kalesinde Buffon vardı.
2010’da ilk kez Dünya Kupası şampiyonu olan İspanya’nın kaptan kalecisi kimdi?|Iker Casillas|David de Gea|Pepe Reina|Víctor Valdés|Casillas kupayı kaptan olarak kaldırdı.
2022 Dünya Kupası’nda Arjantin’in penaltı kurtarışlarıyla öne çıkan kalecisi kimdi?|Emiliano Martínez|Sergio Romero|Franco Armani|Willy Caballero|Martínez özellikle eleme turlarındaki penaltılarda öne çıktı.
2002 Dünya Kupası’nda hem Altın Top alan hem kalecilik yapan Alman kimdi?|Oliver Kahn|Jens Lehmann|Manuel Neuer|Sepp Maier|Kahn turnuvanın en iyi oyuncusu seçildi.
2018 Dünya Kupası’nda Altın Top ödülünü hangi Hırvat oyuncu aldı?|Luka Modrić|Ivan Rakitić|Mario Mandžukić|Ivan Perišić|Finalist Hırvatistan’ın lideri Modrić ödülü kazandı.
2022 Dünya Kupası’nda Altın Top ödülünü kim kazandı?|Lionel Messi|Kylian Mbappé|Luka Modrić|Julián Álvarez|Messi turnuvanın en iyi oyuncusu seçildi.
2010 Dünya Kupası’nda Altın Top ödülünü alan Uruguaylı kimdi?|Diego Forlán|Luis Suárez|Edinson Cavani|Diego Godín|Forlán Uruguay’ın yarı finale çıkışında öne çıktı.
2014 Dünya Kupası’nda Altın Eldiven ödülünü kim aldı?|Manuel Neuer|Iker Casillas|Joe Hart|Julio César|Şampiyon Almanya’nın kalecisi Neuer ödülü kazandı.
2018 Dünya Kupası’nda Altın Eldiven kazanan Belçikalı kimdi?|Thibaut Courtois|Simon Mignolet|Koen Casteels|Matz Sels|Courtois üçüncü olan Belçika’nın kalecisiydi.
2022 Dünya Kupası’nda yarı finale çıkan ilk Afrika millî takımı hangisiydi?|Fas|Senegal|Kamerun|Gana|Fas, Portekiz’i eleyerek yarı finale çıktı.
2002 Dünya Kupası’nda yarı finale çıkan ev sahibi Asya takımı hangisiydi?|Güney Kore|Japonya|Çin|İran|Güney Kore turnuvayı dördüncü bitirdi.
1990 Dünya Kupası’nda çeyrek finale çıkan Kamerun’un dansıyla tanınan golcüsü kimdi?|Roger Milla|Samuel Eto'o|Didier Drogba|George Weah|Milla köşe bayrağı önündeki gol sevinçleriyle hatırlanır.
2002 Dünya Kupası açılışında son şampiyon Fransa’yı yenen Afrika takımı hangisiydi?|Senegal|Nijerya|Tunus|Güney Afrika|Senegal açılış maçını 1-0 kazandı.
2022 Dünya Kupası’nda Arjantin’i grup maçında 2-1 yenen takım hangisiydi?|Suudi Arabistan|Meksika|Polonya|Avustralya|Suudi Arabistan turnuvanın büyük sürprizlerinden birini yaptı.
2022 Dünya Kupası grubunda hem Almanya’yı hem İspanya’yı yenen takım hangisiydi?|Japonya|Güney Kore|Avustralya|İran|Japonya iki eski şampiyonu da 2-1 yendi.
2014 Dünya Kupası’nda İtalya, İngiltere ve Uruguay’ın grubunu lider bitiren takım hangisiydi?|Kosta Rika|Meksika|ABD|Kolombiya|Kosta Rika güçlü rakiplerinin önünde grup lideri oldu.
1998 Dünya Kupası’nda ilk katılımında üçüncü olan Avrupa ülkesi hangisiydi?|Hırvatistan|Slovenya|Slovakya|Ukrayna|Hırvatistan, Davor Šuker’in golleriyle üçüncülüğe ulaştı.
2018 Dünya Kupası’nı üçüncü bitiren takım hangisiydi?|Belçika|İngiltere|Brezilya|Uruguay|Belçika üçüncülük maçında İngiltere’yi yendi.
2022 Dünya Kupası’nı üçüncü bitiren takım hangisiydi?|Hırvatistan|Fas|Portekiz|İngiltere|Hırvatistan üçüncülük maçında Fas’ı yendi.
1970 Dünya Kupası finalinde Brezilya’nın ünlü takım golünü tamamlayan sağ bek kimdi?|Carlos Alberto|Cafu|Roberto Carlos|Dani Alves|Kaptan Carlos Alberto finalin son golünü attı.|expert
1974 Dünya Kupası’nda “Total Futbol” ile anılan finalist hangisiydi?|Hollanda|Arjantin|Polonya|İtalya|Johan Cruyff’un liderlik ettiği Hollanda bu anlayışla anılır.
1954 Dünya Kupası finalindeki Batı Almanya zaferi hangi adla anılır?|Bern Mucizesi|İstanbul Mucizesi|Roma Gecesi|Paris Destanı|Batı Almanya, Bern’de Macaristan’ı 3-2 yendi.
1950 Dünya Kupası’nda Brezilya’nın Uruguay’a yenilmesi hangi stadyumla özdeşleşir?|Maracanã|Wembley|Azteca|Camp Nou|Maracanazo adı bu stadyumdan gelir.
1982 Dünya Kupası’nda İtalya’yı şampiyonluğa taşıyan teknik direktör kimdi?|Enzo Bearzot|Marcello Lippi|Carlo Ancelotti|Roberto Mancini|Bearzot’un İtalya’sı finalde Batı Almanya’yı yendi.|expert
1998’de Dünya Kupası’nı oyuncu, 2018’de teknik direktör olarak kazanan Fransız kimdi?|Didier Deschamps|Zinedine Zidane|Laurent Blanc|Arsène Wenger|Deschamps 1998’de kaptan, 2018’de teknik direktördü.
2022 Dünya Kupası şampiyonu Arjantin’in teknik direktörü kimdi?|Lionel Scaloni|Diego Simeone|Mauricio Pochettino|Marcelo Bielsa|Scaloni, Arjantin’i 2022 şampiyonluğuna taşıdı.''')
    rows('kupa-kulturu','''1966 Dünya Kupası maskotu Willie hangi hayvandı?|Aslan|Kaplan|Kurt|Leopar|Willie bir aslan olarak tasarlandı.
1970 Dünya Kupası maskotu Juanito hangi ülkenin turnuvasına aitti?|Meksika|İspanya|Arjantin|İtalya|Juanito Meksika 1970’in maskotuydu.|expert
1982 Dünya Kupası maskotu Naranjito hangi meyveden esinlenmişti?|Portakal|Elma|Muz|Ananas|Naranjito İspanya 1982 için tasarlanan bir portakaldı.
1986 Dünya Kupası maskotu Pique hangi bitki ürünü biçimindeydi?|Acı biber|Patlıcan|Mısır|Domates|Meksika’nın maskotu sombrero takan bir acı biberdi.|expert
1990 Dünya Kupası’nın çubuk biçimli maskotunun adı neydi?|Ciao|Footix|Zakumi|Fuleco|İtalya 1990’ın maskotu Ciao idi.|expert
1994 Dünya Kupası maskotu Striker hangi hayvandı?|Köpek|Kedi|Ayı|Tilki|ABD turnuvasının maskotu Striker bir köpekti.|expert
1998 Dünya Kupası maskotu Footix hangi hayvandı?|Horoz|Kartal|Baykuş|Penguen|Horoz, Fransa’nın simgelerinden biridir.
2006 Dünya Kupası maskotu Goleo VI hangi hayvandı?|Aslan|Kurt|Leopar|Ayı|Goleo VI’ya konuşan top Pille eşlik ediyordu.|expert
2010 Dünya Kupası maskotu Zakumi hangi hayvandı?|Leopar|Zebra|Zürafa|Fil|Güney Afrika 2010’un maskotu yeşil saçlı bir leopardı.
2014 Dünya Kupası maskotu Fuleco hangi hayvandan esinlendi?|Armadillo|Panda|Kanguru|Koala|Fuleco Brezilya’ya özgü bir armadillodan esinlendi.
2018 Dünya Kupası maskotu Zabivaka hangi hayvandı?|Kurt|Ayı|Tilki|Geyik|Zabivaka gözlük takan bir kurt olarak tasarlandı.
2022 Dünya Kupası maskotunun adı hangisiydi?|La’eeb|Footix|Ciao|Striker|Katar 2022’nin maskotu La’eeb idi.
Dünya Kupası’nda ilk resmî maskot hangi turnuvada tanıtıldı?|İngiltere 1966|Uruguay 1930|İtalya 1934|Fransa 1938|İlk resmî maskot World Cup Willie idi.|expert
2010 Dünya Kupası tribünlerinin sesiyle özdeşleşen çalgı hangisiydi?|Vuvuzela|Keman|Arp|Piyano|Güney Afrika’daki tribünlerde vuvuzelalar çok yaygındı.
2010 Dünya Kupası’nın “Waka Waka” şarkısıyla öne çıkan sanatçı kimdi?|Shakira|Adele|Madonna|Beyoncé|Shakira şarkıyı Freshlyground ile seslendirdi.
1998 Dünya Kupası’nın “La Copa de la Vida” şarkısını kim söyledi?|Ricky Martin|Enrique Iglesias|Luis Fonsi|Marc Anthony|Ricky Martin’in şarkısı turnuvayla özdeşleşti.
2022 Dünya Kupası finali hangi stadyumda oynandı?|Lusail|Wembley|Maracanã|Azteca|Final Katar’daki Lusail Stadyumu’ndaydı.
1966 Dünya Kupası finalinin Londra’daki sahnesi hangi stadyumdu?|Wembley|Anfield|Old Trafford|Stamford Bridge|İngiltere finali Wembley’de kazandı.
1970 ve 1986 Dünya Kupası finallerine ev sahipliği yapan Meksika stadyumu hangisiydi?|Azteca|Maracanã|San Siro|Rose Bowl|İki final de Mexico City’deki Azteca’da oynandı.
1994 Dünya Kupası finalinin oynandığı ABD stadyumu hangisiydi?|Rose Bowl|Wembley|Allianz Arena|Santiago Bernabéu|Final Pasadena’daki Rose Bowl’da oynandı.|expert''','mascots')
    rows('kupa-toplari','''1970 Dünya Kupası’nın siyah-beyaz panelleriyle tanınan resmî topunun adı neydi?|Telstar|Jabulani|Brazuca|Al Rihla|Telstar, siyah-beyaz televizyon görüntüsüyle de özdeşleşti.|expert
1978 Dünya Kupası’nda kullanılan ve tasarımıyla tanınan top hangisiydi?|Tango|Fevernova|Teamgeist|Telstar 18|Arjantin 1978’de Tango kullanıldı.|expert
1986 Dünya Kupası’nın resmî topu hangi adı taşıyordu?|Azteca|Questra|Tricolore|Jabulani|Meksika 1986’nın topu Azteca idi.|expert
1994 Dünya Kupası’nda kullanılan resmî topun adı hangisiydi?|Questra|Brazuca|Al Rihla|Fevernova|ABD 1994’te Questra kullanıldı.|expert
1998 Dünya Kupası’nın resmî topunun adı neydi?|Tricolore|Telstar|Tango|Azteca|Tricolore adı Fransa’nın üç rengine gönderme yapar.|expert
2002 Dünya Kupası’nda kullanılan resmî top hangisiydi?|Fevernova|Jabulani|Brazuca|Questra|Kore/Japonya 2002’nin topu Fevernova idi.|expert
2006 Dünya Kupası’nın resmî maç topu hangi adı taşıyordu?|Teamgeist|Tricolore|Al Rihla|Azteca|Almanya 2006’da Teamgeist kullanıldı.|expert
2010 Dünya Kupası’nın çok konuşulan resmî topu hangisiydi?|Jabulani|Tango|Questra|Telstar 18|Güney Afrika 2010’un topu Jabulani idi.
2014 Dünya Kupası’nın resmî maç topunun adı neydi?|Brazuca|Fevernova|Tricolore|Teamgeist|Brazuca Brezilya 2014’te kullanıldı.
2022 Dünya Kupası’nın başlangıç aşamalarındaki resmî topunun adı neydi?|Al Rihla|Jabulani|Questra|Tango|Al Rihla kullanıldı; final aşamasında Al Hilm devreye girdi.''','balls')
    rows('temel-bilgiler','''FIFA Dünya Kupası’nda kulüpler yerine hangi takımlar yarışır?|Millî takımlar|Şehir takımları|Okul takımları|Şirket takımları|Erkekler Dünya Kupası millî takımlar arasında oynanır.
Erkekler FIFA Dünya Kupası normal takvimde kaç yılda bir düzenlenir?|4|2|3|5|Normal turnuva aralığı dört yıldır.
FIFA Dünya Kupası hangi spor dalına aittir?|Futbol|Basketbol|Voleybol|Hentbol|Buradaki FIFA Dünya Kupası futbol turnuvasıdır.
Dünya Kupası’nı düzenleyen uluslararası kuruluş hangisidir?|FIFA|UEFA|FIBA|IOC|FIFA dünya futbolunun uluslararası yönetim kuruluşudur.
Dünya Kupası grubunda bir galibiyet, 1994’ten itibaren kaç puan getirir?|3|1|2|4|1994 turnuvasından itibaren galibiyet üç puandır.
Dünya Kupası grup aşamasında beraberlik yapan takım kaç puan alır?|1|0|2|3|Beraberlikte iki takım da birer puan alır.
Dünya Kupası’nda normal maç süresi, eklenen süre hariç kaç dakikadır?|90|60|80|100|Normal süre iki devrede toplam 90 dakikadır.
Dünya Kupası maçında bir takım kaleci dahil sahaya kaç oyuncuyla başlar?|11|9|10|12|Standart başlangıç kadrosu on bir oyuncudur.
Dünya Kupası’nda kırmızı kart gören oyuncuya ne olur?|Oyundan atılır|İki gol kazanır|Kaleci olur|Kaptan olur|Kırmızı kart ihraç anlamına gelir.
Dünya Kupası eleme maçında normal süre berabere biterse önce hangi bölüm oynanır?|Uzatma|Tekrar grup maçı|Yeni kura|Doğrudan final|Standart eleme maçlarında önce iki uzatma devresi oynanır.
Dünya Kupası’nda standart uzatma bölümü toplam kaç dakikadır?|30|10|15|45|Uzatma iki 15 dakikalık devreden oluşur.
Dünya Kupası’nda uzatma sonunda eşitlik sürerse kazanan nasıl belirlenir?|Penaltı atışlarıyla|Korner sayısıyla|Topa sahip olma oranıyla|Seyirci oylamasıyla|Eşitlik penaltı atışlarıyla bozulur.
Dünya Kupası’ndaki Altın Eldiven ödülü hangi oyuncu rolüne yöneliktir?|Kaleci|Santrfor|Kanat|Orta saha|Altın Eldiven en iyi kaleciye verilen ödüldür.
Dünya Kupası’ndaki Altın Top ödülü neyi onurlandırır?|Turnuvanın en iyi oyuncusunu|En yüksek tribünü|En hızlı topu|En büyük stadyumu|Altın Top bireysel oyuncu performansı ödülüdür.
Dünya Kupası’ndaki Altın Ayakkabı ödülü hangi başarıyla ilişkilidir?|Gol krallığı|En çok taç atışı|En çok korner|En az faul|Gol sayısı ve gerektiğinde eşitlik kriterleriyle belirlenir.
Dünya Kupası’nda “hat-trick” yapan oyuncu bir maçta kaç gol atmıştır?|3|2|4|5|Hat-trick üç gol anlamına gelir.
Dünya Kupası’nda “son 16” turuna kaç takım katılır?|16|8|12|32|Bu turda on altı takım sekiz eşleşmede oynar.
Dünya Kupası’nda çeyrek finale kaç takım kalır?|8|4|6|16|Dört çeyrek final maçında sekiz takım oynar.
Dünya Kupası’nda üçüncülük maçını hangi takımlar oynar?|Yarı finali kaybedenler|Grup sonuncuları|Finali kazananlar|Çeyrek finali kaybeden tüm takımlar|Yarı finalde elenen iki takım üçüncülük için karşılaşır.
Dünya Kupası’nda VAR kısaltması hangi sistemi anlatır?|Video yardımcı hakem|Yeni bir puan sistemi|Yedek kaptanlık|Turnuva kura yöntemi|VAR, video yardımcı hakem sistemidir.''','rules')
    rows('tarih-ve-rekorlar','''2022 sonuna kadar erkekler Dünya Kupası’nı en çok kazanan ülke hangisiydi?|Brezilya|Almanya|İtalya|Arjantin|Brezilya bu dönemin sonunda beş şampiyonluğa sahipti.
2022 sonuna kadar üç Dünya Kupası şampiyonluğu bulunan futbolcu kimdi?|Pelé|Diego Maradona|Lionel Messi|Cristiano Ronaldo|Pelé 1958, 1962 ve 1970’te şampiyon kadrodaydı.
2022 sonu itibarıyla erkekler Dünya Kupası toplam gol rekorunun sahibi kimdi?|Miroslav Klose|Ronaldo|Gerd Müller|Lionel Messi|Klose 16 golle bu tarihte listenin başındaydı.
2022 sonuna kadar bir Dünya Kupası turnuvasında 13 gol atan oyuncu kimdi?|Just Fontaine|Pelé|Eusébio|Harry Kane|Fontaine 1958’de 13 gol kaydetti.
Dünya Kupası 2022 sona erdiğinde erkeklerde en fazla maça çıkmış futbolcu kimdi?|Lionel Messi|Lothar Matthäus|Miroslav Klose|Cristiano Ronaldo|Messi 2022 finaliyle 26 Dünya Kupası maçına ulaştı.
2022 sonuna kadar erkekler Dünya Kupası’nda gol atan en yaşlı futbolcu kimdi?|Roger Milla|Didier Drogba|Zlatan Ibrahimović|Samuel Eto'o|Milla 1994’te 42 yaşındayken gol attı.
2022 sonuna kadar Dünya Kupası finalinde gol atan en genç erkek futbolcu kimdi?|Pelé|Kylian Mbappé|Lionel Messi|Michael Owen|Pelé 1958 finalinde 17 yaşındaydı.
Erkekler Dünya Kupası’nın Afrika kıtasında düzenlenen ilk turnuvası hangisiydi?|Güney Afrika 2010|Meksika 1986|İspanya 1982|Katar 2022|2010 turnuvası Afrika’daki ilk erkekler Dünya Kupası’ydı.
Erkekler Dünya Kupası’nın Asya’da düzenlenen ilk turnuvası hangisiydi?|Güney Kore/Japonya 2002|Katar 2022|İtalya 1990|ABD 1994|2002 turnuvası hem Asya’daki ilk organizasyon hem ilk ortak ev sahipliğiydi.
1942 ve 1946 Dünya Kupalarının oynanmamasının temel nedeni neydi?|İkinci Dünya Savaşı ve etkileri|Top bulunamaması|FIFA’nın kalıcı kapanması|Futbolun yasaklanması|Savaş ve savaş sonrası koşullar turnuvaların yapılamamasına yol açtı.
1950 Dünya Kupası’nın şampiyon belirleme düzeni nasıl farklıydı?|Son aşamada final grubu vardı|Tüm maçlar penaltıyla oynandı|Yalnız iki ülke katıldı|Şampiyon kura ile seçildi|1950’de tek final yerine dört takımlı final grubu oynandı.
1934 ve 1938 Dünya Kupalarını art arda kazanan ülke hangisiydi?|İtalya|Uruguay|Brezilya|Almanya|İtalya iki turnuvada da şampiyon oldu.''')
    assert len(out)==250, len(out)
    assert len({q['text'] for q in out})==250
    return out
