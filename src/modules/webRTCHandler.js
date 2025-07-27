//import modules
import * as state from "./state";
import * as ws from "./ws";

//set up global variables.
export let pc;
let dataChannel;
const icecandidatesGenerated = [];
const icecandidatesReceivedBuffer = [];

// step 1
const webRTCConfigurations ={
    iceServers:[
        {
            urls: [
                "stun:stun.l.google.com:19302",
                "stun:stun2.l.google.com:19302",
                "stun:stun3.l.google.com:19302",
                "stun:stun4.l.google.com:19302"
            ]
        }
    ]
}

//function will be called in creators side.
export async function startWebRTCProcess(){
    let offer;
    await createPeerConnectionObject();
    //adding local stream to peer connection.
    addStreams();
    createDataChannel(true);
    offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    ws.sendOffer(offer);
}//end of startWebRTCProcess function.

//function to create peer connection object.
async function createPeerConnectionObject(){
    pc = new RTCPeerConnection(webRTCConfigurations); //passing the iceServers.
    
    pc.addEventListener("connectionstatechange", (e)=>{
        console.log("Connection state changed to:",pc.connectionState);
        if(pc.connectionState === "connected"){
            alert("Connected to peer.");
        }
    })

    pc.addEventListener("signalingstatechange", (e)=>{
        console.log("Signaling state changed to: ", pc.signalingState);
    })

    pc.addEventListener("icecandidate", (e)=>{
        if(e.candidate){
            console.log("ICE: ",e.candidate);
            icecandidatesGenerated.push(e.candidate);
        }
    })

    pc.addEventListener("track", (e)=>{
        console.log("Got a Track fom peer: ",e);
        e.streams[0].getTracks().forEach(track=>{
            state.getState().remoteStream.addTrack(track,state.getState().remoteStream);
        })
        console.log("yoyoyoyoyoyo");
        document.dispatchEvent(new Event("remote-stream-updated"));
    })
    
}


//function to create a data channel.
function createDataChannel(isOffer){
    if(isOffer){
        const dataChannelOptions = {
            ordered: false,
            maxRetransmits: 0,
        }
        dataChannel = pc.createDataChannel("top-secret-channel", dataChannelOptions);
        registerDataChannelEventListeners();
    }else{
        pc.ondatachannel = (e)=>{
            dataChannel = e.channel
            registerDataChannelEventListeners();
        }
    }
}//end of createDataChannel function.

// handleAnswer function.
export async function handleAnswer(data){
    ws.sendIceCandidates(icecandidatesGenerated);
    await pc.setRemoteDescription(data.answer);
    //adding ice candidates from buffer.
    for(const candidate of icecandidatesReceivedBuffer){
        await pc.addIceCandidate(candidate);
    }
    icecandidatesReceivedBuffer.splice(0,icecandidatesReceivedBuffer.length); //reset buffer.
}
//handle ice candidates received function.
export function iceCandidatesReceived(data){
    if(pc.remoteDescription){
        try{
            data.candidate.forEach(can =>{
                pc.addIceCandidate(can);
            })
        }catch(e){
            console.log("Error adding ice candidate: ",e);
        }
    }else{
        data.candidate.forEach(can=>{
            icecandidatesReceivedBuffer.push(can);
        })
    }
}//end of iceCandidatesReceived function.


//register event listeners for data channel.
function registerDataChannelEventListeners(){
    dataChannel.addEventListener("message", (e)=>{

    })
    dataChannel.addEventListener("close", (e)=>{
        //will fire for all users that are listening to this data channel.
        console.log("the close event was fired on your data channel");
    });
    dataChannel.addEventListener("open", (e)=>{
        //this will  fire when webRTC connection is established.
        console.log("data channel has been opened. you are now ready to send and receive messages over your data channel..");
    });
}//end of registerDataChannelEventListeners function.




//reciever side.
export async function handleOffer(data){
    let answer;
    await createPeerConnectionObject();
    //adding local stream to peer connection.
    if(!state.getState().localStream){
        state.setLocalStream(await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true,
        }));
        addStreams();
    }else{
        addStreams();
    }
    // addStreams();
    createDataChannel(false);
    await pc.setRemoteDescription(data.offer);
    answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);
    ws.sendAnswer(answer);
    ws.sendIceCandidates(icecandidatesGenerated);
}



//function to add local stream to peer connection.
function addStreams(){
    if(pc){
        // console.log("created a pc", localStream)
        state.getState().localStream.getTracks().forEach((track)=>{
            console.log("Adding track:  ",pc)
            pc.addTrack(track,state.getState().localStream);
        })
    }else{
        console.log("pc is null");
    }
       
}


export async function closePeerConnection(){
    if(pc){
        pc.close();
         console.log("You have closed your peer connection by calling the close() method.");
        pc = null;
        // state.setLocalStream(null);
        state.setRemoteStream(new MediaStream());
    }  
    console.log("Your pc object after exiting the room is now: ",pc);
}