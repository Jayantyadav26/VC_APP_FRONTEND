import React, { use, useEffect, useState } from "react";
import VideoCall from "./VideoCall";
import * as state from "../modules/state";
import * as ws from "../modules/ws";
import { useNavigate } from "react-router-dom";
import Join from "./Join";
function Room() {
    const [joinee, setJoinee] = useState(state.getState().joineeStatus);
    let wsClientConnection = null;
    const WS_URL = import.meta.env.VITE_WS_URL;
    const navigate = useNavigate();
   
    console.log("joineeStatus in room page: ", state.getState().joineeStatus);

    useEffect(() => {
        if (state.getState().roomName === null) {
            navigate("/"); // redirect if no roomName
        }
    }, []);

    //Mointor joineeStatus and navigate to videoCall page when true
    useEffect(()=>{
        const interval = setInterval(()=>{
            if(!state.getState().joineeStatus){
                clearInterval(interval);
                setJoinee(false);
            }
        },100);
        return () => clearInterval(interval);
    },[]);
    
    //setup websocket connection.
    useEffect(() => {
        setupWebSocket();
        // cleanup: close socket when component unmounts
        return () => {
            if (wsClientConnection) {
                wsClientConnection.close();
                console.log("WebSocket connection closed");
            }
        };
    }, []); // run only once on mount

    async function setupWebSocket() {
        if (state.getState().joineeStatus === false) {
            //for creator.
            await webSocketConnector();
        } else {
            //setup userId for joinee.
            const userId = Math.round(Math.random() * 1000000000);
            await state.setUserId(userId);
            console.log("userId in room page: ", state.getState().userId);
            await webSocketConnector();
            //send join room request to server.
            // await ws.joinRoom(state.getState().roomName, state.getState().userId);
        }
    }

    async function webSocketConnector(){
        wsClientConnection = new WebSocket(`${WS_URL}/?userId=${state.getState().userId}`);
        await ws.registerSocketEvents(wsClientConnection);
    }


    return (
        <div className="room-container" style={{height: "100vh", width: "100vw"}}>
            {   (joinee=== false) ? <VideoCall />: <Join />}

        </div>
    )
}

export default Room;