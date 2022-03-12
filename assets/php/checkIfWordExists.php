<?php

ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

date_default_timezone_set('Europe/London');

$word_exists = false;
$todayWord = "hidden";
$status = "";
$searchWord = $_POST['word'];

function GenerateRadnomNumber() {
  $hash = hash("sha512", date("Y-m-d") . "dodatek k naključnemu faktorju");
  $sumNumber = "";
  for($i = 0; $i < strlen($hash); $i++) {
    if(is_numeric($hash[$i]))
    $sumNumber .= $hash[$i];
  }
  return intval(substr($sumNumber, 0, 15));
}

if(isset($searchWord) && $searchWord != "") {
  // Lowercase reviced word
  $searchWord = strtolower($searchWord);
  $searchWord = str_replace(array('Č', 'Š', 'Ž'), array('č', 'š', 'ž'), $searchWord);

  // Check if word exists
  if(strpos(file_get_contents("../word_list.txt"), $searchWord) == true) {
    $word_exists = true;
  }

  // Find today word
  $todayWordIndex = GenerateRadnomNumber();
  $file = file("../word_list.txt");
  $todayWord = str_replace("\n", "", $file[$todayWordIndex % (count($file) - 2) + 1]);

  // Format for special characters
  $searchWord = preg_split("//u", $searchWord, null, PREG_SPLIT_NO_EMPTY);
  $todayWord = preg_split("//u", $todayWord, null, PREG_SPLIT_NO_EMPTY);

  // Check if how much word is correct
  $status = "";
  for($i = 0; $i < count($todayWord); $i++) {
    if($searchWord[$i] == $todayWord[$i]) {
      $todayWord[$i] = "_";
      $status[$i] = "2";
    }
    else {
      $status[$i] = "0";
    }
  }
  //echo "status: $status<br>";
  for($i = 0; $i < count($todayWord); $i++) {
    if($status[$i] == "2") {
      continue;
    }
    //else if(strpos($todayWord, $searchWord[$i]) > -1) {
    else if(array_search($searchWord[$i], $todayWord) > -1) {
      $status[$i] = "1";
      $todayWord[array_search($searchWord[$i], $todayWord)] = "_";
    }
    else {
      $status[$i] = "0";
    }
    //echo $todayWord . " - " . $searchWord . "<br>";
  }
  if($status != "22222") {
    $todayWord = "hidden";
  }
  if(!$word_exists) {
    $status = "hidden";
  }
}

echo json_encode(array(
  "gotWord" => $searchWord,
  "exists" => $word_exists,
  "word" => $todayWord,
  "status" => $status
));
?>
