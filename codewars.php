<?php

function solution($number){
    $result = 0;
    $i = 0;
    while($i < $number){
        if(($i % 3 === 0) || $i % 5 === 0){
            $result += $i;
            echo $i . '<br>';
        }
        $i++;
    }
    return $result;
}

echo(solution(20));