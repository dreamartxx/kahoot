<?php
declare(strict_types=1);
// Account quotas and game state are changed in the same database transaction.
function creditSchema(): void {
    static $ready=false;if($ready)return;$db=db();$mysql=$db->getAttribute(PDO::ATTR_DRIVER_NAME)==='mysql';
    $db->exec('CREATE TABLE IF NOT EXISTS arena_credit_accounts (user_id INT PRIMARY KEY, daily_limit INT NOT NULL DEFAULT 10, monthly_limit INT NOT NULL DEFAULT 150, participant_limit INT NOT NULL DEFAULT 10, room_limit INT NOT NULL DEFAULT 1, raffle_limit INT NOT NULL DEFAULT 50, bonus INT NOT NULL DEFAULT 0)');
    $db->exec('CREATE TABLE IF NOT EXISTS arena_credit_events (event_key VARCHAR(160) PRIMARY KEY, user_id INT NOT NULL, kind VARCHAR(32) NOT NULL, title VARCHAR(100) NOT NULL, amount INT NOT NULL, bonus_used INT NOT NULL DEFAULT 0, period_day VARCHAR(10) NOT NULL, period_month VARCHAR(7) NOT NULL, state VARCHAR(16) NOT NULL, created_at BIGINT NOT NULL, note VARCHAR(300) NOT NULL DEFAULT \'\''.($mysql?', INDEX credit_user_state (user_id,state)':'').')');
    if(!$mysql)$db->exec('CREATE INDEX IF NOT EXISTS credit_user_state ON arena_credit_events (user_id,state)');
    $db->exec('CREATE TABLE IF NOT EXISTS arena_credit_changes (request_key VARCHAR(100) PRIMARY KEY, user_id INT NOT NULL, actor_id INT NOT NULL, kind VARCHAR(20) NOT NULL, amount INT NOT NULL, note VARCHAR(300) NOT NULL, created_at BIGINT NOT NULL)');$ready=true;
}
function creditPeriod(?DateTimeImmutable $now=null): array {
    $now=($now??new DateTimeImmutable('now'))->setTimezone(new DateTimeZone('Europe/Istanbul'));
    return ['day'=>$now->format('Y-m-d'),'month'=>$now->format('Y-m'),'dailyResetAt'=>$now->modify('tomorrow')->setTime(0,0)->getTimestamp(),'monthlyResetAt'=>$now->modify('first day of next month')->setTime(0,0)->getTimestamp()];
}
function creditAccount(int $id,bool $lock=false): array {
    $db=db();$mysql=$db->getAttribute(PDO::ATTR_DRIVER_NAME)==='mysql';
    if($lock){if(!$db->inTransaction())throw new LogicException('Credit lock needs transaction');$db->prepare('UPDATE arena_credit_accounts SET bonus=bonus WHERE user_id=?')->execute([$id]);}
    $db->prepare($mysql?'INSERT IGNORE INTO arena_credit_accounts (user_id) VALUES (?)':'INSERT INTO arena_credit_accounts (user_id) VALUES (?) ON CONFLICT DO NOTHING')->execute([$id]);
    $q=$db->prepare('SELECT a.*,u.role FROM arena_credit_accounts a JOIN arena_users u ON u.id=a.user_id WHERE a.user_id=?'.($lock&&$mysql?' FOR UPDATE':''));$q->execute([$id]);$a=$q->fetch();if(!$a)fail('Hesap bulunamadı.',404);return $a;
}
function creditSummary(int $id): array {
    $db=db();$a=creditAccount($id,$db->inTransaction());$p=creditPeriod();
    // Locking reads see committed balances even after waiting for another request
    // under MySQL's default REPEATABLE READ isolation.
    $q=$db->prepare("SELECT amount,bonus_used,period_day,period_month,state FROM arena_credit_events WHERE user_id=? AND state IN ('spent','reserved','compensated') AND (period_month=? OR state='reserved')".($db->inTransaction()&&$db->getAttribute(PDO::ATTR_DRIVER_NAME)==='mysql'?' FOR UPDATE':''));$q->execute([$id,$p['month']]);
    $u=['day_used'=>0,'month_used'=>0,'reserved'=>0];foreach($q as $e){$base=(int)$e['amount']-(int)$e['bonus_used'];if($e['period_day']===$p['day'])$u['day_used']+=$base;if($e['period_month']===$p['month'])$u['month_used']+=$base;if($e['state']==='reserved')$u['reserved']+=(int)$e['amount'];}
    $day=max(0,(int)$a['daily_limit']-(int)$u['day_used']);$month=max(0,(int)$a['monthly_limit']-(int)$u['month_used']);$owner=$a['role']==='owner';
    return ['unlimited'=>$owner,'dailyLimit'=>(int)$a['daily_limit'],'monthlyLimit'=>(int)$a['monthly_limit'],'dailyRemaining'=>$day,'monthlyRemaining'=>$month,'bonus'=>(int)$a['bonus'],'available'=>min($day,$month)+(int)$a['bonus'],'reserved'=>(int)$u['reserved'],'participantLimit'=>$owner?300:(int)$a['participant_limit'],'roomLimit'=>$owner?null:(int)$a['room_limit'],'raffleLimit'=>$owner?2000:(int)$a['raffle_limit']]+$p;
}
function creditRequest(array $in): string {
    $id=$in['requestId']??'';if(!is_string($id)||!preg_match('/^[a-zA-Z0-9_-]{16,80}$/D',$id))fail('İşlem kimliği eksik. Sayfayı yenileyip tekrar deneyin.',400);return $id;
}
function creditSpend(int $id,string $key,string $kind,string $title,int $amount=1,string $state='spent'): void {
    $a=creditAccount($id,true);if($a['role']==='owner')return;
    $q=db()->prepare('SELECT event_key FROM arena_credit_events WHERE event_key=?'.(db()->getAttribute(PDO::ATTR_DRIVER_NAME)==='mysql'?' FOR UPDATE':''));$q->execute([$key]);if($q->fetchColumn())fail('Bu işlem zaten işlendi. Ekranı yenileyin.',409);
    $summary=creditSummary($id);if($summary['available']<$amount)fail('Kredin yetersiz. Günlük ve aylık haklarını profilinden görebilirsin.',409);
    $bonus=max(0,$amount-min($summary['dailyRemaining'],$summary['monthlyRemaining']));$p=creditPeriod();
    db()->prepare('UPDATE arena_credit_accounts SET bonus=bonus-? WHERE user_id=?')->execute([$bonus,$id]);
    db()->prepare('INSERT INTO arena_credit_events (event_key,user_id,kind,title,amount,bonus_used,period_day,period_month,state,created_at) VALUES (?,?,?,?,?,?,?,?,?,?)')->execute([$key,$id,$kind,mb_substr($title,0,100),$amount,$bonus,$p['day'],$p['month'],$state,time()]);
}
function creditRefund(string $key,string $note,bool $reservedOnly=false): bool {
    $q=db()->prepare('SELECT * FROM arena_credit_events WHERE event_key=?');$q->execute([$key]);$e=$q->fetch();if(!$e)return false;
    creditAccount((int)$e['user_id'],true);
    // A manual refund after midnight is a replacement bonus. Keep the original
    // monthly usage counted to avoid granting both a quota refund and a bonus.
    $late=!$reservedOnly&&$e['period_day']!==creditPeriod()['day'];$state=$late?'compensated':'refunded';
    $q=db()->prepare("UPDATE arena_credit_events SET state=?,note=? WHERE event_key=? AND state ".($reservedOnly?"='reserved'":"IN ('spent','reserved')"));$q->execute([$state,$note,$key]);
    if(!$q->rowCount())return false;db()->prepare('UPDATE arena_credit_accounts SET bonus=bonus+? WHERE user_id=?')->execute([$late?$e['amount']:$e['bonus_used'],$e['user_id']]);return true;
}
function creditRoomCharge(array &$s,string $kind,array $in): void {
    if(isPreview())return;
    $id=(int)($s['ownerId']??1);$a=creditAccount($id,true);if($a['role']==='owner')return;
    $request=creditRequest($in);creditSpend($id,'action:'.$id.':'.$request,$kind,$s['title']);
}
function creditReserveTournament(array &$s): void {
    if(isPreview())return;
    $id=(int)($s['ownerId']??1);$a=creditAccount($id,true);if($a['role']==='owner')return;
    $count=count($s['tournamentRounds']);if(creditSummary($id)['available']<$count)fail('Turnuva için '.$count.' kredi gerekli. Başlamayan turların ayrılan kredileri iptalde geri döner.',409);
    $s['creditTournament']=bin2hex(random_bytes(12));
    for($i=0;$i<$count;$i++)creditSpend($id,'round:'.$s['creditTournament'].':'.$i,'tournament',$s['title'].' · '.$s['tournamentRounds'][$i],1,'reserved');
}
function creditNeedsSettlement(array $s): bool {
    if(empty($s['creditTournament'])||!empty($s['creditSettled']))return false;
    syncQuizClock($s,min(microtime(true),(float)$s['expiresAt']));
    $round=$s['index']<0?-1:intdiv($s['index'],max(1,$s['questionsPerRound']??10));
    return $s['expiresAt']<time()||in_array($s['phase'],['closed','finished'],true)||$round!==($s['creditRound']??-1);
}
function creditSettleTournament(array &$s): void {
    if(empty($s['creditTournament'])||!empty($s['creditSettled']))return;
    $id=(int)($s['ownerId']??1);creditAccount($id,true);$round=$s['index']<0?-1:intdiv($s['index'],max(1,$s['questionsPerRound']??10));
    $count=count($s['tournamentRounds']);$closed=in_array($s['phase'],['closed','finished'],true);
    for($i=0;$i<$count;$i++){
        $key='round:'.$s['creditTournament'].':'.$i;
        if($i<=$round)db()->prepare("UPDATE arena_credit_events SET state='spent' WHERE event_key=? AND state='reserved'")->execute([$key]);
        elseif($closed)creditRefund($key,'Başlamayan turnuva turu otomatik iade edildi.',true);
    }
    $s['creditRound']=$round;
    if($closed||$round===$count-1)$s['creditSettled']=true;
}
function creditReconcile(int $id): void {
    $db=db();if($db->inTransaction())throw new LogicException('Reconcile before opening transaction');
    $rooms=$db->query('SELECT pin,state FROM arena_rooms')->fetchAll();
    foreach($rooms as $row){$s=json_decode($row['state'],true);if((int)($s['ownerId']??1)!==$id||!creditNeedsSettlement($s))continue;
        $db->beginTransaction();
        $q=$db->prepare('SELECT state FROM arena_rooms WHERE pin=?'.($db->getAttribute(PDO::ATTR_DRIVER_NAME)==='mysql'?' FOR UPDATE':''));$q->execute([$row['pin']]);$raw=$q->fetchColumn();if(!$raw){$db->rollBack();continue;}
        $s=json_decode($raw,true);syncQuizClock($s,min(microtime(true),(float)$s['expiresAt']));
        if($s['expiresAt']<time())$s['phase']='closed';
        saveRoom($s);
    }
}
function creditCapacity(int $id): void {
    if(isPreview())return;
    $a=creditAccount($id,true);if($a['role']==='owner')return;
    $open=0;foreach(db()->query('SELECT state FROM arena_rooms') as $row){$s=json_decode($row['state'],true);if((int)($s['ownerId']??1)!==$id||$s['expiresAt']<time())continue;syncIdleClock($s);syncQuizClock($s);if(!in_array($s['phase'],['closed','finished'],true))$open++;}
    // Solo games count towards the same account-wide active event limit.
    if(function_exists('soloSync')){$q=db()->prepare('SELECT state FROM arena_solo WHERE scope=?');$q->execute(['user:'.$id]);$raw=$q->fetchColumn();if($raw){$solo=json_decode($raw,true);soloSync($solo);if(!in_array($solo['phase'],['finished','abandoned'],true))$open++;}}
    if($open>=(int)$a['room_limit'])fail('Aynı anda en fazla '.$a['room_limit'].' etkinlik açabilirsin. Önce açık etkinliğini bitir.',409);
}
function creditActions(string $action,array $in): void {
    if(!in_array($action,['credits','credit_update','credit_bonus','credit_refund'],true))return;
    needAdmin();$id=(int)($in['userId']??currentUser()['id']);if($id!==(int)currentUser()['id'])needOwner();
    if($action==='credits'){creditReconcile($id);$out=creditSummary($id)+['preview'=>isPreview()];$q=db()->prepare('SELECT event_key AS id,kind,title,amount,bonus_used AS bonusUsed,state,created_at AS createdAt,note FROM arena_credit_events WHERE user_id=? ORDER BY created_at DESC,event_key DESC LIMIT 50');$q->execute([$id]);$out['history']=$q->fetchAll();echo json_encode($out,JSON_UNESCAPED_UNICODE);exit;}
    needOwner();$req=creditRequest($in);$db=db();$db->beginTransaction();$a=creditAccount($id,true);
    $q=$db->prepare('SELECT user_id FROM arena_credit_changes WHERE request_key=?');$q->execute([$req]);if($q->fetchColumn()){$db->rollBack();fail('Bu yönetim işlemi zaten kaydedildi.',409);}
    $note=inputText($in['note']??'',3,300,'Açıklama');$amount=0;
    if($action==='credit_update'){
        $fields=['dailyLimit'=>['daily_limit',0,10000],'monthlyLimit'=>['monthly_limit',0,100000],'participantLimit'=>['participant_limit',1,300],'roomLimit'=>['room_limit',1,20],'raffleLimit'=>['raffle_limit',1,2000]];$values=[];$sets=[];
        foreach($fields as $key=>[$column,$min,$max]){$v=$in[$key]??null;if(!is_int($v)||$v<$min||$v>$max)fail('Limit değeri geçersiz.');$sets[]=$column.'=?';$values[]=$v;}$values[]=$id;$db->prepare('UPDATE arena_credit_accounts SET '.implode(',',$sets).' WHERE user_id=?')->execute($values);
    }elseif($action==='credit_bonus'){$amount=$in['amount']??null;if(!is_int($amount)||$amount<1||$amount>10000)fail('Bonus 1–10000 arasında olmalı.');$db->prepare('UPDATE arena_credit_accounts SET bonus=bonus+? WHERE user_id=?')->execute([$amount,$id]);}
    else{$key=$in['eventId']??'';$q=$db->prepare('SELECT user_id,state,amount FROM arena_credit_events WHERE event_key=?');$q->execute([$key]);$e=$q->fetch();if(!$e||(int)$e['user_id']!==$id)fail('Kredi hareketi bulunamadı.',404);if($e['state']==='reserved')fail('Ayrılan turnuva kredisi, etkinlik iptal edildiğinde otomatik iade edilir.',409);$amount=creditRefund($key,$note)?(int)$e['amount']:0;}
    $db->prepare('INSERT INTO arena_credit_changes (request_key,user_id,actor_id,kind,amount,note,created_at) VALUES (?,?,?,?,?,?,?)')->execute([$req,$id,currentUser()['id'],$action,$amount,$note,time()]);$db->commit();echo json_encode(['ok'=>true]);exit;
}
