// ==UserScript==
// @name         OC Notify
// @version      0.3
// @description  Shows when your OC is ready in the 'Travel Agency' and prevents you from flying when it's close.
// @author       Pi77Bull[2082618]
// @match        *.torn.com/travelagency.php
// @grant        none
// ==/UserScript==

let info = $(".right-round");
let styleButton = document.createElement("style");
let timeLeftCount;
styleButton.type = "text/css";
styleButton.innerHTML = ".ocnbtn { float:right; background-color: #4CAF50; border: none; color: white; padding: 0px 8px 0px; text-align: center; text-decoration: none; display: inline-block; font-size: 16px; margin: -5px -4px 2px; -webkit-transition-duration: 0.4s; transition-duration: 0.4s; cursor: pointer; } .ocnbtnSettings { background-color:white; color:black; border:2px solid #555555; border-radius: 12px; } .ocnbtnSettings:hover { background-color: #555555; color: white; }";
document.getElementsByTagName("head")[0].appendChild(styleButton);

(function () {
    if (localStorage.getItem("ocnotify") && JSON.parse(localStorage.getItem("ocnotify")).apikey && JSON.parse(localStorage.getItem("ocnotify")).playerid) {
        showCrime();
    } else {
        showApiInput();
    }
})();

function showCrime() {
    showButtons();
    getCrimes(function (data) {
        let found = false;
        let timeLeft;
        let readyDate;
        let id = JSON.parse(localStorage.getItem("ocnotify")).playerid;
        $.each(data, function (key1, val1) {
            $.each(val1.participants, function (key2, val2) {
                if (!data[key1].initiated && key2 == id) {
                    found = true;
                    readyDate = new Date(new Date().getTime() + data[key1].time_left * 1000);
                    timeLeft = Math.round((readyDate - new Date()) / 1000);
                }
            });
        });

        if (found) {
            timeLeftCount = setInterval(function () {
                if (timeLeft > 0) {
                    info.text("Your organized crime will be ready in " + formatSeconds(timeLeft));
                } else {
                    info.text("Your organized crime is ready");
                }

                if (timeLeft / 60 < JSON.parse(localStorage.getItem("ocnotify")).travelprevent && $(".travel-agency").css("display") != "none" && !$(".travel-agency").attr("class").includes("travelanyway")) {
                    $(".travel-agency").css("display", "none");
                    showTravelAnyway();
                }
                if (timeLeft == 0) {
                    clearInterval(timeLeftCount);
                }

                timeLeft = Math.round((readyDate - new Date()) / 1000);
            }, 1000);
        } else {
            info.text("You're currently not participating in an organized crime");
        }
    });
}

function showTravelAnyway() {
    $("<div id='thugLife' style='font-size:18px; text-align:center;'><span>Your OC is (almost) ready.</span><br><span>Do you want to <span style='color:blue; cursor:pointer;'>travel anyway</span>?</span></div>").insertAfter(".travel-agency");

    $("#thugLife > span > span").on("click", function () {
        $(".travel-agency").addClass("travelanyway");
        $(".travel-agency").css("display", "block");
        $("#thugLife").remove();
        $("#thugLife").remove(); //someone please tell me why this line has to be executed twice to work
    });
}

function showButtons() {
    $("<a id='ocnbtnLogout' role='button' class='t-clear h c-pointer  m-icon line-h24 right last'><span class='icon-wrap'><i class='top-page-icon'></i></span><span> OCN Logout</span></a>").insertBefore("#top-page-links-list > .links-footer");
    $("<a id='ocnbtnSettings' role='button' class='t-clear h c-pointer  m-icon line-h24 right last'><span class='icon-wrap'><i class='top-page-icon'></i></span><span> OCN Settings</span></a>").insertBefore("#top-page-links-list > .links-footer");

    $("#ocnbtnSettings").on("click", function () {
        let newtravelprevent = prompt("Prevent travelling when OC time is less then [...] minutes:", JSON.parse(localStorage.getItem("ocnotify")).travelprevent);
        if (newtravelprevent) {
            let obj = JSON.parse(localStorage.getItem("ocnotify"));
            obj.travelprevent = newtravelprevent;
            localStorage.setItem("ocnotify", JSON.stringify(obj));
        }
    });
    $("#ocnbtnLogout").on("click", function () {
        clearInterval(timeLeftCount);
        localStorage.removeItem("ocnotify");
        $(".travel-agency").css("display", "block");
        showApiInput();
        removeButtons();
    });
}

function removeButtons() {
    $("#ocnbtnSettings").remove();
    $("#ocnbtnLogout").remove();
}

function showApiInput() {
    info.html("<input id='ocnapikey' style='border:solid 1px black; text-align:center; height:24px;' type='text' placeholder='Enter API-Key'><button id='ocnbtnSave' type='button'>Save</button>");
    $("#ocnbtnSave").on("click", function () {
        saveInformation();
    });
}

function saveInformation() {
    let ocnotify = localStorage.getItem("ocnotify");
    if (ocnotify) {
        let travelprevent = JSON.parse(localStorage.getItem("ocnotify")).travelprevent;
    }

    getID($("#ocnapikey").val(), function (playerid) {
        let obj = {
            "apikey": $('#ocnapikey').val(),
            "playerid": playerid,
            "travelprevent": ocnotify ? (travelprevent ? travelprevent : "1440") : "1440"
        };
        localStorage.setItem("ocnotify", JSON.stringify(obj));
        showCrime();
    });
}

function getCrimes(callback) {
    $.getJSON("https://api.torn.com/faction/?selections=crimes&key=" + JSON.parse(localStorage.getItem("ocnotify")).apikey, function (data) {
        if (data.error) {
            showApiInput();
        } else {
            callback(data.crimes);
        }
    });
}

function getID(apikey, callback) {
    $.getJSON("https://api.torn.com/user/?selections=basic&key=" + apikey, function (data) {
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