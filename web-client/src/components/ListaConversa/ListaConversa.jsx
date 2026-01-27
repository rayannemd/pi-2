import React from "react";
import "./ListaConversa.css";

// Mock atualizado
const conversasMock = [
  {
    id: 1,
    nome: "João Silva",
    ultimaMensagem: "Preciso de ajuda com o código",
    categoria: "urgente",
    horario: "14:30",
    foto: "",
  },
  {
    id: 2,
    nome: "Maria Souza",
    ultimaMensagem: "O relatório está pronto",
    categoria: "todos",
    horario: "10:15",
    foto: "",
  },
  {
    id: 3,
    nome: "Suporte Técnico",
    ultimaMensagem: "Chamado em aberto",
    categoria: "pendentes",
    horario: "Ontem",
    foto: "",
  },
  {
    id: 4,
    nome: "Ana Paula",
    ultimaMensagem: "Até amanhã!",
    categoria: "todos",
    horario: "Segunda",
    foto: "",
  },
];

export default function ListaConversa({ filtro, aoClicarNoChat }) {
  const conversasFiltradas = conversasMock.filter((conversa) => {
    if (filtro === "todos") return true;
    return conversa.categoria === filtro;
  });

  function definirClasseBorda(categoria) {
    if (categoria === "urgente") return "urgente";
    if (categoria === "pendentes") return "pendente";
    return "";
  }

  return (
    <div className="lista-conversa">
      {conversasFiltradas.map((conversa) => (
        <div
          key={conversa.id}
          className={`item-conversa ${definirClasseBorda(
            conversa.categoria
          )}`}
          onClick={() => aoClicarNoChat(conversa)}
        >
          <div className="avatar">
            {conversa.foto ? (
              <img src={conversa.foto} alt={conversa.nome} />
            ) : (
              conversa.nome[0]
            )}
          </div>

          <div className="conteudo">
            <div className="linha-topo">
              <strong>{conversa.nome}</strong>
              <span className="horario">{conversa.horario}</span>
            </div>

            <p className="ultima-mensagem">
              {conversa.ultimaMensagem}
            </p>
          </div>
        </div>
      ))}

      {conversasFiltradas.length === 0 && (
        <p className="vazio">
          Nenhuma conversa encontrada nesta categoria.
        </p>
      )}
    </div>
  );
}
