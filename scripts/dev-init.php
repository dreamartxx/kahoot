<?php
require __DIR__.'/../api/core.php';
$path=$argv[1]??'/tmp/arena-test.sqlite';$db=new PDO('sqlite:'.$path);$db->setAttribute(PDO::ATTR_ERRMODE,PDO::ERRMODE_EXCEPTION);migrate($db);echo "Test database ready\n";
