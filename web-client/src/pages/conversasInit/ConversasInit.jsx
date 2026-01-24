//import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./ConversasInit.css";
import Sidebar from "../components/BarraLateral";

export default function ConversasInit() {
  const navigate = useNavigate();
 

 
  return (
    <div className="conversas-container">
      
        <Sidebar />
       
      
    </div>
  );
}
