<?php
declare(strict_types=1);
require_once __DIR__.'/family.php';
function fail(string $message, int $status = 400): never { http_response_code($status); echo json_encode(['error'=>$message], JSON_UNESCAPED_UNICODE); exit; }
function privateDir(): string { return dirname(__DIR__,2).'/bilgi-arena-private'; }
function configured(): bool { return is_file(privateDir().'/config.php') || (PHP_SAPI==='cli-server' && (bool)getenv('ARENA_TEST_DSN')); }
function prepareInstaller(): void {
    if(configured())return;
    $dir=privateDir();if(!is_dir($dir) && !mkdir($dir,0700,true) && !is_dir($dir))fail('Özel ayar klasörü oluşturulamadı.',503);
    $path=$dir.'/setup.key';
    if(!is_file($path)){ $h=@fopen($path,'x');if($h){fwrite($h,bin2hex(random_bytes(32)));fclose($h);chmod($path,0600);} }
}
function config(): array {
    static $cfg;
    if ($cfg !== null) return $cfg;
    $file = privateDir().'/config.php';
    if (is_file($file)) return $cfg = require $file;
    if (getenv('ARENA_TEST_DSN') && PHP_SAPI === 'cli-server') return $cfg = ['dsn'=>getenv('ARENA_TEST_DSN'),'user'=>'','password'=>'','admin_hash'=>getenv('ARENA_TEST_ADMIN_HASH'),'origin'=>'http://127.0.0.1:8091'];
    fail('Sunucu kurulumu henüz tamamlanmadı. Yönetici kurulumu gerekli.',503);
}
function db(): PDO {
    static $db;
    if (!$db) { $c=config(); $db=new PDO($c['dsn'],$c['user'],$c['password'],[PDO::ATTR_ERRMODE=>PDO::ERRMODE_EXCEPTION,PDO::ATTR_DEFAULT_FETCH_MODE=>PDO::FETCH_ASSOC]); }
    return $db;
}
function migrate(PDO $db): void {
    $db->exec('CREATE TABLE IF NOT EXISTS arena_rooms (pin VARCHAR(6) PRIMARY KEY, state '.($db->getAttribute(PDO::ATTR_DRIVER_NAME)==='mysql'?'LONGTEXT':'TEXT').' NOT NULL, created_at BIGINT NOT NULL)');
    $db->exec('CREATE TABLE IF NOT EXISTS arena_questions (id VARCHAR(64) PRIMARY KEY, category VARCHAR(32) NOT NULL, content TEXT NOT NULL)');
    $db->exec('CREATE TABLE IF NOT EXISTS arena_history (id VARCHAR(64) PRIMARY KEY, used_at BIGINT NOT NULL)');
    $db->exec('CREATE TABLE IF NOT EXISTS arena_limits (id VARCHAR(64) PRIMARY KEY, hits INT NOT NULL, expires_at BIGINT NOT NULL)');
}
function makeAdminHash(string $password): string { return 'sha256:'.password_hash(hash('sha256',$password),PASSWORD_DEFAULT); }
function verifyAdminPassword(string $password,string $hash): bool { return str_starts_with($hash,'sha256:')?password_verify(hash('sha256',$password),substr($hash,7)):password_verify($password,$hash); }
function adminHash(): string {
    static $hash;
    if ($hash !== null) return $hash;
    $db=db();
    $db->exec('CREATE TABLE IF NOT EXISTS arena_auth (id INT PRIMARY KEY, password_hash VARCHAR(255) NOT NULL)');
    $sql=$db->getAttribute(PDO::ATTR_DRIVER_NAME)==='mysql'?'INSERT IGNORE INTO arena_auth (id,password_hash) VALUES (1,?)':'INSERT INTO arena_auth (id,password_hash) VALUES (1,?) ON CONFLICT(id) DO NOTHING';
    $db->prepare($sql)->execute([config()['admin_hash']]);
    return $hash=(string)$db->query('SELECT password_hash FROM arena_auth WHERE id=1')->fetchColumn();
}
require_once __DIR__.'/auth.php';
function inputText(mixed $s,int $min,int $max,string $label): string {
    if (!is_string($s)) fail($label.' geçersiz.');
    $s=trim(preg_replace('/\s+/u',' ',$s) ?? '');
    if (mb_strlen($s)<$min || mb_strlen($s)>$max) fail($label." {$min}–{$max} karakter olmalı.");
    return $s;
}
function normalize(string $word): string {
    if (class_exists('Normalizer')) $word=Normalizer::normalize($word,Normalizer::FORM_KC);
    $word=str_replace(['İ','I'],['i','ı'],$word);
    return trim(preg_replace('/[^\p{L}\p{N}\s]/u','',mb_strtolower(preg_replace('/\s+/u',' ',trim($word)))) ?? '');
}
function bank(): array {
    $bank=json_decode(file_get_contents(__DIR__.'/../data/questions.json'),true,512,JSON_THROW_ON_ERROR);
    foreach(db()->query('SELECT content FROM arena_questions') as $row) { $q=json_decode($row['content'],true);$u=currentUser();if((int)($q['ownerId']??1)===1||($u&&($u['role']==='owner'||(int)$q['ownerId']===(int)$u['id'])))$bank[]=$q; }
    return $bank;
}
function rateLimit(string $action,int $limit): void {
    $db=db(); $bucket=intdiv(time(),60);$id=hash('sha256',$action.'|'.($_SERVER['REMOTE_ADDR']??'local').'|'.$bucket);
    $mysql=$db->getAttribute(PDO::ATTR_DRIVER_NAME)==='mysql';
    $sql=$mysql?'INSERT INTO arena_limits (id,hits,expires_at) VALUES (?,1,?) ON DUPLICATE KEY UPDATE hits=hits+1':'INSERT INTO arena_limits (id,hits,expires_at) VALUES (?,1,?) ON CONFLICT(id) DO UPDATE SET hits=hits+1';
    $db->prepare($sql)->execute([$id,time()+120]);$q=$db->prepare('SELECT hits FROM arena_limits WHERE id=?');$q->execute([$id]);
    if((int)$q->fetchColumn()>$limit) fail('Çok fazla deneme. Bir dakika sonra tekrar deneyin.',429);
    if(random_int(1,100)===1) $db->prepare('DELETE FROM arena_limits WHERE expires_at < ?')->execute([time()]);
}
// The server clock drives all screens, even when the host tab is closed or asleep.
function syncQuizClock(array &$s, ?float $now=null): void {
    if(!in_array($s['mode'],['quiz','family'],true))return;
    $now??=microtime(true);
    while(true){
        if($s['phase']==='question'){
            if($now<$s['deadline'])return;
            $s['phase']='reveal';$s['revealUntil']=$s['deadline']+5;
        } elseif($s['phase']==='reveal'){
            $until=$s['revealUntil']??($s['deadline']+5);
            $s['revealUntil']=$until;
            if($now<$until)return;
            if($s['index']===count($s['questions'])-1){$s['phase']='finished';return;}
            $s['phase']='countdown';$s['countdownUntil']=$until+3;
        } elseif($s['phase']==='countdown'){
            if($now<$s['countdownUntil'])return;
            $s['index']++;$s['phase']='question';$s['deadline']=$s['countdownUntil']+$s['seconds'];
            unset($s['revealUntil'],$s['countdownUntil']);
        } else return;
    }
}
function lockRoom(string $pin): array {
    $db=db();$db->beginTransaction();
    $q=$db->prepare('SELECT state FROM arena_rooms WHERE pin=?'.($db->getAttribute(PDO::ATTR_DRIVER_NAME)==='mysql'?' FOR UPDATE':''));$q->execute([$pin]);$raw=$q->fetchColumn();
    if(!$raw){$db->rollBack();fail('Bu kodla açık bir etkinlik bulunamadı.',404);}
    $s=json_decode($raw,true);
    if($s['expiresAt']<time()){ $db->rollBack();fail('Bu etkinliğin süresi doldu.',410); }
    syncQuizClock($s);
    return $s;
}
function saveRoom(array $s): void { db()->prepare('UPDATE arena_rooms SET state=? WHERE pin=?')->execute([json_encode($s,JSON_UNESCAPED_UNICODE),$s['pin']]);db()->commit(); }
// Reveal only the current round. Never return token hashes or private profiles.
function revealedAnswerCards(array $s, ?string $viewerKey): array {
    if($s['phase']!=='reveal' || !isset($s['questions'][$s['index']]))return [];
    $q=$s['questions'][$s['index']];$cards=[];
    foreach($s['players'] as $key=>$player){
        $reference=$s['mode']==='family' && $key===($q['subjectKey']??null);
        $answer=$s['answers'][(string)$s['index']][$key]??null;
        $choice=$reference?$q['correct']:($answer['choice']??null);
        $cards[]=['name'=>$player['name'],'avatar'=>$player['avatar']??'astronaut','role'=>$player['role']??null,'isMe'=>$viewerKey!==null && $key===$viewerKey,'reference'=>$reference,'choice'=>$choice,'correct'=>$choice===null?null:$choice===$q['correct'],'points'=>$reference?0:($answer['points']??0)];
    }
    return $cards;
}
function playerKey(array $s,string $token): string { $key=hash('sha256',$token);if(!isset($s['players'][$key])) fail('Katılımcı oturumu bulunamadı. Yeniden katılın.',401);return $key; }
function snapshot(array $s,?string $token=null,bool $host=false): array {
    syncQuizClock($s);
    if($s['mode']==='family')return familySnapshot($s,$token)+['canManage'=>$host];
    $now=microtime(true);$phase=$s['phase'];
    $visiblePlayers=$s['players'];
    if($s['mode']==='quiz' && $phase==='question') foreach($s['answers'][(string)$s['index']]??[] as $k=>$a) $visiblePlayers[$k]['score']-=$a['points'];
    $out=['canManage'=>$host,'pin'=>$s['pin'],'mode'=>$s['mode'],'title'=>$s['title'],'category'=>$s['category']??null,'phase'=>$phase,'createdAt'=>$s['createdAt'],'serverTime'=>$now,'expiresAt'=>$s['expiresAt'],'playerCount'=>count($s['players']),'players'=>array_values(array_map(fn($p)=>['name'=>$p['name'],'score'=>$p['score'],'avatar'=>$p['avatar']??'astronaut'],$visiblePlayers))];
    usort($out['players'],fn($a,$b)=>$b['score']<=>$a['score']);
    $key=$token?hash('sha256',$token):null;$me=$key?($s['players'][$key]??null):null;
    if($me) $out['me']=['name'=>$me['name'],'score'=>$visiblePlayers[$key]['score'],'avatar'=>$me['avatar']??'astronaut'];
    if($s['mode']==='quiz') {
        $i=$s['index'];$out+=['index'=>$i,'total'=>count($s['questions']),'seconds'=>$s['seconds'],'deadline'=>$s['deadline']??null,'revealUntil'=>$s['revealUntil']??null,'countdownUntil'=>$s['countdownUntil']??null,'answeredCount'=>count($s['answers'][(string)$i]??[])];
        if($i>=0 && $phase!=='countdown' && isset($s['questions'][$i])) { $q=$s['questions'][$i];$out['question']=['id'=>$q['id'],'text'=>$q['text'],'options'=>$q['options']];if(in_array($phase,['reveal','finished'])){$out['question']['correct']=$q['correct'];$out['question']['explanation']=$q['explanation']??'';} }
        if($phase==='reveal')$out['answerCards']=revealedAnswerCards($s,$key);
        if($me){$answer=$s['answers'][(string)$i][$key]??null;$out['myAnswer']=$answer && $phase==='question'?['choice'=>$answer['choice']]:$answer;}
    }
    if($s['mode']==='cloud') {
        $out['prompt']=$s['prompt'];$out['promptVersion']=$s['promptVersion'];$counts=[];
        foreach($s['submissions'] as $words) foreach($words as $word) $counts[$word]=($counts[$word]??0)+1;
        arsort($counts);$out['words']=array_map(fn($w,$n)=>['text'=>$w,'count'=>$n],array_keys($counts),array_values($counts));$out['responseCount']=count($s['submissions']);$out['myWords']=$key?($s['submissions'][$key]??[]):[];
    }
    if($s['mode']==='raffle') {
        $draw=$s['draw']??null;$out['entryCount']=count($s['entries']);$out['remainingCount']=count(array_filter($s['entries'],fn($e)=>!in_array($e['id'],$s['winnerIds'],true)));
        $out['draw']=$draw?['id'=>$draw['id'],'startedAt'=>$draw['startedAt'],'revealAt'=>$draw['revealAt'],'settleAt'=>$draw['settleAt']??$draw['revealAt'],'winner'=>$now >= $draw['revealAt']?$draw['winner']:null]:null;
        $out['wheelEntries']=$draw['wheelEntries']??array_values(array_filter($s['entries'],fn($e)=>!in_array($e['id'],$s['winnerIds'],true)||$e['id']===($draw['winner']['id']??'')));
        $out['winners']=array_values(array_filter($s['winners'],fn($w)=>$now >= ($w['settleAt']??$w['revealAt'])));
        if($host) $out['entries']=$s['entries'];
    }
    return $out;
}
