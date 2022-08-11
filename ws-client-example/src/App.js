import React, { useState, useEffect } from "react";
import useWebSocket, { ReadyState } from "react-use-websocket";

import cavaloAudio from "./audio/cavalo.mp3";
import naoAudio from "./audio/nao.mp3";
import eleGostaAudio from "./audio/ele-gosta.mp3";
import queEIssoMeuFilhoCalmaAudio from "./audio/que-isso-meu-filho-calma.mp3";
import tomeAudio from "./audio/tome.mp3";
import uiAudio from "./audio/ui.mp3";

function getFunnyAudioByMessage(message = "") {
  if (message.includes("cavalo")) return new Audio(cavaloAudio);
  if (message.includes("não")) return new Audio(naoAudio);
  if (message.includes("ele gosta")) return new Audio(eleGostaAudio);
  if (message.includes("que é isso meu filho calma")) return new Audio(queEIssoMeuFilhoCalmaAudio);
  if (message.includes("tome")) return new Audio(tomeAudio);
  if (message.includes("ui")) return new Audio(uiAudio);

  return null;
}

function UsernameForm({ setUsername }) {
  const [formValue, setFormValue] = useState("");

  return (
    <div>
      <input type="text" value={formValue} onChange={e => setFormValue(e.target.value)} />
      <button onClick={() => setUsername(formValue)}>Set username</button>
    </div>
  );
}

function ChatScreen({ username }) {
  const [socketUrl] = useState(process.env.REACT_APP_WS_URL);
  const [messageHistory, setMessageHistory] = useState([]);
  const [message, setMessage] = useState("");
  const { lastMessage, readyState, sendJsonMessage } = useWebSocket(socketUrl);

  useEffect(() => {
    if (lastMessage !== null) {
      console.log("lastMessage", lastMessage)
      if (lastMessage.data) {
        const lastMessageData = JSON.parse(lastMessage.data);
        const audio = getFunnyAudioByMessage(lastMessageData.message);

        if (audio) {
          audio.play();
        }

        setMessageHistory((prev) => prev.concat(lastMessageData));
      }
    }
  }, [lastMessage, setMessageHistory]);

  const handleClickSendMessage = () => {
    const messageBody = {
      action: "onMessage",
      message,
      username
    };
    
    sendJsonMessage(messageBody);
    setMessage("");
  };

  return (
    <div>
      <div>
        <input type="text" value={message} onChange={e => setMessage(e.target.value)} />
        <button
          onClick={handleClickSendMessage}
          disabled={readyState !== ReadyState.OPEN}
        >
          Send message
        </button>
      </div>
      <div>
        <ul>
          {messageHistory.map((item, idx) => (
            <li key={idx}>{item.username} {item.sentDate}: {item.message}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function App() {
  const [username, setUsername] = useState();
  
  return username 
    ? <ChatScreen username={username}/> 
    : <UsernameForm setUsername={setUsername} />
}

export default App;
