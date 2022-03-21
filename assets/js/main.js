let game, currentWord;

let storage_location = "wordle-storage";

let statusColor = ["#9D9D9D", "#FCF05C", "#008F50"];
let statusTextColor = ["white", "black", "white"];
let statusBorderColor = ["#5e5e5e", "#bfb643", "#005e35"];

var keyboardChars = ["qwertzuiopš", "asdfghjklčž", "yxcvbnm"]; // Slovenska tipkovnica
// var keyboardChars = ["qwertzuiop", "asdfghjkl", "yxcvbnm"]; // Slovenska tipkovnica (brez šumnikov)

$(document).ready(function() {
  // Game Tile Initalisation
  var gameTile = "";
  for(i = 0; i < 6; i++) {
    gameTile += "<div class='row" + i + "'>"
    for(k = 0; k < 5; k++) {
      gameTile += "<div class='col" + k + "'></div>";
    }
    gameTile += "</div>";
  }
  $(".game").html(gameTile);

  // Keyboard Initalisation
  var keyboard = "";
  keyboardChars.forEach(function(item, index) {
    keyboard += "<div class='row" + index + "'>";
    keyboard += (index == 2) ? "<button class='specialKey' data-specialKey='enter' onClick='PressedCheck(this)'><i class='fas fa-check'></i></button>" : "";
    for(i = 0; i < item.length; i++) {
      keyboard += "<button type='button' onClick='PressedKey(this)'>" + item[i].toUpperCase() + "</button>";
    }
    keyboard += (index == 2) ? "<button class='specialKey' data-specialKey='backspace' onClick='PressedErase(this)'><i class='fas fa-backspace'></i></button>" : "";
    keyboard += "</div>";
  });
  $(".keyboard").html(keyboard);

  // Game Storage Initialisation
  game = JSON.parse(localStorage.getItem(storage_location));
  if(game === null) {
    game = new Object();
    game.tile = [];
    game.history = [];
    SaveGame();
  }

  if(!IfDateInHistory(new Date())) {
    game.history.push({"date": new Date(), "status": "opend"});
    game.tile = [];
    SaveGame();
  }

  console.log(game);
  game.tile.forEach(function(item, index) {
    $(".game .row" + Math.floor(index / 5) + " .col" + (index % 5)).html(item.char);
    $(".game .row" + Math.floor(index / 5) + " .col" + (index % 5)).css({
      "background-color": statusColor[parseInt(item.status)],
      "border-color": statusBorderColor[parseInt(item.status)],
      "color": statusTextColor[parseInt(item.status)]
    });
    ColorButton(item.char, item.status);
  });

  // copy result to clipboard for discord
  $("#copy-today-result-discord").click(function() {
    var copyString = "Today Wordle Slovenia 🇸🇮 Result:\n";
    game.tile.forEach((item, i) => {
      if(item.status == "0")
        copyString += ":white_large_square:";
      else if(item.status == "1")
        copyString += ":yellow_square:";
      else if(item.status == "2")
        copyString += ":green_square:";
      if((i+1) % 5 == 0)
        copyString += "\n";
    });
    copyString += "\nPlay on http://aleks.rf.gd/wordle/";
    CopyToClipboard(copyString);
    console.log("Kopiranje izvedeno.");
  });

  // copy result to clipboard for messenger
  $("#copy-today-result-messenger").click(function() {
    var copyString = "Today Wordle Slovenia 🇸🇮 Result:\n";
    game.tile.forEach((item, i) => {
      if(item.status == "0")
        copyString += "💣";
      else if(item.status == "1")
        copyString += "🤔";
      else if(item.status == "2")
        copyString += "💚";
      if((i+1) % 5 == 0)
        copyString += "\n";
    });
    copyString += "\nPlay on http://aleks.rf.gd/wordle/";
    CopyToClipboard(copyString);
    console.log("Kopiranje izvedeno.");
  });

  // Current Word Initialisation
  currentWord = "";

  // Add space for keyboard
  ChangeKeyboardSpace();

  // Add color to help
  for(i = 0; i < 3; i++) {
    $(".help-color-" + i).css({
      "background-color": statusColor[i],
      "color": statusTextColor[i],
    });
    $(".help-color-" + i + " i").css({
      "color": statusBorderColor[i]
    });
  }

  // Real Keyboard Click
  $(document).keyup(function(key) {
    var pressedKey = key.originalEvent.key.toUpperCase()
    if(keyboardChars[0].toUpperCase().includes(pressedKey) ||
       keyboardChars[1].toUpperCase().includes(pressedKey) ||
       keyboardChars[2].toUpperCase().includes(pressedKey)) {
         SimulatePressedKey("button:contains('" + pressedKey + "')");
         $("button:contains('" + pressedKey + "')").click(PressedKey({textContent: pressedKey}));
    }
    else if(pressedKey == "ENTER") {
      console.log("enter");
      SimulatePressedKey("button[data-specialKey='enter']");
      $("button[data-specialKey='enter']").click(PressedCheck());
    }
    else if(pressedKey == "BACKSPACE") {
      console.log("backspace");
      SimulatePressedKey("button[data-specialKey='backspace']");
      $("button[data-specialKey='backspace']").click(PressedErase());
    }
    else {
      console.log(key);
    }
  });
});

function SaveGame() {
  localStorage.setItem(storage_location, JSON.stringify(game));
}

function PressedKey(key) {
  SimulatePressedKey(key);
  if(currentWord.length < 5 &&
        game.tile.length < 30 &&
        (game.history[game.history.length-1].status == "started" || game.history[game.history.length-1].status == "opend")) {
    console.log(key.textContent);
    var rowIndex = Math.floor((game.tile.length / 5));
    console.log(".game .row" + rowIndex + " .col" + currentWord.length);
    $(".game .row" + rowIndex + " .col" + currentWord.length).html(key.textContent);
    currentWord += key.textContent;
  }
  $(':focus').blur();
}

function FalseTry() {
  var rowIndex = Math.floor((game.tile.length / 5));
  $(".game .row" + rowIndex + " div").css("animation", "shake-effect 0.5s");
  setTimeout(function() {
    $(".game .row" + rowIndex + " div").css("animation", "");
  }, 500);
}

function PressedCheck(key) {
  SimulatePressedKey(key);
  if(currentWord.length < 5) {
    FalseTry();
  }
  else {
    game.history[game.history.length-1].status = "started";

    $.ajax({
      type: "POST",
      data: { word: currentWord },
      url: "assets/php/checkIfWordExists.php",
      success: function(result) {
        var check = JSON.parse(result)
        console.log(check);

        if(check.exists == true) {
          var rowIndex = Math.floor((game.tile.length / 5));
          if(check.status == "22222") {
            console.log("to se ne sme zgoditi");
            game.history[game.history.length-1].status = "won";
          }

          for(i = 0; i < 5; i++) {
            game.tile[game.tile.length] = {
              char: currentWord[i],
              status: check.status[i]
            };
            $(".game .row" + rowIndex + " .col" + i).css({
              "background-color": statusColor[parseInt(check.status[i])],
              "border-color": statusBorderColor[parseInt(check.status[i])],
              "color": statusTextColor[parseInt(check.status[i])]
            });
            ColorButton(currentWord[i], check.status[i]);
          }
          currentWord = "";
          SaveGame();
        }
        else {
          FalseTry();
        }

        // Check for win
        if(game.history[game.history.length-1].status == "won") {
          GameEnd(true);
          console.log("klic 1");
        }
        else if(game.tile.length >= 30) {
          GameEnd(false);
          console.log("klic 2");
        }
      },
      error: function() {
        console.log("error");
      }
    });
  }
  $(':focus').blur();
}

function PressedErase(key) {
  SimulatePressedKey(key);
  if(currentWord.length > 0) {
    var rowIndex = Math.floor((game.tile.length / 5));
    currentWord = currentWord.slice(0, -1);
    $(".game .row" + rowIndex + " .col" + currentWord.length).html("");
    console.log("new word: " + currentWord);
  }
  $(':focus').blur();
}

function IfDateInHistory(date) {
  var found = false;
  game.history.forEach(function(item, index) {
    // console.log(date.toISOString());
    // console.log(item.date);
    if(item.date.split('T')[0] == date.toISOString().split('T')[0]) {
      found = true;
    }
  });
  return found;
}

$( window ).resize(function() {
  ChangeKeyboardSpace();
});

function ChangeKeyboardSpace() {
  $(".keyboard-space").css({
    "height": $(".keyboard").outerHeight()
  });

  if($(window).innerHeight() > ($(window).innerWidth() * 2) || $(window).innerHeight() > 640) {
    var gameHeight = $(window).innerHeight() - $(".navbar-background").outerHeight() - $(".keyboard").outerHeight() - 24;
    $(".game").css({
      "max-height": gameHeight,
      "max-width": gameHeight / 6 * 5
    });
  }
}

function ColorButton(button, status) {
  if($("button:contains('" + button + "')").attr("data-status") == null ||
      parseInt($("button:contains('" + button + "')").attr("data-status")) < parseInt(status)) {
    $("button:contains('" + button + "')").css({
      "background-color": statusColor[parseInt(status)],
      "border-color": statusBorderColor[parseInt(status)],
      "color": statusTextColor[parseInt(status)]
    });
    $("button:contains('" + button + "')").attr("data-status", status);
  }
}

function GameEnd(won) {
  console.log("Game ended: " + won);
  if(won) {
    $("#modal-gameEnd .modal-title").html("Zmaga");
    $("#modal-gameEnd .modal-body").html("<img src='assets/img/trophy.svg' style='max-height: 200px; margin: auto; width: 100%;'><br>Čestitamo, našli ste iskano besedo dneva. Naslednjo besedo dneva lahko greste iskat že jutri.");
    $("#modal-gameEnd").modal("show");
  }
  else {
    $("#modal-gameEnd .modal-title").html("Poraz");
    $("#modal-gameEnd .modal-body").html("<img src='assets/img/sad.svg' style='max-height: 200px; margin: auto; width: 100%;'><br>Porabili ste vse možne poskuse in niste našli iskane besede dneva. <br><br> Več sreče prihodnjič.");
    $("#modal-gameEnd").modal("show");
  }
}

function SimulatePressedKey(selector) {
  $(selector).addClass("simulate-pressed-key");
  setTimeout(function () {
    $(selector).removeClass("simulate-pressed-key");
  }, 200);
}

function CopyToClipboard(text) {
  navigator.clipboard.writeText(text);
}
