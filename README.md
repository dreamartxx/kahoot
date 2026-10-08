# Bilgi Arena

QR ile katılımlı Türkçe etkinlik stüdyosu. React + PHP 8.2+ + MySQL/MariaDB; Hostinger Business Web Hosting üzerinde çalışır.

## Modüller

- **Bilgi yarışması:** Coğrafya, Dinozorlar, Hayvanlar, Türkiye, Ülkeler, Gezegenler, Futbol, Kaleciler, Arabalar ve Genel kültür başlıklarında 100'er soru. Her tur 10 soru, her soruda dört şık ve tek doğru cevap. Kullanılmamış sorulara öncelik; havuz bitince en eski sorular tekrar kullanılır. Yönetici soruları elle seçebilir veya yeni sorular ekleyebilir. Sunucu süreyi, yanıt tekilliğini ve 500–1.000 arası hız puanını doğrular. Yanlış cevap 0 puan. Doğru cevap ve mevcut sorunun puanı soru kapanmadan katılımcıya gönderilmez.
- **Çekiliş:** Elle isim ekleme, ilk sütundan `.xlsx` / `.csv` içe aktarma, önizleme, QR katılımı, aynı ismin bir kez eklenmesi. Altı saniye karıştırma, üç saniye yavaş iniş, iki saniye açılma. Kazanan sunucuda `random_int` ile seçilir; açılma anından önce yanıtta bulunmaz. Kazananlar aynı etkinlikte tekrar seçilmez. Yalnızca görsel animasyon istemcidedir.
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
- Yapısal testler: 10×100 soru, benzersiz kimlik/metin, dört benzersiz şık, tek cevap indeksi. İçerik editoryal olarak gözden geçirilebilir; hazır havuz koddan, özel sorular yönetici ekranından yönetilir.

## Referanslar

Sorular özgün Türkçe ifadelerle hazırlanmıştır. Konu kontrolü için [NASA gezegenler](https://science.nasa.gov/solar-system/planets/), [Natural History Museum Dino Directory](https://www.nhm.ac.uk/discover/dino-directory), [FIFA Dünya Kupası tarihi](https://www.fifa.com/es/articles/todos-los-mundiales-de-la-historia-campeones-sedes-y-mejores-jugadores), [UEFA EURO geçmişi](https://www.uefa.com/uefaeuro/history/) ve [Hostinger Git dağıtımı](https://www.hostinger.com/support/1583302-how-to-deploy-a-git-repository-in-hostinger/) referans alınabilir. Havuzdaki her soru bağımsız bir bilimsel kaynak taramasından geçirilmiş olduğu iddiasını taşımaz.
