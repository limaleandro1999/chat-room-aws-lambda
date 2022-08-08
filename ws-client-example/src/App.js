import React, { useState, useEffect } from "react";
import useWebSocket, { ReadyState } from "react-use-websocket";

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
        setMessageHistory((prev) => prev.concat(JSON.parse(lastMessage.data)));
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
