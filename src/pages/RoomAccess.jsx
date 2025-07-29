import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import * as state from "../modules/state";
import * as ws from "../modules/ws";
import * as ajax from "../modules/ajax";
import "../../public/styles/roomAccess.css";
function RoomAccess() {
    const [userId, setUserId] = useState("");
    const [userName, setUserName] = useState("");
    const [roomName, setRoomName] = useState("");
    const [roomOperation, setRoomOperation] = useState("");
    let wsClientConnection = null;
    const navigate = useNavigate();

    const WS_URL = import.meta.env.VITE_WS_URL;

    // Generate userId once on mount
    useEffect(() => {
        setUserId(Math.round(Math.random() * 1000000));
    }, []);

    // WebSocket connection setup when userId is set
    useEffect(() => {
        if (userId) {
            state.setUserId(userId);
            wsClientConnection = new WebSocket(`${WS_URL}/?userId=${userId}`);
            console.log("WebSocket created:", wsClientConnection);
            ws.registerSocketEvents(wsClientConnection);
        }
    }, [userId]);

    // 🟢 Monitor joineeStatus and navigate to /lobby when true
    useEffect(() => {
        const interval = setInterval(() => {
            if (state.getState().joineeStatus) {
                clearInterval(interval);
                navigate(`/lobby/${state.getState().userId}`);
            }
        }, 100);

        return () => clearInterval(interval);
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        state.setUserName(userName);

        if (roomOperation === "createRoom") {
            const isSuccess = await ajax.createRoom(roomName, userId);
            if (isSuccess) {
                console.log("Successfully created room");
                // state.setJoineeStatus(true);
                navigate(`/lobby/${userId}`);
            }
        }

        if (roomOperation === "joinRoom") {
           await ws.joinRoom(roomName, userId);
        }
    };

    const handleOperationClick = (e) => {
        setRoomOperation(e.target.value);
    };

    return (
        <>
            <form onSubmit={handleSubmit}>
                <label htmlFor="userName">User Name: </label>
                <input
                    type="text"
                    name="userName"
                    placeholder="Enter User Name"
                    onChange={(e) => setUserName(e.target.value)}
                    required
                />

                <label htmlFor="roomName">Room Name: </label>
                <input
                    type="text"
                    name="roomName"
                    placeholder="Enter Room Name"
                    onChange={(e) => setRoomName(e.target.value)}
                    required
                />

                <button type="submit" value="createRoom" onClick={handleOperationClick}>
                    Create Room
                </button>
                <button type="submit" value="joinRoom" onClick={handleOperationClick}>
                    Join Room
                </button>
            </form>
        </>
    );
}

export default RoomAccess;
