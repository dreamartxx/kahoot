<?php
declare(strict_types=1);
header('Content-Type: application/json; charset=utf-8');header('Cache-Control: no-store');
require __DIR__.'/core.php';
if(configured())fail('Kurulum zaten tamamlandı.',409);
if($_SERVER['REQUEST_METHOD']!=='POST')fail('POST gerekli.',405);
if(!str_contains($_SERVER['CONTENT_TYPE']??'','application/json'))fail('JSON gerekli.',415);
$keyFile=privateDir().'/setup.key';if(!is_file($keyFile))fail('Önce ana sayfayı açarak kurulum anahtarını oluşturun.',503);
try {
    $in=json_decode(file_get_contents('php://input'),true,32,JSON_THROW_ON_ERROR);
    if(!hash_equals(trim(file_get_contents($keyFile)),(string)($in['key']??'')))fail('Kurulum anahtarı hatalı.',403);
    $user=inputText($in['user']??'',1,64,'Veritabanı kullanıcısı');$name=inputText($in['database']??'',1,64,'Veritabanı adı');
    if(!preg_match('/^[a-zA-Z0-9_]+$/',$name)||!preg_match('/^[a-zA-Z0-9_]+$/',$user))fail('Veritabanı bilgileri geçersiz.');
    $origin=$_SERVER['HTTP_ORIGIN']??'';if(!preg_match('~^https://[a-z0-9.-]+(?::[0-9]+)?$~i',$origin))fail('Kurulum HTTPS üzerinden açılmalı.',400);
    $pass=(string)($in['password']??'');$adminPass=(string)($in['adminPassword']??'');if(strlen($adminPass)<12)fail('Yönetici şifresi en az 12 karakter olmalı.');
    $cfg=['dsn'=>"mysql:host=localhost;dbname=$name;charset=utf8mb4",'user'=>$user,'password'=>$pass,'admin_hash'=>password_hash($adminPass,PASSWORD_DEFAULT),'origin'=>$origin];
    $pdo=new PDO($cfg['dsn'],$user,$pass,[PDO::ATTR_ERRMODE=>PDO::ERRMODE_EXCEPTION]);migrate($pdo);
    $path=privateDir().'/config.php';$handle=fopen($path,'x');if(!$handle)fail('Kurulum kilitli.',409);fwrite($handle,"<?php\nreturn ".var_export($cfg,true).";\n");fclose($handle);chmod($path,0600);unlink($keyFile);
    echo json_encode(['ok'=>true]);
} catch(Throwable $e){error_log('Arena setup: '.$e->getMessage());fail('Veritabanına bağlanılamadı. Bilgileri ve veritabanının oluşturulduğunu kontrol edin.',400);}
