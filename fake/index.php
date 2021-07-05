<!doctype html>
<html lang="en">
  <head>
    <!-- Required meta tags -->
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">

    <!-- Bootstrap CSS -->
   <!--  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-EVSTQN3/azprG1Anm3QDgpJLIm9Nao0Yz1ztcQTwFspd3yD65VohhpuuCOmLASjC" crossorigin="anonymous"> -->

    <title>парсилка-#уярсилка</title>
  </head>
  <body>
    <h1>парсилка</h1>

<?php
require_once '../lib/simplehtmldom/simple_html_dom.php';
//    https://26gosuslugi.ru/covid-19_qr-org/5fcaab7efe792d490b65f29a
// пропуск делается на 15 минут
//<strong class="ng-binding">"Кинотеатр "Салют Юг""</strong>
$html = new simple_html_dom();
    $myUrl = 'https://26gosuslugi.ru/covid-19_qr-org/5fcaab7efe792d490b65f29a';

// Load from a string
$html->load('<html><body><p>Hello World!</p><p>We\'re here</p></body></html>');
// Load a file
$html->load_file($myUrl);
// Create DOM from URL or file
$html = file_get_html($myUrl);
foreach($html->find('title') as $title) {
    echo $title->innertext . '<br>';
}

foreach($html->find('strong[class=ng-binding]') as $binding) {

        echo $binding->innertext . '<br>';

}

?>


  </body>
</html>
