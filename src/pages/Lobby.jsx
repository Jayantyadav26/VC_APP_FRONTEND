import React, { useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../public/styles/lobby.css"
import * as state from "../modules/state";
import * as ajax from "../modules/ajax";
import * as ws from "../modules/ws";
import * as webRTCHandler from "../modules/webRTCHandler";

function Lobby() {
    const videoRef = useRef(null);
    const remoteVideoRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        async function getMedia() {
            try {
                state.setLocalStream(await navigator.mediaDevices.getUserMedia({
                    video: true,
                    audio: true,
                }));
                if (videoRef.current) {
                    videoRef.current.srcObject = state.getState().localStream;
                }

                if (remoteVideoRef.current) {
                    remoteVideoRef.current.srcObject = state.getState().remoteStream;
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

    const handleDestroyRoom = async (e) => {
        e.preventDefault();
        console.log("Destroying room");
        let roomName = state.getState().roomName;
        let userId = state.getState().userId;

        if (state.getState().otherUserId === null) {
            const isSuccess = await ajax.destroyRoom(roomName, userId);
            if (isSuccess) {
                state.setRoomName(null);
                // state.setUserId(null);
            }
        } else {
            state.setJoineeStatus(false);
            state.setUserId(null);
            await ws.exitRoom(roomName, userId);
            // console.log("exit function haggiiiiiiiiiiiiii");
            await webRTCHandler.closePeerConnection();
        }

        console.log("navigating to /");
        navigate("/");
    }


    return (
        <>
            <p>Hello, welcome to Room: {state.getState().roomName}</p>
            <div className="video-container">
                <video id="local-video" ref={videoRef} autoPlay muted />
                <video id="remote-video" ref={remoteVideoRef} autoPlay />
            </div>
            <div className="lobby-buttons">
                <button className="destroy" onClick={handleDestroyRoom}>Leave Room</button>
            </div>
        </>
    )
}

export default Lobby;