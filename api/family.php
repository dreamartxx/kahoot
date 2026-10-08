<?php
declare(strict_types=1);

function familyPrompts(): array {
    return [
        ['id'=>'food','self'=>'En çok sevdiğim yemek hangisi?','ask'=>'En çok sevdiği yemek hangisi?','examples'=>['Mantı','Pizza','Karnıyarık','Makarna','Köfte','Sarma','Kuru fasulye','Lahmacun']],
        ['id'=>'color','self'=>'En sevdiğim renk hangisi?','ask'=>'En sevdiği renk hangisi?','examples'=>['Mavi','Yeşil','Kırmızı','Mor','Sarı','Turuncu','Siyah','Beyaz']],
        ['id'=>'dessert','self'=>'En sevdiğim tatlı hangisi?','ask'=>'En sevdiği tatlı hangisi?','examples'=>['Baklava','Sütlaç','Dondurma','Künefe','Kazandibi','Brownie','Profiterol','Revani']],
        ['id'=>'fruit','self'=>'En sevdiğim meyve hangisi?','ask'=>'En sevdiği meyve hangisi?','examples'=>['Çilek','Elma','Muz','Karpuz','Kiraz','Portakal','Üzüm','Şeftali']],
        ['id'=>'drink','self'=>'En sevdiğim içecek hangisi?','ask'=>'En sevdiği içecek hangisi?','examples'=>['Çay','Türk kahvesi','Ayran','Limonata','Sıcak çikolata','Portakal suyu','Su','Süt']],
        ['id'=>'animal','self'=>'En sevdiğim hayvan hangisi?','ask'=>'En sevdiği hayvan hangisi?','examples'=>['Kedi','Köpek','Yunus','At','Tavşan','Panda','Kuş','Kaplumbağa']],
        ['id'=>'hobby','self'=>'Boş zamanımda en çok ne yapmayı severim?','ask'=>'Boş zamanında en çok ne yapmayı sever?','examples'=>['Kitap okumak','Yürüyüş yapmak','Oyun oynamak','Resim çizmek','Müzik dinlemek','Film izlemek','Yüzmek','Yemek yapmak']],
        ['id'=>'season','self'=>'En sevdiğim mevsim hangisi?','ask'=>'En sevdiği mevsim hangisi?','examples'=>['İlkbahar','Yaz','Sonbahar','Kış','Hepsi','Hiçbiri']],
        ['id'=>'city','self'=>'Gezmek için en çok gitmek istediğim şehir hangisi?','ask'=>'Gezmek için en çok gitmek istediği şehir hangisi?','examples'=>['İstanbul','Paris','Roma','Tokyo','Londra','Antalya','Barselona','New York']],
        ['id'=>'screen','self'=>'En sevdiğim film veya dizi hangisi?','ask'=>'En sevdiği film veya dizi hangisi?','examples'=>['Hababam Sınıfı','Harry Potter','Aslan Kral','Yüzüklerin Efendisi','Neşeli Günler','Şirinler','Rafadan Tayfa','Kral Şakir']],
    ];
}
function familyLabel(array $p): string { return $p['name'].' ('.$p['role'].')'; }
function familyAction(array &$s,string $action,array $in,string $token): void {
    if($action==='family_profile') {
        $key=playerKey($s,$token);
        if($s['phase']!=='lobby')fail('Yarışma başladı; kişisel cevaplar artık değiştirilemez.',409);
        $answers=$in['answers']??null;
        if(!is_array($answers)||count($answers)!==10)fail('Kendinle ilgili 10 sorunun tamamını cevapla.');
        $clean=[];
        foreach(familyPrompts() as $prompt){$value=inputText($answers[$prompt['id']]??'',1,80,'Cevap');if(normalize($value)==='')fail('Cevaplarda harf veya rakam kullan.');$clean[$prompt['id']]=$value;}
        $s['profiles'][$key]=$clean;
        return;
    }
    if($action==='family_start') {
        if($s['phase']!=='lobby')fail('Aile oyunu zaten başladı.',409);
        if(count($s['players'])<2)fail('En az iki aile üyesi katılmalı.',409);
        foreach($s['players'] as $key=>$p)if(!isset($s['profiles'][$key]))fail('Herkes 10 cevabını tamamladıktan sonra başlayabilirsiniz.',409);
        $deck=[];
        foreach($s['players'] as $key=>$p)foreach(familyPrompts() as $prompt){
            $correct=$s['profiles'][$key][$prompt['id']];$seen=[normalize($correct)=>true];$candidates=[];
            // Prefer other family members' answers, then fill short pools with suitable alternatives.
            $others=array_column(array_values($s['profiles']),$prompt['id']);shuffle($others);
            $fallback=$prompt['examples'];shuffle($fallback);
            foreach(array_merge($others,$fallback) as $value){$norm=normalize($value);if(isset($seen[$norm]))continue;$seen[$norm]=true;$candidates[]=$value;}
            $options=array_merge([$correct],array_slice($candidates,0,3));shuffle($options);
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
        $ranking[]=['id'=>$p['id'],'name'=>$p['name'],'role'=>$p['role'],'correct'=>$correct,'answered'=>$answered,'total'=>$totalPerPerson,'score'=>$correct*100,'percent'=>(int)round(100*$correct/max(1,$totalPerPerson))];
        $knowers=[];
        foreach($s['players'] as $otherKey=>$other){
            if($otherKey===$key)continue;$known=$knownCounts[$key][$otherKey]??0;
            $knowers[]=['id'=>$other['id'],'name'=>$other['name'],'role'=>$other['role'],'correct'=>$known,'total'=>10];
        }
        usort($knowers,fn($a,$b)=>$b['correct']<=>$a['correct']);
        $byPerson[]=['id'=>$p['id'],'name'=>$p['name'],'role'=>$p['role'],'knowers'=>$knowers];
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
        $players[]=['id'=>$p['id'],'name'=>$p['name'],'role'=>$p['role'],'ready'=>isset($s['profiles'][$k]),'score'=>$score];
    }
    $out=['pin'=>$s['pin'],'mode'=>'family','category'=>null,'title'=>$s['title'],'phase'=>$phase,'createdAt'=>$s['createdAt'],'serverTime'=>$now,'expiresAt'=>$s['expiresAt'],'playerCount'=>count($players),'players'=>$players,'readyCount'=>count($s['profiles']),'index'=>$s['index'],'total'=>count($s['questions']),'seconds'=>$s['seconds'],'deadline'=>$s['deadline']??null,'revealUntil'=>$s['revealUntil']??null,'countdownUntil'=>$s['countdownUntil']??null];
    if($me)$out['me']=array_values(array_filter($players,fn($p)=>$p['id']===$me['id']))[0];
    if($phase==='lobby'){
        $out['prompts']=array_map(fn($p)=>['id'=>$p['id'],'text'=>$p['self']],familyPrompts());
        if($me)$out['myProfile']=$s['profiles'][$key]??null;
    }
    if(in_array($phase,['question','reveal'],true)){
        $q=$s['questions'][$s['index']];$subject=$s['players'][$q['subjectKey']];
        $out['question']=['id'=>$q['id'],'text'=>$q['text'],'options'=>$q['options'],'subject'=>['id'=>$subject['id'],'name'=>$subject['name'],'role'=>$subject['role']]];
        $out['ownQuestion']=$me && $key===$q['subjectKey'];$out['answeredCount']=count($s['answers'][(string)$s['index']]??[]);$out['eligibleCount']=count($players)-1;
        $answer=$key?($s['answers'][(string)$s['index']][$key]??null):null;
        $out['myAnswer']=$answer && $phase==='question'?['choice'=>$answer['choice']]:$answer;
        if($phase==='reveal')$out['question']['correct']=$q['correct'];
    }
    if($phase==='finished')$out['results']=familyResults($s);
    return $out;
}
