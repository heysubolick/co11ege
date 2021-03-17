$(document).ready(function(){
    let localVideo = document.getElementById("localVideo");
    let localStream;
    let pcs = {};
    let socket = io.connect('https://192.168.0.46:5000');
    let room;
    let pcConfig = {
        'iceServers':[{
            urls:'stun:stun.l.google.com:19302'
        }]
    }

    navigator.mediaDevices
        .getUserMedia({video: true, audio: true})
        .then((stream)=>{
            localStream = stream;
            localVideo.srcObject = stream;
        })
        .catch((error) => console.error(error));

    function createPeerConnection(target_sid) {
      try {
          //비디오 추가
          let video = "<video playsinline id='remoteVideo"+target_sid+"' controls preload='metadata' width='140' height='120' autoplay></video>"
          $('.videoarea').append(video);

          //피어커넥션 추가
            let pc = new RTCPeerConnection(pcConfig);
            pc.addStream(localStream);

            pc.onicecandidate = event=>{
                 if (event.candidate) {
                    sendMessage(target_sid,{
                      type: "candidate",
                      label: event.candidate.sdpMLineIndex,
                      id: event.candidate.sdpMid,
                      candidate: event.candidate.candidate,
                    });
                  } else {
                    console.log("end of candidates");
                  }
            }
            pc.onaddstream = event=>{
              console.log("remote stream added");
              document.getElementById("remoteVideo"+target_sid).srcObject = event.stream;
            };

            return pc;
      } catch (e) {
        alert("connot create RTCPeerConnection object");
      }
    }

    function sendMessage(target_id,message){
        console.log(message);
        socket.emit('candidation',{'payload':message,'to':target_id});
    }
    //===================UI EVENT HANDLER=============================
    $('#roomconnect').on('click',function(){
        room=$('#roomname').val();
        socket.emit('clientjoin',room);
        $('#roomconnect').css('display','none');
        $('#roomdisconnect').css('display','block');
        $('.message').focus();
    });

    $('#roomdisconnect').on('click',function(){
        room=$('#roomname').val();
        socket.disconnect();
        document.location.href = document.location.origin;
    });

   $('#chatbtn').on('click',function(){
        message = $('.message').val();
        nickname = $('#nickname').val();
        socket.emit('chatrequest',message,nickname);

        $('.message').val('');
    });

     //===================SOCKET HANDLER===============================
    socket.on('ClientJoined',(target_sid)=>{
        let pc = createPeerConnection(target_sid);
        pcs[target_sid] = pc;
        pc.createOffer(sessionDescription =>{
                pc.setLocalDescription(sessionDescription);
                sendMessage(target_sid,sessionDescription);
            },
            error => alert("Falied to create session Description"+ error)
        );
    });

    socket.on('candidation', function (message) {
        console.log('Client received message:', message);
        let payload = message['payload'];
        let target_sid = message['from'];
        //클라이언트의 경우 이미 존재하던 방에서 offer가 먼저 들어오면 그때 PC를 생성해야함
        if (payload.type === 'offer') {
            let pc = createPeerConnection(target_sid);
            pcs[target_sid] = pc;
            pc.setRemoteDescription(new RTCSessionDescription(payload));
            pc.createAnswer().then(
                (sessionDescription)=>{
                    pc.setLocalDescription(sessionDescription);
                    console.log('setLocalAndSendMessage sending message', sessionDescription);
                    sendMessage(target_sid,sessionDescription);
                },
                (error)=> console.log('Failed to create session description: ' + error.toString())
            );
        } else if (payload.type === 'candidate') {
            let pc = pcs[target_sid]
            pc.addIceCandidate(new RTCIceCandidate({
                sdpMLineIndex: payload.label,
                candidate: payload.candidate
            }));
        }else if (payload.type === 'answer') {
            console.log('answer')
            let pc = pcs[target_sid]
            pc.setRemoteDescription(new RTCSessionDescription(payload));
        }
    });

    socket.on('bye',(sender_sid)=>{
        //TODO 만들었던 비디오 제거
        console.log("session terminated.");
        let pc = pcs[sender_sid];
        pc.close();
        delete pcs[sender_sid];
        $('#remoteVideo'+sender_sid).remove()
    })

    socket.on( 'chatresponse', function( msg ) {
        var showuser = '['+msg.nickname+']';
        $( '#talks' ).append( '<div><b style="color: #000">'+showuser+'</b> '+msg.message+'</div>' );
    });

});