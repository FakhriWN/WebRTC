'use strict';

var isChannelReady = false;
var isInitiator = false;
var isStarted = false;
var localStream;
var pc;
var remoteStream;
var turnReady;

/**
 * Konfigurasi untuk TURN dan STUN server
 */
var pcConfig = {
  'iceServers': [{
    'urls': 'stun:stun.l.google.com:19302'
  },
  {
    'urls': 'turn:192.158.29.39:3478?transport=udp',
    'credential': 'JZEOEt2V3Qb0y27GRntt2u2PAYA=',
    'username': '28224511:1379330808'
  },
  {
    'urls': 'turn:192.158.29.39:3478?transport=tcp',
    'credential': 'JZEOEt2V3Qb0y27GRntt2u2PAYA=',
    'username': '28224511:1379330808'
  }
]
};

// Set up audio and video regardless of what devices are present.
var sdpConstraints = {
  offerToReceiveAudio: true,
  offerToReceiveVideo: true
};

/////////////////////////////////////////////

/**
 * Deklarasi nama room
 */
var room = 'foo';
// Could prompt for room name:
// room = prompt('Enter room name:');

//Membuat koneksi pada socket
var socket = io.connect();

//Kalau nama roomnya tidak kosong, maka pada socket membuat room (di emit)
if (room !== '') {
  socket.emit('create or join', room);
  console.log('Attempted to create or  join room', room);
}

/**
 * Ini buat nge get event saat room pertama kali dibuat, 
 * Bakal ngeluarin log kalau room sudah dibuat dan 
 * yang pertama kali ngakses statusnya bakal jadi initiator
 */
socket.on('created', function(room) {
  console.log('Created room ' + room);
  isInitiator = true;
});

/**
 * Ini buat nge get event saat room penuh, 
 * Bakal outpul room penuh di log
 * 
 */
socket.on('full', function(room) {
  console.log('Room ' + room + ' is full');
});

/**
 * Ini buat nge get event saat ada orang lain yang join, 
 * Bakal outpul ada yang join di room ..
 * ngubah status channelnya ready
 */

socket.on('join', function (room){
  console.log('Another peer made a request to join room ' + room);
  console.log('This peer is the initiator of room ' + room + '!');
  isChannelReady = true;
});

/**
 * Ini buat nge get event saat kita  udah join room, 
 * Bakal outpul kita join ke room tersebut
 * ngubah status channelnya ready
 */

socket.on('joined', function(room) {
  console.log('joined: ' + room);
  isChannelReady = true;
});

socket.on('log', function(array) {
  console.log.apply(console, array);
});

////////////////////////////////////////////////

/**
 * Ini fungsi buat ngirim message 
 */
function sendMessage(message) {
  console.log('Client sending message: ', message);
  socket.emit('message', message);
}

/**
 * Ini fungsi buat ngirim message 
 */

 /**
 * Ini fungsi buat ngeget event kalau si socket dapat pesan
 * 1. Kalau pesannya gotusermedia dia manggil fungsi maybestart()
 * 2. Else dia ngecek  
 */
// This client receives a message
socket.on('message', function(message) {
  console.log('Client received message:', message);
  if (message === 'got user media') {
    maybeStart();
  } else if (message.type === 'offer') {
    if (!isInitiator && !isStarted) {
      maybeStart();
    }
    pc.setRemoteDescription(new RTCSessionDescription(message));
    doAnswer();
  } else if (message.type === 'answer' && isStarted) {
    pc.setRemoteDescription(new RTCSessionDescription(message));
  } else if (message.type === 'candidate' && isStarted) {
    var candidate = new RTCIceCandidate({
      sdpMLineIndex: message.label,
      candidate: message.candidate
    });
    pc.addIceCandidate(candidate);
  } else if (message === 'bye' && isStarted) {
    handleRemoteHangup();
  }
});

////////////////////////////////////////////////////

var localVideo = document.querySelector('#localVideo');
var remoteVideo = document.querySelector('#remoteVideo');

/**
 * Ini buat setting enabled video dan audio
 * Tadi audionya ternyata false sudah diubah jadi true
 */
navigator.mediaDevices.getUserMedia({
  audio: true,
  video: true
})
.then(gotStream)
.catch(function(e) {
  alert('getUserMedia() error: ' + e.name);
});


/**
 * 
 * Ngambil akses stream kamera 
 */
function gotStream(stream) {
  console.log('Adding local stream.');
  localStream = stream;
  localVideo.srcObject = stream;
  sendMessage('got user media');
  if (isInitiator) {
    maybeStart();
  }
}

/**
 * Contrains buat setting di laptop sendiri
 */
var constraints = {
  audio:true,
  video: true
};

console.log('Getting user media with constraints', constraints);

if (location.hostname !== 'localhost') {
  requestTurn('https://computeengineondemand.appspot.com/turn?username=41784574&key=4080218913');
}

/**
 * Ini fungsi buat ngecek apakah si koneksi bisa dilakukan atau tidak
 */
function maybeStart() {
  console.log('>>>>>>> maybeStart() ', isStarted, localStream, isChannelReady);
  if (!isStarted && typeof localStream !== 'undefined' && isChannelReady) {
    console.log('>>>>>> creating peer connection');
    createPeerConnection();
    pc.addStream(localStream);
    isStarted = true;
    console.log('isInitiator', isInitiator);
    if (isInitiator) {
      doCall();
    }
  }
}


/**
 * Ini fungsi buat ngecek kalau ngeclose tab atau putus koneksi 
 */
window.onbeforeunload = function() {
  sendMessage('bye');
};

/////////////////////////////////////////////////////////

/**
 * Membuat Peer to peer connection dengan mendaftarkan beberapa even handler
 */
function createPeerConnection() {
  try {
    pc = new RTCPeerConnection(null);
    pc.onicecandidate = handleIceCandidate;
    pc.onaddstream = handleRemoteStreamAdded;
    pc.onremovestream = handleRemoteStreamRemoved;
    console.log('Created RTCPeerConnnection');
  } catch (e) {
    console.log('Failed to create PeerConnection, exception: ' + e.message);
    alert('Cannot create RTCPeerConnection object.');
    return;
  }
}

/**
 * 
 * Nangkep ice candidate dari beberapa kemungkinan 
 */
function handleIceCandidate(event) {
  console.log('icecandidate event: ', event);
  if (event.candidate) {
    sendMessage({
      type: 'candidate',
      label: event.candidate.sdpMLineIndex,
      id: event.candidate.sdpMid,
      candidate: event.candidate.candidate
    });
  } else {
    console.log('End of candidates.');
  }
}

function handleCreateOfferError(event) {
  console.log('createOffer() error: ', event);
}

function doCall() {
  console.log('Sending offer to peer');
  pc.createOffer(setLocalAndSendMessage, handleCreateOfferError);
}

function doAnswer() {
  console.log('Sending answer to peer.');
  pc.createAnswer().then(
    setLocalAndSendMessage,
    onCreateSessionDescriptionError
  );
}

function setLocalAndSendMessage(sessionDescription) {
  pc.setLocalDescription(sessionDescription);
  console.log('setLocalAndSendMessage sending message', sessionDescription);
  sendMessage(sessionDescription);
}

function onCreateSessionDescriptionError(error) {
  trace('Failed to create session description: ' + error.toString());
}

/**
 * Akses URL server
 * @param {*} turnURL 
 */
function requestTurn(turnURL) {
  var turnExists = false;
  for (var i in pcConfig.iceServers) {
    if (pcConfig.iceServers[i].urls.substr(0, 5) === 'turn:') {
      turnExists = true;
      turnReady = true;
      break;
    }
  }
  if (!turnExists) {
    console.log('Getting TURN server from ', turnURL);
    // No TURN server. Get one from computeengineondemand.appspot.com:
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
      if (xhr.readyState === 4 && xhr.status === 200) {
        var turnServer = JSON.parse(xhr.responseText);
        console.log('Got TURN server: ', turnServer);
        pcConfig.iceServers.push({
          'urls': 'turn:' + turnServer.username + '@' + turnServer.turn,
          'credential': turnServer.password
        });
        turnReady = true;
      }
    };
    xhr.open('GET', turnURL, true);
    xhr.send();
  }
}

function handleRemoteStreamAdded(event) {
  console.log('Remote stream added.');
  remoteStream = event.stream;
  remoteVideo.srcObject = remoteStream;
}

function handleRemoteStreamRemoved(event) {
  console.log('Remote stream removed. Event: ', event);
}

/**
 * Memutuskan koneksi
 */
function hangup() {
  console.log('Hanging up.');
  stop();
  sendMessage('bye');
}

/**
 * Memutuskan koneksi
 */
function handleRemoteHangup() {
  console.log('Session terminated.');
  stop();
  isInitiator = false;
}

/**
 * Menghentikan koneksi
 */
function stop() {
  isStarted = false;
  pc.close();
  pc = null;
}

/**
 * PS dari Ridwan : 
 * Ini juga masih nyari mengenai offer dan ICE candidate, mungkin Acong bisa tambahin komen?
 */