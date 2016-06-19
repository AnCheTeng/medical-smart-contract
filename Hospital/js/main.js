// var url = "http://140.112.41.157:5678";
var url = ""
var InfoArray = [""];
var currentView = 0;
var viewDate = "No. ";

$(document).ready(function() {

  var changeView = function() {
    $("#view-content").text(InfoArray[currentView]);
    $("#date").text(viewDate + currentView);
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
      $.get(url + "/medicineAPI/getMedicine/" + msgType, (response) => {
        console.log(response);
        response = response.replace(/\'/g, '"');
        InfoArray = JSON.parse(response);
        currentView = 0;
        changeView();
        swal("Get prescription!", "", "success");
      });
    });
  };

  $('#notEmptyForm').validate({
    rules: {
      medicineinfo: {
        required: true,
        minlength: 10,
      }
    },
    highlight: function(element) {
      $(element).closest('.control-group').removeClass('success').addClass('error');
      $('#submit').prop('disabled', true);
    },
    success: function(element) {
      element.text('OK!').addClass('valid').closest('.form-group').removeClass('input-validation-error').addClass('success');
      $('#submit').prop('disabled', false);
    }
  });

  $("#submit").on('click', function() {
    var OP_RETURN = $("textarea").val();
    if (OP_RETURN != "") {
      swal({
        title: "Send to Gcoin Blockchain?",
        text: OP_RETURN,
        type: "warning",
        showCancelButton: true,
        confirmButtonColor: "#DD6B55",
        confirmButtonText: "Yes, send it!",
        closeOnConfirm: false,
        closeOnCancel: false,
        showLoaderOnConfirm: true,
      }, function(isConfirm) {
        if (isConfirm) {
          $.get(encodeURI(url + "/medicineAPI/setMedicine/" + OP_RETURN), (response) => {
            console.log(response);
            swal("Send to Gcoin Blockchain!","", "success");
            $("textarea").val("");
            $('#submit').prop('disabled', true);

            $.get(encodeURI(url + "/medicineAPI/mint/4/2"), (response) => {console.log(response);});
            $.get(encodeURI(url + "/medicineAPI/mint/1/1"), (response) => {console.log(response);});

          });
          // swal("Deleted!", "Your imaginary file has been deleted.", "success");
        } else {
          swal("Cancelled", "Your imaginary file is safe :)", "error");
        }

      });
    } else {
      sweetAlert("Oops...", "Diagnose cannot be empty!", "error");
    }
  });

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
      currentView = InfoArray.length - 1;
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
})
