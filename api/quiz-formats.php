<?php
declare(strict_types=1);
function specialQuiz(string $category): bool {return in_array($category,['estimate','binary','mixed'],true);}
function specialQuizBank(string $type): array {return json_decode(file_get_contents(__DIR__.'/../data/quiz-'.$type.'.json'),true,512,JSON_THROW_ON_ERROR);}
function specialQuizSchema(): void {ensureSchema('quiz_rotation',1,static function():void{db()->exec('CREATE TABLE IF NOT EXISTS arena_quiz_rotation (scope VARCHAR(100) PRIMARY KEY, state TEXT NOT NULL)');});}
function specialQuizDeck(string $type,int $count=10): array {
    $db=db();$mysql=$db->getAttribute(PDO::ATTR_DRIVER_NAME)==='mysql';
    if(!$db->inTransaction())throw new LogicException('Quiz selection needs room transaction');$db->prepare('UPDATE arena_users SET active=active WHERE id=?')->execute([currentUser()['id']]);
    $scope=currentUser()['id'].':'.$type.(isPreview()?':test':'');
    $q=$db->prepare('SELECT state FROM arena_quiz_rotation WHERE scope=?'.($mysql?' FOR UPDATE':''));$q->execute([$scope]);$raw=$q->fetchColumn();$rotation=$raw?json_decode($raw,true):['previous'=>[],'used'=>[],'round'=>0,'extras'=>[]];
    $pool=array_values(array_filter(specialQuizBank($type),fn($q)=>!in_array($q['id'],$rotation['previous'],true)));
    shuffle($pool);usort($pool,fn($a,$b)=>($rotation['used'][$a['id']]??0)<=>($rotation['used'][$b['id']]??0));
    if($type==='mixed'){
        $groups=[];foreach($pool as $question)$groups[$question['category']][]=$question;
        $categories=array_keys($groups);shuffle($categories);$deck=[];
        usort($categories,fn($a,$b)=>($rotation['used'][$groups[$a][0]['id']]??0)<=>($rotation['used'][$groups[$b][0]['id']]??0));
        foreach(array_slice($categories,0,$count) as $category)$deck[]=array_shift($groups[$category]);
        // Cover distinct topics first, then repeat only when the round is longer.
        usort($categories,fn($a,$b)=>(int)in_array($a,$rotation['extras'],true)<=>(int)in_array($b,$rotation['extras'],true));
        $rotation['extras']=array_slice($categories,0,max(0,$count-count($deck)));
        foreach($rotation['extras'] as $category)$deck[]=array_shift($groups[$category]);
    }else $deck=array_slice($pool,0,$count);
    shuffle($deck);$rotation['round']++;$rotation['previous']=array_column($deck,'id');
    foreach($deck as &$question){$rotation['used'][$question['id']]=$rotation['round'];if($type!=='estimate'){$correct=$question['options'][$question['correct']];if($type!=='binary')shuffle($question['options']);$question['correct']=array_search($correct,$question['options'],true);}}unset($question);
    $sql=$mysql?'INSERT INTO arena_quiz_rotation (scope,state) VALUES (?,?) ON DUPLICATE KEY UPDATE state=VALUES(state)':'INSERT INTO arena_quiz_rotation (scope,state) VALUES (?,?) ON CONFLICT(scope) DO UPDATE SET state=excluded.state';
    $db->prepare($sql)->execute([$scope,json_encode($rotation,JSON_UNESCAPED_UNICODE)]);
    return $deck;
}
function scoreEstimates(array &$s): void {
    if(($s['quizType']??'')!=='estimate'||$s['index']<0||isset($s['estimateScored'][(string)$s['index']]))return;
    $i=(string)$s['index'];$target=(int)round($s['questions'][$s['index']]['answer']*1000);$distances=[];
    foreach($s['answers'][$i]??[] as $key=>$answer)$distances[$key]=abs((int)round($answer['guess']*1000)-$target);
    $nearest=$distances?min($distances):null;
    foreach($distances as $key=>$distance){$points=$distance===$nearest?1000:0;$s['answers'][$i][$key]+=['distance'=>$distance/1000];$s['answers'][$i][$key]['points']=$points;$s['players'][$key]['score']+=$points;}
    $s['estimateScored'][$i]=true;
}
function estimateValue(mixed $value): float {
    if(!is_string($value)&&!is_int($value)&&!is_float($value))fail('Geçerli bir sayı yazın.');
    $value=str_replace(',','.',trim((string)$value));
    if(!preg_match('/^-?\d{1,13}(?:\.\d{1,3})?$/D',$value))fail('Sadece sayı yazın; ondalık için virgül veya nokta kullanın (en fazla 3 basamak).');
    $number=(float)$value;if(!is_finite($number)||abs($number)>1000000000000)fail('Tahmin çok büyük.');return $number;
}
function estimateResults(array $s,?string $key): array {
    if(!in_array($s['phase'],['reveal','finished'],true))return [];
    $rows=[];foreach($s['players'] as $id=>$p){$a=$s['answers'][(string)$s['index']][$id]??null;$rows[]=['name'=>$p['name'],'avatar'=>$p['avatar']??'astronaut','isMe'=>$id===$key,'guess'=>$a['guess']??null,'distance'=>$a['distance']??null,'points'=>$a['points']??0];}
    usort($rows,fn($a,$b)=>($a['distance']??INF)<=>($b['distance']??INF));return $rows;
}
