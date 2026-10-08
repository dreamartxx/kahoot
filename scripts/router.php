<?php
$uri=parse_url($_SERVER['REQUEST_URI'],PHP_URL_PATH);
if ($uri==='/') {header('Content-Type: text/html; charset=utf-8');readfile(__DIR__.'/../app.html');return true;}
if(in_array($uri,['/manifest.webmanifest','/offline.html','/sw.js'],true) || preg_match('~^/icons/(?:icon-192|icon-512|maskable-512|apple-touch-icon)\.png$~',$uri)){
    $file=$uri==='/sw.js' && is_file(__DIR__.'/../sw.js')?__DIR__.'/../sw.js':__DIR__.'/../public'.$uri;
    $type=str_ends_with($uri,'.png')?'image/png':($uri==='/manifest.webmanifest'?'application/manifest+json':($uri==='/sw.js'?'application/javascript':'text/html; charset=utf-8'));
    header('Content-Type: '.$type);header('Cache-Control: no-store');readfile($file);return true;
}
if (in_array($uri,['/api/index.php','/api/setup.php'],true)){require __DIR__.'/..'.$uri;return true;}
if(str_starts_with($uri,'/assets-build/assets/') && !str_contains($uri,'..'))return false;
http_response_code(404);echo 'Not found';
