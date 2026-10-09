from bank250_common import rows,grouped

def expand_cars(questions,add):
    data=rows('''
Toyota|Yaris|Supra
Honda|Accord|S2000
Nissan|Micra|GT-R
Mazda|Mazda3|RX-7
Subaru|Impreza|Outback
Suzuki|Jimny|Vitara
Mitsubishi|Pajero|Outlander
Lexus|LS|LFA
Infiniti|QX80|G35
Acura|TLX|RSX
Volkswagen|Passat|Touareg
BMW|i8|Z4
Mercedes-Benz|C-Serisi|G-Serisi
Audi|TT|R8
Porsche|Cayenne|Taycan
Opel|Astra|Insignia
Ford|Focus|Fiesta
Chevrolet|Corvette|Impala
Dodge|Viper|Durango
Jeep|Cherokee|Renegade
Cadillac|Eldorado|CT5
Lincoln|Nautilus|Aviator
Tesla|Model 3|Model Y
Chrysler|PT Cruiser|Sebring
Buick|Regal|Riviera
GMC|Sierra|Acadia
Renault|Megane|Twingo
Peugeot|208|508
Citroën|2CV|Berlingo
DS Automobiles|DS 3 Crossback|DS 9
Bugatti|Veyron|Divo
Fiat|Punto|Tipo
Ferrari|Testarossa|Enzo
Lamborghini|Miura|Countach
Maserati|Ghibli|MC20
Alfa Romeo|Stelvio|Alfasud
Lancia|Stratos|Fulvia
Pagani|Huayra|Utopia
Aston Martin|DB9|Valhalla
Bentley|Bentayga|Mulsanne
Rolls-Royce|Ghost|Cullinan
Jaguar|F-Type|XJ
Land Rover|Discovery|Range Rover Evoque
Lotus|Esprit|Emira
McLaren|P1|Artura
Volvo|S60|XC40
Saab|900|9-5
Škoda|Fabia|Kodiaq
SEAT|Leon|Arona
Hyundai|Elantra|Ioniq 5
''')
    for brand,*models in data:
        for model in models:add('arabalar',f'{model} otomobilini üreten marka hangisidir?',brand,[r[0] for r in data],f'{model}, {brand} markasının model ailesinde yer alan bir otomobildir; soru modelin marka kimliğini sorar.')
    grouped(add,'arabalar','“{}” tanımı hangi otomobil parçasına veya sistemine aittir?', '''
Tekerleklerin virajda farklı hızlarla dönmesini sağlar|Diferansiyel
Motordan gelen hareketin oranını değiştirir|Şanzıman
Manuel araçta motorla şanzıman arasındaki bağlantıyı ayırır|Debriyaj
Motordaki yağın dolaşmasını sağlar|Yağ pompası
Motor soğutma sıvısının ısısını havaya aktarır|Radyatör
Soğutma devresindeki akışı sıcaklığa göre düzenler|Termostat
Pistonun doğrusal hareketini dönmeye çevirir|Krank mili
Supapların açılma zamanlamasını yönetir|Eksantrik mili
Motorun yanma odasında aşağı yukarı hareket eder|Piston
Pistonla krank mili arasındaki bağlantıyı kurar|Biyel kolu
Benzinli motorda karışımı kıvılcımla ateşler|Buji
Dizel motorda soğuk çalıştırmayı ısıtarak destekler|Kızdırma bujisi
Yakıtı ince püskürtme ile motora verir|Enjektör
Motora giren havadaki tozu tutar|Hava filtresi
Motor yağındaki kirleri süzer|Yağ filtresi
Egzoz gazlarından enerjiyle emme havasını sıkıştırır|Turboşarj
Sıkıştırılmış emme havasını soğutur|Intercooler
Egzozda zararlı gazların dönüşümüne yardım eder|Katalitik konvertör
Dizel egzozundaki kurum parçacıklarını tutar|Dizel partikül filtresi
Egzozdaki oksijen miktarını ölçer|Lambda sensörü
Yakıt buharının atmosfere kaçmasını sınırlayan devredir|EVAP sistemi
Aracı elektrikle ilk kez döndürerek çalıştırır|Marş motoru
Motor çalışırken elektrik üretir|Alternatör
Elektrik enerjisini kimyasal olarak depolar|Akü
Elektrikli araçta doğru akımı motor için alternatif akıma dönüştürür|İnverter
Elektrikli araçta yavaşlama enerjisini geri kazanır|Rejeneratif frenleme
Frenlemede tekerlek kilitlenmesini önlemeye yardım eder|ABS
Aracın savrulmasını azaltmak için tek tek fren uygulayabilir|Elektronik denge kontrolü
Hızlanmada aşırı patinajı sınırlar|Çekiş kontrolü
Lastik basıncını izler|TPMS
Sürücünün direksiyon çevirme kuvvetini azaltır|Direksiyon desteği
Yayların salınımını sönümler|Amortisör
Virajda gövdenin yana yatmasını azaltır|Viraj denge çubuğu
Yol darbesini esneyerek karşılar|Süspansiyon yayı
Tekerleğe yön veren direksiyon bağlantısıdır|Rot kolu
Fren diskine sürtünerek yavaşlatır|Fren balatası
Fren balatalarını diske bastıran parçadır|Fren kaliperi
Motor torkunu çekiş tekerleğine ileten mildir|Aks
Önden ve yandan çarpışmada şişerek destek koruma sağlar|Hava yastığı
Emniyet kemerindeki boşluğu çarpışma anında azaltır|Kemer gergisi
Cam üzerindeki suyu mekanik olarak temizler|Silecek
Silecek suyunu cama püskürtür|Cam yıkama pompası
Kabin havasının tozunu ve polenini süzer|Kabin filtresi
Klimanın soğutucu akışkanını sıkıştırır|Klima kompresörü
Aşırı elektrik akımında devreyi keser|Sigorta
Küçük bir kontrol akımıyla daha büyük devreyi açıp kapatır|Röle
Araçtaki elektronik kontrol birimlerinin haberleşmesini sağlar|CAN veri yolu
Araç arızalarının teşhis bağlantısı için kullanılır|OBD soketi
Geri manevrada yakındaki engellere mesafeyi algılar|Park sensörü
Öndeki araçla mesafeye göre hızı ayarlar|Adaptif hız sabitleyici
''')
