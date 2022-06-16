<?php
// Enter your code here, enjoy!
$line = "<script>alert('hello')</script>";

echo $line . '<br>';

echo htmlspecialchars($line) . '<br>';

echo htmlentities($line) . '<br>';
