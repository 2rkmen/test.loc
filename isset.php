<?php 
$arMain = array(3);
$arDuplicates = array(1,2,3);

if(isset($arMain[0])){
	echo 'arMain is set<br>';
}

if(!empty($arDuplicates)){
	echo 'arDuplicates not empty<br>';
}

if(isset($arMain[0]) && !empty($arDuplicates)){
	echo 'not empty and main set';
}

?>