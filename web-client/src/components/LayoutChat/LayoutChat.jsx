import React, { useState } from "react";
import "./LayoutChat.css";
import { FaPaperPlane, FaEllipsisV } from "react-icons/fa";

export default function LayoutChat({ conversa }) {
  const [mensagem, setMensagem] = useState("");

  // Sem conversa selecionada
  if (!conversa) {
    return (
      <div className="chat-vazio">
        <p>Selecione uma conversa para começar a interagir.</p>
      </div>
    );
  }

  return (
    <div className="layout-chat">
      {/* CABEÇALHO */}
      <div className="chat-header">
        <div className="chat-header-info">
          <div className="avatar">
            {conversa.foto ? (
              <img src={conversa.foto} alt={conversa.nome} />
            ) : (
              conversa.nome[0]
            )}
          </div>

          <div>
            <strong>{conversa.nome}</strong>
            <span className="status">Online</span>
          </div>
        </div>

        <button className="icon-btn">
          <FaEllipsisV />
        </button>
      </div>

      {/* MENSAGENS */}
      <div className="chat-messages">
        {/* RECEBIDA */}
        <div className="mensagem recebida">
          <p>Olá! Como posso te ajudar hoje?</p>
          <span className="hora">14:35</span>
        </div>

        {/* ENVIADA */}
        <div className="mensagem enviada">
          <p>Oi! Estou com uma dúvida sobre o meu pedido.</p>
          <span className="hora">14:36</span>
        </div>
      </div>

      {/* INPUT */}
      <div className="chat-input">
        <input
          type="text"
          placeholder="Digite sua mensagem..."
          value={mensagem}
          onChange={(e) => setMensagem(e.target.value)}
        />

        <button className="btn-enviar">
          <FaPaperPlane />
        </button>
      </div>
    </div>
  );
}
