<?php
declare(strict_types=1);

function familyPrompts(): array {
    static $pool=null;
    return $pool??=json_decode(file_get_contents(__DIR__.'/../data/family-prompts.json'),true,512,JSON_THROW_ON_ERROR);
}
function familyRoomPrompts(array $s): array {
    if(isset($s['familyPrompts']))return $s['familyPrompts'];
    // Keep already-created rooms compatible with their original ten answers.
    $legacy=['food','color','dessert','fruit','drink','animal','hobby','season','city','screen'];
    $pool=array_column(familyPrompts(),null,'id');
    return array_map(fn($id)=>$pool[$id],$legacy);
}
function customFamilyPrompts(mixed $input): array {
    if(!is_array($input)||!array_is_list($input)||count($input)>10)fail('En fazla 10 özel aile sorusu ekleyebilirsin.');
    $out=[];$seen=[];
    foreach($input as $row){
        if(!is_array($row))fail('Özel aile sorusu geçersiz.');
        $text=inputText($row['text']??'',5,200,'Özel soru');$norm=normalize($text);
        if($norm===''||isset($seen[$norm]))fail('Özel sorular anlamlı ve birbirinden farklı olmalı.');$seen[$norm]=true;
        $examples=$row['examples']??null;
        if(!is_array($examples)||!array_is_list($examples)||count($examples)!==3)fail('Her özel soru için üç farklı örnek şık yaz.');
        $clean=[];foreach($examples as $value){$value=inputText($value,1,80,'Örnek şık');if(normalize($value)==='')fail('Örnek şıklarda harf veya rakam kullan.');$clean[]=$value;}
        if(count(array_unique(array_map('normalize',$clean)))!==3)fail('Örnek şıklar birbirinden farklı olmalı.');
        $out[]=['id'=>'custom-family-'.bin2hex(random_bytes(8)),'self'=>$text,'ask'=>'«'.$text.'» sorusuna kendisi için verdiği cevap hangisi?','examples'=>$clean];
    }
    return $out;
}
function selectFamilyPrompts(PDO $db, int $count=10, array $excluded=[]): array {
    if($count===0)return [];
    // Serialize selection and use a monotonic round number, including games
    // created in the same second. The shared history survives room expiry.
    $mysql=$db->getAttribute(PDO::ATTR_DRIVER_NAME)==='mysql';
    $clockId='family-pool:clock';
    $sql=$mysql?'INSERT INTO arena_history (id,used_at) VALUES (?,?) ON DUPLICATE KEY UPDATE used_at=GREATEST(used_at+1,VALUES(used_at))':'INSERT INTO arena_history (id,used_at) VALUES (?,?) ON CONFLICT(id) DO UPDATE SET used_at=MAX(used_at+1,excluded.used_at)';
    $db->prepare($sql)->execute([$clockId,time()]);
    $clock=$db->prepare('SELECT used_at FROM arena_history WHERE id=?');$clock->execute([$clockId]);$round=(int)$clock->fetchColumn();
    $history=[];foreach($db->query("SELECT id,used_at FROM arena_history WHERE id LIKE 'family-prompt:%'") as $row)$history[$row['id']]=(int)$row['used_at'];
    $groups=[];foreach(familyPrompts() as $prompt){if(in_array(normalize($prompt['self']),$excluded,true))continue;$groups[$prompt['group']][]=$prompt;}
    $selected=[];
    foreach($groups as $pool){shuffle($pool);usort($pool,fn($a,$b)=>($history['family-prompt:'.$a['id']]??0)<=>($history['family-prompt:'.$b['id']]??0));array_push($selected,...array_slice($pool,0,2));}
    shuffle($selected);$selected=array_slice($selected,0,$count);
    $sql=$mysql?'INSERT INTO arena_history (id,used_at) VALUES (?,?) ON DUPLICATE KEY UPDATE used_at=VALUES(used_at)':'INSERT INTO arena_history (id,used_at) VALUES (?,?) ON CONFLICT(id) DO UPDATE SET used_at=excluded.used_at';
    $record=$db->prepare($sql);foreach($selected as $p)$record->execute(['family-prompt:'.$p['id'],$round]);
    return $selected;
}
function familyLabel(array $p): string { return $p['name'].' ('.$p['role'].')'; }
function familyAction(array &$s,string $action,array $in,string $token): void {
    if($action==='family_profile') {
        $key=playerKey($s,$token);
        if($s['phase']!=='lobby')fail('Yarışma başladı; kişisel cevaplar artık değiştirilemez.',409);
        $answers=$in['answers']??null;
        if(!is_array($answers)||count($answers)!==10)fail('Kendinle ilgili 10 sorunun tamamını cevapla.');
        $clean=[];
        foreach(familyRoomPrompts($s) as $prompt){$value=inputText($answers[$prompt['id']]??'',1,80,'Cevap');if(normalize($value)==='')fail('Cevaplarda harf veya rakam kullan.');$clean[$prompt['id']]=$value;}
        $s['profiles'][$key]=$clean;
        return;
    }
    if($action==='family_start') {
        if($s['phase']!=='lobby')fail('Aile oyunu zaten başladı.',409);
        if(count($s['players'])<2)fail('En az iki aile üyesi katılmalı.',409);
        foreach($s['players'] as $key=>$p)if(!isset($s['profiles'][$key]))fail('Herkes 10 cevabını tamamladıktan sonra başlayabilirsiniz.',409);
        $deck=[];
        foreach($s['players'] as $key=>$p)foreach(familyRoomPrompts($s) as $prompt){
            $correct=$s['profiles'][$key][$prompt['id']];$seen=[normalize($correct)=>true];$candidates=[];
            // No participant's private answer may be reused as somebody else's distractor,
            // even if it happens to match one of the curated alternatives.
            foreach($s['profiles'] as $profile)foreach($profile as $answer)$seen[normalize($answer)]=true;
            $fallback=$prompt['examples'];shuffle($fallback);
            $neutral=['Özel bir tercihi yok','Hepsini eşit seviyor','Tercihi sık değişiyor','Seçim yapamıyor','Hiçbirini sevmiyor','Yeni şeyler denemeyi seviyor'];
            foreach(array_merge($fallback,$neutral) as $value){$norm=normalize($value);if(isset($seen[$norm]))continue;$seen[$norm]=true;$candidates[]=$value;if(count($candidates)===3)break;}
            // Preserve four distinct choices even if a very large family exhausts the pool.
            for($i=1;count($candidates)<3;$i++){$value='Başka bir seçenek '.$i;$norm=normalize($value);if(isset($seen[$norm]))continue;$seen[$norm]=true;$candidates[]=$value;}
            $options=array_merge([$correct],$candidates);shuffle($options);
            $deck[]=['id'=>'family-'.bin2hex(random_bytes(8)),'subjectKey'=>$key,'promptId'=>$prompt['id'],'text'=>familyLabel($p).': '.$prompt['ask'],'options'=>$options,'correct'=>array_search($correct,$options,true)];
        }
        shuffle($deck);$s['questions']=$deck;$s['index']=0;$s['phase']='question';$s['deadline']=microtime(true)+$s['seconds'];
        return;
    }
    if($action==='family_answer') {
        $key=playerKey($s,$token);
        if($s['phase']!=='question')fail('Bu sorunun yanıt süresi bitti.',409);
        $q=$s['questions'][$s['index']];
        if(($in['questionId']??'')!==$q['id'])fail('Yeni soruya geçildi.',409);
        if($q['subjectKey']===$key)fail('Kendinle ilgili soruya cevap veremezsin.',409);
        if(isset($s['answers'][(string)$s['index']][$key]))fail('Yanıtınız zaten alındı.',409);
        $choice=$in['choice']??null;if(!is_int($choice)||$choice<0||$choice>3)fail('Seçenek geçersiz.');
        $points=$choice===$q['correct']?100:0;
        $s['answers'][(string)$s['index']][$key]=['choice'=>$choice,'points'=>$points];$s['players'][$key]['score']+=$points;
        return;
    }
    if($action==='family_advance') {
        if(!in_array($s['phase'],['question','reveal'],true))fail('Yarışma henüz başlamadı.',409);
        if(($in['expectedIndex']??null)!==$s['index']||($in['expectedPhase']??null)!==$s['phase'])fail('Ekran güncellendi; tekrar deneyin.',409);
        if($s['phase']==='question'){$s['phase']='reveal';$s['revealUntil']=microtime(true)+5;}
        elseif($s['index']===count($s['questions'])-1)$s['phase']='finished';
        else{$s['index']++;$s['phase']='question';$s['deadline']=microtime(true)+$s['seconds'];unset($s['revealUntil'],$s['countdownUntil']);}
    }
}
function familyResults(array $s): array {
    $totalPerPerson=10*(count($s['players'])-1);$ranking=[];$byPerson=[];$knownCounts=[];
    foreach($s['questions'] as $index=>$q)foreach($s['answers'][(string)$index]??[] as $guesser=>$guess)if($guess['points']>0){$subject=$q['subjectKey'];$knownCounts[$subject][$guesser]=($knownCounts[$subject][$guesser]??0)+1;}
    foreach($s['players'] as $key=>$p){
        $correct=0;$answered=0;
        foreach($s['answers'] as $guesses)if(isset($guesses[$key])){$answered++;if($guesses[$key]['points']>0)$correct++;}
        $ranking[]=['id'=>$p['id'],'name'=>$p['name'],'avatar'=>$p['avatar']??'astronaut','role'=>$p['role'],'correct'=>$correct,'answered'=>$answered,'total'=>$totalPerPerson,'score'=>$correct*100,'percent'=>(int)round(100*$correct/max(1,$totalPerPerson))];
        $knowers=[];
        foreach($s['players'] as $otherKey=>$other){
            if($otherKey===$key)continue;$known=$knownCounts[$key][$otherKey]??0;
            $knowers[]=['id'=>$other['id'],'name'=>$other['name'],'role'=>$other['role'],'correct'=>$known,'total'=>10];
        }
        usort($knowers,fn($a,$b)=>$b['correct']<=>$a['correct']);
        $byPerson[]=['id'=>$p['id'],'name'=>$p['name'],'avatar'=>$p['avatar']??'astronaut','role'=>$p['role'],'knowers'=>$knowers];
    }
    usort($ranking,fn($a,$b)=>$b['score']<=>$a['score']);$lastScore=null;$rank=0;
    foreach($ranking as $i=>&$row){if($lastScore!==$row['score'])$rank=$i+1;$row['rank']=$rank;$lastScore=$row['score'];}unset($row);
    return ['ranking'=>$ranking,'byPerson'=>$byPerson];
}
function familySnapshot(array $s,?string $token): array {
    $now=microtime(true);$phase=$s['phase'];
    $key=$token?hash('sha256',$token):null;$me=$key?($s['players'][$key]??null):null;$players=[];
    foreach($s['players'] as $k=>$p){
        $score=$p['score'];if($phase==='question')$score-=$s['answers'][(string)$s['index']][$k]['points']??0;
        $players[]=['id'=>$p['id'],'name'=>$p['name'],'avatar'=>$p['avatar']??'astronaut','role'=>$p['role'],'ready'=>isset($s['profiles'][$k]),'score'=>$score];
    }
    $out=['pin'=>$s['pin'],'mode'=>'family','category'=>null,'title'=>$s['title'],'phase'=>$phase,'createdAt'=>$s['createdAt'],'serverTime'=>$now,'expiresAt'=>$s['expiresAt'],'playerCount'=>count($players),'players'=>$players,'readyCount'=>count($s['profiles']),'index'=>$s['index'],'total'=>count($s['questions']),'seconds'=>$s['seconds'],'deadline'=>$s['deadline']??null,'revealUntil'=>$s['revealUntil']??null,'countdownUntil'=>$s['countdownUntil']??null];
    if($me)$out['me']=array_values(array_filter($players,fn($p)=>$p['id']===$me['id']))[0];
    if($phase==='lobby'){
        $out['prompts']=array_map(fn($p)=>['id'=>$p['id'],'text'=>$p['self']],familyRoomPrompts($s));
        if($me)$out['myProfile']=$s['profiles'][$key]??null;
    }
    if(in_array($phase,['question','reveal'],true)){
        $q=$s['questions'][$s['index']];$subject=$s['players'][$q['subjectKey']];
        $out['question']=['id'=>$q['id'],'text'=>$q['text'],'options'=>$q['options'],'subject'=>['id'=>$subject['id'],'name'=>$subject['name'],'avatar'=>$subject['avatar']??'astronaut','role'=>$subject['role']]];
        $out['ownQuestion']=$me && $key===$q['subjectKey'];$out['answeredCount']=count($s['answers'][(string)$s['index']]??[]);$out['eligibleCount']=count($players)-1;
        $answer=$key?($s['answers'][(string)$s['index']][$key]??null):null;
        $out['myAnswer']=$answer && $phase==='question'?['choice'=>$answer['choice']]:$answer;
        if($phase==='reveal'){$out['question']['correct']=$q['correct'];$out['answerCards']=revealedAnswerCards($s,$key);}
    }
    if($phase==='finished')$out['results']=familyResults($s);
    return $out;
}
