import React, { useState } from "react";
import BarraLateral from "../../components/BarraLateral/BarraLateral.jsx";
import LayoutChat from "../../components/LayoutChat/LayoutChat.jsx";
import "./TelaChatAdmin.css";

export default function TelaChatAdmin() {
  const [conversaSelecionada, setConversaSelecionada] = useState(null);

  return (
    <div className="container">
      <div className="barra-lateral-wrapper">
        <BarraLateral aoSelecionarChat={setConversaSelecionada} />
      </div>

      <div className="chat-wrapper">
        <LayoutChat conversa={conversaSelecionada} />
      </div>
    </div>
  );
}
