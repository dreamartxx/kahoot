<?php
declare(strict_types=1);
header('Content-Type: application/json; charset=utf-8');header('Cache-Control: no-store');header('X-Content-Type-Options: nosniff');
require __DIR__.'/core.php';
$action=$_GET['action']??'status';$method=$_SERVER['REQUEST_METHOD'];
try {
    if($action==='status') {prepareInstaller();echo json_encode(['configured'=>configured(),'admin'=>admin(),'user'=>currentUser()?publicUser(currentUser()):null]);exit;}
    if($method==='POST') {
        if(!str_contains($_SERVER['CONTENT_TYPE']??'','application/json')) fail('JSON gerekli.',415);
        $origin=$_SERVER['HTTP_ORIGIN']??'';
        // Exact deployment addresses keep domain migrations compatible with the private setup config.
        $allowedOrigins=[config()['origin'],'https://khaki-panther-692104.hostingersite.com','https://ailecekeglen.com.tr'];
        if($origin && !in_array($origin,$allowedOrigins,true)) fail('Geçersiz kaynak.',403);
        if((int)($_SERVER['CONTENT_LENGTH']??0)>1048576) fail('İstek çok büyük.',413);
        $raw=file_get_contents('php://input');if(strlen($raw)>1048576) fail('İstek çok büyük.',413);
        $in=json_decode($raw,true,64,JSON_THROW_ON_ERROR);if(!is_array($in)) fail('Geçersiz istek.');
    } else $in=$_GET;
    $writes=['login','logout','password_change','user_create','user_update','create','join','answer','advance','words','prompt','entries','draw','close','question_save','question_delete','family_profile','family_start','family_answer','family_advance'];
    if(in_array($action,$writes,true) && $method!=='POST') fail('POST gerekli.',405);
    authActions($action,$in);
    if($action==='categories') { $counts=[];foreach(bank() as $q)$counts[$q['category']]=($counts[$q['category']]??0)+1;echo json_encode($counts);exit; }
    if($action==='questions'){needOwner();$qs=bank();$cat=$in['category']??'';echo json_encode(array_values(array_filter($qs,fn($q)=>!$cat || $q['category']===$cat)),JSON_UNESCAPED_UNICODE);exit;}
    if($action==='question_save'){
        needOwner();$q=['ownerId'=>(int)currentUser()['id'],'id'=>'custom-'.bin2hex(random_bytes(12)),'category'=>inputText($in['category']??'',2,32,'Kategori'),'text'=>inputText($in['text']??'',5,500,'Soru'),'options'=>[],'correct'=>(int)($in['correct']??-1),'explanation'=>inputText($in['explanation']??'',0,600,'Açıklama')];
        if(!in_array($q['category'],['cografya','dinozor','hayvanlar','turkiye','ulkeler','gezegenler','futbol','kaleciler','arabalar','genel-kultur','meshur','plakalar','bayraklar','enler','turkiye-tarihi','osmanli-tarihi','islam-tarihi','peygamberler-tarihi'],true)) fail('Kategori geçersiz.');
        if(!is_array($in['options']??null)||count($in['options'])!==4||$q['correct']<0||$q['correct']>3)fail('Dört seçenek ve bir doğru cevap gerekli.');
        foreach($in['options'] as $opt)$q['options'][]=inputText($opt,1,180,'Seçenek');
        if(count(array_unique(array_map('normalize',$q['options'])))!==4)fail('Seçenekler farklı olmalı.');
        db()->prepare('INSERT INTO arena_questions (id,category,content) VALUES (?,?,?)')->execute([$q['id'],$q['category'],json_encode($q,JSON_UNESCAPED_UNICODE)]);echo json_encode($q,JSON_UNESCAPED_UNICODE);exit;
    }
    if($action==='question_delete'){needOwner();$lookup=db()->prepare('SELECT content FROM arena_questions WHERE id=?');$lookup->execute([$in['id']??'']);$raw=$lookup->fetchColumn();if($raw&&!canManageRoom(json_decode($raw,true)))fail('Bu soruyu yönetme yetkiniz yok.',403);db()->prepare('DELETE FROM arena_questions WHERE id=?')->execute([$in['id']??'']);echo '{}';exit;}
    if($action==='rooms'){needAdmin();$q=db()->query('SELECT state FROM arena_rooms ORDER BY created_at DESC');$out=[];foreach($q as $row){$s=json_decode($row['state'],true);if($s['expiresAt']>time()&&canManageRoom($s))$out[]=snapshot($s,null,true);if(count($out)>=50)break;}echo json_encode($out,JSON_UNESCAPED_UNICODE);exit;}
    if($action==='create'){
        needAdmin();$mode=$in['mode']??'';if(!in_array($mode,['quiz','cloud','raffle','family']))fail('Modül geçersiz.');
        $s=['ownerId'=>(int)currentUser()['id'],'pin'=>(string)random_int(100000,999999),'mode'=>$mode,'title'=>inputText($in['title']??'',2,100,'Başlık'),'phase'=>'lobby','players'=>[],'createdAt'=>time(),'expiresAt'=>time()+604800];
        if($mode==='quiz'){
            $s['category']=$in['category']??'cografya';$pool=array_values(array_filter(bank(),fn($q)=>$q['category']===$s['category']));
            $selected=$in['questionIds']??[];
            if($selected)needOwner();
            if($selected){if(!is_array($selected)||count(array_unique($selected))!==10)fail('Tam 10 farklı soru seçin.');$pool=array_values(array_filter($pool,fn($q)=>in_array($q['id'],$selected,true)));}
            if(count($pool)<10)fail('Bu konu için en az 10 geçerli soru gerekli.');
            $history=[];foreach(db()->query('SELECT id,used_at FROM arena_history') as $row)$history[$row['id']]=(int)$row['used_at'];
            shuffle($pool);usort($pool,fn($a,$b)=>($history[$a['id']]??0)<=>($history[$b['id']]??0));$s['questions']=array_slice($pool,0,10);
            foreach($s['questions'] as &$question){$correct=$question['options'][$question['correct']];shuffle($question['options']);$question['correct']=array_search($correct,$question['options'],true);}unset($question);
            $s['seconds']=max(10,min(90,(int)($in['seconds']??20)));$s['index']=-1;$s['answers']=[];
        }
        if($mode==='family'){$customFamily=customFamilyPrompts($in['familyQuestions']??[]);$s['profiles']=[];$s['questions']=[];$s['answers']=[];$s['index']=-1;$s['seconds']=max(15,min(90,(int)($in['seconds']??45)));}
        if($mode==='cloud'){$s['prompt']=inputText($in['prompt']??'Bugünü tek kelimeyle anlat!',3,200,'Soru');$s['promptVersion']=1;$s['submissions']=[];$s['phase']='open';}
        if($mode==='raffle'){$s['entries']=[];$s['winnerIds']=[];$s['winners']=[];$s['draw']=null;$s['phase']='open';}
        $db=db();$db->beginTransaction();
        if($mode==='family'){$s['familyPrompts']=array_merge($customFamily,selectFamilyPrompts($db,10-count($customFamily),array_map(fn($p)=>normalize($p['self']),$customFamily)));shuffle($s['familyPrompts']);}
        for($attempt=0;$attempt<5;$attempt++){try{$db->prepare('INSERT INTO arena_rooms (pin,state,created_at) VALUES (?,?,?)')->execute([$s['pin'],json_encode($s,JSON_UNESCAPED_UNICODE),time()]);break;}catch(PDOException $e){if(!in_array((string)$e->getCode(),['23000','23505']))throw $e;$s['pin']=(string)random_int(100000,999999);if($attempt===4)throw $e;}}
        foreach($s['questions']??[] as $q){$sql=$db->getAttribute(PDO::ATTR_DRIVER_NAME)==='mysql'?'INSERT INTO arena_history (id,used_at) VALUES (?,?) ON DUPLICATE KEY UPDATE used_at=VALUES(used_at)':'INSERT INTO arena_history (id,used_at) VALUES (?,?) ON CONFLICT(id) DO UPDATE SET used_at=excluded.used_at';$db->prepare($sql)->execute([$q['id'],time()]);}
        $db->commit();echo json_encode(snapshot($s,null,true),JSON_UNESCAPED_UNICODE);exit;
    }
    if($action==='room'){
        $q=db()->prepare('SELECT state FROM arena_rooms WHERE pin=?');$q->execute([$in['pin']??'']);$raw=$q->fetchColumn();if(!$raw)fail('Etkinlik bulunamadı.',404);$s=json_decode($raw,true);if($s['expiresAt']<time())fail('Etkinlik süresi doldu.',410);
        echo json_encode(snapshot($s,$_SERVER['HTTP_X_PLAYER_TOKEN']??null,canManageRoom($s)),JSON_UNESCAPED_UNICODE);exit;
    }
    if(!in_array($action,$writes,true))fail('İşlem bulunamadı.',404);
    if(in_array($action,['advance','prompt','entries','draw','close','family_start','family_advance']))needAdmin();
    if(in_array($action,['join','words','answer','family_profile','family_answer']))rateLimit($action,$action==='join'?100:500);
    currentUser(); // Resolve lazy auth migration before opening the room transaction.
    $s=lockRoom(inputText($in['pin']??'',6,6,'Etkinlik kodu'));
    if(in_array($action,['advance','prompt','entries','draw','close','family_start','family_advance'],true)&&!canManageRoom($s)){db()->rollBack();fail('Bu etkinliği yönetme yetkiniz yok.',403);}
    if(in_array($s['phase'],['closed','finished']) && $action!=='close')fail('Etkinlik sona erdi.',409);
    $token=$_SERVER['HTTP_X_PLAYER_TOKEN']??'';
    if(str_starts_with($action,'family_')){
        if($s['mode']!=='family')fail('Aile oyunu gerekli.');
        familyAction($s,$action,$in,$token);saveRoom($s);echo json_encode(snapshot($s,$token,canManageRoom($s)),JSON_UNESCAPED_UNICODE);exit;
    }
    if($action==='join'){
        $name=inputText($in['name']??'',2,32,'İsim');if(count($s['players'])>=300)fail('Etkinlik 300 kişilik kapasiteye ulaştı.',409);
        foreach($s['players'] as $p)if(normalize($p['name'])===normalize($name))fail('Bu isim kullanılıyor. İsminize bir ek yapın.',409);
        if(in_array($s['mode'],['quiz','family'],true) && $s['phase']!=='lobby')fail('Yarışma başladı. Bir sonraki turda katılabilirsiniz.',409);
        $avatar=$in['avatar']??'astronaut';
        if(!is_string($avatar)||!in_array($avatar,['astronaut','robot','alien','wizard','dragon','unicorn','knight','ninja','fox','panda','cat','dinosaur','penguin','footballer','goalkeeper','racer','chef','scientist','pirate','diver'],true))fail('Geçerli bir karakter seçin.');
        $token=bin2hex(random_bytes(24));$key=hash('sha256',$token);$s['players'][$key]=['name'=>$name,'score'=>0,'avatar'=>$avatar];
        if($s['mode']==='family'){$s['players'][$key]['role']=inputText($in['role']??'',1,24,'Ailedeki rolün');$s['players'][$key]['id']=bin2hex(random_bytes(8));}
        if($s['mode']==='raffle'){
            $existing=array_filter($s['entries'],fn($e)=>normalize($e['name'])===normalize($name));
            if(!$existing){if(count($s['entries'])>=2000)fail('Katılımcı kapasitesi doldu.',409);$s['entries'][]=['id'=>bin2hex(random_bytes(8)),'name'=>$name];}
        }
        saveRoom($s);echo json_encode(['token'=>$token,'room'=>snapshot($s,$token)],JSON_UNESCAPED_UNICODE);exit;
    }
    if($action==='answer'){
        $key=playerKey($s,$token);if($s['mode']!=='quiz'||$s['phase']!=='question')fail('Bu sorunun yanıt süresi bitti.',409);
        $i=(string)$s['index'];$q=$s['questions'][$s['index']];if(($in['questionId']??'')!==$q['id'])fail('Yeni soruya geçildi.',409);
        if(isset($s['answers'][$i][$key]))fail('Yanıtınız zaten alındı.',409);
        $choice=$in['choice']??null;if(!is_int($choice)||$choice<0||$choice>3)fail('Seçenek geçersiz.');
        $correct=$choice===$q['correct'];$points=$correct?(int)round(500+500*max(0,($s['deadline']-microtime(true))/$s['seconds'])):0;
        $s['answers'][$i][$key]=['choice'=>$choice,'points'=>$points];$s['players'][$key]['score']+=$points;
    }
    if($action==='advance'){
        if($s['mode']!=='quiz')fail('Yarışma gerekli.');
        if($s['phase']==='countdown')fail('Yeni soru hazırlanıyor.',409);
        if(($in['expectedIndex']??null)!==$s['index']||($in['expectedPhase']??null)!==$s['phase'])fail('Ekran güncellendi; tekrar deneyin.',409);
        if($s['phase']==='question'){$s['phase']='reveal';$s['revealUntil']=microtime(true)+5;}
        elseif($s['index']===9)$s['phase']='finished';
        else{$s['index']++;$s['phase']='question';$s['deadline']=microtime(true)+$s['seconds'];unset($s['revealUntil'],$s['countdownUntil']);}
    }
    if($action==='words'){
        $key=playerKey($s,$token);if($s['mode']!=='cloud'||$s['phase']!=='open')fail('Kelime bulutu açık değil.',409);
        if(($in['promptVersion']??null)!==$s['promptVersion'])fail('Soru değişti. Yeni soruyu yanıtlayın.',409);
        if(!is_array($in['words']??null)||count($in['words'])<1||count($in['words'])>3)fail('1–3 kelime yazın.');
        $words=array_map(fn($w)=>normalize(inputText($w,1,30,'Kelime')),$in['words']);foreach($words as $w)if(!$w)fail('Geçerli bir kelime yazın.');
        $s['submissions'][$key]=array_values(array_unique($words));
    }
    if($action==='prompt'){
        if($s['mode']!=='cloud')fail('Kelime bulutu gerekli.');$s['prompt']=inputText($in['prompt']??'',3,200,'Soru');$s['promptVersion']++;$s['submissions']=[];
    }
    if($action==='entries'){
        if($s['mode']!=='raffle')fail('Çekiliş gerekli.');if(($s['draw']['settleAt']??$s['draw']['revealAt']??0)>microtime(true))fail('Çekiliş sürüyor.',409);
        $names=$in['names']??[];if(!is_array($names)||count($names)>2000)fail('En fazla 2.000 isim yüklenebilir.');
        $seen=array_map(fn($e)=>normalize($e['name']),$s['entries']);foreach($names as $name){$name=inputText($name,1,80,'İsim');$norm=normalize($name);if(!in_array($norm,$seen,true)){$s['entries'][]=['id'=>bin2hex(random_bytes(8)),'name'=>$name];$seen[]=$norm;}}
        if(count($s['entries'])>2000)fail('En fazla 2.000 katılımcı olabilir.');
    }
    if($action==='draw'){
        if($s['mode']!=='raffle')fail('Çekiliş gerekli.');$now=microtime(true);if(($s['draw']['settleAt']??$s['draw']['revealAt']??0)>$now)fail('Çekiliş sürüyor.',409);
        $pool=array_values(array_filter($s['entries'],fn($e)=>!in_array($e['id'],$s['winnerIds'],true)));if(!$pool)fail('Çekilecek katılımcı kalmadı.',409);
        $winner=$pool[random_int(0,count($pool)-1)];$s['draw']=['id'=>bin2hex(random_bytes(8)),'startedAt'=>$now,'revealAt'=>$now+11,'settleAt'=>$now+17,'winner'=>$winner];$s['winnerIds'][]=$winner['id'];$s['winners'][]=$s['draw'];$s['draw']['wheelEntries']=$pool;
    }
    if($action==='close')$s['phase']='closed';
    saveRoom($s);echo json_encode(snapshot($s,$token,canManageRoom($s)),JSON_UNESCAPED_UNICODE);
} catch(JsonException $e){if(isset($db)&&$db->inTransaction())$db->rollBack();fail('Geçersiz JSON.',400);}
catch(Throwable $e){if(isset($db)&&$db->inTransaction())$db->rollBack();error_log('Arena: '.$e->getMessage());fail('Sunucu işlemi tamamlayamadı. Lütfen tekrar deneyin.',500);}
