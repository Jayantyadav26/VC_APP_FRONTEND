// this is a file to store all states related to the user.

//state object.
let state = {
    userId: null, //done
    userName: null, //done
    roomName: null, //done
    userWebSocketConnection: null, //done
    otherUserId: null,
    joineeStatus: false,
    localStream : null,
    remoteStream : new MediaStream(),
}

//generic setter function

const setState = (newState) =>{
    state = {
        ...state,
        ...newState
    }
}// end of setState function. It uses spread operator to update the state object.


export function setLocalStream(localStream){
    setState({localStream})
}

export function setRemoteStream(remoteStream){
    setState({remoteStream});
}

//Setter functions
// setUserId function
export const setUserId = async (userId) =>{
    setState({userId});
}

//setUserName function
export const setUserName = (userName) =>{
    setState({userName});
}

//setRoomName function
export const setRoomName = async (roomName) =>{
    setState({roomName});
}

//setOtherUserId function
export const setOtherUserId = (otherUserId) =>{
    setState({otherUserId});
}

//set userWebSocketConnection function
export const setUserWebSocketConnection = (userWebSocketConnection) =>{
    setState({userWebSocketConnection});
}

export const setJoineeStatus = async (joineeStatus) =>{
    setState({joineeStatus});
}

//Getter function
export const getState =() =>{
    return state;
}