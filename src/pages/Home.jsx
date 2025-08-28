import React, { use, useEffect, useState } from "react";
import "../home.css"
import * as state from "../modules/state.js";
import { useNavigate } from "react-router-dom";
import * as ajax from "../modules/ajax.js"

function Home() {
    const [roomName, setRoomName] = useState("");
    const [date, setDate] = useState(new Date().toLocaleString());
    const [isDisabled, setIsDisabled] = useState(true);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const images = [import.meta.env.VITE_WEBRTC_IMAGE_URL, import.meta.env.VITE_WEBSOCKET_IMAGE_URL];

    const navigate = useNavigate();

    //enable join room button only when room code is entered
    useEffect(() => {
        if (roomName) {
            setIsDisabled(false);
        } else {
            setIsDisabled(true);
        }
    }, [roomName]);

    //update date on every second
    useEffect(() => {
        const interval = setInterval(() => {
            setDate(new Date().toLocaleString());
        }, 1000) //updates every second
        return () => clearInterval(interval); //cleanup function to clear the interval
    }, []);

   
    //create room function
    const handleCreateRoom = async (e) => {
        e.preventDefault();
        //step1 : creating userId and setting it to state.
        const userId = Math.round(Math.random()*1000000000);
        console.log("userId: ", userId);
        await state.setUserId(userId);
        console.log("userId from state: ", state.getState().userId);

        //step2 : creating a roomName and setting it to state.
        await generatingRoomName();
        //step3: creating a room at backend server by making an api call.
        const isSuccess = await ajax.createRoom(state.getState().roomName, state.getState().userId);
        await navigateToVC(isSuccess);
    }

    //join room function
    const handleJoinRoom = async (e) => {
        e.preventDefault();
        console.log("join room clicked");
        await state.setRoomName(roomName);
        await state.setJoineeStatus(true);
        navigate(`/room/${roomName}`);
    }
    
    async function generatingRoomName(){
        const roomCode =  Math.round(Math.random()*10000000);
        await state.setRoomName(roomCode.toString());
        console.log("create room clicked roomName: ", state.getState().roomName);
    }

    async function navigateToVC(isSuccess){
         if(isSuccess){
            navigate(`/room/${state.getState().roomName}`);
        }else{
            //if room creation failed, reset userId and roomName in state.
            state.setRoomName(null);
            await generatingRoomName();
            const response = await ajax.createRoom(state.getState().roomName, state.getState().userId);
            await navigateToVC(response);
        }
    }

    return (
        <div className="home-container">
            <div className="home-nav">
                <h2>Welcome to My app</h2>
                <p>{date}</p>
            </div>
            <div className="home-body">
                <div className="description">
                    <h2>A one to one video conferencing app</h2>
                    <p>This is a one to one video conferencing app that allows users to connect with each other and share their video and audio streams using <b>WebRTC and WebSockets</b>.</p>
                    <hr  style={{ border: "1px solid black", width: "80%", margin: "0 0 2rem 0" }} />
                    <div className="operations">
                        <button className="create-room-btn" onClick={handleCreateRoom}>Create a Room</button>
                        <input className="room-code-input" type="text" placeholder="Enter code to create or join a room."  onChange={(e) => { setRoomName(e.target.value) }} />
                        <button className="join-room-btn" value={"joinRoom"} disabled={isDisabled}
                        onClick={handleJoinRoom}>Join a Room</button>
                    </div>
                </div>
                <div className="section-2">
                    <div className="image-carousel">
                        <button className="prev" onClick={() => { setCurrentImageIndex((currentImageIndex > 0) ? (currentImageIndex - 1) % images.length : images.length - 1) }}>{"<"}</button>
                        <img src={images[currentImageIndex]} alt="WebRTC and WebSockets" />
                        <button className="next" onClick={() => {
                            setCurrentImageIndex((currentImageIndex + 1) % images.length)
                        }}>{">"}</button>
                    </div>
                    <div className="image-text">
                        {currentImageIndex === 0 ? <p className="webrtc-text" >WebRTC is an open-source technology that enables real-time audio, video, and data sharing directly between browsers and mobile apps using peer-to-peer (P2P) connections. It powers video calls, gaming, and messaging with low latency and is supported by major browsers.
                        </p> :
                            <p className="websocket-text">
                                WebSockets is a communication protocol that provides full-duplex communication channels over a single TCP connection. It enables real-time data transfer between a client (like a web browser) and a server, allowing for interactive applications such as chat apps, live updates, and online gaming.
                            </p>
                        }
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Home;