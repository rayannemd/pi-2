import "./TelaInicialADM.css";
import { useNavigate } from "react-router-dom";
import logoPlanetaNet from "../assets/images/logoPlanetaNet.png";
import { HomeIcon } from "lucide-react";

export default function TelaInicialADM() {
  const navigate = useNavigate();

  return (
    <div className="home-container">
      <header className="top-bar">
        <div className="home-icon"><HomeIcon size={20}/></div>

        {/* Menu ChatBot */}
        <nav className="menu-chatbot">
          <div
            className="menu-item"
            onClick={() => navigate("/ChatBot")}
            style={{ cursor: "pointer" }}
          >
            ChatBot ▾
          </div>
        </nav>

        {/* Menu Conversas */}
        <nav className="menu-conversas">
          <div
            className="menu-item"
            onClick={() => navigate("/ConversasInit")}
            style={{ cursor: "pointer" }}
          >
            Conversas ▾
          </div>
        </nav>
      </header>

      <main className="home-content">
        <img
          src={logoPlanetaNet}
          alt="Logo Planeta Net"
          className="logo"
          draggable="false"
        />

        <p className="description">
          Esse é o aplicativo da Planeta Net para visualização e automação
          de mensagens e atendimentos.
          <br />
          Selecione a opção para começar.
        </p>
      </main>
    </div>
  );
}
