import React, { useEffect, useState } from 'react'
import SockJS from 'sockjs-client';
import Stomp from "stompjs"
import  './Chat.css'

const Chat = () => {

    const [stompClient, setStompClient] = useState(null);
    const [connected, setConnected] = useState(false);
    const [message, setMessage] = useState([]);
    const [sender, setSender] = useState("");
    const [receiver, setReceiver] = useState("");
    const [messageContent, setMessageContent] = useState("");
    const [time, setTime] = useState();

  // let check = false;
  // function MyComponent() {
  //   useEffect(() => {
  //     if (!check) {
  //       connect();
  //       check = true;
  //     }
  //   }, []);
  // }
  // MyComponent();
  useEffect(() => {
    connect();
  }, [])
  
    
    const connect = () =>{
        const socket = new SockJS("https://chat-demo-backend-production-69c0.up.railway.app/chat");
        const stomp = Stomp.over(socket);

        stomp.connect({}, (frame) => {  
            console.log("Connected : " + frame);
            setConnected(true);
            setStompClient(stomp);

            //public chat
            stomp.subscribe("/topic/message", (msg) =>{
                const body = JSON.parse(msg.body);
                setMessage((perv) => [...perv, body]);
            });

            //private chat
            stomp.subscribe(`/user/${sender}/queue/private`, (msg) => {
              const body = JSON.parse(msg.body);
              setMessage((perv) => [...perv, {...body, private:true}]);
            });
        });
    };

    const sendMessage = () =>{
        if(stompClient && sender.trim() != "" && messageContent.trim() != ""){
            const chatMessage = {
                sender: sender,
                content: messageContent,
                time: time
            };

            stompClient.send("/app/sendMessage", {}, JSON.stringify(chatMessage));
            setMessageContent("");
        };
    };

    const sendPrivateMessage = () =>{
      if(stompClient && sender.trim() && receiver.trim() != "" && messageContent.trim() != ""){
            const chatMessage = {
                sender: sender,
                receiver: receiver,
                content: messageContent,
                time: time
            };
            

            stompClient.send("/app/private-message", {}, JSON.stringify(chatMessage));
            setMessageContent("");
        };
    };
  

  return (
    <>
      <h1 className="text-center m-3" style={{color:'yellow', fontWeight:'bolder'}}>Rahuls Real-Time Chat Application</h1>
      <div className="container mt-1 mainbox">


      <div className="box">
        {message.map((msg, index) => (
          <div key={index} className="border-bottom mb-2 parent" id={msg.sender == sender ? "you" : "other"}>

            <div className="child1">
              {msg.content}
            </div>

            <div className="child2">
              <div className="det">{msg.sender}</div>
              <div className="det">{msg.time.substring(11, 16)}</div>
            </div>
            
          </div>
        ))}
      </div>

      <div className="input container">
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

// just try