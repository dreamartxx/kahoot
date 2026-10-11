<?php
declare(strict_types=1);
// Solo games never expose the deck or accept client-supplied scores.
function soloSchema(): void {
    $db=db();$text=$db->getAttribute(PDO::ATTR_DRIVER_NAME)==='mysql'?'LONGTEXT':'TEXT';
    $db->exec('CREATE TABLE IF NOT EXISTS arena_solo (scope VARCHAR(80) PRIMARY KEY, state '.$text.' NOT NULL)');
    $db->exec('CREATE TABLE IF NOT EXISTS arena_solo_results (scope VARCHAR(80) NOT NULL, id VARCHAR(32) NOT NULL, category VARCHAR(32) NOT NULL, score INT NOT NULL, correct_count INT NOT NULL, finished_at BIGINT NOT NULL, PRIMARY KEY(scope,id))');
}
function soloScope(): string {return isPreview()?'test:'.hash('sha256',$_COOKIE['arena_session']):'user:'.currentUser()['id'];}
function soloSync(array &$s): void {
    $now=microtime(true);
    while(true){
        if($s['phase']==='question' && $now >= $s['deadline']){
            $s['answers'][(string)$s['index']]??=['choice'=>null,'correct'=>false];$s['phase']='reveal';$s['until']=$s['deadline']+5;
        }elseif($s['phase']==='reveal' && $now >= $s['until']){
            if($s['index']===9){$s['phase']='finished';$s['finishedAt']=(int)$s['until'];return;}
            $s['phase']='countdown';$s['until']+=3;
        }elseif($s['phase']==='countdown' && $now >= $s['until']){
            $s['index']++;$s['phase']='question';$s['deadline']=$s['until']+30;
        }else return;
    }
}
function soloSave(string $scope,array $s): void {
    $db=db();$mysql=$db->getAttribute(PDO::ATTR_DRIVER_NAME)==='mysql';
    $sql=$mysql?'INSERT INTO arena_solo (scope,state) VALUES (?,?) ON DUPLICATE KEY UPDATE state=VALUES(state)':'INSERT INTO arena_solo (scope,state) VALUES (?,?) ON CONFLICT(scope) DO UPDATE SET state=excluded.state';
    $db->prepare($sql)->execute([$scope,json_encode($s,JSON_UNESCAPED_UNICODE)]);
    if($s['phase']==='finished'){
        $correct=count(array_filter($s['answers'],fn($a)=>$a['correct']));
        $sql=$mysql?'INSERT IGNORE INTO arena_solo_results (scope,id,category,score,correct_count,finished_at) VALUES (?,?,?,?,?,?)':'INSERT INTO arena_solo_results (scope,id,category,score,correct_count,finished_at) VALUES (?,?,?,?,?,?) ON CONFLICT(scope,id) DO NOTHING';
        $db->prepare($sql)->execute([$scope,$s['id'],$s['category'],$correct*100,$correct,$s['finishedAt']]);
    }
}
function soloSnapshot(?array $s): ?array {
    if(!$s || $s['phase']==='abandoned')return null;
    $correct=count(array_filter($s['answers'],fn($a)=>$a['correct']));
    $out=['id'=>$s['id'],'category'=>$s['category'],'phase'=>$s['phase'],'index'=>$s['index'],'total'=>10,'seconds'=>30,'deadline'=>$s['deadline'],'until'=>$s['until']??null,'serverTime'=>microtime(true),'correctCount'=>$correct,'score'=>$correct*100,'answeredCount'=>count($s['answers'])];
    if(in_array($s['phase'],['question','reveal'],true)){
        $q=$s['questions'][$s['index']];$out['question']=['id'=>$q['id'],'text'=>$q['text'],'options'=>$q['options']];
        if($s['phase']==='reveal'){$out['question']+=['correct'=>$q['correct'],'explanation'=>$q['explanation']??''];$out['answer']=$s['answers'][(string)$s['index']];}
    }
    if($s['phase']==='finished'){
        $out['review']=array_map(fn($q,$i)=>['text'=>$q['text'],'options'=>$q['options'],'correct'=>$q['correct'],'explanation'=>$q['explanation']??'','choice'=>$s['answers'][(string)$i]['choice']??null],$s['questions'],array_keys($s['questions']));
    }
    return $out;
}
function soloStats(string $scope): array {
    $db=db();$q=$db->prepare('SELECT COUNT(*) AS games, COALESCE(MAX(score),0) AS best, COALESCE(SUM(correct_count),0) AS correctTotal FROM arena_solo_results WHERE scope=?');$q->execute([$scope]);$stats=array_map('intval',$q->fetch());
    $q=$db->prepare('SELECT category,MAX(score) AS best,COUNT(*) AS games FROM arena_solo_results WHERE scope=? GROUP BY category ORDER BY best DESC');$q->execute([$scope]);$stats['categories']=$q->fetchAll();
    $q=$db->prepare('SELECT id,category,score,correct_count AS correctCount,finished_at AS finishedAt FROM arena_solo_results WHERE scope=? ORDER BY finished_at DESC LIMIT 8');$q->execute([$scope]);$stats['recent']=$q->fetchAll();return $stats;
}
function soloActions(string $action,array $in): never {
    needAdmin();soloSchema();$scope=soloScope();$db=db();
    if(!in_array($action,['solo_summary','solo_state','solo_start','solo_answer','solo_abandon'],true))fail('İşlem bulunamadı.',404);
    if($action==='solo_start')rateLimit('solo_start',30);
    $db->beginTransaction();
    // One writable game per account. This also serializes two simultaneous starts.
    $db->prepare('UPDATE arena_users SET active=active WHERE id=?')->execute([currentUser()['id']]);
    $q=$db->prepare('SELECT state FROM arena_solo WHERE scope=?'.($db->getAttribute(PDO::ATTR_DRIVER_NAME)==='mysql'?' FOR UPDATE':''));$q->execute([$scope]);$raw=$q->fetchColumn();$s=$raw?json_decode($raw,true):null;
    if($s){soloSync($s);soloSave($scope,$s);}
    if($action==='solo_start'){
        if($s && !in_array($s['phase'],['finished','abandoned'],true)){$db->rollBack();fail('Devam eden testini tamamla veya bitir.',409);}
        $category=$in['category']??'mixed';if(!is_string($category))fail('Geçerli bir konu seçin.');
        $pool=array_values(array_filter(bank(),fn($q)=>$category==='mixed'||$q['category']===$category));
        $history=[];foreach($s['questions']??[] as $old)$history[$old['id']]=time();
        try{$questions=selectQuizQuestions($pool,$history);}catch(DomainException $e){$db->rollBack();fail($e->getMessage());}
        foreach($questions as &$question){$correct=$question['options'][$question['correct']];shuffle($question['options']);$question['correct']=array_search($correct,$question['options'],true);}unset($question);
        $s=['id'=>bin2hex(random_bytes(16)),'category'=>$category,'questions'=>$questions,'answers'=>[],'phase'=>'question','index'=>0,'deadline'=>microtime(true)+30];
    }
    if(in_array($action,['solo_answer','solo_abandon'],true)){
        if(!$s || ($in['gameId']??'')!==$s['id']){$db->rollBack();fail('Test değişti. Ekranı yenileyin.',409);}
        if($action==='solo_abandon')$s['phase']='abandoned';
        else{
            if($s['phase']!=='question'||($in['questionId']??'')!==$s['questions'][$s['index']]['id']){$db->commit();fail('Yeni soruya geçildi veya yanıt süresi bitti.',409);}
            $choice=$in['choice']??null;if(!is_int($choice)||$choice<0||$choice>3){$db->rollBack();fail('Dört seçenekten birini seçin.');}
            $s['answers'][(string)$s['index']]=['choice'=>$choice,'correct'=>$choice===$s['questions'][$s['index']]['correct']];$s['phase']='reveal';$s['until']=microtime(true)+5;
        }
    }
    if($s)soloSave($scope,$s);$db->commit();
    $out=['game'=>soloSnapshot($s),'preview'=>isPreview()];
    if($action==='solo_summary'||($s['phase']??'')==='finished')$out['stats']=soloStats($scope);
    echo json_encode($out,JSON_UNESCAPED_UNICODE);exit;
}
