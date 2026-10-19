<?php
declare(strict_types=1);
// Durable, revocable browser sessions. Only a digest of the cookie is stored.
function authSchema(): void {
    ensureSchema('auth',2,static function():void{
    $db=db();$mysql=$db->getAttribute(PDO::ATTR_DRIVER_NAME)==='mysql';
    $db->exec('CREATE TABLE IF NOT EXISTS arena_users (id '.($mysql?'INT AUTO_INCREMENT PRIMARY KEY':'INTEGER PRIMARY KEY AUTOINCREMENT').', username VARCHAR(64) NOT NULL, username_key VARCHAR(64) NOT NULL UNIQUE, password_hash VARCHAR(255) NOT NULL, role VARCHAR(16) NOT NULL, active INT NOT NULL DEFAULT 1)');
    $db->exec('CREATE TABLE IF NOT EXISTS arena_profiles (user_id INT PRIMARY KEY, avatar VARCHAR(32) NOT NULL, setup_complete INT NOT NULL DEFAULT 0)');
    $db->exec('CREATE TABLE IF NOT EXISTS arena_sessions (token_hash VARCHAR(64) PRIMARY KEY, user_id INT NOT NULL, auth_version VARCHAR(64) NOT NULL, expires_at BIGINT NOT NULL)');
    $db->exec('CREATE TABLE IF NOT EXISTS arena_active_sessions (user_id INT PRIMARY KEY, token_hash VARCHAR(64) NOT NULL)');
    $db->exec('CREATE TABLE IF NOT EXISTS arena_previews (token_hash VARCHAR(64) PRIMARY KEY, target_id INT NOT NULL, started_at BIGINT NOT NULL)');
    $sql=$mysql?'INSERT IGNORE INTO arena_users (id,username,username_key,password_hash,role,active) VALUES (1,?,?,?,\'owner\',1)':'INSERT INTO arena_users (id,username,username_key,password_hash,role,active) VALUES (1,?,?,?,\'owner\',1) ON CONFLICT DO NOTHING';
    $db->prepare($sql)->execute(['admin','admin',adminHash()]);
    });
}
function accountProfile(int $id): ?array {
    $q=db()->prepare('SELECT avatar,setup_complete FROM arena_profiles WHERE user_id=?');$q->execute([$id]);return $q->fetch()?:null;
}
function profileAvatar(mixed $value): string {
    if(!is_string($value)||!in_array($value,['astronaut','robot','alien','wizard','dragon','unicorn','knight','ninja','fox','panda','cat','dinosaur','penguin','footballer','goalkeeper','racer','chef','scientist','pirate','diver'],true))fail('Geçerli bir karakter seçin.');
    return $value;
}
function publicUser(array $u): array {
    $google=function_exists('googleAccount')&&googleAccount((int)$u['id']);$profile=accountProfile((int)$u['id']);
    return ['id'=>(int)$u['id'],'username'=>$u['username'],'role'=>$u['role'],'active'=>(bool)$u['active'],'authProvider'=>$google?'google':'local','avatar'=>$profile['avatar']??null,'needsProfileSetup'=>$google&&!(bool)($profile['setup_complete']??false)];
}
function authCookie(string $token,int $expires): void {
    if(function_exists('mobileClient') && mobileClient()) {
        header('X-Arena-Session: '.($token===''?'cleared':$token));
        $_COOKIE['arena_session']=$token;
        return;
    }
    setcookie('arena_session',$token,['expires'=>$expires,'path'=>'/','secure'=>(!empty($_SERVER['HTTPS'])&&$_SERVER['HTTPS']!=='off'),'httponly'=>true,'samesite'=>'Strict']);
    $_COOKIE['arena_session']=$token;
}
function clearLegacySession(): void {
    if(empty($_COOKIE[session_name()]))return;
    if(session_status()!==PHP_SESSION_ACTIVE)session_start();
    $_SESSION=[];session_destroy();setcookie(session_name(),'',['expires'=>time()-3600,'path'=>'/','httponly'=>true,'samesite'=>'Strict']);unset($_COOKIE[session_name()]);
}
function startAuthSession(array $u): void {
    $db=db();$db->beginTransaction();
    // Serialize logins for one account, including concurrent requests on MySQL.
    $q=$db->prepare('SELECT * FROM arena_users WHERE id=?'.($db->getAttribute(PDO::ATTR_DRIVER_NAME)==='mysql'?' FOR UPDATE':''));$q->execute([$u['id']]);$fresh=$q->fetch();
    if(!$fresh || !(int)$fresh['active'] || !hash_equals($fresh['password_hash'],$u['password_hash'])){$db->rollBack();fail('Hesap değişti. Yeniden giriş yapın.',401);}
    $u=$fresh;$token=bin2hex(random_bytes(32));$digest=hash('sha256',$token);$expires=time()+30*86400;
    if($u['role']!=='owner'){
        $db->prepare('DELETE FROM arena_sessions WHERE user_id=?')->execute([$u['id']]);
        $db->prepare('DELETE FROM arena_active_sessions WHERE user_id=?')->execute([$u['id']]);
        $db->prepare('INSERT INTO arena_active_sessions (user_id,token_hash) VALUES (?,?)')->execute([$u['id'],$digest]);
    }
    $db->prepare('INSERT INTO arena_sessions (token_hash,user_id,auth_version,expires_at) VALUES (?,?,?,?)')->execute([$digest,$u['id'],hash('sha256',$u['password_hash']),$expires]);
    $db->commit();authCookie($token,$expires);$GLOBALS['arena_user']=$u;$GLOBALS['arena_user_loaded']=true;
    $db->prepare('DELETE FROM arena_sessions WHERE expires_at < ?')->execute([time()]);
    $db->exec('DELETE FROM arena_previews WHERE token_hash NOT IN (SELECT token_hash FROM arena_sessions)');
}
function singleSessionValid(array $u,string $digest): bool {
    if($u['role']==='owner')return true;
    $db=db();$sql=$db->getAttribute(PDO::ATTR_DRIVER_NAME)==='mysql'?'INSERT IGNORE INTO arena_active_sessions (user_id,token_hash) VALUES (?,?)':'INSERT INTO arena_active_sessions (user_id,token_hash) VALUES (?,?) ON CONFLICT(user_id) DO NOTHING';
    // Upgrade old sessions atomically: only the first existing device remains valid.
    $db->prepare($sql)->execute([$u['id'],$digest]);$q=$db->prepare('SELECT token_hash FROM arena_active_sessions WHERE user_id=?');$q->execute([$u['id']]);
    return hash_equals((string)$q->fetchColumn(),$digest);
}
function sessionUser(): ?array {
    if($GLOBALS['arena_user_loaded']??false)return $GLOBALS['arena_user']??null;
    $GLOBALS['arena_user_loaded']=true;
    if(!configured())return null;
    $token=$_COOKIE['arena_session']??'';
    if($token===''&&empty($_COOKIE[session_name()]))return null;
    authSchema();
    if(preg_match('/^[a-f0-9]{64}$/D',$token)){
        $q=db()->prepare('SELECT u.*,s.auth_version,s.expires_at FROM arena_sessions s JOIN arena_users u ON u.id=s.user_id WHERE s.token_hash=?');$q->execute([hash('sha256',$token)]);$u=$q->fetch();
        if($u && (int)$u['active']===1 && (int)$u['expires_at']>time() && hash_equals(hash('sha256',$u['password_hash']),$u['auth_version']) && singleSessionValid($u,hash('sha256',$token))){
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
function currentUser(): ?array {
    $actor=sessionUser();if(!$actor || $actor['role']!=='owner')return $actor;
    if(array_key_exists('arena_preview_user',$GLOBALS))return $GLOBALS['arena_preview_user']??$actor;
    $q=db()->prepare('SELECT u.* FROM arena_previews p JOIN arena_users u ON u.id=p.target_id WHERE p.token_hash=? AND u.active=1 AND u.role<>\'owner\'');$q->execute([hash('sha256',$_COOKIE['arena_session']??'')]);
    $target=$q->fetch();$GLOBALS['arena_preview_user']=$target?:null;
    return $target?:$actor;
}
function isPreview(): bool { $actor=sessionUser();$user=currentUser();return $actor && $user && (int)$actor['id']!==(int)$user['id']; }
function authStatus(): array { $u=currentUser();return ['admin'=>$u!==null,'user'=>$u?publicUser($u):null,'preview'=>isPreview()?['adminUsername'=>sessionUser()['username'],'username'=>$u['username']]:null]; }
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
    if($action==='preview_start'){
        needOwner();$q=db()->prepare('SELECT * FROM arena_users WHERE id=?');$q->execute([(int)($in['userId']??0)]);$target=$q->fetch();
        if(!$target || !(int)$target['active'] || $target['role']==='owner')fail('Aktif bir kullanıcı seçin.');
        $digest=hash('sha256',$_COOKIE['arena_session']??'');
        db()->prepare('DELETE FROM arena_previews WHERE token_hash=?')->execute([$digest]);
        db()->prepare('INSERT INTO arena_previews (token_hash,target_id,started_at) VALUES (?,?,?)')->execute([$digest,$target['id'],time()]);
        unset($GLOBALS['arena_preview_user']);echo json_encode(authStatus(),JSON_UNESCAPED_UNICODE);exit;
    }
    if($action==='preview_stop'){
        $actor=sessionUser();if(!$actor||$actor['role']!=='owner')fail('Bu işlem yalnızca yöneticiye açık.',403);
        db()->prepare('DELETE FROM arena_previews WHERE token_hash=?')->execute([hash('sha256',$_COOKIE['arena_session']??'')]);
        unset($GLOBALS['arena_preview_user']);echo json_encode(authStatus(),JSON_UNESCAPED_UNICODE);exit;
    }
    if(in_array($action,['password_change','profile_update'],true)&&isPreview())fail('Test görünümünde hesap bilgileri değiştirilemez. Yöneticiye dönün.',403);
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
        needAdmin();rateLimit('password_change',10);$u=currentUser();if(function_exists('googleAccount')&&googleAccount((int)$u['id']))fail('Bu hesaba Google ile giriş yapılıyor. Şifreni Google hesabından yönetebilirsin.',409);
        if(!verifyAdminPassword((string)($in['currentPassword']??''),$u['password_hash']))fail('Mevcut şifreniz hatalı.',401);
        $pass=$in['newPassword']??'';if(!is_string($pass)||$pass==='')fail('Yeni şifre boş bırakılamaz.');
        $hash=makeAdminHash($pass);$db=db();$db->beginTransaction();$q=$db->prepare('UPDATE arena_users SET password_hash=? WHERE id=? AND password_hash=?');$q->execute([$hash,$u['id'],$u['password_hash']]);
        if($q->rowCount()!==1){$db->rollBack();fail('Şifre değişti. Yeniden giriş yapın.',409);}
        if((int)$u['id']===1)$db->prepare('UPDATE arena_auth SET password_hash=? WHERE id=1')->execute([$hash]);
        $db->prepare('DELETE FROM arena_sessions WHERE user_id=?')->execute([$u['id']]);$db->commit();$u['password_hash']=$hash;startAuthSession($u);echo '{"ok":true}';exit;
    }
    if($action==='profile_update'){
        needAdmin();rateLimit('profile_update',30);$u=currentUser();
        foreach(array_keys($in) as $key)if(!in_array($key,['username','avatar'],true))fail('Yalnızca kendi kullanıcı adınızı ve karakterinizi güncelleyebilirsiniz.');
        $name=usernameValue($in['username']??$u['username']);
        $db=db();$db->beginTransaction();
        try{
            // Lock the account before updating its name and avatar together.
            $q=$db->prepare('SELECT id FROM arena_users WHERE id=?'.($db->getAttribute(PDO::ATTR_DRIVER_NAME)==='mysql'?' FOR UPDATE':''));$q->execute([$u['id']]);
            $existing=accountProfile((int)$u['id']);
            $avatar=profileAvatar(array_key_exists('avatar',$in)?$in['avatar']:($existing['avatar']??'astronaut'));
            $db->prepare('UPDATE arena_users SET username=?,username_key=? WHERE id=?')->execute([$name,usernameKey($name),$u['id']]);
            $db->prepare('DELETE FROM arena_profiles WHERE user_id=?')->execute([$u['id']]);
            $db->prepare('INSERT INTO arena_profiles (user_id,avatar,setup_complete) VALUES (?,?,1)')->execute([$u['id'],$avatar]);
            $db->commit();
        }catch(PDOException $e){if($db->inTransaction())$db->rollBack();if(in_array((string)$e->getCode(),['23000','23505']))fail('Bu kullanıcı adı zaten kullanılıyor.',409);throw $e;}
        $u['username']=$name;echo json_encode(['user'=>publicUser($u)],JSON_UNESCAPED_UNICODE);exit;
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
