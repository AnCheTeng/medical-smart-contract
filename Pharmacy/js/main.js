var url = "http://140.112.41.157:5678";
// var url = ""
var InfoArray = [""];
var currentView = 0;
var viewDate = "No. ";

$(document).ready(function() {

  var changeView = function() {
    $("#view-content").text(InfoArray[currentView]);
    $("#date").text(viewDate+currentView);
  };

  changeView();

  var getMedicine = function(msgType) {
    swal({
      title: "Fetch data from Gcoin",
      text: "Please wait for a few second!",
      type: "info",
      showCancelButton: true,
      closeOnConfirm: false,
      showLoaderOnConfirm: true,
    }, function() {
      $.get(url + "/medicineAPI/getMedicine/"+msgType, (response) => {
        console.log(response);
        response = response.replace(/\'/g, '"');
        InfoArray = JSON.parse(response);
        currentView = 0;
        changeView();
        swal("Get prescription!","", "success");
      });
    });
  };

  $("#history").on('click', function() {
    getMedicine(1);
  });

  $("#remain").on('click', function() {
    getMedicine(3);
  });

  $("#error").on('click', function() {
    getMedicine(2);
  });

  $("#prev").on('click', function() {
    if (currentView > 0) {
      currentView -= 1;
    } else {
      currentView = InfoArray.length-1;
    }
    changeView();
  });

  $("#next").on('click', function() {
    if (currentView < InfoArray.length - 1) {
      currentView += 1;
    } else {
      currentView = 0;
    }
    changeView();
  });

  $("#take").on('click', function() {
    swal({
      title: "Take the prescription from\nGcoin Blockchain?",
      text: "You have to take this medicine after each meal.\nTake one tablet three times a day.\nTake the painkiller only when you need it. ",
      type: "warning",
      showCancelButton: true,
      confirmButtonColor: "#DD6B55",
      confirmButtonText: "Yes, take it!",
      closeOnConfirm: false,
      showLoaderOnConfirm: true,
    }, function() {
      $.get(url + "/medicineAPI/takeMedicine/2/2", (response) => {
        swal("Success! Here is your prescription!", "", "success");
        console.log(response);
      });
      $.get(url + "/medicineAPI/takeMedicine/1/1?sender=pharmacy&receiver=patient", (response) => {
        console.log(response);
      });
    });
  });

  $("#ers").on('click', function() {
    swal({
      title: "Push the prescription error to\nGcoin Blockchain?",
      text: "Please tell the doctor who prescribe the medicine.",
      type: "warning",
      showCancelButton: true,
      confirmButtonColor: "#DD6B55",
      confirmButtonText: "Yes, take it!",
      closeOnConfirm: false,
      showLoaderOnConfirm: true,
    }, function() {
      $.get(url + "/medicineAPI/takeMedicine/1/2", (response) => {
        swal("OK! Complete the error report.", "", "success");
        console.log(response);
      });
      $.get(url + "/medicineAPI/takeMedicine/1/1?sender=pharmacy&receiver=patient", (response) => {
        console.log(response);
      });
    });
  });
})
