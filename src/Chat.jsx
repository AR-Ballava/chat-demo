import React, { useEffect, useState } from "react";
import SockJS from "sockjs-client";
import Stomp from "stompjs";
import "./Chat.css";

const Chat = () => {
  const [stompClient, setStompClient] = useState(null);
  const [connected, setConnected] = useState(false);
  const [message, setMessage] = useState([]);

  // Name system
  const [savedName, setSavedName] = useState(null); // name from sessionStorage
  const [typedName, setTypedName] = useState(""); 
  const [sender, setSender] = useState(""); 

  const [receiver, setReceiver] = useState("");
  const [messageContent, setMessageContent] = useState("");
  const [time, setTime] = useState("");

  // Load saved name (sessionStorage clears on tab close/refresh)
  useEffect(() => {
    const stored = sessionStorage.getItem("chat_username");
    if (stored) {
      setSavedName(stored);
      setSender(stored);
    }
  }, []);

  useEffect(() => {
    connect();
  }, []);

  const connect = () => {
    const socket = new SockJS(
      "https://chat-room-backend-1-s85w.onrender.com/chat"
    );
    const stomp = Stomp.over(socket);

    stomp.connect({}, (frame) => {
      console.log("Connected : " + frame);
      setConnected(true);
      setStompClient(stomp);

      stomp.subscribe("/topic/message", (msg) => {
        const body = JSON.parse(msg.body);
        setMessage((prev) => [...prev, body]);
      });

      if (sender) {
        stomp.subscribe(`/user/${sender}/queue/private`, (msg) => {
          const body = JSON.parse(msg.body);
          setMessage((prev) => [...prev, { ...body, private: true }]);
        });
      }
    });
  };

  // send public message
  const sendMessage = () => {
    if (stompClient && sender.trim() !== "" && messageContent.trim() !== "") {
      const time = new Date().toISOString();
      const chatMessage = {
        sender: sender,
        content: messageContent,
        time: time,
      };

      stompClient.send("/app/sendMessage", {}, JSON.stringify(chatMessage));
      setMessageContent("");
    }
  };

  // send private message
  const sendPrivateMessage = () => {
    if (
      stompClient &&
      sender.trim() &&
      receiver.trim() !== "" &&
      messageContent.trim() !== ""
    ) {
      const chatMessage = {
        sender: sender,
        receiver: receiver,
        content: messageContent,
        time: time,
      };

      stompClient.send("/app/private-message", {}, JSON.stringify(chatMessage));
      setMessageContent("");
    }
  };

  // ----------------------------------------------------------------
  // NAME SCREEN — shows every time because sessionStorage resets
  // ----------------------------------------------------------------
  if (!savedName) {
    return (
      <div style={{ padding: "40px", textAlign: "center", color: "white" }}>
        <h2>Enter your name</h2>

        <input
          type="text"
          className="form-control"
          placeholder="Your name..."
          style={{ maxWidth: "350px", margin: "20px auto" }}
          value={typedName}
          onChange={(e) => setTypedName(e.target.value)}
        />

        <button
          className="btn btn-warning"
          style={{ marginTop: "20px" }}
          onClick={() => {
            if (typedName.trim() === "") return;

            sessionStorage.setItem("chat_username", typedName);
            setSavedName(typedName);
            setSender(typedName);
          }}
        >
          Continue
        </button>
      </div>
    );
  }

  // ----------------------------------------------------------------
  // MAIN CHAT UI
  // ----------------------------------------------------------------
  return (
    <>
      <h2
        className="text-center mt-3 "
        style={{ color: "rgba(255, 255, 0, 0.853)", fontWeight: "normal" }}
      >
        Wait for peopel's to join or say hello?
      </h2>

      <div className="container mt-1 mainbox">
        <div className="box">
          {message.map((msg, index) => (
            <div
              key={index}
              className="border-bottom mb-2 parent"
              id={msg.sender === sender ? "you" : "other"}
            >
              <div className="child1">{msg.content}</div>

              <div className="child2">
                <div className="det">{msg.sender}</div>
                <div className="det">
                  {msg.time ? msg.time.substring(11, 16) : ""}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="input container">
          <div className="input-group">
            <input
              value={messageContent}
              onChange={(e) => setMessageContent(e.target.value)}
              className="form-control"
              type="text"
              placeholder="type a message..."
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            />
            <button
              className="btn btn-warning"
              onClick={sendMessage}
              disabled={!connected}
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Chat;
