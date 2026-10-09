<?php
declare(strict_types=1);
// Durable, revocable browser sessions. Only a digest of the cookie is stored.
function authSchema(): void {
    static $ready=false;if($ready)return;
    $db=db();$mysql=$db->getAttribute(PDO::ATTR_DRIVER_NAME)==='mysql';
    $db->exec('CREATE TABLE IF NOT EXISTS arena_users (id '.($mysql?'INT AUTO_INCREMENT PRIMARY KEY':'INTEGER PRIMARY KEY AUTOINCREMENT').', username VARCHAR(64) NOT NULL, username_key VARCHAR(64) NOT NULL UNIQUE, password_hash VARCHAR(255) NOT NULL, role VARCHAR(16) NOT NULL, active INT NOT NULL DEFAULT 1)');
    $db->exec('CREATE TABLE IF NOT EXISTS arena_sessions (token_hash VARCHAR(64) PRIMARY KEY, user_id INT NOT NULL, auth_version VARCHAR(64) NOT NULL, expires_at BIGINT NOT NULL)');
    $sql=$mysql?'INSERT IGNORE INTO arena_users (id,username,username_key,password_hash,role,active) VALUES (1,?,?,?,\'owner\',1)':'INSERT INTO arena_users (id,username,username_key,password_hash,role,active) VALUES (1,?,?,?,\'owner\',1) ON CONFLICT DO NOTHING';
    $db->prepare($sql)->execute(['admin','admin',adminHash()]);$ready=true;
}
function publicUser(array $u): array {return ['id'=>(int)$u['id'],'username'=>$u['username'],'role'=>$u['role'],'active'=>(bool)$u['active']];}
function authCookie(string $token,int $expires): void {
    setcookie('arena_session',$token,['expires'=>$expires,'path'=>'/','secure'=>(!empty($_SERVER['HTTPS'])&&$_SERVER['HTTPS']!=='off'),'httponly'=>true,'samesite'=>'Strict']);
    $_COOKIE['arena_session']=$token;
}
function clearLegacySession(): void {
    if(empty($_COOKIE[session_name()]))return;
    if(session_status()!==PHP_SESSION_ACTIVE)session_start();
    $_SESSION=[];session_destroy();setcookie(session_name(),'',['expires'=>time()-3600,'path'=>'/','httponly'=>true,'samesite'=>'Strict']);unset($_COOKIE[session_name()]);
}
function startAuthSession(array $u): void {
    $token=bin2hex(random_bytes(32));$expires=time()+30*86400;
    db()->prepare('INSERT INTO arena_sessions (token_hash,user_id,auth_version,expires_at) VALUES (?,?,?,?)')->execute([hash('sha256',$token),$u['id'],hash('sha256',$u['password_hash']),$expires]);
    authCookie($token,$expires);$GLOBALS['arena_user']=$u;$GLOBALS['arena_user_loaded']=true;
    db()->prepare('DELETE FROM arena_sessions WHERE expires_at < ?')->execute([time()]);
}
function currentUser(): ?array {
    if($GLOBALS['arena_user_loaded']??false)return $GLOBALS['arena_user']??null;
    $GLOBALS['arena_user_loaded']=true;
    if(!configured())return null;
    $token=$_COOKIE['arena_session']??'';
    if($token===''&&empty($_COOKIE[session_name()]))return null;
    authSchema();
    if(preg_match('/^[a-f0-9]{64}$/D',$token)){
        $q=db()->prepare('SELECT u.*,s.auth_version,s.expires_at FROM arena_sessions s JOIN arena_users u ON u.id=s.user_id WHERE s.token_hash=?');$q->execute([hash('sha256',$token)]);$u=$q->fetch();
        if($u && (int)$u['active']===1 && (int)$u['expires_at']>time() && hash_equals(hash('sha256',$u['password_hash']),$u['auth_version'])){
            if((int)$u['expires_at']<time()+29*86400){$expires=time()+30*86400;db()->prepare('UPDATE arena_sessions SET expires_at=? WHERE token_hash=?')->execute([$expires,hash('sha256',$token)]);authCookie($token,$expires);}
            return $GLOBALS['arena_user']=$u;
        }
        return null;
    }
    // Upgrade an existing valid owner login without asking for the password again.
    if(!empty($_COOKIE[session_name()])){
        session_start();$valid=($_SESSION['admin_until']??0)>time()&&hash_equals(hash('sha256',adminHash()),(string)($_SESSION['admin_version']??''));
        if($valid){$u=db()->query('SELECT * FROM arena_users WHERE id=1')->fetch();startAuthSession($u);}
        clearLegacySession();return $GLOBALS['arena_user']??null;
    }
    return null;
}
function admin(): bool {return currentUser()!==null;}
function needAdmin(): void {if(!admin())fail('Giriş yapmanız gerekli.',401);}
function needOwner(): void {needAdmin();if(currentUser()['role']!=='owner')fail('Bu işlem yalnızca yöneticiye açık.',403);}
function canManageRoom(array $s): bool {$u=currentUser();return $u && ($u['role']==='owner'||(int)($s['ownerId']??1)===(int)$u['id']);}
function usernameValue(mixed $value): string {
    $name=inputText($value,1,64,'Kullanıcı adı');
    if(!preg_match('/^[\p{L}\p{N}_.-]+$/uD',$name))fail('Kullanıcı adında harf, rakam, nokta, tire ve alt çizgi kullanın.');
    return $name;
}
function usernameKey(string $name): string {return mb_strtolower(str_replace('İ','i',$name));}
function authActions(string $action,array $in): void {
    if($action==='login'){
        rateLimit('login',10);authSchema();$name=(string)($in['username']??'admin');$q=db()->prepare('SELECT * FROM arena_users WHERE username_key=?');$q->execute([usernameKey(trim($name))]);$u=$q->fetch();
        // Always verify a real hash, including when the username is unknown.
        $valid=verifyAdminPassword((string)($in['password']??''),$u?$u['password_hash']:adminHash());
        if(!$u||!$valid||!(int)$u['active'])fail('Kullanıcı adı veya şifre hatalı.',401);
        $old=$_COOKIE['arena_session']??'';db()->prepare('DELETE FROM arena_sessions WHERE token_hash=?')->execute([hash('sha256',$old)]);
        startAuthSession($u);clearLegacySession();echo json_encode(['admin'=>true,'user'=>publicUser($u)],JSON_UNESCAPED_UNICODE);exit;
    }
    if($action==='logout'){
        authSchema();db()->prepare('DELETE FROM arena_sessions WHERE token_hash=?')->execute([hash('sha256',$_COOKIE['arena_session']??'')]);authCookie('',time()-3600);clearLegacySession();echo '{}';exit;
    }
    if($action==='password_change'){
        needAdmin();rateLimit('password_change',10);$u=currentUser();
        if(!verifyAdminPassword((string)($in['currentPassword']??''),$u['password_hash']))fail('Mevcut şifreniz hatalı.',401);
        $pass=$in['newPassword']??'';if(!is_string($pass)||$pass==='')fail('Yeni şifre boş bırakılamaz.');
        $hash=makeAdminHash($pass);$db=db();$db->beginTransaction();$q=$db->prepare('UPDATE arena_users SET password_hash=? WHERE id=? AND password_hash=?');$q->execute([$hash,$u['id'],$u['password_hash']]);
        if($q->rowCount()!==1){$db->rollBack();fail('Şifre değişti. Yeniden giriş yapın.',409);}
        if((int)$u['id']===1)$db->prepare('UPDATE arena_auth SET password_hash=? WHERE id=1')->execute([$hash]);
        $db->prepare('DELETE FROM arena_sessions WHERE user_id=?')->execute([$u['id']]);$db->commit();$u['password_hash']=$hash;startAuthSession($u);echo '{"ok":true}';exit;
    }
    if($action==='users'){needOwner();echo json_encode(array_map('publicUser',db()->query('SELECT * FROM arena_users ORDER BY id')->fetchAll()),JSON_UNESCAPED_UNICODE);exit;}
    if($action==='user_create'){
        needOwner();rateLimit('user_create',30);$name=usernameValue($in['username']??'');$pass=$in['password']??'';
        if(!is_string($pass)||$pass==='')fail('Şifre boş bırakılamaz.');
        try{db()->prepare('INSERT INTO arena_users (username,username_key,password_hash,role,active) VALUES (?,?,?,\'host\',1)')->execute([$name,usernameKey($name),makeAdminHash($pass)]);}catch(PDOException $e){if(in_array((string)$e->getCode(),['23000','23505']))fail('Bu kullanıcı adı zaten kullanılıyor.',409);throw $e;}
        echo '{"ok":true}';exit;
    }
    if($action==='user_update'){
        needOwner();$id=(int)($in['id']??0);$q=db()->prepare('SELECT * FROM arena_users WHERE id=?');$q->execute([$id]);$u=$q->fetch();if(!$u)fail('Kullanıcı bulunamadı.',404);
        $name=usernameValue($in['username']??$u['username']);$active=$in['active']??(bool)$u['active'];if(!is_bool($active))fail('Hesap durumu geçersiz.');
        if($u['role']==='owner'&&!$active)fail('Yönetici hesabı kapatılamaz.');
        $pass=$in['password']??null;if($pass!==null && (!is_string($pass)||$pass===''))fail('Şifre boş bırakılamaz.');
        if($u['role']==='owner'&&$pass!==null)fail('Kendi şifreniz için Şifremi değiştir bölümünü kullanın.');
        $hash=$pass===null?$u['password_hash']:makeAdminHash($pass);$db=db();$db->beginTransaction();
        try{$db->prepare('UPDATE arena_users SET username=?,username_key=?,password_hash=?,active=? WHERE id=?')->execute([$name,usernameKey($name),$hash,(int)$active,$id]);}catch(PDOException $e){$db->rollBack();if(in_array((string)$e->getCode(),['23000','23505']))fail('Bu kullanıcı adı zaten kullanılıyor.',409);throw $e;}
        if(!$active||$pass!==null)$db->prepare('DELETE FROM arena_sessions WHERE user_id=?')->execute([$id]);$db->commit();echo '{"ok":true}';exit;
    }
}
