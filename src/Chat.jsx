import React, { useEffect, useState } from 'react'
import SockJS from 'sockjs-client';
import Stomp from "stompjs"

const Chat = () => {

    const [stompClient, setStompClient] = useState(null);
    const [connected, setConnected] = useState(false);
    const [message, setMessage] = useState([]);
    const [sender, setSender] = useState( "");
    const [messageContent, setMessageContent] = useState("");

    useEffect(() => {
      if(!stompClient){
        connect();
      }
    }, [])
    
    const connect = () =>{
        const socket = new SockJS("http://localhost:8080/chat");
        const stomp = Stomp.over(socket);

        stomp.connect({}, (frame) => {
            console.log("Connected : " + frame);
            setConnected(true);
            setStompClient(stomp);

            stomp.subscribe("/topic/message", (msg) =>{
                const body = JSON.parse(msg.body);
                setMessage((perv) => [...perv, body]);
            });
        });
    };

    const sendMessage = () =>{
        if(stompClient && sender.trim() != "" && messageContent.trim() != ""){
            const chatMessage = {
                sender: sender,
                content: messageContent
            };

            stompClient.send("/app/sendMessage", {}, JSON.stringify(chatMessage));
            setMessageContent("");
        };
    };

  return (
    <>
        <div className="container mt-4">
      <h1 className="text-center">Real-Time Chat Application</h1>

      <div
        className="border rounded p-3 mb-3"
        style={{ height: "300px", overflowY: "auto" }}
      >
        {message.map((msg, index) => (
          <div key={index} className="border-bottom mb-1">
            <strong>{msg.sender}:</strong> {msg.content}
          </div>
        ))}
      </div>

      <div className="input-group mb-3">
        <input
          value={sender}
          onChange={(e) => setSender(e.target.value)}
          className="form-control"
          type="text"
          placeholder="your name..."
        />
      </div>

      <div className="input-group mb-3">
        <input
          value={messageContent}
          onChange={(e) => setMessageContent(e.target.value)}
          className="form-control"
          type="text"
          placeholder="type a message..."
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <button
          className="btn btn-primary"
          onClick={sendMessage}
          disabled={!connected}
        >
          Send
        </button>
      </div>
    </div>
    </>
  )
}

export default Chat