import "./TelaInicialCliente.css";
import authedFetch from "../../services/authFetch";

import SearchBox from "../../components/SearchBox/SearchBox.jsx";
import Logo from "../../components/Logo/Logo.jsx";

import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";

import userIcon from "../../assets/icons/User.svg";
import configIcon from "../../assets/icons/Config.svg";


export default function TelaInicialCliente() {
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";
  const [chatId, setChatId] = useState(null);
  const userId = localStorage.getItem("userId");

  // Cria um novo chat ao entrar na tela
  useEffect(() => {
    authedFetch(`${API_URL}/api/users/${userId}/chats`, {
      method: "POST",
      body: JSON.stringify({ title: "", summary: "", type: "NORMAL" }),
    })
      .then(res => {
        if (!res.ok) throw new Error("Erro ao criar chat");
        return res.json();
      })
      .then(chat => {
        localStorage.setItem(`chatId_${userId}`, chat.id);
        setChatId(chat.id);
        console.log("✅ Chat criado com ID:", chat.id);
      })
      .catch(err => console.error("❌ Erro ao criar chat:", err));
  }, []);

  const handleSend = async (msg, id = chatId) => {
      if (!msg.trim() || !id) return;
  
      const userMessage = { 
        id: Math.random(),
        userId: "me",
        content: msg,
        hora: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
  
      // O cliente envia somente via REST (que aciona o agente e trata a resposta).
      // O WebSocket é usado apenas para RECEBER as mensagens do admin em tempo real;
      // enviar também por WS causaria chamada dupla ao agente e mensagens duplicadas.
  
      try {
        const response = await authedFetch(
          `${API_URL}/api/chats/${id}/messages`,
          {
            method: "POST",
            body: JSON.stringify({ message: userMessage.content }),
          }
        );
  
        if (!response.ok) throw new Error("Erro ao enviar mensagem");

        navigate("/chat-client");
  
      } catch (err) {
        console.error("Erro no envio:", err);
        alert("Erro ao enviar mensagem! Tente novamente.");
      }
  };

  return (
    <div className="tela-root">
      <div className="tela-inner">
        <div className="flex">
          <Logo />
          <h1 className="brand">
            PLANETA NET <span className="dot-telecom">.TELECOM</span>
          </h1>
        </div>
        <p className="help-text">Como posso te ajudar?</p>

        <SearchBox placeholder="Pergunte alguma coisa." onSend={handleSend} disabled={!chatId} />
      </div>

      <div className="tela-options">
        <div className="user-icon">
          <Link to={"/login"}>
            <i>
              <img src={userIcon} alt="Usuário" className="icon-img" />
            </i>
          </Link>
        </div>

        <div className="config-icon">
          <i>
            <img src={configIcon} alt="Configurações" className="icon-img" />
          </i>
        </div>
      </div>
    </div>
  );
}
