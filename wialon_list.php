<?php 

include('wialon.php');
	$wialon_api = new Wialon();

	// old username and password login is deprecated, use token login
	$token = '';
	$result = $wialon_api->login($token);
	$json = json_decode($result, true);

	if(!isset($json['error'])){
		 echo $wialon_api->core_search_items('{"spec":{"itemsType":"avl_unit","propName":"sys_user_creator","propValueMask":"*","sortType":"sys_name","propType":"creatortree"},"force":1,"flags":9217,"from":0,"to":1000}}],"flags":0}');

        echo '<hr>';

        $wialon_api->logout();
	} else {
		echo WialonError::error($json['error']);
	}

//    0x00000001
//Флаг - 0x00000400
//Флаг - 0x00002000

/*
 * "cnm":<uint>,	 счетчик пробега, км или мили
 * "pos":{ - последнее известное местоположение
 *  	"mu":<uint>,	 единицы измерения: 0 - si, 1 - us, 2 - имперская, 3 - метрическая с галлонами
//"nm":<text>,	/* название */
//	"cls":<uint>,	/* ID базового класса "avl_unit" */
//	"id":<uint>,	/* ID объекта */
//	"uacl":<uint>	/* уровень доступа к объекту у текущего пользователя */