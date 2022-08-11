
import { useEffect, useState } from "react";
import useWebSocket, { ReadyState } from "react-use-websocket";

import { getFunnyAudioByMessage } from "../utils/get-funny-audio-by-message";

export function ChatScreen({ username }) {
  const [socketUrl] = useState(process.env.REACT_APP_WS_URL);
  const [messageHistory, setMessageHistory] = useState([]);
  const [message, setMessage] = useState("");
  const { lastMessage, readyState, sendJsonMessage } = useWebSocket(
    socketUrl, 
    { queryParams: { username } }
  );

  useEffect(() => {
    if (lastMessage?.data) {
      const lastMessageData = JSON.parse(lastMessage.data);
      const audio = getFunnyAudioByMessage(lastMessageData.message);

      if (audio) {
        audio.play();
      }

      setMessageHistory((prev) => prev.concat(lastMessageData));
    }
  }, [lastMessage]);

  const handleClickSendMessage = () => {
    if (message.length > 200) {
      setMessageHistory((prev) => prev.concat({ 
        username: "ADM", 
        message: "Tá me tirando? Só pode no máximo 200 caracteres", 
        flag: "warn" })
      );
      setMessage("");

      return;
    }

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
        <input 
          type="text" 
          value={message} 
          onChange={e => setMessage(e.target.value)} 
          onKeyDown={e => e.key === "Enter" ? handleClickSendMessage() : null}
        />
        <button
          onClick={handleClickSendMessage}
          disabled={readyState !== ReadyState.OPEN}
        >
          Send message
        </button>
      </div>
      <div style={{ 
        overflow: "scroll", 
        height: 300, 
        display: "flex", 
        flexDirection: "column-reverse" 
      }}>
        <ul>
          {messageHistory
            .map((item, idx) => (
              <li 
                key={idx} 
                style={
                  item?.flag === "warn" 
                  ? {color: "red"} 
                  : null}
                >
                  {item.username} {item.sentDate}: {item.message}
              </li>
            ))}
        </ul>
      </div>
    </div>
  );
}