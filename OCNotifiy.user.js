// ==UserScript==
// @name         OC Notify
// @version      0.1
// @description  Shows when your OC is ready in the 'Travel Agency' and prevents you from flying on the day it is due.
// @author       Pi77Bull[2082618]
// @match        *.torn.com/travelagency.php
// @grant        none
// ==/UserScript==

let info = $(".right-round");

(function() {
    if (localStorage.getItem("ocnotify") && JSON.parse(localStorage.getItem("ocnotify")).apikey && JSON.parse(localStorage.getItem("ocnotify")).playerid) {
        showCrime();
    } else {
        showApiInput();
    }
})();

function showCrime() {
    getCrimes(function(data) {
        let found = false;
        let timeLeft = -1;
        let id = JSON.parse(localStorage.getItem("ocnotify")).playerid;
        $.each(data, function(key1, val1) {
            $.each(val1.participants, function(key2, val2) {
                if (!data[key1].initiated && key2 == id) {
                    found = true;
                    timeLeft = data[key1].time_left;
                }
            });
        });
        if (found) {
            if (timeLeft > 0) {
                info.text("Your organized crime will be ready in " + formatSeconds(data[key1].time_left));
            } else {
                info.text("Your organized crime is ready");
            }
            if (timeLeft <= 86400) {
                $(".travel-agency").css("display", "none");
            }
        } else {
            info.text("You're currently not participating in an organized crime");
        }
    });
}

function showApiInput() {
    info.html("<input id='apikey' style='border:solid 1px black; text-align:center; height:24px;' type='text' placeholder='Enter API-Key'><button id='btnSave' type='button'>Save</button> ");
    $("#btnSave").on("click", function() {
        saveInformation();
    });
}

function saveInformation() {
    getID($("#apikey").val(), function(playerid) {
        let obj = {
            "apikey":$('#apikey').val(),
            "playerid":playerid
        };
        localStorage.setItem("ocnotify", JSON.stringify(obj));
        showCrime();
    });
}

function getCrimes(callback) {
    $.getJSON("https://api.torn.com/faction/?selections=crimes&key=" + JSON.parse(localStorage.getItem("ocnotify")).apikey, function(data) {
        if (data.error) {
            showApiInput();
        } else {
            callback(data.crimes);
        }
    });
}

function getID(apikey, callback) {
    $.getJSON("https://api.torn.com/user/?selections=basic&key=" + apikey, function(data) {
        if (data.error) {
            alert("Invalid API key");
        } else {
            callback(data.player_id);
        }
    });
}

function formatSeconds(s) {
  var days = Math.floor(s / 86400);
  var hours = Math.floor((s - (days * 86400)) / 3600);
  var minutes = Math.floor((s - (days * 86400) - (hours * 3600)) / 60);
  var seconds = s - (days * 86400) - (hours * 3600) - (minutes * 60);

  if (days != 0 && hours < 10) {
    hours = "0" + hours;
  }
  if (hours != 0 && minutes < 10) {
    minutes = "0" + minutes;
  }
  if (minutes != 0 && seconds < 10) {
    seconds = "0" + seconds;
  }

  if (days == "00") {
    if (hours == "00") {
      if (minutes == "00") {
        return seconds + 's';
      } else {
        return minutes + 'm ' + seconds + 's';
      }
      return minutes + 'm ' + seconds + 's';
    } else {
      return hours + 'h ' + minutes + 'm ' + seconds + 's';
    }
    return hours + 'h ' + minutes + 'm ' + seconds + 's';
  } else {
    return days + 'd ' + hours + 'h ' + minutes + 'm ' + seconds + 's';
  }
};