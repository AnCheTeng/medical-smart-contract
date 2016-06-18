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
        closeOnConfirm: false
      }, function() {
        swal("Send to Gcoin Blockchain!", "Your diagnosis has been sent!", "success");
        $("textarea").val("");
        $('#submit').prop('disabled', true);
      });
    } else {
      sweetAlert("Oops...", "Diagnose cannot be empty!", "error");
    }

  });

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
})
