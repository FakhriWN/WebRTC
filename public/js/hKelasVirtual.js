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
function notifikasi() {
    console.log('notifikasi');
}
function kelasVirtual() {

    var connection = new RTCMultiConnection();
    connection.socketURL = '/';
    // connection.socketURL = 'https://rtcmulticonnection.herokuapp.com:443/';
    connection.extra.userFullName = kelas.nama; //<%=data.person%> 
    /// make this room public
    connection.publicRoomIdentifier = kelas.PRI;
    connection.socketMessageEvent = 'canvas-dashboard';
    // keep room opened even if owner leaves
    connection.autoCloseEntireSession = true;
    // https://www.rtcmulticonnection.org/docs/maxParticipantsAllowed/
    connection.maxParticipantsAllowed = kelas.maxPartisipan;
    // set value 2 for one-to-one connection
    // connection.maxParticipantsAllowed = 2;
    // here goes canvas designer
    var papanTulisIn = new CanvasDesigner();
    var recorder = new MRecordRTC();
    recorder.mimeType = {
        audio: 'audio/wav',
        video: 'video/webm',
        gif: 'image/gif'
    };
    var tempDataCanvasLocal = [];
    var tempDataCanvasRemote = [];
    function initPapanTulisIn() {
        // you can place widget.html anywhere
        papanTulisIn.widgetHtmlURL = '/canvas-designer/widget.html';
        papanTulisIn.widgetJsURL = '/canvas-designer/widget.js'
        papanTulisIn.addSyncListener(function (data) { // Yang dapat mensinkronkan coretan canvas
            tempDataCanvasLocal.push(data);
            console.log(tempDataCanvasLocal);
            connection.send(data);
        });
        btnClear.style.display = 'none'
        btnClear.addEventListener("click", function(){
            papanTulisIn.clearCanvas();
        });


        papanTulisIn.setSelected('pencil');
        papanTulisIn.setTools({
            pencil: true,
            text: true,
            image: false,
            pdf: true,
            eraser: true,
            line: true,
            arrow: true,
            dragSingle: false,
            dragMultiple: true,
            arc: true,
            rectangle: true,
            quadratic: false,
            bezier: false,
            marker: false,
            zoom: false,
            lineWidth: false,
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
    var link = location.origin + '/kelas/bergabung?sessionid=' + kelas.sessionid;
    $('#btn-generate-link').popover({
        html: true,
        placement: 'top',
        content: '<a id="a-link" href='+link+' value='+link+'>'+link+'</a><br><button onclick=copyLink(' + JSON.stringify(link) + ')>Copy</button>'
    });
    var btnSync = document.getElementById('sync');
    var btnHandsup = document.getElementById('handsup');
    var btnClear= document.getElementById("clear");

    if(kelas.open === 'false'){
        console.log("Masuk hands");
        btnHandsup.style.display = "inline";
    }
    btnHandsup.addEventListener('click',function(){
        connection.send({
            id: connection.userid,
            type: "atensi"
        });
    });
    btnSync.addEventListener('click', function () {
        recorder.save();
    });
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
    connection.onUserStatusChanged = function (event) {
        var infoBar = document.getElementById('onUserStatusChanged');
        var names = [];

        //M.Ridwan H D P - Fungsi popup
        $(function () {
            $('[data-toggle="popover"]').popover({
                html: true,
                placement: 'top',
                trigger: 'focus',
                content: '<button>Berikan Izin</button><br><button onclick=kickParticipant(' + JSON.stringify(event.userid) + ')>Keluarkan</button>'
            })
        });

        //M.Ridwan - ditampilkan hanya untuk fasilitator
        if(connection.userid == event.userid && event.extra.roomOwner){
            btnClear.style.display = 'inline-block';
        }

        infoBar.innerHTML = '';
        connection.getAllParticipants().forEach(function (pid) {
            names.push(getFullName(pid));
        });
        if (!names.length) {
            names = ['Only You'];
        } else {
            names = [connection.extra.userFullName || 'You'].concat(names);
        }

        names.forEach(function (item) {
            var btn = document.createElement('button');
            btn.setAttribute('type', 'button');
            btn.setAttribute('class', 'btn btn-secondary btn-partcipant');
            btn.setAttribute('data-container', 'body');
            btn.setAttribute('data-toggle', 'popover');
            // btn.setAttribute('onClick','kickParticipant('+JSON.stringify(event.userid)+')');

            btn.innerHTML = item;
            infoBar.appendChild(btn);
        })

    };
    connection.onopen = function (event) {
        console.log('OnOpen');
        connection.onUserStatusChanged(event);
        console.log(papanTulisIn.pointsLength);
        if (papanTulisIn.pointsLength <= 0) {
            // make sure that remote user gets all drawings synced.
            setTimeout(function () {
                connection.send('plz-sync-points');
            }, 1000);
        }
        document.getElementById('btn-chat-message').disabled = false;
        document.getElementById('btn-attach-file').style.display = 'inline-block';
        document.getElementById('btn-share-screen').style.display = 'inline-block';
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
            if(connection.userid != event.data.id){
                var namaPartisipan = getFullName(event.data.id);
                $.notify({
                    // options
                    message: namaPartisipan + ' mengacungkan tangan!' 
                }); 
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
        console.log('Masuk Selected');
        var setReceiver = document.getElementById('set-receiver');
        // setReceiver.removeChild(setReceiver);
        setReceiver.innerHTML = '';
        console.log('Masuk Selected2');
        var option = document.createElement('option');
        var names = [];
        connection.getAllParticipants().forEach(function (pid) {
            console.log('Masuk Selected3');
            names.push(pid);
        });
        console.log(names);
        // if (!names.length) {
        option.value = 'All';
        option.innerHTML = 'All';
        console.log(option.value);
        setReceiver.add(option);
        // } else {
        console.log(names.length);
        for (var i = 0; i < names.length; i++) {
            var option2 = document.createElement('option');
            option2.value = names[i];
            option2.innerHTML = getFullName(names[i]);
            console.log(option2.value);
            setReceiver.add(option2);
        }
        // }
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
            var recordObject = connection.streamEvents[event.streamid].stream;

            var medWidth = $('#main-video').width() - 20;
            var medHeight = 250;
            if (connection.isInitiator) {
                button = ['mute-audio', 'mute-video', 'volume-slider'];
            } else {
                button = ['volume-slider', 'record-audio', 'record-video'];
            }
            var mediaElement = getMediaElement(event.mediaElement, {
                width: medWidth, //Pixel
                height: medHeight,
                buttons: button,
                toggle: event.type == 'local' ? ['mute-audio'] : [],
                onMuted: function (type) {
                    //console.log(type);
                    connection.streamEvents[event.streamid].stream.mute(type);
                },
                onUnMuted: function (type) {
                    // www.RTCMultiConnection.org/docs/unmute/
                    connection.streamEvents[event.streamid].stream.unmute(type);
                },
                onRecordingStarted: function (type) {
                    // www.RTCMultiConnection.org/docs/startRecording/
                    recorder.addStream(recordObject);
                    recorder.mediaType = {
                        audio: true, // or StereoAudioRecorder or MediaStreamRecorder
                        video: true, // or WhammyRecorder or MediaStreamRecorder or WebAssemblyRecorder
                        gif: false     // or GifRecorder
                    };
                    recorder.startRecording();
                },
                onRecordingStopped: function (type) {
                    // www.RTCMultiConnection.org/docs/stopRecording/
                    recorder.stopRecording(function (url, type) {
                        console.log('Recording Stopped');
                        recorder.writeToDisk();
                    });

                    //recorder.destroy();
                },
            });
            div.appendChild(mediaElement);
            // console.log($( '#main-video' ).width());
            // console.log($( '#main-video' ).height());
            if (typeof connection.extra.streamid == 'undefined') {
                connection.extra.streamid = event.streamid;
            }

            //div.appendChild(control);
            //event.mediaElement.controls = true;
            mainVideo.appendChild(div);
            $('#main-video').show();
        } else {

            console.log('Not Owner');


            console.log($('#other-videos').width());
            console.log($('#other-videos').height());
            var medWidth = ($('#other-videos').width() * (50 / 100));
            var medHeight = 120;

            if (typeof connection.extra.streamid == 'undefined') {
                connection.extra.streamid = event.streamid;
            }
            if (connection.isInitiator) {
                button = ['mute-audio', 'mute-video', 'volume-slider'];
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
                    //connection.streamEvents[event.streamid].stream.mute(type);
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
                    //connection.streamEvents[event.streamid].stream.unmute(type);
                    if (event.type == 'remote') {
                        var streamByUserId = connection.streamEvents.selectFirst({ userid: event.userid }).stream;
                        streamByUserId.unmute(type);
                        connection.send({
                            unmuteid: event.userid,
                            type: type
                        });
                    }

                }
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
        //console.log(chatMessage);
        if (!chatMessage || !chatMessage.replace(/ /g, '').length) return;
        var checkmark_id = connection.userid + connection.token();
        console.log(document.getElementById('set-receiver').value);
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
    document.getElementById('btn-attach-file').onclick = kirimFile;
    function kirimFile() {
        var file = new FileSelector();
        file.selectSingleFile(function (file) {
            recentFile = file;
            if (connection.getAllParticipants().length >= 1) {
                recentFile.userIndex = 0;
                connection.send(file, connection.getAllParticipants()[recentFile.userIndex]);//shareFile
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
            if (kelas.open === true || kelas.open === 'true') {
                console.log('Append Canvas');
                var tempStreamCanvas = document.getElementById('temp-stream-canvas');
                var tempStream = tempStreamCanvas.captureStream();
                tempStream.isScreen = true;
                tempStream.streamid = tempStream.id;
                tempStream.type = 'local';
                connection.attachStreams.push(tempStream);
                window.tempStream = tempStream;
                connection.extra.roomOwner = true;
                connection.open(kelas.sessionid, function (isRoomOpened, roomid, error) {
                    if (error) {
                        if (error === connection.errors.ROOM_NOT_AVAILABLE) {
                            alert('Someone already created this room. Please either join or create a separate room.');
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
                            alert('This room does not exist. Please either create it or wait for moderator to enter in the room.');
                            return;
                        }
                        if (error === connection.errors.ROOM_FULL) {
                            alert('Room is full.');
                            return;
                        }
                        if (error === connection.errors.INVALID_PASSWORD) {
                            connection.password = prompt('Please enter room password.') || '';
                            if (!connection.password.length) {
                                alert('Invalid password.');
                                return;
                            }
                            connection.join(kelas.sessionid, function (isRoomJoined, roomid, error) {
                                if (error) {
                                    alert(error);
                                }
                            });
                            return;
                        }
                        alert(error);
                    }
                    connection.socket.on('disconnect', function () {
                        location.reload();
                    });
                });
            }
        });
    }
    persiapanKelas();

    function addStreamStopListener(stream, callback) {
        stream.addEventListener('ended', function () {
            callback();
            callback = function () { };
        }, false);
        stream.addEventListener('inactive', function () {
            callback();
            callback = function () { };
        }, false);
        stream.getTracks().forEach(function (track) {
            track.addEventListener('ended', function () {
                callback();
                callback = function () { };
            }, false);
            track.addEventListener('inactive', function () {
                callback();
                callback = function () { };
            }, false);
        });
    }
    function replaceTrack(videoTrack, screenTrackId) {
        if (!videoTrack) return;
        if (videoTrack.readyState === 'ended') {
            alert('Can not replace an "ended" track. track.readyState: ' + videoTrack.readyState);
            return;
        }
        connection.getAllParticipants().forEach(function (pid) {
            var peer = connection.peers[pid].peer;
            if (!peer.getSenders) return;
            var trackToReplace = videoTrack;
            peer.getSenders().forEach(function (sender) {
                if (!sender || !sender.track) return;
                if (screenTrackId) {
                    if (trackToReplace && sender.track.id === screenTrackId) {
                        sender.replaceTrack(trackToReplace);
                        trackToReplace = null;
                    }
                    return;
                }
                if (sender.track.id !== tempStream.getTracks()[0].id) return;
                if (sender.track.kind === 'video' && trackToReplace) {
                    sender.replaceTrack(trackToReplace);
                    trackToReplace = null;
                }
            });
        });
    }
    function replaceScreenTrack(stream) {
        stream.isScreen = true;
        stream.streamid = stream.id;
        stream.type = 'local';
        // connection.attachStreams.push(stream);
        connection.onstream({
            stream: stream,
            type: 'local',
            streamid: stream.id,
            // mediaElement: video
        });
        var screenTrackId = stream.getTracks()[0].id;
        addStreamStopListener(stream, function () {
            connection.send({
                hideMainVideo: true
            });
            // $('#main-video').hide();
            $('#screen-viewer').hide();
            $('#btn-share-screen').show();
            replaceTrack(tempStream.getTracks()[0], screenTrackId);
        });
        stream.getTracks().forEach(function (track) {
            if (track.kind === 'video' && track.readyState === 'live') {
                replaceTrack(track);
            }
        });
        connection.send({
            showMainVideo: true
        });
        // $('#main-video').show();
        $('#screen-viewer').css({
            top: $('#widget-container').offset().top,
            left: $('#widget-container').offset().left,
            width: $('#widget-container').width(),
            height: $('#widget-container').height()
        });
        $('#screen-viewer').show();
    }
    $('#btn-share-screen').click(function () {
        if (!window.tempStream) {
            alert('Screen sharing is not enabled.');
            return;
        }
        $('#btn-share-screen').hide();
        getScreenId(function (error, sourceId, screen_constraints) {
            if (navigator.userAgent.indexOf('Edge') !== -1 && (!!navigator.msSaveOrOpenBlob || !!navigator.msSaveBlob)) {
                navigator.getDisplayMedia(screen_constraints).then(stream => {
                    replaceScreenTrack(stream);
                }, error => {
                    alert('Please make sure to use Edge 17 or higher.');
                });
                return;
            }
            if (error == 'not-installed') {
                alert('Please install Chrome extension.');
                return;
            }
            navigator.mediaDevices.getUserMedia(screen_constraints).then(function (stream) {
                replaceScreenTrack(stream);
            }).catch(function (error) {
                alert('Failed to capture your screen. Please check Chrome console logs for further information.');
            });
        });
    });
    run_clock('clockdiv', deadline);
    globalVar.connection = connection;
}

function kickParticipant(id) {
    globalVar.connection.disconnectWith(id);
}
function copyLink(_link) {
    const textArea = document.createElement('textarea');
    textArea.value = _link;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
}