// import modules
import * as state from "./state";
import * as ws from "./ws";

// set up global variables
export let pc;
let dataChannel;
const icecandidatesGenerated = [];
const icecandidatesReceivedBuffer = [];

// Step 1: ICE server config
const webRTCConfigurations = {
    iceServers: [
        {
            urls: [
                "stun:stun.l.google.com:19302",
                "stun:stun2.l.google.com:19302",
                "stun:stun3.l.google.com:19302",
                "stun:stun4.l.google.com:19302"
            ]
        },
        // OPTIONAL: TURN server for production
        // {
        //     urls: "turn:your.turn.server:3478",
        //     username: "user",
        //     credential: "pass"
        // }
    ]
};

// Start WebRTC on offerer side
export async function startWebRTCProcess() {
    if (!state.getState().localStream) {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        state.setLocalStream(stream);
    }

    await createPeerConnectionObject();
    addStreams();
    createDataChannel(true);

    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    ws.sendOffer(offer);
}

// Create RTCPeerConnection
async function createPeerConnectionObject() {
    pc = new RTCPeerConnection(webRTCConfigurations);

    pc.addEventListener("connectionstatechange", () => {
        console.log("Connection state changed to:", pc.connectionState);
        if (pc.connectionState === "connected") {
            alert("Connected to peer.");
        }
    });

    pc.addEventListener("signalingstatechange", () => {
        console.log("Signaling state changed to:", pc.signalingState);
    });

    pc.addEventListener("iceconnectionstatechange", () => {
        console.log("ICE Connection State:", pc.iceConnectionState);
    });

    pc.addEventListener("icegatheringstatechange", () => {
        console.log("ICE Gathering State:", pc.iceGatheringState);
    });

    pc.addEventListener("icecandidate", (e) => {
        if (e.candidate) {
            console.log("ICE:", e.candidate);
            icecandidatesGenerated.push(e.candidate);
            // Send immediately
            ws.sendIceCandidates([e.candidate]);
        }
    });

    pc.addEventListener("track", (e) => {
        console.log("Got a Track from peer:", e);
        e.streams[0].getTracks().forEach(track => {
            state.getState().remoteStream.addTrack(track, state.getState().remoteStream);
        });
        document.dispatchEvent(new Event("remote-stream-updated"));
    });
}

// Create or receive data channel
function createDataChannel(isOffer) {
    if (isOffer) {
        const dataChannelOptions = {
            ordered: false,
            maxRetransmits: 0,
        };
        dataChannel = pc.createDataChannel("top-secret-channel", dataChannelOptions);
        registerDataChannelEventListeners();
    } else {
        pc.ondatachannel = (e) => {
            dataChannel = e.channel;
            registerDataChannelEventListeners();
        };
    }
}

// Handle answer (receiver -> sender)
export async function handleAnswer(data) {
    await pc.setRemoteDescription(data.answer);
    for (const candidate of icecandidatesReceivedBuffer) {
        await pc.addIceCandidate(candidate);
    }
    icecandidatesReceivedBuffer.length = 0;
}

// ICE candidates received from peer
export function iceCandidatesReceived(data) {
    if (pc.remoteDescription) {
        try {
            data.candidate.forEach(can => {
                pc.addIceCandidate(can);
            });
        } catch (e) {
            console.error("Error adding ice candidate:", e);
        }
    } else {
        data.candidate.forEach(can => {
            icecandidatesReceivedBuffer.push(can);
        });
    }
}

// Data channel events
function registerDataChannelEventListeners() {
    dataChannel.addEventListener("message", (e) => {
        console.log("Received data:", e.data);
    });
    dataChannel.addEventListener("close", () => {
        console.log("Data channel closed.");
    });
    dataChannel.addEventListener("open", () => {
        console.log("Data channel opened. Ready to send messages.");
    });
}

// Handle offer (sender -> receiver)
export async function handleOffer(data) {
    await createPeerConnectionObject();

    if (!state.getState().localStream) {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        state.setLocalStream(stream);
    }

    addStreams();
    createDataChannel(false);

    await pc.setRemoteDescription(data.offer);
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);

    ws.sendAnswer(answer);
}

// Add local stream to peer connection
function addStreams() {
    if (pc) {
        state.getState().localStream.getTracks().forEach(track => {
            pc.addTrack(track, state.getState().localStream);
        });
    } else {
        console.warn("Peer connection not initialized when calling addStreams");
    }
}

// Close connection
export async function closePeerConnection() {
    if (pc) {
        pc.close();
        pc = null;
        state.setRemoteStream(new MediaStream());
        console.log("Peer connection closed.");
    }
}
