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

- **Bilgi yarışması:** Aile oyunu dışında 18 kategorinin her birinde 250 soru; toplam 4.500 hazır soru. Türkiye kategorisinde yalnız 20 büyükşehir plakası bulunur. Plakalar havuzu 81 ilin kodlarını, ters eşleştirmeleri, şehir çiftlerini ve rotaları içerir. Ülke bayrakları havuzu 196 ülke/bölge bayrağı ile 54 başkent ipucundan oluşur. Bayrak şıkları sunucudan gelen seçenek kodlarıyla yerel SVG görsellerini kullanır. Her tur 10 soru, her soruda dört şık ve tek doğru cevap. Kullanılmamış sorulara öncelik; havuz bitince en eski sorular tekrar kullanılır. Yönetici soruları elle seçebilir veya yeni sorular ekleyebilir. Sunucu süreyi, yanıt tekilliğini ve 500–1.000 arası hız puanını doğrular. Yanlış cevap 0 puan. Doğru cevap ve mevcut sorunun puanı soru kapanmadan katılımcıya gönderilmez.
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

### Katılımcı karakterleri ve final podyumu

Katılımcılar oyun girişinde altı temadan 20 adet 3D görünümlü karakter seçer. Seçim oyun kaydında saklanır, aynı cihazın sonraki katılımında hatırlanır ve bekleme salonu, oyuncu bilgisi, ara sıralama ve finalde görünür. Eski oyun ve istemciler astronot karakteriyle uyumludur. API yalnızca tanımlı karakter kimliklerini kabul eder.

Bilgi yarışması ve aile oyunu finalinde ilk altı katılımcı animasyonlu basamaklı podyumda gösterilir. Eşit puanlar aynı sırayı ve aynı basamak yüksekliğini paylaşır; tam sıralama erişilebilir kalır. Mobil görünüm ve azaltılmış hareket tercihi desteklenir. Görseller `src/characters/` altında, üretim notları `docs/character-art.md` dosyasındadır.

### Soru sonu cevap karşılaştırması

Bilgi yarışması ve aile oyununda, yalnızca `reveal` aşamasında o soruya ait katılımcı seçimleri açıklanır. İki kişilik oyunda her katılımcı “Senin cevabın” ve “Karşıdakinin cevabı” kartlarını kendi bakış açısından görür. Doğru seçim yeşil, yanlış seçim kırmızı, yanıtsız soru nötr renktedir; etiket ve simgeler renge ek olarak sonucu açıklar. Kalabalık oyunlarda diğer cevaplar açılır bölümde gösterilir. Aile oyunundaki soru sahibinin kayıtlı yanıtı referans olarak işaretlenir ve puan almaz. Başka soruların profil cevapları veya katılımcı token/hash değerleri gönderilmez. Mevcut sonuç penceresi karşılaştırmayı içerir; 3–2–1 geçişinde kapanır.
