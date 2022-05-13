<!DOCTYPE html>
<html>
<head>
	<meta charset="utf-8">
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<title></title>
</head>
<body>


<?php
$domains = [
'www', 'ekaterinburg', 'nalchik', 'novosibirsk', 'krasnodar', 'cherkessk', 'irkutsk', 'ufa', 'tyumen', 'lensk', 'pyatigorsk', 'maykop', 'orel', 'rostov', 'ulan-ude', 'oktyabrskij', 'yakutsk', 'samara', 'moscow', 'magnitogorsk', 'omsk', 'kazan', 'perm', 'habarovsk', 'mahachkala', 'spb', 'volgograd', 'voronezh', 'orenburg', 'chelny', 'kaluga', 'simferopol', 'yaroslavl', 'tambov', 'nn', 'surgut', 'ivanovo', 'chelyabinsk', 'lipetsk', 'belgorod', 'astrahan', 'barnaul', 'krasnoyarsk', 'arhangelsk', 'saratov', 'tver', 'tula', 'kemerovo', 'smolensk', 'ryazan', 'vladimir', 'vladikavkaz', 'kirov', 'elista', 'bryansk', 'grozny', 'noyabrsk', 'sochi', 'tomsk', 'ulyanovsk', 'izhevsk', 'cheboksary', 'vologda', 'vladivostok', 'chita', 'novorossiysk', 'volgodonsk', 'kursk', 'penza'];


function getCertInfo($domain){

$url = 'ssl://' . $domain . '.stavtrack.ru:443';

$context = stream_context_create(
	array(
		'ssl' => array(
			'capture_peer_cert' => true,
			'verify_peer'       => false, // Т.к. промежуточный сертификат может отсутствовать,
			'verify_peer_name'  => false  // отключение его проверки.
		)
	)
);

$fp = stream_socket_client($url, $err_no, $err_str, 30, STREAM_CLIENT_CONNECT, $context);
$cert = stream_context_get_params($fp);

if (empty($err_no)) {
	$info = openssl_x509_parse($cert['options']['ssl']['peer_certificate']);
	//print_r($info);
}

echo 'Домен: '   . $info['subject']['CN'] . "\r\n";
echo '<br>Выдан: '   . $info['issuer']['CN'] . "\r\n";
echo '<br>Истекает: ' . date('d.m.Y H:i', $info['validTo_time_t']);

}


foreach($domains as $domain){
	echo '<br>домен ' . $domain . '.stavtrack.ru<br>';
	getCertInfo($domain);

	echo '<hr>';
}

?>
</body>
</html>