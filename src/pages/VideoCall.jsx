import { useState } from "react";
import * as state from "../modules/state";
import { useEffect } from "react";
import "../videoCall.css"
import { useRef } from "react";
import { useNavigate } from "react-router-dom";
import * as ajax from "../modules/ajax";
import * as ws from "../modules/ws";
function VideoCall() {
    const localVideoRef = useRef(null);
    const remoteVideoRef = useRef(null);
    const roomName = state.getState().roomName;
    const [date, setDate] = useState(new Date().toLocaleString());
    const[muteBtnText, setMuteBtnText] = useState("🔊");
    const[cameraBtnText, setCameraBtnText] = useState("🎦✅");
    const navigate = useNavigate();

    // console.log("roomName in video call page: ", roomName);
    //setting up websockets

    //setting video streams
    useEffect(() => {
        async function getMedia() {
            try {
                state.setLocalStream(await navigator.mediaDevices.getUserMedia({
                    video: true,
                    audio: true,
                }));
                if (localVideoRef.current) {
                    localVideoRef.current.srcObject = state.getState().localStream;
                }

            } catch (e) {
                console.log(e);
            }
        }
        getMedia();
        const handleRemoteStreamUpdated = () => {
            console.log("remote stream updated");
            if (remoteVideoRef.current) {
                remoteVideoRef.current.srcObject = state.getState().remoteStream;
            }
        };

        document.addEventListener("remote-stream-updated", handleRemoteStreamUpdated);

    }, [])

    useEffect(() => {
        const interval = setInterval(() => {
            setDate(new Date().toLocaleString());
        }, 1000)
        return () => clearInterval(interval);
    }, [])

    async function handleExitRoom(e) {
        e.preventDefault();
        console.log("exit room clicked");
        let userId = state.getState().userId;
        if (state.getState().otherUserId === null) {
            const isSuccess = await ajax.destroyRoom(roomName, userId);
            if (isSuccess) {
                state.setRoomName(null);
                state.setUserId(null);
            }
        } else {
            state.setJoineeStatus(false);
            state.setUserId(null);
            // webRTC connection close call.
            await ws.exitRoom(roomName, userId);
        }

        navigate("/");
    }
    
    //mute function
    function handleAudio (){
        if(state.getState().localStream){
            const audioTracks = state.getState().localStream.getAudioTracks()[0];
            if(audioTracks){
                audioTracks.enabled = !audioTracks.enabled;
                console.log("Mic is "+ (audioTracks.enabled ? "unmuted" : "muted"));
            }
            if(audioTracks.enabled){
                setMuteBtnText("🔊");
            }else{
                setMuteBtnText("🔇");
            }
        }
    }

    //camera function
     function handleCamera (){
        if(state.getState().localStream){
            const videoTracks = state.getState().localStream.getVideoTracks()[0];
            if(videoTracks){
                videoTracks.enabled = !videoTracks.enabled;
                console.log("Camera is "+ (videoTracks.enabled ? "on" : "off"));
            }
            if(videoTracks.enabled){
                setCameraBtnText("🎦✅");
            }else{
                setCameraBtnText("🎦❌");
            }
        }
     }

    async function copyText() {
        try {
            await navigator.clipboard.writeText(roomName);
        }
        catch (err) {
            console.log("Failed to copy text", err);
        }
    }
    return (
        <div className="vc_container">
            <div className="vc_body">
                <video id="local-video" ref={localVideoRef} autoPlay muted className="camera_video" />
                <video id="remote-video" ref={remoteVideoRef} autoPlay className="camera_video" />
            </div>
            <div className="features" style={{ marginTop: "20px" }}>
                <p className="date">{date}</p>
                <div className="features_buttons">
                    <button className="mute" onClick={handleAudio}>{muteBtnText}</button>
                    <button className="camera" onClick={handleCamera}>{cameraBtnText}</button>
                    <button className="endcall" onClick={handleExitRoom}>End Call</button>
                </div>
                <p onClick={copyText} style={{ cursor: "pointer" }}>Room Code: {roomName}📝</p>
            </div>
        </div>
    )
}

export default VideoCall;