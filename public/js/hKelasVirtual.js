var globalVar = {};
(function () {
    var params = {},
        r = /([^&=]+)=?([^&]*)/g;
    function d(s) {
        return decodeURIComponent(s.replace(/\+/g, ' '));
    }
    var match, search = window.location.search;
    while (match = r.exec(search.substring(1))) {
        params[d(match[1])] = d(match[2]);
    }
    console.log(params);
    window.params = params;
})();

var connection = new RTCMultiConnection();
connection.socketURL = '/';
connection.extra.userFullName = kelas.nama; //<%=data.person%> 
/// make this room public
connection.publicRoomIdentifier = kelas.PRI;
connection.socketMessageEvent = 'canvas-dashboard';
// keep room opened even if owner leaves
connection.autoCloseEntireSession = true;
// https://www.rtcmulticonnection.org/docs/maxParticipantsAllowed/
connection.maxParticipantsAllowed = parseInt(kelas.maxPartisipan)+1;
// set value 2 for one-to-one connection
var papanTulisIn = new CanvasDesigner();
var recorder;
var tempDataCanvasLocal = [];
var tempDataCanvasRemote = [];
function kirimDataPapan(data) {
    tempDataCanvasLocal.push(data);
    console.log(tempDataCanvasLocal);
    connection.send(data);
}
function initPapanTulisIn() {
    // you can place widget.html anywhere
    papanTulisIn.widgetHtmlURL = '/canvas-designer/widget.html';
    papanTulisIn.widgetJsURL = '/canvas-designer/widget.js'
    papanTulisIn.addSyncListener(kirimDataPapan);
    btnClear.addEventListener("click", function () {
        papanTulisIn.clearCanvas();
        papanTulisIn.sync();
    });
    papanTulisIn.setSelected('pencil');
    papanTulisIn.setTools({
            pencil: true,
            text: true,
            image: true,
            pdf: true,
            eraser: true,
            line: true,
            arrow: true,
            dragSingle: true,
            dragMultiple: true,
            arc: true,
            rectangle: true,
            quadratic: false,
            bezier: false,
            marker: false,
            zoom: false,
            lineWidth: true,
            colorsPicker: true,
            extraOptions: false,
            code: false,
            undo: false
        });
    var ToolAccess = {
        pencil: true,
        text: true,
        image: false,
        pdf: true,
        eraser: true,
        line: true,
        arrow: true,
        dragSingle: true,
        dragMultiple: true,
        arc: false,
        rectangle: false,
        quadratic: false,
        bezier: false,
        marker: false,
        zoom: false,
        lineWidth: false,
        colorsPicker: true,
        extraOptions: false,
        code: false,
        undo: false
    }
}
if(kelas.open == 'true'){
    console.log(connection.userid);
    kelas.idowner = connection.userid;
}
var link = location.origin + '/kelas/bergabung?sessionid=' + kelas.sessionid+'&idowner='+connection.userid;
$('#btn-generate-link').popover({
    html: true,
    placement: 'top',
    content: '<a id="a-link" href=' + link + ' value=' + link + '>' + link + '</a><br><button class="btn btn-secondary btn-sm" onclick=copyLink(' + JSON.stringify(link) + ')>Copy</button>'
});
// var btnSync = document.getElementById('sync');
var btnHandsup = document.getElementById('handsup');
var btnStartClass = document.getElementById('btn-start-class');
var btnClear = document.getElementById("clear");
var btnGenerateLink = document.getElementById("btn-generate-link");
var aNamaRuangan = document.getElementById('namaRuangan');
var btnSaveRekam = document.getElementById('btn-download');
var btnGetScreen = document.getElementById('getScreen');
var btnStopRekam = document.getElementById('stopRekam');
var namaFasilitator;

if (kelas.open === 'false') {
    btnHandsup.style.display = "inline";
    namaFasilitator = getFullName(kelas.idowner)
}else{
    namaFasilitator = kelas.nama;
    btnStartClass.style.display = "inline";
    btnGenerateLink.style.display = 'inline';
    btnSaveRekam.style.display = 'inline';
    btnClear.style.display = 'inline';
}
btnHandsup.addEventListener('click', function () {
    connection.send({
        id: connection.userid,
        type: "atensi"
    });
});
function MulaiRekam() {
    if(typeof RecordRTC_Extension === 'undefined') {
        alert('RecordRTC chrome extension belum aktif atau belum terinstall.');
        return;
    }
    recorder = new RecordRTC_Extension();
    recorder.startRecording({
        enableScreen: true,
        enableMicrophone: true,
        enableSpeakers: true
    });
    btnGetScreen.style.display = 'none';
    btnStopRekam.style.display = 'inline';
}
function StopRekam() {
    recorder.stopRecording(function (blob) {
        btnGetScreen.style.display = 'inline';
        btnStopRekam.style.display = 'none';
        console.log(blob.size, blob);
        var d = new Date(connection.extra.waktuMulai);
        var filename = d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate() + '_' + d.getHours() + '-' + d.getMinutes() + '_' + kelas.namaRuangan + '_' + namaFasilitator;
        var url = URL.createObjectURL(blob);
        btnSaveRekam.href = url;
        btnSaveRekam.style.cursor = 'pointer';
        btnSaveRekam.download = filename;
    });
}
btnGetScreen.addEventListener('click', MulaiRekam);
btnStopRekam.addEventListener('click', StopRekam);

//Fakhri Waliyyuddin Nugraha
btnStartClass.addEventListener('click',function() {
    connection.extra.waktuMulai = new Date();
    connection.extra.waktuBerakhir = connection.extra.waktuMulai;
    connection.extra.waktuBerakhir.setMinutes(connection.extra.waktuMulai.getMinutes() + connection.extra.durasi)
    run_clock('clockdiv', connection.extra.waktuBerakhir, true);
    connection.extra.timer = true;
    connection.updateExtraData();
    connection.send({
        type: 'timer',
        waktuMulai : connection.extra.waktuMulai
    });
});
function captureScreen(callback) {
    invokeGetDisplayMedia(function(screen) {
        addStreamStopListener(screen, function() {
            if(window.stopCallback) {
                window.stopCallback();
            }
        });
        callback(screen);
    }, function(error) {
        console.error(error);
        alert('Unable to capture your screen. Please check console logs.\n' + error);
    });
}
function invokeGetDisplayMedia(success, error) {
    var displaymediastreamconstraints = {
        video: {
            displaySurface: 'monitor', // monitor, window, application, browser
            logicalSurface: true,
            cursor: 'always' // never, always, motion
        }
    };
    displaymediastreamconstraints = {
        video: true
    };
    if(navigator.mediaDevices.getDisplayMedia) {
        navigator.mediaDevices.getDisplayMedia(displaymediastreamconstraints).then(success).catch(error);
    }
    else {
        navigator.getDisplayMedia(displaymediastreamconstraints).then(success).catch(error);
    }
}

function addStreamStopListener(stream, callback) {
    stream.addEventListener('ended', function() {
        callback();
        callback = function() {};
    }, false);
    stream.addEventListener('inactive', function() {
        callback();
        callback = function() {};
    }, false);
    stream.getTracks().forEach(function(track) {
        track.addEventListener('ended', function() {
            callback();
            callback = function() {};
        }, false);
        track.addEventListener('inactive', function() {
            callback();
            callback = function() {};
        }, false);
    });
}

//Oleh Fakhri Waliyyuddin Nugraha
function giveAccesCanvas(Tools, _callback) {
    console.log('Give Access Canvas');
    console.log(papanTulisIn);
    console.log(papanTulisIn.pointsLength);
    papanTulisIn.destroy();
    papanTulisIn.setTools(Tools);
    papanTulisIn.appendTo(document.getElementById('widget-container'), function () {
        console.log("Append To");
    });
    setTimeout(SyncLocalRemoteCanvas, 1000)
}
function SyncLocalRemoteCanvas() {
    console.log("Sync");
    console.log(tempDataCanvasLocal);
    tempDataCanvasLocal.forEach(function (item) {
        papanTulisIn.syncData(item);
    });
    tempDataCanvasRemote.forEach(function (item) {
        papanTulisIn.syncData(item);
    });
}
// here goes RTCMultiConnection
connection.chunkSize = 16000;
connection.enableFileSharing = true;
connection.session = {
    audio: true,
    video: true,
    data: true
};
connection.sdpConstraints.mandatory = {
    OfferToReceiveAudio: true,
    OfferToReceiveVideo: true
};
connection.iceServers = [{
        'urls': [
            'turn:webrtcweb.com:4455?transport=udp', // restund udp
        ],
        'username': 'muazkh',
        'credential': 'muazkh'
    },
    {
        'urls': [
            'stun:stun.l.google.com:19302',
            'stun:stun.l.google.com:19302?transport=udp',
        ]
    }
];
connection.onUserStatusChanged = function (event) {
    var infoBar = document.getElementById('onUserStatusChanged');
    var names = [];

    infoBar.innerHTML = '';
    connection.getAllParticipants().forEach(function (pid) {
        names.push(pid);
    });
    if (!names.length) {
        names = ['Only You'];
    } else {
        console.log(connection.extra.roomOwner);
        if(typeof connection.extra.roomOwner == 'undefined'){
            console.log('Bukan Owwwwwner');
            //names = [connection.extra.userFullName].concat(names);
            names.push(connection.extra.userFullName);
        }
    }
    names.forEach(function (item) {
        // console.log(item);
        // console.log(event.extra.idFasilitator);
            //M.Ridwan H D P - Fungsi popup
        $(function () {
            $('[data-toggle="popover"]').popover({
                html: true,
                placement: 'top',
                trigger: 'focus',
                content: '<button onclick=keluarkanPartisipan(' + JSON.stringify(item) + ')>Keluarkan</button>'
            })
        });
        var btn = document.createElement('button');
        btn.setAttribute('type', 'button');
        btn.setAttribute('class', 'btn btn-secondary btn-partcipant');
        if(kelas.idowner == connection.userid){
            btn.setAttribute('data-container', 'body');
            btn.setAttribute('data-toggle', 'popover');
        }
        // btn.setAttribute('onClick','keluarkanPartisipan('+JSON.stringify(event.userid)+')');
        btn.innerHTML = getFullName(item);
        if (kelas.idowner != item) {
            infoBar.appendChild(btn);
        }
    });
};
connection.onopen = function (event) {
    console.log('OnOpen');
    //connection.onUserStatusChanged(event);
    console.log(papanTulisIn.pointsLength);
    if (papanTulisIn.pointsLength <= 0) {
        // make sure that remote user gets all drawings synced.
        setTimeout(function () {
            connection.send('plz-sync-points');
        }, 1000);
    }
    document.getElementById('btn-chat-message').disabled = false;
    document.getElementById('btn-attach-file').style.display = 'inline-block';
};
connection.onclose = connection.onerror = connection.onleave = function (event) {
    connection.onUserStatusChanged(event);
    setReceiverSelected(event);
};
connection.onmessage = function (event) {
    //console.log(event);
    if (event.data.showMainVideo) {
        // $('#main-video').show();
        $('#screen-viewer').css({
            top: $('#widget-container').offset().top,
            left: $('#widget-container').offset().left,
            width: $('#widget-container').width(),
            height: $('#widget-container').height()
        });
        $('#screen-viewer').show();
        return;
    }
    if (event.data.hideMainVideo) {
        // $('#main-video').hide();
        $('#screen-viewer').hide();
        return;
    }
    if (event.data.typing === true) {
        $('#key-press').show().find('span').html(event.extra.userFullName + ' is typing');
        return;
    }
    if (event.data.typing === false) {
        $('#key-press').hide().find('span').html('');
        return;
    }
    if (event.data.type == "atensi") {
        if (connection.userid != event.data.id) {
            var namaPartisipan = getFullName(event.data.id);
            $.notify({
                // options
                message: namaPartisipan + ' mengacungkan tangan!'
            });
        }
        return;
    }
    if (event.data.type == "timer") {
        connection.extra.waktuMulai = new Date();
        connection.extra.waktuBerakhir = connection.extra.waktuMulai;
        connection.extra.waktuBerakhir.setMinutes(connection.extra.waktuMulai.getMinutes() + connection.extra.durasi)
        run_clock('clockdiv', connection.extra.waktuBerakhir, true);
        return;
    }
    if(event.data.type == 'kick'){
        if(event.data.userid == connection.userid){
                $.notify({
                // options
                message: 'Anda telah dikeluarkan dari kelas'
            });
            // disconnect with all users
            connection.getAllParticipants().forEach(function (pid) {
                connection.disconnectWith(pid);
            });

            // stop all local cameras
            connection.attachStreams.forEach(function (localStream) {
                localStream.stop();
            });

            connection.closeSocket();
        }
    }
    if (event.data.chatMessage) {
        if (event.data.receiver_id == 'All' || event.data.receiver_id == connection.userid) { //cek penerima pesan diedit
            appendChatMessage(event);
        }
        return;
    }
    if (event.data.checkmark === 'received') {
        var checkmarkElement = document.getElementById(event.data.checkmark_id);
        if (checkmarkElement) {
            checkmarkElement.style.display = 'inline';
        }
        return;
    }
    if (event.data === 'plz-sync-points') {
        papanTulisIn.sync();
        return;
    }
    if (event.data.muteid === connection.userid) {
        var streamByUserId = connection.streamEvents.selectFirst({ userid: event.data.muteid }).stream;
        streamByUserId.mute(event.data.type);
        return;
    }
    if (event.data.unmuteid === connection.userid) {
        var streamByUserId = connection.streamEvents.selectFirst({ userid: event.data.unmuteid }).stream;
        streamByUserId.unmute(event.data.type);
        return;
    }
    papanTulisIn.syncData(event.data);
    tempDataCanvasRemote.push(event.data);
};

// Created by Fadhil Shofian
function setReceiverSelected(event) {
    var setReceiver = document.getElementById('set-receiver');
    // setReceiver.removeChild(setReceiver);
    setReceiver.innerHTML = '';
    var option = document.createElement('option');
    var names = [];
    connection.getAllParticipants().forEach(function (pid) {
        names.push(pid);
    });
    // if (!names.length) {
    option.value = 'All';
    option.innerHTML = 'All';
    setReceiver.add(option);
    // } else {
    for (var i = 0; i < names.length; i++) {
        var option2 = document.createElement('option');
        option2.value = names[i];
        option2.innerHTML = getFullName(names[i]);
        setReceiver.add(option2);
    }
    // }
}
function isTimerStart(event) {
    if (event.extra.timer) { //Mendapatkan waktu berakhir dari dimulainya menekan tombol start button
        run_clock('clockdiv', Date.parse(new Date(event.extra.waktuBerakhir)), true);
    } else { // Mendapatkan durasi kelas
        connection.extra.waktuMulai = new Date();
        connection.extra.durasi = parseInt(event.extra.durasi);
        connection.extra.waktuBerakhir = connection.extra.waktuMulai;
        connection.extra.waktuBerakhir.setMinutes(connection.extra.waktuMulai.getMinutes() + connection.extra.durasi);
        run_clock('clockdiv', connection.extra.waktuBerakhir, false);
    }
}

var isdeklarasi = false;
// extra code
connection.onstream = function (event) {
    // console.log('onstream');
    // console.log(event);
    var div = document.createElement('div');
    var otherVideos = document.querySelector('#other-videos');
    var mainVideo = document.getElementById('main-video');

    div.id = event.streamid; div.className = 'video-player';
    var button = [];

    if (event.stream.isScreen && !event.stream.canvasStream) {
        $('#screen-viewer').get(0).srcObject = event.stream;
        $('#screen-viewer').hide();
    }
    else if (event.extra.roomOwner === true) {
        //console.log('Owner');
        connection.extra.idFasilitator = event.extra.idFasilitator;
        aNamaRuangan.innerHTML = event.extra.nama +' '+ event.extra.namaRuangan;
        var recordObject = connection.streamEvents[event.streamid].stream;
        var medWidth = $('#main-video').width() - 20;
        var medHeight = 250;
        isTimerStart(event);//Untuk mendapatkan waktu
        if (connection.isInitiator) {
            button = ['mute-audio', 'volume-slider', 'record-video'];
        } else {
            button = ['volume-slider'];
        }
        var mediaElement = getMediaElement(event.mediaElement, {
            width: medWidth, //Pixel
            height: medHeight,
            buttons: button,
            onMuted: function (type) {
                connection.streamEvents[event.streamid].stream.mute(type);
            },
            onUnMuted: function (type) {
                // www.RTCMultiConnection.org/docs/unmute/
                connection.streamEvents[event.streamid].stream.unmute(type);
            },
            showOnMouseEnter: true,
        });
        div.appendChild(mediaElement);
        if (typeof connection.extra.streamid == 'undefined') {
            connection.extra.streamid = event.streamid;
        }
        mainVideo.appendChild(div);
        $('#main-video').show();
    } else {
        console.log('Not Owner');
        var medWidth = ($('#other-videos').width() * (50 / 100));
        var medHeight = 120;

        if (typeof connection.extra.streamid == 'undefined') {
            connection.extra.streamid = event.streamid;
        }
        if (connection.isInitiator) {
            button = ['mute-audio', 'volume-slider'];
        } else {
            button = ['volume-slider'];
        }
        var mediaElement = getMediaElement(event.mediaElement, {
            width: medWidth, //Pixel
            height: medHeight,
            buttons: button,
            toggle: event.type == 'local' ? ['mute-audio'] : [],
            onMuted: function (type) {
                // www.RTCMultiConnection.org/docs/mute/
                if (event.type == 'remote') {
                    var streamByUserId = connection.streamEvents.selectFirst({ userid: event.userid }).stream;
                    streamByUserId.mute(type);
                    connection.send({
                        muteid: event.userid,
                        type: type
                    });
                }
            },
            onUnMuted: function (type) {
                // www.RTCMultiConnection.org/docs/unmute/
                if (event.type == 'remote') {
                    var streamByUserId = connection.streamEvents.selectFirst({ userid: event.userid }).stream;
                    streamByUserId.unmute(type);
                    connection.send({
                        unmuteid: event.userid,
                        type: type
                    });
                }

            },
            showOnMouseEnter: true,
        });
        div.appendChild(mediaElement);
        otherVideos.appendChild(div);

    }
    connection.onUserStatusChanged(event);
    setReceiverSelected(event);
};
connection.onstreamended = function (event) {
    console.log('onstreamend');
    var video = document.querySelector('video[data-streamid="' + event.streamid + '"]');
    if (!video) {
        video = document.getElementById(event.streamid);
        if (video) {
            video.parentNode.removeChild(video);
            return;
        }
    }
    if (video) {
        video.srcObject = null;
        video.style.display = 'none';
    }
};

var conversationPanel = document.getElementById('conversation-panel');
function appendChatMessage(event, checkmark_id, receiver_id) {
    console.log("Masuk appendChatMessage");
    var div = document.createElement('div');
    div.className = 'message';
    if (event.data) {
        if (event.data.receiver_id == connection.userid) {
            div.innerHTML = '<b> from ' + (event.extra.userFullName || event.userid) + ':</b><br>' + event.data.chatMessage;
            div.style.background = '#f73838';
        }
        else {
            div.innerHTML = '<b>' + (event.extra.userFullName || event.userid) + ':</b><br>' + event.data.chatMessage;
        }
        if (event.data.checkmark_id) {
            connection.send({
                checkmark: 'received',
                checkmark_id: event.data.checkmark_id
            });
        }
    } else {
        if (receiver_id != 'All') {
            div.innerHTML = '<b> to ' + getFullName(receiver_id) + ':</b><br>' + event;
            div.style.background = '#f73838';
        }
        else {
            div.innerHTML = '<b>You:</b>' + event;
            div.style.background = '#cbffcb';
        }
    }
    conversationPanel.appendChild(div);
    conversationPanel.scrollTop = conversationPanel.clientHeight;
    conversationPanel.scrollTop = conversationPanel.scrollHeight - conversationPanel.scrollTop;
}
var keyPressTimer;
var numberOfKeys = 0;
$('#txt-chat-message').emojioneArea({
    pickerPosition: "top",
    filtersPosition: "bottom",
    tones: false,
    autocomplete: true,
    inline: true,
    hidePickerOnBlur: true,
    events: {
        focus: function () {
            $('.emojionearea-category').unbind('click').bind('click', function () {
                $('.emojionearea-button-close').click();
            });
        },
        keyup: function (e) {
            var chatMessage = $('.emojionearea-editor').html();
            if (!chatMessage || !chatMessage.replace(/ /g, '').length) {
                connection.send({
                    typing: false
                });
            }
            clearTimeout(keyPressTimer);
            numberOfKeys++;
            if (numberOfKeys % 3 === 0) {
                connection.send({
                    typing: true
                });
            }
            keyPressTimer = setTimeout(function () {
                connection.send({
                    typing: false
                });
            }, 1200);
        },
        blur: function () {
            // $('#btn-chat-message').click();
            connection.send({
                typing: false
            });
        }
    }
});
var list = document.getElementsByClassName('emojionearea-button');

window.onkeyup = function (e) {
    var code = e.keyCode || e.which;
    if (code == 13) {
        $('#btn-chat-message').click();
    }
};
document.getElementById('btn-chat-message').onclick = kirimPesan
function kirimPesan() { //diedit
    var chatMessage = $('.emojionearea-editor').html();
    $('.emojionearea-editor').html('');
    if (!chatMessage || !chatMessage.replace(/ /g, '').length) return;
    var checkmark_id = connection.userid + connection.token();
    var receiver_id = document.getElementById('set-receiver').value;
    appendChatMessage(chatMessage, checkmark_id, receiver_id);
    connection.send({
        chatMessage: chatMessage,
        checkmark_id: checkmark_id,
        receiver_id: receiver_id
    });
    connection.send({
        typing: false
    });
}
var recentFile;
connection.extra.totalUpload = 0;
document.getElementById('btn-attach-file').onclick = kirimFile;
function kirimFile() {
    var file = new FileSelector();
    file.selectSingleFile(function (file) {
        recentFile = file;
        var tempTotal = connection.extra.totalUpload;
        console.log('Total sebelum ditambah = ' + tempTotal);
        tempTotal += recentFile.size;
        console.log('Total setelah ditambah = ' + tempTotal);
        if (connection.getAllParticipants().length < 1) {
            console.log("masuk error file kurang orang");
            $.notify({
                // options
                message: 'Belum ada partisipan yang masuk'
            });
        } else if (tempTotal > 50000000) {
            console.log("masuk error file limit upload");
            $.notify({
                // options
                message: 'Ukuran file yang anda kirim melebihi sisa kapasitas yang anda miliki'
            });
        } else if (recentFile.size > 20000000){
            console.log("masuk error file limit kirim");
            $.notify({
                // options
                message: 'File yang anda kirim lebih dari 20 MB'
            });
        } else {
            recentFile.userIndex = 0;
            connection.send(file, connection.getAllParticipants()[recentFile.userIndex]);//shareFile
            connection.extra.totalUpload += recentFile.size;
        }
    });
}
function getFileHTML(file) {
    var url = file.url || URL.createObjectURL(file);
    var attachment = '<a href="' + url + '" target="_blank" download="' + file.name + '">Download: <b>' + file.name + '</b></a>';
    if (file.name.match(/\.jpg|\.png|\.jpeg|\.gif/gi)) {
        attachment += '<br><img crossOrigin="anonymous" src="' + url + '">';
    } else if (file.name.match(/\.wav|\.mp3/gi)) {
        attachment += '<br><audio src="' + url + '" controls></audio>';
    } else if (file.name.match(/\.pdf|\.js|\.txt|\.sh/gi)) {
        attachment += '<iframe class="inline-iframe" src="' + url + '"></iframe></a>';
    }
    return attachment;
}
function getFullName(userid) {
    var _userFullName = userid;
    if (connection.peers[userid] && connection.peers[userid].extra.userFullName) {
        _userFullName = connection.peers[userid].extra.userFullName;
    }
    return _userFullName;
}
connection.onFileEnd = function (file) {
    var html = getFileHTML(file);
    var div = progressHelper[file.uuid].div;
    if (file.userid === connection.userid) {
        div.innerHTML = '<b>You:</b><br>' + html;
        div.style.background = '#cbffcb';
        if (recentFile) {
            recentFile.userIndex++;
            var nextUserId = connection.getAllParticipants()[recentFile.userIndex];
            if (nextUserId) {
                connection.send(recentFile, nextUserId);
            }
            else {
                recentFile = null;
            }
        }
        else {
            recentFile = null;
        }
    } else {
        div.innerHTML = '<b>' + getFullName(file.userid) + ':</b><br>' + html;
    }
};
// to make sure file-saver dialog is not invoked.
connection.autoSaveToDisk = false;
var progressHelper = {};
var OneDiv = true;
connection.onFileProgress = function (chunk, uuid) {
    var helper = progressHelper[chunk.uuid];
    helper.progress.value = chunk.currentPosition || chunk.maxChunks || helper.progress.max;
    updateLabel(helper.progress, helper.label);
};
connection.onFileStart = function (file) {
    // if(OneDiv){
    OneDiv = false;
    var div = document.createElement('div');
    div.className = 'message';
    if (file.userid === connection.userid) {
        var userFullName = file.remoteUserId;
        if (connection.peersBackup[file.remoteUserId]) {
            userFullName = connection.peersBackup[file.remoteUserId].extra.userFullName;
        }
        div.innerHTML = '<b>You (to: ' + userFullName + '):</b><br><label>0%</label> <progress></progress>';
        div.style.background = '#cbffcb';
    } else {
        div.innerHTML = '<b>' + getFullName(file.userid) + ':</b><br><label>0%</label> <progress></progress>';
    }
    div.title = file.name;
    conversationPanel.appendChild(div);
    progressHelper[file.uuid] = {
        div: div,
        progress: div.querySelector('progress'),
        label: div.querySelector('label')
    };
    progressHelper[file.uuid].progress.max = file.maxChunks;
    conversationPanel.scrollTop = conversationPanel.clientHeight;
    conversationPanel.scrollTop = conversationPanel.scrollHeight - conversationPanel.scrollTop;
    // }
};
function updateLabel(progress, label) {
    if (progress.position == -1) return;
    var position = +progress.position.toFixed(2).split('.')[1] || 100;
    label.innerHTML = position + '%';
}
function persiapanKelas() {
    initPapanTulisIn();
    var wc = document.getElementById('widget-container');
    papanTulisIn.appendTo(document.getElementById('widget-container'), function () {
        papanTulisIn.iframe.style.border = '2px solid black';
        if (kelas.open === true || kelas.open === 'true') {
            console.log('Append Canvas');
            //Fakhri Waliyyuddin Nugraha
            connection.extra.nama = kelas.nama;
            connection.extra.namaRuangan = kelas.namaRuangan;
            connection.extra.waktuMulai = new Date();
            connection.extra.durasi = kelas.durasi;
            connection.extra.waktuBerakhir = connection.extra.waktuMulai;
            connection.extra.waktuBerakhir.setMinutes(connection.extra.waktuMulai.getMinutes() + parseInt(connection.extra.durasi));
            run_clock('clockdiv', connection.extra.waktuBerakhir, false);
            connection.extra.timer = false;
            connection.extra.roomOwner = true;
            connection.extra.idFasilitator = connection.userid;
            connection.open(kelas.sessionid, function (isRoomOpened, roomid, error) {
                if (error) {
                    if (error === connection.errors.ROOM_NOT_AVAILABLE) {
                        alert('Seseorang telah membuat room dengan id-room yang sama. Silakan join atau buat lagi');
                        return;
                    }
                    alert(error);
                }
                connection.socket.on('disconnect', function () {
                    location.reload();
                });
            });
        } else {
            connection.join(kelas.sessionid, function (isRoomJoined, roomid, error) {
                if (error) {
                    if (error === connection.errors.ROOM_NOT_AVAILABLE) {
                        alert('Room ini tidak tersedia. Anda bisa buat atau menunggu fasilitator masuk ruangan');
                        return;
                    }
                    if (error === connection.errors.ROOM_FULL) {
                        alert('Room Penuh.');
                        return;
                    }
                    alert(error);
                }
                connection.socket.on('disconnect', function () {
                    //location.reload();
                });
            });
        }
    });
}
// Reqeust Turn Server
window.onload = function () {
    let xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function ($evt) {
        if (xhr.readyState == 4 && xhr.status == 200) {
            let res = JSON.parse(xhr.responseText);
            console.log("response: ", res);
            console.log(res.v.iceServers);
            connection.iceServers.push(res.v.iceServers);
            persiapanKelas();
        }
    }
    xhr.open("PUT", "https://global.xirsys.net/_turn/MyFirstApp", true);
    xhr.setRequestHeader("Authorization", "Basic " + btoa("fakhri:ed659d2e-814c-11e9-99a5-0242ac110007"));
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.send(JSON.stringify({ "format": "urls" }));
};

function keluarkanPartisipan(id) {
    connection.send({
        type : 'kick',
        userid : id
    })
}
function copyLink(_link) {
    const textArea = document.createElement('textarea');
    textArea.value = _link;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
}