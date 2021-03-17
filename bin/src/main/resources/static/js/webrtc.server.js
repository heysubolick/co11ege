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
    $('#roomcreate').on('click',function(){
        room = $('#roomname').val();
        socket.emit('serverRoomCreate',room);
        $('#roomcreate').prop('disabled', true);
        $('.message').focus();
    });

    //TODO =================실험용 기능. 삭제 예정입니다!!!!!!!!!!!!!
    $('#micstop').on('click',() =>{
        Object.keys(pcs).forEach((sid)=>{
            document.getElementById("remoteVideo"+sid).srcObject.getTracks().forEach((t)=>{
              t.enabled = false;
            })
        })
    });

    $('#micstart').on('click',() =>{
                Object.keys(pcs).forEach((sid)=>{
            document.getElementById("remoteVideo"+sid).srcObject.getTracks().forEach((t)=>{
              t.enabled = true;
            })
        })
    });

    //TODO ==============실험용 기능 끝=============


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
        let payload = message['payload'];
        let target_sid = message['from'];
        let pc = pcs[target_sid]
         if (payload.type === 'candidate') {
             console.log('candidate')
             pc.addIceCandidate(new RTCIceCandidate({
                 sdpMLineIndex: payload.label,
                 candidate: payload.candidate
             }));
        }if (payload.type === 'answer') {
            console.log('answer')
            pc.setRemoteDescription(new RTCSessionDescription(payload));
        }
    });

    socket.on('bye',(sender_sid)=>{
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

    var span = document.getElementsByClassName("close")[0];
    span.onclick = function() {
      servermodal.style.display = "none";
    }

});