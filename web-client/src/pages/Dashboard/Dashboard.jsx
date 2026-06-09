import React, { useState, useEffect } from "react";
import "./Dashboard.css";

import NavBar from "../../components/Navbar/NavBar.jsx";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import MovingIcon from "@mui/icons-material/Moving";
import ChatBubbleIcon from "@mui/icons-material/ChatBubble";

import { BarChart } from "@mui/x-charts/BarChart";
import { PieChart } from '@mui/x-charts/PieChart';

export default function Dashboard() {

  // Estados dos Cards Superiores
  const [dadosCards, setDadosCards] = useState([
    { title: "Total de Chats", icon: ChatBubbleIcon, data: "..." },
    { title: "Atendimento por ChatBot", icon: SmartToyIcon, data: "..." },
    { title: "Sucesso ChatBot", icon: SmartToyIcon, data: "..." },
    { title: "Total Pendentes", icon: ChatBubbleIcon, data: "..." },
    { title: "Média Avaliação", icon: MovingIcon, data: "..." },
  ]);

  // Estados inicializados estritamente como arrays vazios para evitar quebras
  const [dadosMensagens, setDadosMensagens] = useState([]);
  const [dadosChats, setDadosChats] = useState([]); 
  const [diasSelecionado, setDiaSelecionado] = useState(7);
  
  const periodoDias = [1, 7, 15, 30];

  const getCorGeral = (label) => {
    const cores = {
      'Recebidas': '#AE3841',
      'Enviadas': '#7D6161',
      'Agente Humano': '#8D212A',
      'Agente Virtual / Bot': '#c2aaac',
    };
    return cores[label] || '#777777';
  };

  useEffect(() => {
    const prepararDados = (lista) => {
      const listaValida = lista.filter(item => item && item.value !== undefined && item.value !== null);
      const total = listaValida.reduce((a, b) => a + (b.value || 0), 0);
      
      return listaValida.map((item, idx) => ({
        id: idx,
        value: item.value || 0,
        label: item.label,
        color: getCorGeral(item.label),
        pct: total > 0 ? ((item.value / total) * 100).toFixed(1) : "0"
      })).sort((a, b) => b.value - a.value);
    };

    const url = "http://localhost:8080";

    fetch(`${url}/dashboard?qtdDias=${diasSelecionado}`)
      .then((resposta) => {
        if (!resposta.ok) throw new Error('Não foi possível carregar os dados.');
        return resposta.json();
      })
      .then((dadosVindosDoBack) => {
        if (!dadosVindosDoBack) return;
        
        setDadosCards((prev) =>
          prev.map((card) => {
            if (card.title === "Sucesso ChatBot") return { ...card, data: dadosVindosDoBack.porcentagemSucesso ? `${dadosVindosDoBack.porcentagemSucesso}%` : "0%" };
            if (card.title === "Atendimento por ChatBot") return { ...card, data: dadosVindosDoBack.totalAtendimentos ?? 0 };
            if (card.title === "Média Avaliação") return { ...card, data: dadosVindosDoBack.mediaAvaliacao ?? 0 };
            if (card.title === "Total Pendentes") return { ...card, data: 0 };
            if (card.title === "Total de Chats") return { ...card, data: dadosVindosDoBack.totalAtendimentos ?? 0 };
            return card;
          })
        );

        setDadosMensagens(prepararDados([
          { label: 'Recebidas', value: dadosVindosDoBack.totalMensagensRecebidas },
          { label: 'Enviadas', value: dadosVindosDoBack.totalMensagensEnviadas }
        ]));

        setDadosChats(prepararDados([
          { label: 'Agente Virtual / Bot', value: dadosVindosDoBack.totalAtendimentos },
          // console.log(dadosVindosDoBack)
        ]));
      })
      .catch((erro) => console.error("Erro na requisição:", erro));

  }, [diasSelecionado]);

  return (
    <>
      <NavBar />
      <div className="background--box">

        {/* CARDS KPI */}
        <div className="cards--container">
          <div className="dashboard--filtros">
            <span className="filtros--titulo">Filtrar por Período:</span>
            <div className="filtros--botoes">
              {periodoDias.map((qtd) => (
                <button
                  key={qtd}
                  className={`btn--data ${diasSelecionado === qtd ? 'active' : ''}`}
                  onClick={() => setDiaSelecionado(qtd)}
                >
                  {qtd === 1 ? "Hoje" : `${qtd} dias`}
                </button>
              ))}
            </div>
          </div>
          {dadosCards.map((card, index) => (
            <div key={index} className="card--wrapper">
              <div className="dashboard--card">
                <card.icon sx={{ color: "white", fontSize: 35 }} />
                <p className="card--title">{card.title}</p>
              </div>
              <div className="card--footer">
                <span className="footer--data">{card.data}</span>
              </div>
            </div>
          ))}
        </div>

        {/* GRÁFICOS GERAIS */}
        <div className="linha--dash">
          <div className="content--container">
            
            {/* Bloco 1: Mensagens Totais */}
            <div className="grande--box">
              <h3 className="box--title">Mensagens Totais</h3>
              {dadosMensagens.length > 0 ? (
                <PieChart
                  series={[{ data: dadosMensagens, innerRadius: 40 }]}
                  width={400} height={200}
                />
              ) : <p>Carregando gráfico...</p>}
              <div className="box--totalizador">
                <span>Total: </span>
                <strong>
                 {dadosMensagens.reduce((acumulador, item) => acumulador + item.value, 0)} Mensagens
                </strong>
              </div>
            </div>

            {/* Bloco 2: Conclusões de Chats */}
            <div className="grande--box">
              <h3 className="box--title">Chats Resolvidos</h3>
              {dadosChats.length > 0 ? (
                <PieChart
                  series={[{ data: dadosChats, innerRadius: 40 }]}
                  width={400} height={200}
                />
              ) : <p>Carregando gráfico...</p>}
              <div className="box--totalizador">
                <span>Total Resolvidos: </span>
                <strong>
                  {dadosChats.reduce((acumulador, item) => acumulador + item.value, 0)} chats
                </strong>
              </div>
            </div>

          </div>

          {/* RESUMOS E BLOCO ALOCAR */}
          <div className="coluna-direita">
            <div className="resumo--container">
              <div className="resumo--grupo">
                <div className="pequena--box">
                  <span className="resumo--label">Predominante: {dadosMensagens[0]?.label || "..."}</span>
                  <span className="resumo--valor">{dadosMensagens[0]?.pct || "0"}%</span>
                </div>
                <div className="pequena--box">
                  <span className="resumo--label">Menor Volume: {dadosMensagens[1]?.label || "..."}</span>
                  <span className="resumo--valor">{dadosMensagens[1]?.pct || "0"}%</span>
                </div>
              </div>
              <div className="resumo--grupo">
                <div className="pequena--box">
                  <span className="resumo--label">Predominante: {dadosChats[0]?.label || "..."}</span>
                  <span className="resumo--valor">{dadosChats[0]?.pct || "0"}%</span>
                </div>
                <div className="pequena--box">
                  <span className="resumo--label">Alternativo: {dadosChats[1]?.label || "..."}</span>
                  <span className="resumo--valor">{dadosChats[1]?.pct || "0"}%</span>
                </div>
              </div>
            </div>

            <div className="alocar">
              <h3 className="box--title">Avaliações</h3>
              <div className="alocar--conteudo">
                <BarChart
                  xAxis={[{ data: ['1 Estrela', '2 Estrelas' , '3 Estrelas' , '4 Estrelas' , '5 Estrelas' ] }]}
                  yAxis={[{ min: 0, max: 5 }]}
                  series={[{ data: [0, 0, 0, 0, 0] }]}
                  height={300}
                />
              </div>
            </div>
          </div> 
        </div>

      </div>
    </>
  );
}
