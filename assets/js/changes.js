$(document).ready(function() {
  game = JSON.parse(localStorage.getItem(storage_location));
  if(game != null) {
    console.log(game.history[game.history.length-1].date);
    if(1644413540627 > new Date(game.history[game.history.length-1].date).valueOf()) {
      Update();
      console.log("posodobitev");
    }
    else {
      console.log("ni posodobitve");
    }

  }
});

function Update() {
  if(game.history[game.history.length-1].status == "started") {
    game.history.push({"date": new Date(), "status": "opend"});
    game.tile = [];
    SaveGame();
    $("#modal-update .modal-title").html("Posodobitev");
    $("#modal-update .modal-body").html("V preteklem času je prišlo do posodobitve besede dneva zaradi dela na strežniku. Iskano besedo smo zamenjali, prav tako pa smo Vam povrnili tudi vaše poskuse. <br> Za nevšečnosti se opravičujemo. <br> Hvala");
    $("#modal-update").modal("show");
  }
}
