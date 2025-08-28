import * as state from "./state";
import * as constants from "./constants";
import * as webRTCHandler from "./webRTCHandler";

export async function registerSocketEvents(wsClientConnection) {
  state.setUserWebSocketConnection(wsClientConnection);
  // console.log("hui huihui",state.getState().userWebSocketConnection);
  wsClientConnection.onopen = () => {
    console.log("WebSocket connection established");

    //registering other 3 events
    wsClientConnection.onmessage = handleMessage;
    wsClientConnection.onclose = handleClose;
    wsClientConnection.onerror = handleError;

    setInterval(() => {
      if (wsClientConnection.readyState === WebSocket.OPEN) {
        wsClientConnection.send(JSON.stringify({ type: "ping" }));
      }
    }, 30000);
  };
}

const handleClose = (closeEventObject) => {
  console.log("WebSocket connection closed");
  state.setUserWebSocketConnection(null);
};

const handleError = (errorEventObject) => {
  console.log("WebSocket connection error");
};

//Outgoing message to the server.
export async function joinRoom(roomName, userId) {
  const message = {
    label: constants.label.NORMAL_SERVER_PROCESS,
    data: {
      type: constants.type.ROOM_JOIN.REQUEST,
      roomName,
      userId,
    },
  };
  state.getState().userWebSocketConnection.send(JSON.stringify(message));
  return;
}

export async function exitRoom(roomName, userId) {
  const message = {
    label: constants.label.NORMAL_SERVER_PROCESS,
    data: {
      type: constants.type.ROOM_EXIT.REQUEST,
      roomName,
      userId,
    },
  };
  state.getState().userWebSocketConnection.send(JSON.stringify(message));
  return;
}

// send offer function.
export function sendOffer(offer) {
  const message = {
    label: constants.label.WEBRTC_PROCESS,
    data: {
      type: constants.type.WEB_RTC.OFFER,
      offer,
      otherUserId: state.getState().otherUserId,
    },
  };
  state.getState().userWebSocketConnection.send(JSON.stringify(message));
} //end of sendOffer function.

//sendAnswer function.
export function sendAnswer(answer) {
  const message = {
    label: constants.label.WEBRTC_PROCESS,
    data: {
      type: constants.type.WEB_RTC.ANSWER,
      answer,
      otherUserId: state.getState().otherUserId,
    },
  };
  state.getState().userWebSocketConnection.send(JSON.stringify(message));
} //end of sendAnswer function.

//sendIceCandidates function.
export function sendIceCandidates(icecandidatesGenerated) {
  const message = {
    label: constants.label.WEBRTC_PROCESS,
    data: {
      type: constants.type.WEB_RTC.ICE_CANDIDATE,
      candidate: icecandidatesGenerated,
      otherUserId: state.getState().otherUserId,
    },
  };
  state.getState().userWebSocketConnection.send(JSON.stringify(message));
}

//incoming message from the server.
const handleMessage = (incomingMessageObject) => {
  const serverMessage = JSON.parse(incomingMessageObject.data);
  //process based on the label.
  switch (serverMessage.label) {
    case constants.label.NORMAL_SERVER_PROCESS:
      normalServerProcessing(serverMessage.data);
      break;
    case constants.label.WEBRTC_PROCESS:
      webRTCProcessing(serverMessage.data);
      break;
    default:
      console.log("Unknown message type: ", serverMessage);
      break;
  }
};

//normal server processing function.
function normalServerProcessing(data) {
  //process the request based on its type.
  switch (data.type) {
    case constants.type.ROOM_JOIN.RESPONSE_SUCCESS:
      joinSuccessHandler(data);
      break;
    case constants.type.ROOM_JOIN.RESPONSE_FAILURE:
      alert(data.message);
      break;
    case constants.type.ROOM_JOIN.NOTIFY:
      joinNotifyHandler(data);
      break;
    case constants.type.ROOM_EXIT.NOTIFY:
      exitNotifyHandler(data);
      break;
    case constants.type.ROOM_DISCONNECT.NOTIFY:
      exitNotifyHandler(data);
      break;
    default:
      console.log("Unknown request type: ", data);
      break;
  }
}

function joinSuccessHandler(data) {
  // const navigate = useNavigate();
  //adding the other UserId to the state object.
  const otherUserId = data.creatorsId;
  const roomName = data.roomName;
  state.setOtherUserId(otherUserId);
  state.setRoomName(roomName);
  // alert("succesfully joined room ");
  state.setJoineeStatus(false);
}

function joinNotifyHandler(data) {
  //setting state of other user.
  let otherUserId = data.joineeId;
  state.setOtherUserId(otherUserId);
  // alert(data.message);
  webRTCHandler.startWebRTCProcess();
}

async function exitNotifyHandler(data) {
  // alert(data.message);
  console.log("User has left the room.");
  await webRTCHandler.closePeerConnection();
}

//webRTC processing function.
function webRTCProcessing(data) {
  switch (data.type) {
    case constants.type.WEB_RTC.OFFER:
      webRTCHandler.handleOffer(data);
      break;
    case constants.type.WEB_RTC.ANSWER:
      webRTCHandler.handleAnswer(data);
      break;
    case constants.type.WEB_RTC.ICE_CANDIDATE:
      webRTCHandler.iceCandidatesReceived(data);
      break;
    default:
      console.log("Unknown request type: ", data);
      break;
  }
}
