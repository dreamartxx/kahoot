<?php
declare(strict_types=1);

function tournamentCategoryIds(): array {
    static $ids=null;
    return $ids??=array_values(array_unique(array_column(json_decode(file_get_contents(__DIR__.'/../data/questions.json'),true,512,JSON_THROW_ON_ERROR),'category')));
}
function tournamentSelection(array $s): array {
    $counts=[];
    foreach($s['tournamentChoices'] as $choices)foreach($choices as $category)$counts[$category]=($counts[$category]??0)+1;
    return $counts;
}
function beginTournamentQuestions(array &$s,float $time): void {
    $five=count(array_filter($s['tournamentVotes'],fn($v)=>$v===5));
    $ten=count(array_filter($s['tournamentVotes'],fn($v)=>$v===10));
    $count=$five>$ten?5:10;
    $s['questionsPerRound']=$count;$s['questions']=[];
    foreach($s['tournamentRounds'] as $category){
        $pool=$s['tournamentDecks'][$category];
        // Five-question rounds use general knowledge only; ten-question rounds
        // retain the existing maximum of one expert question.
        if($count===5)$pool=array_slice(array_values(array_filter($pool,fn($q)=>$q['difficulty']==='general')),0,5);
        array_push($s['questions'],...$pool);
    }
    unset($s['tournamentDecks']);
    $s['phase']='countdown';$s['index']=-1;$s['countdownUntil']=$time+3;
}
function syncTournamentVoting(array &$s,float $now): void {
    if($s['mode']==='tournament'&&$s['phase']==='voting'&&$now>=$s['voteUntil'])beginTournamentQuestions($s,$s['voteUntil']);
}
function tournamentAction(array &$s,string $action,array $in,string $token): void {
    if($s['mode']!=='tournament')fail('Turnuva gerekli.');
    if($action==='tournament_choices'){
        $key=playerKey($s,$token);
        if($s['phase']!=='lobby')fail('Turnuva başladı; alanlar artık değiştirilemez.',409);
        $ids=$in['categories']??null;$allowed=tournamentCategoryIds();
        if(!is_array($ids)||!array_is_list($ids)||count($ids)<1||count($ids)>count($allowed)||count(array_filter($ids,'is_string'))!==count($ids)||count(array_unique($ids))!==count($ids))fail('En az bir farklı alan seç.');
        foreach($ids as $id)if(!in_array($id,$allowed,true))fail('Seçilen alan geçersiz.');
        $s['tournamentChoices'][$key]=$ids;
    } elseif($action==='tournament_prize'){
        if($s['phase']!=='lobby')fail('Turnuva başladı; ödül artık değiştirilemez.',409);
        $s['prize']=inputText($in['prize']??'',1,200,'Ödül');
    } elseif($action==='tournament_start'){
        if($s['phase']!=='lobby')fail('Turnuva zaten başladı.',409);
        if(!empty($in['questionIds']))fail('Turnuvada sorular otomatik seçilir.');
        if(count($s['players'])<2)fail('Turnuva için en az iki katılımcı gerekli.',409);
        foreach($s['players'] as $key=>$player)if(empty($s['tournamentChoices'][$key]))fail('Önce herkes güçlü olduğu alanları seçmeli.',409);
        $s['prize']=inputText($s['prize']??'',1,200,'Ödül');
        $s['tournamentRounds']=array_keys(tournamentSelection($s));shuffle($s['tournamentRounds']);
        $bank=bank();$history=[];foreach(db()->query('SELECT id,used_at FROM arena_history') as $row)$history[$row['id']]=(int)$row['used_at'];
        foreach($s['tournamentRounds'] as $category){
            try{$questions=selectQuizQuestions(array_values(array_filter($bank,fn($q)=>$q['category']===$category)),$history);}catch(DomainException $e){fail($e->getMessage());}
            foreach($questions as &$q){$answer=$q['options'][$q['correct']];shuffle($q['options']);$q['correct']=array_search($answer,$q['options'],true);}unset($q);
            $s['tournamentDecks'][$category]=$questions;
        }
        $mysql=db()->getAttribute(PDO::ATTR_DRIVER_NAME)==='mysql';
        $sql=$mysql?'INSERT INTO arena_history (id,used_at) VALUES (?,?) ON DUPLICATE KEY UPDATE used_at=VALUES(used_at)':'INSERT INTO arena_history (id,used_at) VALUES (?,?) ON CONFLICT(id) DO UPDATE SET used_at=excluded.used_at';
        $record=db()->prepare($sql);foreach($s['tournamentDecks'] as $deck)foreach($deck as $q)$record->execute([$q['id'],time()]);
        $s['phase']='voting';$s['voteUntil']=microtime(true)+30;
    } elseif($action==='tournament_vote'){
        $key=playerKey($s,$token);
        if($s['phase']!=='voting')fail('Soru sayısı oylaması sona erdi.',409);
        $count=$in['count']??null;if(!in_array($count,[5,10],true))fail('5 veya 10 soru seç.');
        $s['tournamentVotes'][$key]=$count;
        if(count($s['tournamentVotes'])===count($s['players']))beginTournamentQuestions($s,microtime(true));
    } elseif($action==='tournament_vote_close'){
        if($s['phase']!=='voting')fail('Soru sayısı oylaması sona erdi.',409);
        if(!$s['tournamentVotes'])fail('En az bir katılımcının oy vermesini bekle.',409);
        beginTournamentQuestions($s,microtime(true));
    }
}
function tournamentSnapshot(array $s,?string $key): array {
    $selection=tournamentSelection($s);
    $rounds=$s['tournamentRounds']?:array_keys($selection);
    $roundIndex=max(0,intdiv(max(0,$s['index']),max(1,$s['questionsPerRound']??10)));
    $participants=[];foreach($s['players'] as $id=>$player)$participants[]=['name'=>$player['name'],'avatar'=>$player['avatar']??'astronaut','categories'=>$s['tournamentChoices'][$id]??[],'voted'=>isset($s['tournamentVotes'][$id])];
    return ['prize'=>$s['prize'],'rounds'=>$rounds,'roundIndex'=>$roundIndex,'roundTotal'=>count($rounds),'questionsPerRound'=>$s['questionsPerRound']??null,'category'=>$rounds[$roundIndex]??null,
        'categoryVotes'=>$selection,'readyCount'=>count($s['tournamentChoices']),'tournamentParticipants'=>$participants,'myCategories'=>$key?($s['tournamentChoices'][$key]??[]):[],
        'voteUntil'=>$s['voteUntil']??null,'voteCount'=>count($s['tournamentVotes']),'votes'=>['5'=>count(array_filter($s['tournamentVotes'],fn($v)=>$v===5)),'10'=>count(array_filter($s['tournamentVotes'],fn($v)=>$v===10))],'myVote'=>$key?($s['tournamentVotes'][$key]??null):null];
}
