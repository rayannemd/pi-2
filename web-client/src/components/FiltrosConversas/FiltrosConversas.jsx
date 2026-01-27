import React, { useState, useRef, useEffect } from "react";
import "./FiltrosConversas.css";
import { FaFilter, FaTimes } from "react-icons/fa";

export default function FiltrosConversas({ aoSelecionarFiltro, filtroAtivo }) {
  const [aberto, setAberto] = useState(false);
  const ref = useRef(null);

  function selecionarFiltro(filtro) {
    setAberto(false);
    aoSelecionarFiltro?.(filtro);
  }

  // Fecha o menu ao clicar fora
  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        setAberto(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="filtros" ref={ref}>
      <button className="btn-filtrar" onClick={() => setAberto(!aberto)}>
        <FaFilter />
        <span>Filtrar</span>
      </button>

      {aberto && (
        <div className="menu-filtro">
          <div onClick={() => selecionarFiltro("todos")}>Todos</div>
          <div onClick={() => selecionarFiltro("urgente")}>Urgente</div>
          <div onClick={() => selecionarFiltro("pendentes")}>Pendentes</div>
        </div>
      )}

      {filtroAtivo !== "todos" && (
        <div className="chip">
          <span>{filtroAtivo.toUpperCase()}</span>
          <button onClick={() => aoSelecionarFiltro("todos")}>
            <FaTimes />
          </button>
        </div>
      )}
    </div>
  );
}
