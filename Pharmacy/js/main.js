var histArray = ["An apple a day keeps you away", "Medicine-History-1", "Medicine-History-2", "Medicine-History-3", ]
var remArray = ["Medicine-recipe-1", "Medicine-recipe-2", "Medicine-recipe-3", "Medicine-recipe-4", "Medicine-recipe-5"];
var errArray = ["Error-1", "Error-2", "Error-3", "Error-4", "Error-5"];

var InfoArray = histArray;
var currentView = 0;
var viewDate = "Date";

$(document).ready(function() {

  var changeView = function() {
    $("#view-content").text(InfoArray[currentView]);
    $("date").text(viewDate);
  };

  changeView();

  $("#history").on('click', function() {
    InfoArray = histArray;
    currentView = 0;
    changeView();
  });

  $("#remain").on('click', function() {
    InfoArray = remArray;
    currentView = 0;
    changeView();
  });

  $("#error").on('click', function() {
    InfoArray = errArray;
    currentView = 0;
    changeView();
  });

  $("#prev").on('click', function() {
    if (currentView > 0) {
      currentView -= 1;
    }
    changeView();
  });

  $("#next").on('click', function() {
    if (currentView < InfoArray.length - 1) {
      currentView += 1;
    }
    changeView();
  });

  $("#take").on('click', function() {
    swal({
      title: "Take the prescription from Gcoin Blockchain?",
      text: "You have to take this medicine after each meal.\nTake one tablet three times a day.\nTake the painkiller only when you need it. ",
      type: "warning",
      showCancelButton: true,
      confirmButtonColor: "#DD6B55",
      confirmButtonText: "Yes, take it!",
      closeOnConfirm: false
    }, function() {
      swal("Success!", "Here is your prescription!", "success");
      $("#remain").trigger('click');
    });
  });
})
