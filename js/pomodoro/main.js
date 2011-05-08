/**
 * The main module
 *
 * @context atl.general
 */
var $ = require('speakeasy/jquery').jQuery;



$(document).ready(function() {
  var AJS = window.AJS;
  var tick = $('<audio id="tick-sound" src="http://www.soundjay.com/clock/sounds/clock-ticking-5.mp3" loop>');  
  var alarm = $('<audio id="alarm-sound" src="http://www.soundjay.com/clock/sounds/alarm-clock-1.mp3">');
  var crank = $('<audio id="wind-sound" src="http://www.soundjay.com/clock/sounds/crank-2.mp3">');
  var running = false;
  var t;
  var dialogConfigure = function(contents) {
    contents.append('<label for="pomodoro-time">Time (min)</label>').append('<input id="pomodoro-time" type="text" value="' + length() + '" >');
    dialogConfigure = function(contents){};
  }
  var configureDialog = AJS.InlineDialog($('.pomodoro-config-web-item'), 1, function(contents, trigger, showPopup) {
    dialogConfigure(contents);
    
    showPopup();
  }, {noBind: true});
  
  crank.bind('ended', function(event) {
    tick[0].play();
  });
  
  function play(sound) {
    sound[0].play();
  }
  
  function pause(sound) {
    sound[0].pause();
  }
  
  function startPomodoro(){
    var mins = length();
    console.log('Starting pomodoro of time: ' + mins);
    play(crank);
    $('.pomodoro-start-web-item').text('Stop Pomodoro');
    running = true;
    t = setTimeout(endPomodoro, 1 * 60 * 1000);
  }
  
  function endPomodoro() {
    running = false;
    pause(tick);
    alarm[0].currentTime=5;
    play(alarm);
    $('.pomodoro-start-web-item').text('Start Pomodoro');
    clearTimeout(t);
  }
  
  function length() {
    return $('#pomodoro-time').val() || localStorage['pomodoro-length'] || 25;
  }
  
  $('.pomodoro-start-web-item').bind('click', function(event) {
    event.preventDefault();
    if (running) {
      endPomodoro();
    } else {
      startPomodoro();
    }
  });
  
  $('.pomodoro-stop-web-item').bind('click', function(event) {
    event.preventDefault();
    pomodoroEnd();
  }); 
  
  $('#pomodoro-time').live('change', function(event) {
    localStorage.setItem('pomodoro-length', length());
  });  
  
  $('.pomodoro-config-web-item').bind('click', function(event) {
    event.preventDefault();
    configureDialog.show();
  });
});