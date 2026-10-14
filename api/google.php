<?php
declare(strict_types=1);
require_once __DIR__.'/../vendor/autoload.php';

function googleClientId(): string {
    $id=(string)((require __DIR__.'/google-config.php')['client_id']??'');
    return preg_match('/^[0-9]+-[a-z0-9]+\.apps\.googleusercontent\.com$/D',$id)?$id:'';
}
function googleSchema(): void {
    ensureSchema('google',1,static function():void{
        $db=db();
        $db->exec('CREATE TABLE IF NOT EXISTS arena_google_accounts (google_sub VARCHAR(255) PRIMARY KEY, user_id INT NOT NULL UNIQUE, email VARCHAR(254) NOT NULL, created_at BIGINT NOT NULL)');
        $db->exec('CREATE TABLE IF NOT EXISTS arena_google_challenges (id VARCHAR(64) PRIMARY KEY, nonce VARCHAR(64) NOT NULL, binding_hash VARCHAR(64) NOT NULL, expires_at BIGINT NOT NULL)');
    });
}
function googleAccount(int $id): bool {
    googleSchema();$q=db()->prepare('SELECT user_id FROM arena_google_accounts WHERE user_id=?');$q->execute([$id]);return (bool)$q->fetchColumn();
}
function googleKeys(): array {
    $dir=privateDir();$path=$dir.'/google-jwks.json';
    $cache=is_file($path)?json_decode((string)file_get_contents($path),true):null;
    if(is_array($cache)&&($cache['expires']??0)>time()&&is_array($cache['keys']??null))return $cache['keys'];
    // Fixed Google endpoint; never use the token's jku/x5u to choose a URL.
    $ch=curl_init('https://www.googleapis.com/oauth2/v3/certs');
    curl_setopt_array($ch,[CURLOPT_RETURNTRANSFER=>true,CURLOPT_CONNECTTIMEOUT=>3,CURLOPT_TIMEOUT=>7,CURLOPT_FOLLOWLOCATION=>false,CURLOPT_PROTOCOLS=>CURLPROTO_HTTPS]);
    $body=curl_exec($ch);$status=curl_getinfo($ch,CURLINFO_RESPONSE_CODE);curl_close($ch);
    if($status!==200||!is_string($body))throw new RuntimeException('Google verification unavailable');
    $keys=json_decode($body,true,16,JSON_THROW_ON_ERROR);
    if(empty($keys['keys'])||!is_array($keys['keys']))throw new RuntimeException('Invalid key set');
    if(!is_dir($dir))mkdir($dir,0700,true);
    $temp=tempnam($dir,'jwks-');if($temp!==false){chmod($temp,0600);file_put_contents($temp,json_encode(['expires'=>time()+1800,'keys'=>$keys]));rename($temp,$path);}
    return $keys;
}
function verifyGoogleIdentity(string $token,string $nonce,string $clientId,array $jwks,array $authorizedParties=[]): array {
    if(strlen($token)>16384||$clientId===''||$nonce==='')throw new UnexpectedValueException('Invalid token');
    $keys=Firebase\JWT\JWK::parseKeySet($jwks,'RS256');
    $claims=(array)Firebase\JWT\JWT::decode($token,$keys);
    if(!in_array($claims['iss']??null,['accounts.google.com','https://accounts.google.com'],true)
        ||($claims['aud']??null)!==$clientId
        ||(isset($claims['azp'])&&!in_array($claims['azp'],array_merge([$clientId],$authorizedParties),true))
        ||!is_int($claims['exp']??null)||$claims['exp']<=time()
        ||!is_int($claims['iat']??null)||$claims['iat']>time()+60||$claims['iat']<time()-600
        ||!is_string($claims['nonce']??null)||!hash_equals($nonce,$claims['nonce'])
        ||($claims['email_verified']??false)!==true
        ||!is_string($claims['sub']??null)||!preg_match('/^[a-zA-Z0-9_-]{1,255}$/D',$claims['sub'])
        ||!is_string($claims['email']??null)||strlen($claims['email'])>254||!filter_var($claims['email'],FILTER_VALIDATE_EMAIL))throw new UnexpectedValueException('Invalid identity');
    return ['sub'=>$claims['sub'],'email'=>$claims['email']];
}
function googleActions(string $action,array $in): void {
    if(!in_array($action,['google_challenge','google_login'],true))return;
    if(googleClientId()==='')fail('Google ile giriş henüz kullanıma açılmadı.',503);
    if(empty($_SERVER['HTTP_ORIGIN']))fail('Geçersiz kaynak.',403);
    googleSchema();authSchema();rateLimit($action,10);
    $binding=$in['binding']??'';
    if(!is_string($binding)||!preg_match('/^[a-f0-9]{64}$/D',$binding))fail('Giriş isteği geçersiz.',400);
    $db=db();$db->prepare('DELETE FROM arena_google_challenges WHERE expires_at < ?')->execute([time()]);
    if($action==='google_challenge'){
        $id=bin2hex(random_bytes(32));$nonce=bin2hex(random_bytes(32));
        $db->prepare('INSERT INTO arena_google_challenges (id,nonce,binding_hash,expires_at) VALUES (?,?,?,?)')->execute([$id,$nonce,hash('sha256',$binding),time()+300]);
        echo json_encode(['challengeId'=>$id,'nonce'=>$nonce,'clientId'=>googleClientId()]);exit;
    }
    $id=$in['challengeId']??'';$token=$in['idToken']??'';
    if(!is_string($id)||!preg_match('/^[a-f0-9]{64}$/D',$id)||!is_string($token))fail('Giriş isteği geçersiz.',400);
    $q=$db->prepare('SELECT * FROM arena_google_challenges WHERE id=?');$q->execute([$id]);$challenge=$q->fetch();
    if(!$challenge||(int)$challenge['expires_at']<time()||!hash_equals($challenge['binding_hash'],hash('sha256',$binding)))fail('Giriş süresi doldu. Tekrar deneyin.',401);
    try{$identity=verifyGoogleIdentity($token,$challenge['nonce'],googleClientId(),googleKeys(),(require __DIR__.'/google-config.php')['android_client_ids']??[]);}
    catch(UnexpectedValueException|DomainException $e){fail('Google hesabı doğrulanamadı. Yeniden deneyin.',401);}
    catch(Throwable $e){error_log('Arena: Google verification unavailable');fail('Google doğrulamasına şu an ulaşılamıyor. Tekrar deneyin.',503);}
    $db->beginTransaction();
    $q=$db->prepare('DELETE FROM arena_google_challenges WHERE id=? AND expires_at>=? AND binding_hash=?');$q->execute([$id,time(),hash('sha256',$binding)]);
    if($q->rowCount()!==1)fail('Bu giriş isteği kullanıldı. Tekrar deneyin.',401);
    $q=$db->prepare('SELECT u.* FROM arena_google_accounts g JOIN arena_users u ON u.id=g.user_id WHERE g.google_sub=?');$q->execute([$identity['sub']]);$u=$q->fetch();
    if(!$u){
        // Google subject is the identity. Never merge with a username or an email match.
        $name='oyuncu_'.bin2hex(random_bytes(5));
        $db->prepare("INSERT INTO arena_users (username,username_key,password_hash,role,active) VALUES (?,?,?,'host',1)")->execute([$name,$name,makeAdminHash(bin2hex(random_bytes(32)))]);
        $userId=(int)$db->lastInsertId();
        $db->prepare('INSERT INTO arena_google_accounts (google_sub,user_id,email,created_at) VALUES (?,?,?,?)')->execute([$identity['sub'],$userId,$identity['email'],time()]);
        $q=$db->prepare('SELECT * FROM arena_users WHERE id=?');$q->execute([$userId]);$u=$q->fetch();
    }
    if(!(int)$u['active'])fail('Bu hesapla giriş yapılamıyor. Destek ile iletişime geçin.',403);
    $db->prepare('UPDATE arena_google_accounts SET email=? WHERE google_sub=?')->execute([$identity['email'],$identity['sub']]);
    $db->commit();
    startAuthSession($u);clearLegacySession();
    echo json_encode(['admin'=>true,'user'=>publicUser($u)],JSON_UNESCAPED_UNICODE);exit;
}
