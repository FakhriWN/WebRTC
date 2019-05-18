// this object is used to get uniquie rooms based on this demo
// i.e. only those rooms that are created on this page
(function() {
    var params = {},
        r = /([^&=]+)=?([^&]*)/g;
    function d(s) {
        return decodeURIComponent(s.replace(/\+/g, ' '));
    }
    var match, search = window.location.search;
    while (match = r.exec(search.substring(1))){
        params[d(match[1])] = d(match[2]);
    }
    console.log(params);
    window.params = params;
})();

var connection = new RTCMultiConnection();
connection.socketURL ='/';
// connection.socketURL = 'https://rtcmulticonnection.herokuapp.com:443/';
/// make this room public
connection.publicRoomIdentifier = 'dashboard';
connection.socketMessageEvent = 'dashboard';
// keep room opened even if owner leaves
connection.autoCloseEntireSession = true;
connection.connectSocket(function(socket) {
    socket.on('disconnect', function() {
        location.reload();
    });
});
// document.getElementById('session-id').addEventListener('change',cekRuangan);
//Cek session id


// function cekRuangan(){
//     var roomid = document.getElementById('session-id').value;
//     connection.checkPresence(roomid, function(isRoomExist) {
//         if (isRoomExist === true) {
//             document.getElementById('btn-submit').disabled = true;
//             alertBox('This room-id is already taken and room is active. Please join instead.', 'Room ID In Use');
//             alert('This room-id is already taken and room is active. Please take another.');
//             return;
//         }    
//         document.getElementById('btn-submit').disabled = false;
//     });
// }
function getDataForm(){
    var sessionId = document.getElementById('session-id');
    var PRI = document.getElementById('PRI');
    if(params.sessionid){
        sessionId.value = params.sessionid;
    }else{
        sessionId.value = connection.token();
        document.getElementById('cek').addEventListener('click',function(){
            alert('good');
        });
    }
    PRI.value = connection.publicRoomIdentifier;
}
getDataForm();
function alertBox(message, title, specialMessage, callback) {
    callback = callback || function() {};
    $('.btn-alert-close').unbind('click').bind('click', function(e) {
        e.preventDefault();
        $('#alert-box').modal('hide');
        $('#confirm-box-topper').hide();
        callback();
    });
    $('#alert-title').html(title || 'Alert');
    $('#alert-special').html(specialMessage || '');
    $('#alert-message').html(message);
    $('#confirm-box-topper').show();
    $('#alert-box').modal({
        backdrop: 'static',
        keyboard: false
    });
}
function confirmBox(message, callback) {
    $('#btn-confirm-action').html('Confirm').unbind('click').bind('click', function(e) {
        e.preventDefault();
        $('#confirm-box').modal('hide');
        $('#confirm-box-topper').hide();
        callback(true);
    });
    $('#btn-confirm-close').html('Cancel');
    $('.btn-confirm-close').unbind('click').bind('click', function(e) {
        e.preventDefault();
        $('#confirm-box').modal('hide');
        $('#confirm-box-topper').hide();
        callback(false);
    });
    $('#confirm-message').html(message);
    $('#confirm-title').html('Please Confirm');
    $('#confirm-box-topper').show();
    $('#confirm-box').modal({
        backdrop: 'static',
        keyboard: false
    });
}
