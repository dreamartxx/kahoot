<?php
$uri=parse_url($_SERVER['REQUEST_URI'],PHP_URL_PATH);
if ($uri==='/') {header('Content-Type: text/html; charset=utf-8');readfile(__DIR__.'/../app.html');return true;}
if (in_array($uri,['/api/index.php','/api/setup.php'],true)){require __DIR__.'/..'.$uri;return true;}
if(str_starts_with($uri,'/assets-build/assets/') && !str_contains($uri,'..'))return false;
http_response_code(404);echo 'Not found';
