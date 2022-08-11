import React, { useState } from "react";
import { ChatScreen } from "./components/Chat";
import { UsernameForm } from "./components/Username";

function App() {
  const [username, setUsername] = useState();
  
  return username 
    ? <ChatScreen username={username}/> 
    : <UsernameForm setUsername={setUsername} />
}

export default App;
