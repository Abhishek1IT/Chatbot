import { useEffect, useState } from "react";
import io from "socket.io-client";
import "./App.css";

const socket = io("http://localhost:5000");

export default function Chat() {
  const [msg, setMsg] = useState("");
  const [chat, setChat] = useState([]);

  useEffect(() => {
    socket.on("reply", (reply) => {
      setChat((prev) => [...prev, { bot: reply }]);
    });

    return () => {
      socket.off("reply");
    };
  }, []);

  const sendMessage = () => {
    if (msg.trim() === "") return;
    socket.emit("message", msg);
    setChat((prev) => [...prev, { user: msg }]);
    setMsg("");
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <h2>Chat Bot</h2>
      </div>

      <div className="chat-box">
        {chat.map((c, i) => (
          <div key={i} className={`message-row ${c.user ? "user-row" : "bot-row"}`}>
            <div className={`message ${c.user ? "user-msg" : "bot-msg"}`}>
              {c.user || c.bot}
            </div>
          </div>
        ))}
      </div>

      <div className="input-area">
        <input
          value={msg}
          onChange={(e) => setMsg(e.target.value)}
          placeholder="Type a message..."
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
}
