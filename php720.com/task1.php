<?php
$content['pageTitle'] = 'Найти сумму цифр числа';
$content['postTitle'] = 'Найти сумму цифр числа';
$content['date'] = '2021.10.27';
$content['author'] = '2rkmen';
$content['text'] =  <<<END
<b>https://php720.com/task/1</b>
<p>Вам нужно разработать программу, которая считала бы сумму цифр числа введенного пользователем.
Например: есть число 123, то программа должна вычислить сумму цифр 1, 2, 3, т. е. 6.</p>
<p>По желанию можете сделать проверку на корректность введения данных пользователем.</p>
END;;

include('../template/head.php');

if(empty($_POST['number'])){
    echo <<<END
<form action="" method="post">
<input type="text" name="number" required class="form-control">
<input type="submit" value="отправить">
<input type="submit" name="reset" value="reset">
</form>
END;

}

$number = $_POST['number'];
//echo $number;
$arNumbers = str_split($number, 1);
$result = 0;

foreach ($arNumbers as $arNumber) {
    $result += $arNumber;
}

echo '<p>' . $result . '</p>';

include('../template/footer.php');