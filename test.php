<!DOCTYPE html>
<html lang="ru">
 <head>
  <meta charset="utf-8">
  <title>для тестов </title>
  <style>
   @media print {
    .more {
     page-break-after: always;
    }
   }
  </style>
 </head>
 <body>
<p></p>
<?php

// $path = 'C:\server\fin.local\app\webroot\files';
// $directory = new \RecursiveDirectoryIterator($path);
// $iterator = new \RecursiveIteratorIterator($directory);
// $files = array();
// $bad = 0;
// $ok = 0;
// $arFiles = [];
// foreach ($iterator as $info) {
//     if ($info->getFilename() == '.' || $info->getFilename() == '..'){
//         continue;
//     }
    // echo $info->getFilename(). '<br />' . "\n"; // Получает имя файла
    // echo $info->getPathname(). '<br />' . "\n"; // Получает путь к файлу
     // echo $info->getPath(). '<br />' . "\n"; // получаем путь без имени файла
    // echo $info->getDirName(). ' <br />';
     // $parentPath = dirname($info->getPathname(),1);
     // $grandParentPath = dirname($info->getPathname(),2);
     // $parentDir =  str_replace($grandParentPath . '\\', '', $parentPath);
     // $arFiles[] = [
     //    'path' => $info->getPath(),
     //    'parentDir' => $parentDir,
     //    'filename' => $info->getFilename(),
     //    'pathname' => $info->getPathname()
     // ];

     // echo $parentDir;
     // echo  '<br />' . "\n";

// }
// echo count($arFiles);

$arr  = ['100', '100', '1хуй','100.1'];
$sum = 0;
foreach($arr as $value){
    $sum += (int)$value;
}
echo $sum;
?>
<pre>

    <?php //var_dump($arFiles);
    echo memory_get_usage()."<br />";// var_dump($arFiles); ?>
</pre>


<?php
echo 'zalupa<br>';
$link = '0фыва';
var_dump((int) $link != 0);
?>

 </body>
</html>