# Bilgi Arena

QR ile katılımlı Türkçe etkinlik stüdyosu. React + PHP 8.2+ + MySQL/MariaDB; Hostinger Business Web Hosting üzerinde çalışır.

## Giriş ve kullanıcılar

- Ana sayfa katılımcılar için büyük oyun kodu alanını gösterir. Yönetici / Sunucu girişi stüdyoyu açar.
- Mevcut yönetici şifresi otomatik olarak `admin` kullanıcı adına taşınır. Mevcut geçerli PHP oturumu ilk istekte kalıcı oturuma dönüştürülür. Kullanıcı adı Kullanıcı yönetimi bölümünden değiştirilebilir.
- Yönetici **Kullanıcı yönetimi** bölümünden kullanıcı adı/şifre verebilir, hesabı düzenleyebilir, şifresini yenileyebilir veya pasife alabilir. Yeni hesaplar yalnızca kendi etkinliklerini yönetir; kategoriden otomatik seçilen sorularla yarışma oluşturabilir. Soru kütüphanesini görüntüleme, elle soru seçme, soru ekleme/silme yalnızca yöneticiye açıktır; API de bu yetkiyi denetler. Eski etkinlik ve sorular yöneticiye aittir.
- Şifre için minimum uzunluk yoktur; boş olamaz. Şifreler SHA-256 ön özeti üzerinden `password_hash` ile saklanır. Kendi şifresini değiştirmek mevcut şifreyi gerektirir.
- `arena_session` çerezi HttpOnly, HTTPS üzerinde Secure ve SameSite=Strict kullanır; 30 gün geçerlidir, aktif kullanımda günlük yenilenir. Veritabanı yalnızca rastgele 256 bit oturum anahtarının özetini saklar. Çıkış, şifre değişimi ve hesabı pasife alma ilgili oturumları iptal eder. Çerezler silinirse, farklı tarayıcı/domain kullanılırsa veya 30 gün giriş yapılmazsa yeniden giriş gerekir.
- `arena_users` ve `arena_sessions` ilk yetkili işlemde otomatik oluşturulur; `arena_auth` içindeki mevcut yönetici hash'i korunur. Yeni kurulumda da varsayılan kullanıcı adı `admin` olur.

## Modüller

Genel bakış yalnızca dört büyük modül kartını gösterir: Bilgi Yarışması, Beni Tanıyor musun?, Çarkıfelek ve Kelime Bulutu. Kartlar masaüstünde iki sütun, telefonda tek sütun yerleşir. Konu seçimi ve etkinlik listeleri ilgili modülün içinde bulunur.

Bilgi yarışması konu seçimi varsayılan olarak büyük, üst üste gelen 3B kartlarla açılır. Kartlar dokunarak kaydırma, fare sürükleme, ok düğmeleri veya klavyeyle gezilebilir. Kartlar/Liste tercihi aynı tarayıcıda hatırlanır; iki görünümde de Türkçe konu araması bulunur. Hareket azaltma tercihi animasyonları kapatır. Bu ekran yalnızca konu seçer; soru kütüphanesi yetkilerini değiştirmez.

- **Bilgi yarışması:** Aile oyunu dışında 18 kategorinin her birinde 250 soru; toplam 4.500 hazır soru. Türkiye kategorisinde yalnız 20 büyükşehir plakası bulunur. Plakalar havuzu 81 ilin kodlarını, ters eşleştirmeleri, şehir çiftlerini ve rotaları içerir. Ülke bayrakları havuzu 196 ülke/bölge bayrağı ile 54 başkent ipucundan oluşur. Bayrak şıkları sunucudan gelen seçenek kodlarıyla yerel SVG görsellerini kullanır. Her tur 10 soru, her soruda dört şık ve tek doğru cevap. Otomatik seçim 9 genel bilgi + 1 detay/uzmanlık sorusudur; soru sırası karışıktır. Kullanılmamış sorulara her düzeyin kendi içinde öncelik verilir; o grup bitince en eski sorular tekrar kullanılır. Elle seçilen 10 soruda da en az 9 genel bilgi sorusu gerekir. Yönetici soruları elle seçebilir veya yeni sorular ekleyebilir. Sunucu süreyi, yanıt tekilliğini ve 500–1.000 arası hız puanını doğrular. Yanlış cevap 0 puan. Doğru cevap ve mevcut sorunun puanı soru kapanmadan katılımcıya gönderilmez.
- **Çekiliş:** Elle isim ekleme, ilk sütundan `.xlsx` / `.csv` içe aktarma, önizleme, QR katılımı, aynı ismin bir kez eklenmesi. Büyük, ışıklı çarkıfelek; eşit açılı isim dilimleri, yavaşlayarak kazananın dilimine durma ve konfeti. Kazanan sunucuda `random_int` ile seçilir; ilk 11 saniye yanıtta bulunmaz. Sonrasında çark yaklaşık dört saniyede kazanana iner; yeni çekiliş ve liste yükleme 17. saniyeye kadar kilitlidir. Her turun katılımcı dilimleri sabitlenir; dönüş sırasında QR ile eklenenler sonraki tura katılır. Çok büyük listelerde her katılımcı eşit dilime sahiptir; okunabilirlik için çark üzerinde en fazla 48 isim etiketi gösterilir. Kazananlar aynı etkinlikte tekrar seçilmez. Yalnızca görsel animasyon istemcidedir.
- **Kelime bulutu:** Kişi başına 1–3 kelime. Türkçe büyük/küçük harf, Unicode, boşluk ve noktalama normalizasyonu. Aynı kişinin aynı kelimeyi tekrar yazması sayıyı artırmaz. Cevap güncelleme eski oyu kaldırır. Balonlar oy sayısıyla büyür ve üzerinde sayacı gösterir. Yeni soru önceki bulutu temizler; önce CSV dışa aktarılabilir.

İsimler/takma adlar etkinlik ekranında görünür. Katılımcı kendi tarayıcısında etkinliğe ait rastgele kimlik taşır. Yönetici şifresi hash olarak sunucuda saklanır. Oturum çerezi HttpOnly + SameSite=Strict kullanır. Şifreler Git'e girmez.

## Yerel geliştirme

```sh
npm ci
npm run build
npm test
npm run check:bank
```

Testler kendi geçici SQLite veritabanını ve PHP sunucusunu açıp kapatır; üretim veritabanına erişmez. MySQL bağlantısı üretim kurulumu sırasında doğrulanır. Kalıcı yerel önizleme için:

```sh
php scripts/dev-init.php /tmp/arena-preview.sqlite
ARENA_TEST_DSN='sqlite:/tmp/arena-preview.sqlite' \
ARENA_TEST_ADMIN_HASH="$(php -r 'echo password_hash("local-test-password", PASSWORD_DEFAULT);')" \
php -S 127.0.0.1:8091 scripts/router.php
```

Tarayıcı: http://127.0.0.1:8091 — yalnızca yerel test yönetici şifresi `local-test-password`. Bu test girişi sadece PHP yerel geliştirme sunucusunda ve açıkça belirtilmiş ortam değişkenleriyle çalışır.

## Hostinger ve otomatik yayın

1. hPanel'de `YOUR_DATABASE_NAME` MySQL veritabanını ve kullanıcıyı oluşturun.
2. GitHub `main` dalındaki her push testleri çalıştırır, derlemeyi yapar ve yalnızca yayın dosyalarını `codex/deploy` dalına gönderir.
3. hPanel → Gelişmiş → GIT: `dreamartxx/kahoot`, dal `codex/deploy`, hedef `public_html`, otomatik dağıtım açık.
4. Siteyi bir kez açın. Uygulama `public_html` dışında, aynı üst dizindeki `bilgi-arena-private/setup.key` dosyasını otomatik oluşturur. Bu 256 bitlik tek kullanımlık kurulum anahtarını hPanel Dosya Yöneticisi üzerinden okuyun. Anahtarı Git'e eklemeyin.
5. HTTPS site adresinde `/#setup` formuna anahtarı, MySQL bilgilerini ve yönetici şifresini girin. Tablo kurulumu tamamlanır; `public_html` dışındaki `bilgi-arena-private/config.php` oluşturulur; `setup.key` kaldırılır ve kurulum kilitlenir.
6. Ana sayfadaki yönetici girişiyle etkinlik oluşturun.

Yönetici girişi yaptıktan sonra sol menüdeki **Şifremi değiştir** ile mevcut şifrenizi girip yeni şifrenizi kaydedebilirsiniz. Şifre uzunluğu şartı yoktur; boş şifre kabul edilmez. Yeni şifreler önce SHA-256 ile işlenir ve ardından bcrypt ile hash edilir; uzun şifrelerin son kısmı kesilmez. Değişiklik diğer yönetici oturumlarını kapatır. Güncel şifrenin hash'i veritabanındaki `arena_auth` tablosunda saklanır; kod güncellemelerinde korunur.

`bilgi-arena-private/config.php` yayın kök dizininin dışında tutulur. Konfigürasyon ve MySQL verileri Git tarafından yönetilmez; yayın güncellemelerinden etkilenmez. Anahtar ve konfigürasyon doğrudan HTTP erişimine kapalıdır. `data/` altındaki cevap anahtarına da HTTP erişimi kapalıdır.

Kaynak değişikliği → GitHub Actions doğrulaması → `codex/deploy` → Hostinger otomatik yayın. Başarısız testler yayın dalını güncellemez. Actions'ın bot push'larının Hostinger uygulama webhook'unu tetiklediği canlı sürüm dosyasıyla doğrulanmalıdır. Mevcut sürümün kaynak commit'i `/version.txt` adresinde bulunur.

## Veri ve sınırlar

- Her etkinlik 7 gün erişilebilir; en fazla 300 QR katılımcısı, çekilişte en fazla 2.000 benzersiz isim. Bu sınırlar kapasite garantisi değildir. Paylaşımlı hostingde büyük etkinlik öncesinde gerçek MySQL ve cihazlarla yük testi yapın.
- Canlı ekranlar yaklaşık 1,4 saniye aralıkla sorgular. Süre sunucu saatine göre hesaplanır.
- Oluşturulan etkinlikler ve özel sorular MySQL'de kalıcıdır. Süresi dolmuş etkinlikler otomatik silinmez; yedekleme/temizlik işletmeci sorumluluğundadır.
- Hazır sorular `scripts/build_bank.py` ile tekrar üretilebilir. Tarihsel futbol soruları 1930–2022 Dünya Kupaları ve 1960–2024 Avrupa Şampiyonalarını kapsar. Güncel kadro veya güncel rekor varsayımı yapılmaz.
- Excel: `.xlsx` ve UTF-8 `.csv`, ilk sayfa/ilk sütun. İlk satır “İsim”, “Ad Soyad” veya “Name” ise atlanır. Eski `.xls` dosyalarını önce `.xlsx` olarak kaydedin. En fazla 5 MB.
- Kelime bulutu en sık kullanılan 120 kelimeyi görselleştirir; tamamı CSV'de bulunur. Giriş yapılan takma ad herkese görünür. İnternete açık etkinliklerde yalnızca güvendiğiniz kişilerle oyun kodunu paylaşın.
- Yapısal testler: 18 kategori × 250 soru, toplam 4.500 soru, benzersiz kimlik/metin, dört benzersiz şık, tek cevap indeksi. İçerik editoryal olarak gözden geçirilebilir; hazır havuz koddan, özel sorular yönetici ekranından yönetilir.

## Referanslar

Sorular özgün Türkçe ifadelerle hazırlanmıştır. Konu kontrolü için [NASA gezegenler](https://science.nasa.gov/solar-system/planets/), [Natural History Museum Dino Directory](https://www.nhm.ac.uk/discover/dino-directory), [FIFA Dünya Kupası tarihi](https://www.fifa.com/es/articles/todos-los-mundiales-de-la-historia-campeones-sedes-y-mejores-jugadores), [UEFA EURO geçmişi](https://www.uefa.com/uefaeuro/history/) ve [Hostinger Git dağıtımı](https://www.hostinger.com/support/1583302-how-to-deploy-a-git-repository-in-hostinger/) referans alınabilir. Havuzdaki her soru bağımsız bir bilimsel kaynak taramasından geçirilmiş olduğu iddiasını taşımaz.

### Tarih soru havuzlarının bakımı

Dört tarih kategorisinin ilk 150 sorusu `data/history/`, ilave 100 sorusu `data/expansion250/` altındadır. Diğer genişletme içerikleri `scripts/bank250_*.py` içinde tutulur; `scripts/bank_250.py` bunları mevcut kayıtlardan sonra ekler. Aile oyununun 50 hazır sorusu ve özel soru seçeneği bu havuzdan bağımsızdır. `scripts/history_bank.py` konu türüne uygun cevap havuzlarından üç yanlış seçenek seçer. `python3 scripts/build_bank.py` tüm bankayı deterministik üretir. Kur’an anlatımına dayalı soruların açıklamalarında sûre/âyet bulunur; siyer bilgileri soru metninde ayrıca belirtilir. Editoryal başvuru kaynakları `data/question-sources.json` içindedir.

### MySQL bağlantıları ve oyun güncelleme yükü

MySQL bağlantıları PHP çalışanı başına kalıcı PDO bağlantısıyla yeniden kullanılır. Hostinger'ın saniyede 20 **yeni** bağlantı sınırı nedeniyle her istekte yeni bağlantı açılmaz. Özel `config.php` dosyasında `persistent => false` ile geri alınabilir. İstek başında ve kapanışında açık işlemler geri alınır; doğrulama hatası veya `exit` oda/kredi kilidini sonraki isteğe taşımaz. SQLite test bağlantıları kalıcı değildir.

Auth, kredi, solo ve özel yarışma şemaları bağlantı başına sürümle kontrol edilir. Tekrarlanan istekler DDL çalıştırmaz; bağlantı yenilenince veya şema sürümü değişince kontrol yeniden yapılır. Tablo değiştirildiğinde ilgili `ensureSchema` sürümü artırılmalıdır. Kullanıcı yetkileri, oturumlar ve bakiyeler önbelleğe alınmaz. Şema hazırlığı işlem açılmadan yapılır; böylece MySQL DDL komutları oyun işlemini örtülü olarak commit edemez.

Oda ekranları 1,5–1,75 saniye aralıklarla ve geçiş sınırlarında güncellenir; 3–2–1 mevcut sunucu zaman çizelgesinden cihazda çizilir. Arka plan sekmeleri 5 saniyeye yavaşlar, görünür olunca hemen güncellenir, bitmiş/kapalı odalar sorgulamayı bırakır. Hatalarda 2–15 saniyelik artan bekleme ve küçük rastgele gecikmeler eşzamanlı istek yığılmasını azaltır. Bu değişiklikler tek başına bir katılımcı kapasitesi garantisi değildir.

CI, MySQL 8 üzerinde farklı HTTP isteklerinin aynı bağlantıyı kullandığını, şema hazırlığının tekrar etmediğini ve erken çıkış/hata sonrası rollback işlemini denetler (`tests/mysql-persistence.test.mjs`). Yerelde MySQL yoksa yalnızca bu test atlanır; API/oyun testleri SQLite ile çalışır.

### Katılımcı karakterleri ve final podyumu

Katılımcılar oyun girişinde altı temadan 20 adet 3D görünümlü karakter seçer. Seçim oyun kaydında saklanır, aynı cihazın sonraki katılımında hatırlanır ve bekleme salonu, oyuncu bilgisi, ara sıralama ve finalde görünür. Eski oyun ve istemciler astronot karakteriyle uyumludur. API yalnızca tanımlı karakter kimliklerini kabul eder.

Bilgi yarışması ve aile oyunu finalinde ilk altı katılımcı animasyonlu basamaklı podyumda gösterilir. Eşit puanlar aynı sırayı ve aynı basamak yüksekliğini paylaşır; tam sıralama erişilebilir kalır. Mobil görünüm ve azaltılmış hareket tercihi desteklenir. Görseller `src/characters/` altında, üretim notları `docs/character-art.md` dosyasındadır.

### Soru sonu cevap karşılaştırması

Bilgi yarışması ve aile oyununda, yalnızca `reveal` aşamasında o soruya ait katılımcı seçimleri açıklanır. İki kişilik oyunda her katılımcı “Senin cevabın” ve “Karşıdakinin cevabı” kartlarını kendi bakış açısından görür. Doğru seçim yeşil, yanlış seçim kırmızı, yanıtsız soru nötr renktedir; etiket ve simgeler renge ek olarak sonucu açıklar. Kalabalık oyunlarda diğer cevaplar açılır bölümde gösterilir. Aile oyunundaki soru sahibinin kayıtlı yanıtı referans olarak işaretlenir ve puan almaz. Başka soruların profil cevapları veya katılımcı token/hash değerleri gönderilmez. Mevcut sonuç penceresi karşılaştırmayı içerir; 3–2–1 geçişinde kapanır.

### Yarışma zorluk dengesi

`data/question-levels.json`, aile dışında 18 kategoride genel bilgi turuna uygun eski soruları sabit kimlikleriyle listeler. Bunlar temel kavramlar, tanınan kişiler/yerler ve kolay–orta düzey bilgilerdir. Diğer sorular ihtiyatlı olarak “Detay / uzmanlık” grubunda tutulur; bu etiket her oyuncu için mutlak bir zorluk iddiası değildir. Teknik terimler, az bilinen türler, ayrıntılı maç kadroları, fosil keşifleri ve hassas tarih ezberi genel kontenjanına alınmaz. Her kategorideki 250 kayıt korunur; içerik yenilemesinde eski oyunların saklanan desteleri değişmez. Yeni hazır sorular inceleme yapılana kadar sınırlı detay grubuna düşer; kimliklerin kategorileri ve yeterli genel soru sayısı testlerde denetlenir.

Sunucu yeni otomatik oyunlarda 9 genel + 1 detay sorusunu, her grupta kullanılmamış/en eski soruları önceleyerek seçer ve son desteyi karıştırır. Genel grubun tükenmesi detay kontenjanını artırmaz. Detay grubu olmayan bir havuzda 10 genel soru kullanılabilir; 9 genel sorusu olmayan havuzla oyun kurulmaz. Elle seçimde 0 veya 1 detay sorusu kabul edilir; istemci ve API 2. detay sorusunu engeller. Yönetici yeni özel soru eklerken düzeyi seçebilir. Düzeyi olmayan eski özel sorular ihtiyatlı olarak detay sayılır. Mevcut oyunların desteleri ve aile oyununun kişisel soruları değiştirilmez.

2026-10-11 içerik yenilemesi: `scripts/easy_refresh.py` her kategoride 50, toplam 900 soruyu daha kolay içerikle değiştirir. `data/easy-replacements.json` çıkarılan sabit kimlikleri saklar. Bayraklarda ülke kapsamını korumak için 50 başkent ipucu, renk/sembol ipuçlarıyla değiştirilir; diğer kategorilerde 50 detay kaydı yenilenir. Yeni 900 kayıtta `difficulty: general` açıkça saklanır. Genel kontenjanı, bu kayıtlar ile `question-levels.json` listesinin birleşimidir: toplam 2.468 genel ve 2.032 sınırlı detay sorusu. İlk 2.081 tarihî kayıt ve aile havuzu korunur. Yapısal testler her kategoride tam 50 değişimi, çıkarılan kimliklerin yokluğunu, dört şıkkı ve kategori kapsamını doğrular.

Beni Tanıyor musun? kurulumunda kurucu rastgele seçim yerine “Soruları ben seçeyim” seçeneğiyle 50 hazır soruyu arayıp seçebilir. Seçilen hazır sorular ve varsa özel sorular toplam 10 olmalıdır. Hazır soruların kimlikleri sunucuda doğrulanır, aynı soru iki kez kullanılamaz ve seçim geçmişe kaydedilir. Kurucu hesapları aile soru metinlerini görebilir; genel soru kütüphanesi yalnızca site yöneticisine açık kalır. Mevcut odaların soruları değişmez.

### Turnuva

Bilgi yarışması, aile oyunu ve turnuva kurucusu bekleme ekranındaki “Ben de yarışacağım” düğmesiyle isim ve karakter seçip aynı ekranda yarışmacı olabilir. Aile oyununda rolünü ve kendi cevaplarını, turnuvada tek alanını ve soru sayısı oyunu kaydeder. Yönetim düğmeleri kullanılabilir kalır; cevaplar ve puanlar diğer katılımcılarla aynı kurallara tabidir. Katılım belirteci saklandığı için sayfa yenilendiğinde yarışmacı kimliği korunur.

Kurucu turnuva adını, soru süresini ve başlamadan önce ödülünü belirler. Katılımcılar QR/kod ile katılıp 18 konu arasından yalnızca bir alan seçip onaylar. Onaylanan seçim kilitlenir; başka biri aynı alanı seçmiş olsa da ek seçim hakkı verilmez. Aynı isteğin tekrar gönderilmesi güvenle aynı sonucu döndürür. Aynı alan kaç kişi tarafından seçilirse seçilsin yalnız bir tur oluşturulur. Herkes tüm alanlarda yarışır; puanlar alanlar arasında sıfırlanmaz. En az iki kişi ve herkesin alan seçimi tamamlanınca kurucu turnuvayı başlatır; bundan sonra yeni katılım ve ödül değişikliği kapanır. Eski sürümden kalan çoklu seçimli bekleme odalarında katılımcı tek alanını yeniden onaylamalıdır; başlamış turnuvaların destesi değişmez.

Başlangıçta katılımcılar her alan için 5 veya 10 soruya oy verir. Çoğunluk kazanır; eşitlikte/hiç oy yoksa 10 seçilir. Herkes oy verince veya 30 saniye dolunca 3–2–1 ile otomatik başlanır. Kurucu en az bir oy geldiyse mevcut oylarla erken başlatabilir. Turların sırası ve soruları sunucuda otomatik hazırlanır; elle soru seçimi yoktur. Beş soruluk turlarda tamamı genel, on soruluk turlarda en fazla bir uzmanlık sorusu kullanılır. Oylamaya başlamadan hazırlanan on soruluk alan desteleri geçmişe kaydedilir; 5 seçildiğinde bunlardan beş genel soru oynanır. Yeniden bağlantı aynı desteyi ve sunucu zaman çizelgesini kullanır. Alanlar tek destede arka arkaya oynanır; mevcut otomatik cevap gösterimi, 3–2–1, sonuç pencereleri ve ilk altı podyumu kullanılır. Ödül yalnız kurucunun belirlediği bir metindir; ödeme veya otomatik ödül teslimi yapılmaz.

Turnuva durumu mevcut oda JSON alanında saklanır; şema değişikliği gerekmez. `api/tournament.php` alan/oy/ödül doğrulamasını yapar, ortak soru-cevap kodu zaman ve puanlamayı yönetir. Soru metni yalnız güncel turda, doğru cevap ve puanlar yalnız soru kapandıktan sonra yayımlanır; ilerideki desteler ve katılımcı token/hash değerleri istemciye gönderilmez. Turnuva genel bakışta beşinci modül olarak eklenmiştir.


### Profil, hesap gizliliği ve mobil gezinme

Mobil stüdyo 800 px ve altında Ana sayfa, Etkinliklerim, Katıl ve Profil alt menüsünü kullanır. Ana sayfada belirgin oyun kodu kısayolu ve daha kompakt modül kartları bulunur. Profilde kullanıcı adı, şifre değiştirme, uygulamayı yükleme, yardım ve çıkış bir aradadır. Yönetici burada kullanıcı yönetimine ve soru kütüphanesine de erişir. `#studio/profile` gibi bölüm adresleri yenileme ve tarayıcı geri/ileri gezinmesini korur.

Standart hesap yalnızca oturumuna ait hesap bilgilerini ve kendi etkinliklerini görür; hesap listesi ve diğer hesapların yönetimi yalnız `owner` rolüne açıktır. `profile_update` yalnız kullanıcı adını kabul eder, hedefi sunucudaki mevcut oturumdan alır; istemciden gönderilen id, rol, durum veya şifre alanlarını reddeder. Kullanıcı adının benzersizliği, kaynak denetimi ve oturum zorunluluğu API testleriyle kontrol edilir. Şifreler mevcut ayrı doğrulamalı akıştan değiştirilir.


Her modül kartının üstünde, modül sayfasında ve oyun bekleme alanında “Nasıl oynanır?” rehberi bulunur. Üç adımlı paneller HTML details/summary kullanır; klavye ve mobil ekranlarla uyumludur. Turnuva alan seçimi tek satırlık yerel açılır listeden yapılır; kaydedildikten sonra kilitli seçim kartı gösterilir.


### Kendini Dene ve tek cihaz oturumu

- `Kendini Dene`: giriş yapan hesap, 18 konu veya karışık konulardan tek başına 10 soru oynar. 30 saniye/soru; her doğru 100 puan, en fazla 1.000. En fazla bir uzmanlık sorusu ve önceki turdaki sorulardan kaçınan seçim kullanılır. Yanıt sonrası doğru şık/açıklama, 5 saniyelik sonuç ve 3–2–1 geçişi gelir. Sayaç sayfa kapalıyken de ilerler.
- Tamamlanan testlerin kişisel ve konu bazlı rekorları, doğruluk oranı ve son sekiz deneme hesapta saklanır. Yarım bırakılan test kaydedilmez. Bu 10 sorunun sonucu genel uzmanlık ölçümü olarak sunulmaz. Skor, süre ve yanıt kontrolü sunucudadır; yalnızca mevcut soru ve sonuçta cevap özeti paylaşılır. Başkasının oyununa/rekoruna erişim yoktur.
- Normal hesapta yeni giriş, önceki tüm oturumları iptal eder. Kullanıcı satırı kilidi ve tek aktif oturum kaydı eşzamanlı girişleri sıralar; eski kurulumdaki oturumlardan yalnızca ilk doğrulanan korunur. Sayfalar 15 saniyede ve yeniden odaklanınca oturumu kontrol eder. Aynı tarayıcının sekmeleri ortak oturumu kullanır. Yönetici birden fazla cihazda oturum açabilir.
- Yönetici: Profil → Kullanıcı yönetimi → **Kullanıcı olarak test et**. Şifre gerektirmeden kullanıcının yetkileriyle arayüz açılır; üst şeritte **Yöneticiye dön** bulunur. Kullanıcının gerçek oturumu kesilmez. Test sırasında kullanıcı adı/şifre değiştirilemez, kütüphane ve kullanıcı yönetimi açılmaz. Tek kişilik test puanları ayrı tutulur; etkinlik işlemleri seçilen kullanıcının alanında uygulanır.
- Yeni tablolar `arena_active_sessions`, `arena_previews`, `arena_solo`, `arena_solo_results` mevcut kurulumda otomatik oluşturulur. Yayın paketi `api/solo.php` içerir.
- API testleri: cihaz değişimi, yönetici istisnası/test görünümü, hesap/puan izolasyonu, cevap gizliliği, tekrar yanıt, süre aşımı, farklı cihazdan devam, otomatik geçişler ve rekorun yalnızca bir kez kaydedilmesi.

### Özel bilgi yarışmaları

Bilgi yarışması ekranında üç ayrı oyun kartı bulunur. En Yakın Tahmin ve Sence Hangisi? kendi 200 soruluk havuzlarını, Ortaya Karışık ayrı 250 soruluk havuzunu kullanır. Her biri 10/15/20 soru ile kurulabilir; varsayılan sayı ilk ikisinde 10, karışıkta 20'dir. Karışık havuz 20 kategoriyi kapsar (kategori başına 12–13 soru); 10/15/20 soruluk oyunlarda her soru farklı kategoriden gelir. Oyun sırası ve dört şık karıştırılır.

`arena_quiz_rotation` kurucu ve oyun türüne göre önceki desteyi ve kullanım geçmişini saklar. Önceki oyunun soruları tamamen dışlanır, kullanılmamış/en eski sorular öncelenir; karışık oyunda 20 soruya kadar kategoriler tekrarlanmaz. Yönetici test görünümünün seçim geçmişi ayrıdır. Oda ve seçim geçmişi aynı işlemde kaydedilir. Yeni oyunlarda elle soru seçimi yoktur; eski odalar sakladıkları desteyle devam eder.

Tahmin soruları matematik işlemi yerine dünya, doğa, uzay, yapılar, kültür ve spor hakkında sayısal bilgiler sorar. Katılımcı belirtilen birimde sayıyı yazar; virgül/nokta ile en fazla üç ondalık basamak kabul edilir. Tahminler soru kapanana kadar gizlidir. En küçük mutlak farkı veren herkes 1.000 puan alır; eşit uzaklıktaki tahminler birlikte kazanır, hız puanı yoktur. Sonuç kartlarında gerçek cevap, tahminler, farklar ve puanlar görünür. Puanlama sunucuda yalnız bir kez uygulanır. Sence Hangisi? yalnız Evet/Hayır seçeneklerini kullanır; mevcut doğru cevap/hız puanlaması geçerlidir. Her iki mod mevcut otomatik geçiş, 3–2–1 ve final podyumunu kullanır.

Havuz kaynağı `scripts/build_quiz_formats.py`, çıktılar `data/quiz-estimate.json`, `data/quiz-binary.json` ve `data/quiz-mixed.json` dosyalarıdır. `npm run check:bank` deterministik üretimi denetler. Sayısal referanslar arasında [NASA gezegen bilgi tablosu](https://nssdc.gsfc.nasa.gov/planetary/factsheet/), [Eyfel Kulesi rakamları](https://www.toureiffel.paris/en/the-monument/key-figures), [NPS Özgürlük Heykeli ölçüleri](https://www.nps.gov/stli/learn/historyculture/statue-statistics.htm) bulunur. Yaklaşık değerlerin birimleri ve referans bağlamı soru/açıklamada belirtilir. Havuzların yapısı, seçim dengesi, ardışık oyunların ayrıklığı, cevap gizliliği, geçersiz tahminler, eşitlik ve süre sonu puanlaması otomatik testlerle kontrol edilir.

### Başlatılmayan etkinliklerin süresi

Yarışma/aile/turnuva bekleme salonu ve ilk çekilişi yapılmamış çark, oluşturulduktan 60 saniye sonra kurucuya “İptal et / Devam et” penceresi gösterir. Devam seçimi sunucuda hatırlanır, sekme/cihaz yenilenince tekrar sorulmaz ve 180 saniyelik başlangıç süresini uzatmaz. Henüz başlamayan etkinlik 180 saniyede kapalı kabul edilir; okuma/yazma sırasında kapanış veritabanına kaydedilir. Açık tarayıcı veya cron gerekmeden sonraki giriş/başlatma istekleri reddedilir. İptal bir silme işlemi değildir; kapalı etkinlikler mevcut tamamlananlar filtresinde kalır.

Başlamış yarışma/turnuva, ilk çekilişi yapılmış çark ve oluşturulduğu anda yanıt kabul eden kelime bulutu etkilenmez. Stüdyo ve kurucu ekranları bekleyen etkinlikleri üç saniyede kontrol eder. Yetkisiz kişiler uyarı/iptal işlemi yapamaz; eski bir uyarı başka sekmede başlatılan oyunu kapatamaz. Sunucu zamanı esastır. API testleri uyarı, onay sonrası değişmeyen son süre, otomatik ve manuel iptal, kayıt kalıcılığı, geç katılım ve başlamış oyunların korunmasını kapsar.

### Seçilebilir bilgi yarışması uzunluğu ve süresi

Yeni klasik bilgi yarışması, En Yakın Tahmin, Sence Hangisi? ve Ortaya Karışık kurulumlarında soru başına süre varsayılan **10 saniye**dir; seçenekler **10 / 15 / 20 saniye** ile sınırlıdır. `questionCount` **10 / 15 / 20** olabilir. Varsayılan soru sayısı klasik/tahmin/evet-hayır için 10, Ortaya Karışık için önceki davranışla uyumlu 20'dir. Seçenekler API'de de doğrulanır; mevcut odaların süreleri ve desteleri değişmez.

Klasik oyunda otomatik ve elle seçim aynı uzunluğu kullanır: 10 ve 15 soruda en fazla bir, 20 soruda en fazla iki detay sorusu; kalanlar genel bilgidir. Seçim sayacı ve elle seçilebilir soru sınırı kurulumdaki sayıyla birlikte değişir. Ortaya Karışık 10/15 soruda farklı kategoriler kullanır; 20 soruda 18 kategori ve iki ek soru bulunur. Özel oyunlarda önceki destenin tamamını dışlama kuralı, soru sayısı değiştirilse de korunur. Havuzların 200/200/250 büyüklükleri değişmez. Turnuvanın 5/10 oylaması, aile oyununun profil soruları ve kişisel test ayrı akışlarını korur.

### Dünya Kupası arşivi

`dunya-kupasi` kategorisi, 1930–2022 erkekler FIFA Dünya Kupaları hakkında 250 özgün Türkçe, dört şıklı soru içerir. Kaynağı `scripts/world_cup_bank.py`, dağıtılan çıktı `data/questions.json` dosyasıdır. Bu ekleme önceki 4.500 kaydı korur; Film kategorisiyle birlikte genel havuz 20 × 250 = 5.000 sorudur. Kategori normal yarışma, Kendini Dene ve turnuvada kullanılabilir; karışık havuza da dengeli biçimde katılır.

İçerik: şampiyonlar, ev sahipleri, finalistler, gol kralları, yıldızlar, Türkiye, unutulmaz anlar, maskotlar/müzik/stadyumlar, maç topları, temel bilgiler ve tarih/rekorlar. 199 genel ve 51 uzmanlık sorusu vardır; mevcut deste seçimi 10/15 soruda en çok 1, 20 soruda en çok 2 uzmanlık sorusu seçer. Rekorlar açıkça 2022 sonuyla sınırlandırılır. 1950 final grubu ve 1962/1994 ortak gol krallıkları gibi istisnalar soru metninde açıklanır.

Tarihsel kontrol kaynakları [FIFA eski turnuvalar](https://www.fifa.com/en/tournaments/mens/worldcup/articles/world-cup-champions-1930-1978-uruguay-italy-germany-brazil-england-argentina), [FIFA modern turnuvalar](https://www.fifa.com/en/tournaments/mens/worldcup/articles/world-cup-champions-1982-2026-italy-argentina-germany-brazil-france-spain), [TFF millî takım tarihi](https://www.tff.org/default.aspx?pageID=314), [FIFA maskotlar](https://www.fifa.com/en/articles/world-cup-mascots-in-history) ve [FIFA maç topları](https://www.fifa.com/en/tournaments/mens/worldcup/canadamexicousa2026/articles/ball-balls-history) sayfalarıdır. Her soruda açıklama ve referans bağlantısı bulunur.


### Film arşivi

`film` kategorisi `scripts/film_bank.py` ile üretilen 250 özgün Türkçe, dört şıklı ve açıklamalı sorudan oluşur. 25 Türk oyuncu/rol, 25 dünya sineması oyuncu/rol, 25 yönetmen, 50 animasyon, 50 film/karakter, 25 Türk filmi, 25 sinema terimi ve 25 Oscar/festival sorusu vardır. 225 genel, 25 uzmanlık sorusu bulunur. Mevcut seçim dengesi 10/15 soruda en çok 1, 20 soruda en çok 2 uzmanlık sorusuna izin verir.

Oyuncu ve yönetmen sorularında filmin sürümü/yılı belirtilir. Oscar sorularındaki yıl tören yılıdır; gösterim yılıyla karıştırılmaz. Soru kontrolünde [Akademi tören arşivi](https://www.oscars.org/oscars/ceremonies/2020), [Pixar film sayfaları](https://www.pixar.com/feature-films), [Chaplin arşivi](https://www.charliechaplin.com/en/films/1) ve [SESAM Arzu Film filmografisi](https://sesam.org.tr/uyeler/arzu-film/) gibi referanslar kullanılır; tekil kaynak bağlantıları ilgili sorularda saklanır. Metinler özgün yazılmıştır, alıntı diyalog ve şarkı sözü kullanılmaz.

Film kartı, yönetici soru kütüphanesi/elle seçim, Kendini Dene ve turnuva aynı kategori kimliğini kullanır. Önceki 4.750 soru değiştirilmeden korunur. Karışık havuz 250 soruda kalır ve artık 20 konu içerir; 20 soruluk yarışmada da konu tekrarı gerekmez. Yapı, zorluk, sürüm ayrımı, deste dönüşümü ve mod entegrasyonları test edilir.

### Ücretsiz aile kredileri

Normal hesaplar günde 10, takvim ayında 150 oyun kredisi kullanır; günlük tüketim aylık kotadan da düşer. Dönemler `Europe/Istanbul` gece yarısında yenilenir, günlük hak birikmez. Yönetici tarafından verilen süresiz bonus, günlük veya aylık hak yetmediğinde kullanılır. Ödeme/abonelik entegrasyonu yoktur; hesap bazlı limitler ileride farklı paketler tanımlamak için değiştirilebilir.

Başlangıç sınırları: aynı anda 1 açık etkinlik (kişisel test dahil), oynayan sunucu dahil 10 canlı katılımcı, çekilişte 50 isim. Yönetici kendi hesabıyla kredi/açık etkinlik sınırından muaftır; mevcut teknik 300 katılımcı/2000 çekiliş ismi üst sınırı korunur. Bunlar Hostinger kapasite garantisi değildir. Yönetici başka kullanıcıyı test ederken kredi harcamaz; kişisel test skorları ayrı kalır.

Oda oluşturmak ve katılmak ücretsizdir. Bilgi yarışması/aile oyunu/kişisel test başlangıcında 1 kredi, kelime bulutunda her başlatılan soruda 1 kredi, çekilişte her dönüşte 1 kredi düşer. Yeni kelime bulutları ücretsiz bekleme odasında açılır. Turnuva, seçilen farklı alan sayısı kadar krediyi başta ayırır; her tur başladığında ilgili hak harcanır, başlamayan turlar iptalde özgün dönemlerine iade edilir. Ayrılan haklar gece yarısından sonra da oyunun sürmesini sağlar. Kullanıcı isteğiyle erken bitirilen, başlamış oyunlar iade edilmez. Devam eden eski oyunlar için geriye dönük ücretlendirme yapılmaz.

Profilde kalan haklar, Türkiye saatindeki yenilenme zamanları ve son 50 kredi hareketi görünür. Yönetici yolu: **Profil ve ayarlar → Kullanıcı yönetimi → Krediler**. Limit değişikliği, bonus ve iade açıklamayla denetim kaydına yazılır. Aynı gün iade özgün kotayı/bonusu geri verir; önceki güne ait teknik sorun iadesi bonus olarak tanımlanır ve aylık kullanım ayrıca geri alınmaz (çift iade önlenir).

`api/credits.php` tabloları veri silmeden otomatik oluşturur. Hesap kilidi, işlem kimliği ve oyun durumu/kredi hareketinin aynı veritabanı işlemiyle kaydı eşzamanlı harcama ve tekrar isteklerinde çift düşümü önler. MySQL bakiye okumaları satır kilidiyle güncel veriyi kullanır; şema oluşturma işlemleri oyun işleminin dışında kalır. Turnuva turları API okumalarında gerektiğinde uzlaştırılır; sürekli her ankette yazılmaz. Yerel SQLite API testleri kota, iade, yetki, tekrar isteği, dönem sınırı ve kayıt hatasında geri alma senaryolarını kapsar; üretim MySQL eşzamanlı yük testi yerine geçmez.
