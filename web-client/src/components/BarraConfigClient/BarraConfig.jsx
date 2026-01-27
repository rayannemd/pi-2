import React, { useState } from "react";
import "./BarraConfig.css";

import Logo from "../../components/Logo/Logo.jsx";

import { FaHome, FaEllipsisV } from "react-icons/fa";

export default function BarraLateral({ aoSelecionarChat }) {
  const [filtroSelecionado, setFiltroSelecionado] = useState("todos");

  return (
    <aside className="barra-lateral">
      {/* TOPO */}
        <div className="barra-topo">
            <div className="logo-wrapper">
            <Logo />
            </div>
        </div>

      {/* RODAPÉ */}
      <div className="barra-rodape">
        <div className="acoes">
          <div className="acao">
            <FaHome />
            <span>Início</span>
          </div>

          <div className="acao">
            <FaEllipsisV />
            <span>Mais</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
