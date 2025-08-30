import React, { useEffect, useRef } from "react";
import "../join.css"
import * as ws from "../modules/ws";
import * as state from "../modules/state";

function Join(){
    const localVideoRef = useRef(null);
    //setting video streams
    useEffect(()=>{
        async function getMedia(){
            try{
                state.setLocalStream(await navigator.mediaDevices.getUserMedia({
                    video: true,
                    audio: true,
                }));
                if(localVideoRef.current){
                    localVideoRef.current.srcObject = state.getState().localStream;
                }


            }catch(e){
                console.log(e);
            }
        }
        getMedia();
    },[])

    async function handleJoin(){
        await ws.joinRoom(state.getState().roomName, state.getState().userId);
    }

    return(
        <div className = "join-container">
           <div className="join-nav">
                    <h1>TOVO</h1>
           </div>
           <div className="media-container">
                <div className="video-container">
                    <video id="local-video" ref={localVideoRef} autoPlay muted className="camera_video" />
                </div>
                
                <div className="join-confirm">
                    <h2>Ready to join?</h2>
                    <button className="join-btn" onClick={handleJoin}>Join</button>
                </div>
           </div>
        </div>
    )
}

export default Join;