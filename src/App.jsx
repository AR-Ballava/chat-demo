import React from "react";
import ChatApp from "./Chat";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Home from "./Home";
import Chat from "./Chat";



const App = () => {
  return (
  
      <BrowserRouter>
        <Routes>
          
          <Route path="/" element={<Home />} />
          <Route path="/chat" element={<Chat />} />

        </Routes>
      </BrowserRouter>
  );
};

export default App;
