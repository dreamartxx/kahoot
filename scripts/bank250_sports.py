from bank250_common import rows, grouped

def expand_sports(questions,add):
    clubs=rows('''
Real Madrid|Madrid|Santiago Bernabéu
Barcelona|Barselona|Camp Nou
Atlético Madrid|Madrid|Vicente Calderón
Athletic Bilbao|Bilbao|San Mamés
Sevilla|Sevilla|Ramón Sánchez Pizjuán
Valencia|Valensiya|Mestalla
Villarreal|Vila-real|El Madrigal
Real Betis|Sevilla|Benito Villamarín
Real Sociedad|San Sebastián|Anoeta
Deportivo La Coruña|A Coruña|Riazor
Manchester United|Manchester|Old Trafford
Liverpool|Liverpool|Anfield
Arsenal|Londra|Highbury
Chelsea|Londra|Stamford Bridge
Everton|Liverpool|Goodison Park
Newcastle United|Newcastle upon Tyne|St James' Park
Aston Villa|Birmingham|Villa Park
Leeds United|Leeds|Elland Road
Southampton|Southampton|St Mary's
Nottingham Forest|Nottingham|City Ground
Juventus|Torino|Delle Alpi
Fiorentina|Floransa|Artemio Franchi
Genoa|Cenova|Luigi Ferraris
Bologna|Bologna|Renato Dall'Ara
Udinese|Udine|Friuli
Palermo|Palermo|Renzo Barbera
Lecce|Lecce|Via del Mare
Cagliari|Cagliari|Sant'Elia
Brescia|Brescia|Mario Rigamonti
Parma|Parma|Ennio Tardini
Bayern Münih|Münih|Olimpiyat Stadı (Münih)
Borussia Dortmund|Dortmund|Westfalenstadion
Bayer Leverkusen|Leverkusen|BayArena
Werder Bremen|Bremen|Weserstadion
Hamburg|Hamburg|Volksparkstadion
Hertha Berlin|Berlin|Olimpiyat Stadı (Berlin)
Kaiserslautern|Kaiserslautern|Fritz-Walter-Stadion
Freiburg|Freiburg|Dreisamstadion
Nürnberg|Nürnberg|Max-Morlock-Stadion
Bochum|Bochum|Ruhrstadion
Paris Saint-Germain|Paris|Parc des Princes
Olympique Marsilya|Marsilya|Stade Vélodrome
Nantes|Nantes|Stade de la Beaujoire
Saint-Étienne|Saint-Étienne|Stade Geoffroy-Guichard
Ajax|Amsterdam|De Meer
Feyenoord|Rotterdam|De Kuip
PSV|Eindhoven|Philips Stadion
Benfica|Lizbon|Estádio da Luz
Porto|Porto|Estádio das Antas
Celtic|Glasgow|Celtic Park
''')
    for club,city,stadium in clubs:
        add('futbol',f'{club} kulübünün merkezinin bulunduğu şehir hangisidir?',city,[r[1] for r in clubs])
        add('futbol',f'{club}, aşağıdaki statlardan hangisini tarihinde iç saha maçları için kullanmıştır?',stadium,[r[2] for r in clubs],f'{stadium}, {club} kulübünün tarihindeki iç saha statlarından biridir; soru güncel sponsorluk adını sormaz.')
    winners='''
1975|Bayern Münih
1976|Bayern Münih
1977|Liverpool
1978|Liverpool
1979|Nottingham Forest
1980|Nottingham Forest
1981|Liverpool
1982|Aston Villa
1983|Hamburg
1984|Liverpool
1985|Juventus
1986|Steaua Bükreş
1987|Porto
1988|PSV
1989|Milan
1990|Milan
1991|Kızılyıldız
1992|Barcelona
1993|Olympique Marsilya
1994|Milan
1995|Ajax
1996|Juventus
1997|Borussia Dortmund
1998|Real Madrid
1999|Manchester United
2000|Real Madrid
2001|Bayern Münih
2002|Real Madrid
2003|Milan
2004|Porto
2005|Liverpool
2006|Barcelona
2007|Milan
2008|Manchester United
2009|Barcelona
2010|Inter
2011|Barcelona
2012|Chelsea
2013|Bayern Münih
2014|Real Madrid
2015|Barcelona
2016|Real Madrid
2017|Real Madrid
2018|Real Madrid
2019|Liverpool
2020|Bayern Münih
2021|Chelsea
2022|Real Madrid
2023|Manchester City
2024|Real Madrid
'''
    grouped(add,'futbol',"Finali {} yılında oynanan Şampiyon Kulüpler Kupası / UEFA Şampiyonlar Ligi'ni hangi kulüp kazandı?",winners)
    grouped(add,'kaleciler','Kaleci {} hangi ülkenin büyükler millî takımını temsil etmiştir?','''
Yann Sommer|İsviçre
Gregor Kobel|İsviçre
Diego Benaglio|İsviçre
Roman Bürki|İsviçre
Wojciech Szczęsny|Polonya
Łukasz Fabiański|Polonya
Jerzy Dudek|Polonya
Artur Boruc|Polonya
Łukasz Skorupski|Polonya
Dominik Livaković|Hırvatistan
Danijel Subašić|Hırvatistan
Stipe Pletikosa|Hırvatistan
Lovre Kalinić|Hırvatistan
Samir Handanović|Slovenya
Vedran Runje|Hırvatistan
Mert Günok|Türkiye
Uğurcan Çakır|Türkiye
Altay Bayındır|Türkiye
Sinan Bolat|Türkiye
Tolga Zengin|Türkiye
Rui Patrício|Portekiz
Diogo Costa|Portekiz
Vítor Baía|Portekiz
Ricardo Pereira|Portekiz
Beto|Portekiz
Yassine Bounou|Fas
Munir Mohamedi|Fas
Édouard Mendy|Senegal
André Onana|Kamerun
Carlos Kameni|Kamerun
Thomas N'Kono|Kamerun
Vincent Enyeama|Nijerya
Joseph Dosu|Nijerya
Essam El-Hadary|Mısır
Mohamed El-Shenawy|Mısır
Itumeleng Khune|Güney Afrika
Mark Schwarzer|Avustralya
Mathew Ryan|Avustralya
Shay Given|İrlanda
Brad Friedel|ABD
Tim Howard|ABD
Kasey Keller|ABD
Zack Steffen|ABD
Claudio Bravo|Şili
David Ospina|Kolombiya
Faryd Mondragón|Kolombiya
Óscar Córdoba|Kolombiya
Sergio Goycochea|Arjantin
Roberto Abbondanzieri|Arjantin
Santiago Cañizares|İspanya
''')
    finals=rows('''
2000|Real Madrid|Iker Casillas|Valencia|Santiago Cañizares
2001|Bayern Münih|Oliver Kahn|Valencia|Santiago Cañizares
2002|Real Madrid|César Sánchez|Bayer Leverkusen|Hans-Jörg Butt
2003|Milan|Dida|Juventus|Gianluigi Buffon
2004|Porto|Vítor Baía|Monaco|Flavio Roma
2006|Barcelona|Víctor Valdés|Arsenal|Jens Lehmann
2007|Milan|Dida|Liverpool|Pepe Reina
2009|Barcelona|Víctor Valdés|Manchester United|Edwin van der Sar
2010|Inter|Júlio César|Bayern Münih|Hans-Jörg Butt
2011|Barcelona|Víctor Valdés|Manchester United|Edwin van der Sar
2013|Bayern Münih|Manuel Neuer|Borussia Dortmund|Roman Weidenfeller
2014|Real Madrid|Iker Casillas|Atlético Madrid|Thibaut Courtois
2015|Barcelona|Marc-André ter Stegen|Juventus|Gianluigi Buffon
2016|Real Madrid|Keylor Navas|Atlético Madrid|Jan Oblak
2017|Real Madrid|Keylor Navas|Juventus|Gianluigi Buffon
2018|Real Madrid|Keylor Navas|Liverpool|Loris Karius
2019|Liverpool|Alisson Becker|Tottenham|Hugo Lloris
2020|Bayern Münih|Manuel Neuer|Paris Saint-Germain|Keylor Navas
2021|Chelsea|Édouard Mendy|Manchester City|Ederson
2022|Real Madrid|Thibaut Courtois|Liverpool|Alisson Becker
2023|Manchester City|Ederson|Inter|André Onana
2024|Real Madrid|Thibaut Courtois|Borussia Dortmund|Gregor Kobel
1997|Borussia Dortmund|Stefan Klos|Juventus|Angelo Peruzzi
1996|Juventus|Angelo Peruzzi|Ajax|Edwin van der Sar
1995|Ajax|Edwin van der Sar|Milan|Sebastiano Rossi
''')
    keepers=list(dict.fromkeys(v for r in finals for v in (r[2],r[4])))
    for year,a,ka,b,kb in finals:
        for club,keeper in [(a,ka),(b,kb)]:
            add('kaleciler',f'{year} UEFA Şampiyonlar Ligi finalinde {club} adına maça ilk 11’de başlayan kaleci kimdi?',keeper,keepers,'Soru maçın başlangıç kadrosunu sorar; maç içindeki oyuncu değişiklikleri veya ihraçlar cevabı değiştirmez.')
    grouped(add,'kaleciler','{} hangi kulübe transfer olmuştur?','''
Gianluigi Buffon, 2001’de Parma’dan|Juventus
Iker Casillas, 2015’te Real Madrid’den|Porto
Manuel Neuer, 2011’de Schalke 04’ten|Bayern Münih
Oliver Kahn, 1994’te Karlsruhe’den|Bayern Münih
Petr Čech, 2004’te Rennes’den|Chelsea
Edwin van der Sar, 2005’te Fulham’dan|Manchester United
Peter Schmeichel, 1991’de Brøndby’den|Manchester United
David de Gea, 2011’de Atlético Madrid’den|Manchester United
Thibaut Courtois, 2018’de Chelsea’den|Real Madrid
Alisson Becker, 2018’de Roma’dan|Liverpool
Ederson, 2017’de Benfica’dan|Manchester City
Hugo Lloris, 2012’de Lyon’dan|Tottenham
Keylor Navas, 2014’te Levante’den|Real Madrid
Jan Oblak, 2014’te Benfica’dan|Atlético Madrid
Marc-André ter Stegen, 2014’te Mönchengladbach’tan|Barcelona
Gianluigi Donnarumma, 2021’de Milan’dan|Paris Saint-Germain
Mike Maignan, 2021’de Lille’den|Milan
Emiliano Martínez, 2020’de Arsenal’den|Aston Villa
Jordan Pickford, 2017’de Sunderland’den|Everton
Kasper Schmeichel, 2011’de Leeds United’dan|Leicester City
Yann Sommer, 2023 yazında Bayern Münih’ten|Inter
André Onana, 2023’te Inter’den|Manchester United
Édouard Mendy, 2020’de Rennes’den|Chelsea
Yassine Bounou, 2023’te Sevilla’dan|Al-Hilal
Wojciech Szczęsny, 2017’de Arsenal’den|Juventus
Rui Patrício, 2018’de Sporting’den|Wolverhampton Wanderers
Claudio Bravo, 2014’te Real Sociedad’dan|Barcelona
Sergio Romero, 2015’te Sampdoria’dan|Manchester United
David Ospina, 2014’te Nice’ten|Arsenal
Morgan De Sanctis, 2008’de Sevilla’dan kiralık olarak|Galatasaray
Óscar Córdoba, 2002’de Perugia’dan|Beşiktaş
Cláudio Taffarel, 1998’de Atlético Mineiro’dan|Galatasaray
Rüştü Reçber, 2003’te Fenerbahçe’den|Barcelona
Volkan Demirel, 2002’de Kartalspor’dan|Fenerbahçe
Mert Günok, 2021’de Başakşehir’den|Beşiktaş
Altay Bayındır, 2023’te Fenerbahçe’den|Manchester United
Tolga Zengin, 2013’te Trabzonspor’dan|Beşiktaş
Fabien Barthez, 2000’de Monaco’dan|Manchester United
Pepe Reina, 2005’te Villarreal’den|Liverpool
Jerzy Dudek, 2001’de Feyenoord’dan|Liverpool
Jens Lehmann, 2003’te Borussia Dortmund’dan|Arsenal
Dida, 1999’da Cruzeiro’dan|Milan
Júlio César, 2005’te Chievo’dan|Inter
Samir Handanović, 2012’de Udinese’den|Inter
Tim Howard, 2003’te MetroStars’tan|Manchester United
Brad Friedel, 2011’de Aston Villa’dan|Tottenham
Shay Given, 2009’da Newcastle United’dan|Manchester City
Mark Schwarzer, 2008’de Middlesbrough’dan|Fulham
Diego Benaglio, 2008’de Nacional’den|Wolfsburg
Artur Boruc, 2005’te Legia Varşova’dan|Celtic
''')
