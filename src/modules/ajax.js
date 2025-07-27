import * as constants from "./constants";
import * as state from "./state";
// create a new room using fetch api.

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export async function createRoom(roomName, userId) {
  try {
    const response = await fetch(`${BACKEND_URL}/create-room`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ roomName, userId }),
    });

    const resObj = await response.json();

    if (resObj.data.type === constants.type.ROOM_CREATE.RESPONSE_SUCCESS) {
      state.setRoomName(roomName);
      alert(resObj.data.message);
      return true;
    }

    if (resObj.data.type === constants.type.ROOM_CREATE.RESPONSE_FAILURE) {
      alert(resObj.data.message);
      return false;
    }

    return false; // default fallback
  } catch (err) {
    console.error("Error creating room:", err);
    return false;
  }
}// end of createRoom function.


// function to destroy a room.
export async function destroyRoom(roomName, userId){
  try{
    const response = await fetch(`${BACKEND_URL}/destroy-room`,{
      method: "DELETE",
      headers:{
        "Content-Type": "application/json",
      },
      body: JSON.stringify({roomName, userId}),
    });

    const resObj = await response.json();
    if(resObj.data.type === constants.type.ROOM_DESTROY.RESPONSE_SUCCESS){
      alert(resObj.data.message);
      return true;
    }
    if(resObj.data.type === constants.type.ROOM_DESTROY.RESPONSE_FAILURE){
      alert(resObj.data.message);
      return false;
    }
    return false; //default fallback
  }catch(err){
    console.error("Error destroying room:", err);
    return false;
  }
}// end of destroyRoom function.


// // function to join a room using fetch api.
// export async function joinRoom(roomName,userId){
//   try{
//     const response = await fetch(`${BACKEND_URL}/join-room`, {
//       method: "POST",
//       headers:{
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({roomName,userId}),
//     });

//     const resObj = await response.json();
//     if(resObj.data.type === constants.type.ROOM_JOIN.RESPONSE_SUCCESS){
//       //adding the other UserId to the state object.
//       const otherUserId = resObj.data.otherUserId;
//       state.setOtherUserId(otherUserId);
//       alert("succesfully joined room ");
//       return true;
//     }
    
//     if(resObj.data.type === constants.type.ROOM_JOIN.RESPONSE_FAILURE){
//       alert(resObj.data.message);
//       return false;
//     }

//     return false; //default fallback
//   }catch(err){
//     console.log(err);
//     alert("Error joining room");
//     return false;
//   }
// }