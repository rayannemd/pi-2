import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./ConversasInit.css";

export default function ConversasInit() {
  const navigate = useNavigate();
  const [showFilters, setShowFilters] = useState(false);

  // 🔥 Conversas de exemplo (você depois troca pelo backend)
  const conversasMock = [
    { id: 1, nome: "João da Silva", ultimo: "Tudo certo com minha instalação?" },
    { id: 2, nome: "Maria Oliveira", ultimo: "Ok, obrigado!" },
    { id: 3, nome: "Pedro Henrique", ultimo: "Tem previsão de retorno?" },
    { id: 4, nome: "Ana Costa", ultimo: "Quero mudar o plano." },
  ];

  return (
    <div className="conversas-container">
      <header className="conversas-header">
        <h2 className="titulo">Conversas</h2>
        <button
          className="filtro-btn"
          onClick={() => setShowFilters(!showFilters)}
        >
          Filtros ▾
        </button>
      </header>

      {/* PAINEL DE FILTROS */}
      {showFilters && (
        <div className="filtro-panel">
          <p>Filtrar por:</p>
          <button>Status</button>
          <button>Data</button>
          <button>Não lidas</button>
        </div>
      )}

      {/* LISTA DE CONVERSAS */}
      <ul className="lista-conversas">
        {conversasMock.map((c) => (
          <li
            key={c.id}
            className="item-conversa"
            onClick={() => navigate(`/ChatBot?id=${c.id}`)}
          >
            <strong>{c.nome}</strong>
            <p className="ultimo-msg">{c.ultimo}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
