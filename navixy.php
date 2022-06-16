<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>Document</title>

  <script src="https://api-maps.yandex.ru/2.1/?apikey=***&lang=ru_RU" type="text/javascript">
</script>
    <script type="text/javascript">
        ymaps.ready(function(){
            // Указывается идентификатор HTML-элемента.
            var moscow_map = new ymaps.Map("first_map", {
                center: [55.76, 37.64],
                zoom: 10
            });
            // Ссылка на элемент.
            var piter_map = new ymaps.Map(document.getElementsByTagName('p')[2], {
                center: [59.94, 30.32],
                zoom: 9
            });
        });
  </script>
</head>

</head>
<body>
    <p>Карта Москвы</p>
    <div id="first_map" style="width:400px; height:300px"></div>
    <p>Карта Санкт-Петербурга</p>
    <p style="width:400px; height:200px"></p>
</body>
</html>