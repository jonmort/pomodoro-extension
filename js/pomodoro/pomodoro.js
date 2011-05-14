/**
 * The main pomodoro module adds pomodoro support to JIRA and Confluence.
 *
 * @context atl.general
 */
var $ = require('speakeasy/jquery').jQuery,
  tick, alarm, crank, running,
  t, messageTimeout,
  pomodoroStage,
  notification,
  start;
  
var storage;
	try {
		// this is to fool the module system and load the extension even though the module doesn't exist.
		var aoso = 'aoso/storage';
		storage = require(aoso);
		console.log(storage);
	} catch(e) {
	  console.log(e);
		storage = localStorage;
		console.log('localsStorage');
	}

console.log(require);
$(document).ready(function() {
  var AJS = window.AJS;

  var dialogConfigure = function(contents) {
    contents.append('<div><form class="aui">' +
            '<h4>Pomodoro Settings</h4>' +
            '<fieldset><label for="pomodoro-time">Time (min)</label>' +
            '<input id="pomodoro-time" type="text" value="' + length() + '" >' +
            '<br/>' +
            '<label for="pomodoro-tick">Play Ticking</label>' +
            '<input id="pomodoro-tick" type="checkbox" ' + (playTicking() ? "checked" : "") + ' >'+
            '</fieldset></form></div>');
    dialogConfigure = function(contents){};
  }
  
  window.AJS.InlineDialog($('.pomodoro-config-web-item'), "pomodoro-configure", function(contents, trigger, showPopup) {
    dialogConfigure(contents);
    showPopup();
  });
  
  tick = $('<audio id="tick-sound" src="http://www.soundjay.com/clock/sounds/clock-ticking-4.mp3" loop>');  
  alarm = $('<audio id="alarm-sound" src="http://www.soundjay.com/clock/sounds/alarm-clock-1.mp3">');
  crank = $('<audio id="wind-sound" src="http://www.soundjay.com/clock/sounds/crank-2.mp3">');

  crank.bind('ended', function(event) {
    if (playTicking()) {
      tick[0].play();
    }
  });

});

$('.pomodoro-start-web-item').live('click', function(event) {
  event.preventDefault();
  pomodoroStage();
});

$('.pomodoro-stop-web-item').live('click', function(event) {
  event.preventDefault();
  pomodoroEnd();
}); 

$('#pomodoro-time').live('change', function(event) {
  storage.setItem('pomodoro-length', $(event.target).val());
});  

$('#pomodoro-tick').live('change', function(event) {
  storage.setItem('pomodoro-tick', event.target.checked);
});  

function play(sound) {
  sound[0].play();
}

function pause(sound) {
  sound[0].pause();
}

function startPomodoro(){
  var mins = length();
  $(document).trigger('pomodoro-start');
  play(crank);
  $('.pomodoro-start-web-item').text('Stop Pomodoro');
  t = setTimeout(endPomodoro, mins * 60 * 1000);
  pomodoroStage = endPomodoro;
}

function endPomodoro() {
  $(document).trigger('pomodoro-stop'); 
  pause(tick);
  alarm[0].currentTime=5;
  play(alarm);
  $('.pomodoro-start-web-item').text('Start Pomodoro');
  clearTimeout(t);
  pomodoroStage = startPomodoro;
}

pomodoroStage = startPomodoro;

function length() {
  return $('#pomodoro-time').val() || storage.getItem('pomodoro-length') || 25;
}

function playTicking() {
  return localStorage.getItem('pomodoro-tick') == "true";
}

function showMessage(message, timeout) {
  if (window.webkitNotifications) {
    if (window.webkitNotifications.checkPermission() == 0) { // 0 is PERMISSION_ALLOWED
      notification = window.webkitNotifications.createNotification('', 'Pomodoro', message);
      notification.replaceId = 'pomodoro-notification';
      notification.show();
      notification.onclick = function() {
        notification.cancel();
      };
      if (timeout) {
        var localNotification = notification;
        notification.ondisplay = function() {
          setTimeout(function() {
            if (localNotification.cancel) {
              localNotification.cancel();
            }
          }, timeout * 1000);
        }
      }
    } else {
      window.webkitNotifications.requestPermission(function() {
        showMessage(message);
      });
    }
  } else {
    console.log(message);
  }
}

function updateMessage() {
  var now = new Date().getTime();
  var elapsedSeconds = Math.ceil((end - now)/1000);
  if (end - now > 0) {
    var mins = Math.floor(elapsedSeconds/(60));
    var seconds = elapsedSeconds - mins*60;
    showMessage('Time Remaining ' + mins + ':' + seconds, false);
    messageTimeout = setTimeout(updateMessage, 1000);
  }
}

function logWork() {
  $('#log-work').click();
}

$(document).bind('dialogContentReady', function() {
  $('#log-work-time-logged').val((length() + 5) + "m");
});

$(document).bind('pomodoro-start', function(event) {
  showMessage('Starting Pomodoro of length: ' + length() + ' minutes', 10);
  end = new Date().getTime() + (length() * 60 * 1000);
  setTimeout(updateMessage, 1000);
});

$(document).bind('pomodoro-stop', function(event) {
  showMessage('Pomodoro Ended', 30);
  clearTimeout(messageTimeout);
  logWork();
});