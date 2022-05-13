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
class P{

}


/*
self:: всегда указывает на тот класс, в котором оно объявлено
parent:: указывает на текущего родителя
static:: на класс в котором он по факту будет вызван с учетом всех наследований
*/

class A extends P{
  public static function getValSelf()
  {
    return new self();
  }

  public static function getValStatic()
  {
    return new static();
  }

  public static function getValParent()
  {
    return new parent();
  }
}

Class B extends A {
    public static function getValParent()
  {
    return new parent();
  }
}

var_dump(get_class(B::getValSelf())); // 'A'
var_dump(get_class(B::getValStatic())); // 'B'
var_dump(get_class(B::getValParent())); // 'B'
?>

 </body>
</html>