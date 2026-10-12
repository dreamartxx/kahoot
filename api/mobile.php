<?php
declare(strict_types=1);
// Native HTTP carries a revocable bearer session; never fall back to a browser
// cookie on this path. Browser sessions retain their HttpOnly/SameSite policy.
function mobileClient(): bool { return ($_SERVER['HTTP_X_ARENA_CLIENT']??'')==='android'; }
function prepareMobileSession(): void {
    if(!mobileClient())return;
    if(($_SERVER['HTTP_ORIGIN']??'')!=='https://localhost')fail('Geçersiz mobil kaynak.',403);
    $auth=$_SERVER['HTTP_AUTHORIZATION']??$_SERVER['REDIRECT_HTTP_AUTHORIZATION']??'';
    if($auth!==''&&!preg_match('/^Bearer ([a-f0-9]{64})$/D',$auth,$matches))fail('Geçersiz oturum.',401);
    unset($_COOKIE[session_name()]);
    $_COOKIE['arena_session']=$auth===''?'':$matches[1];
}
