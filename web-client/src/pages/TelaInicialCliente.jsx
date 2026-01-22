import React from "react";
import "./TelaInicialCliente.css";
import logo from "../assets/images/logo.png"; // ajuste o nome conforme a imagem
import SearchBox from "../components/SearchBox";

export default function TelaInicialCliente() {

  function handleSend(text) {
    // aqui você pode integrar com backend (axios/fetch)
    console.log("Enviar:", text);
    // ex: axios.post('http://localhost:8080/chat', { message: text })
  }

  return (
    <div className="tela-root">
      <div className="tela-inner">
        <img src={logo} alt="Planeta Net logo" className="logo" />
        <h1 className="brand">PLANETA NET <span className="dot-telecom">.TELECOM</span></h1>
        <p className="help-text">Como posso te ajudar?</p>

        <SearchBox placeholder="Pergunte alguma coisa." onSend={handleSend} />

        {/* Espaço lateral ou ícones podem ser adicionados aqui */}
      </div>

      <div className="tela-options">
        <div className="user-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-3-3.87" /> <path d="M4 21v-2a4 4 0 0 1 3-3.87" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        </div>

        <div className="config-icon">
          <svg xmlns="http://www.w3.org/2000/svg" 
            width="32" height="32" 
            viewBox="0 0 24 24" 
            fill="currentColor"
            >
            <circle cx="12" cy="5" r="2"/>
            <circle cx="12" cy="12" r="2"/>
            <circle cx="12" cy="19" r="2"/>
          </svg>
        </div>
      </div>

    </div>
  );
}
