import React, { useState, useEffect } from "react";
import "./Dashboard.css";

import NavBar from "../../components/Navbar/NavBar.jsx";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import MovingIcon from "@mui/icons-material/Moving";
import ChatBubbleIcon from "@mui/icons-material/ChatBubble";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import AccessTimeIcon from "@mui/icons-material/AccessTime";

import { BarChart } from "@mui/x-charts/BarChart";

// Importação do Gráfico do MUI
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

  // Estados dos novos gráficos gerais e detalhamentos
  const [dadosMensagens, setDadosMensagens] = useState([]);
  const [dadosChats, setDadosChats] = useState([]);
  const [periodoSelecionado, setPeriodoSelecionado] = useState('Hoje');

  // Sistema de cores dinâmicas para o mapeamento dos componentes
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
    const buscarDadosDoBanco = async () => {
      // Simula tempo de resposta do servidor
      // await new Promise((resolve) => setTimeout(resolve, 1000));

      const dadosVindosDoBack = {
        atendimentosBot: 150,
        sucessoBot: "95%",
        mediaAvaliacao: "4.8/5",
        totalPendentes: 84,
        fila: 5,
        totalChats: 15616,
        totalRecebidas: 464,
        totalEnviadas: 256,
        chatsConcluidosHumano: 140,
        chatsConcluidosBot: 60
      };

      // Atualiza os Cards superiores
      setDadosCards((prev) =>
        prev.map((card) => {
        
          if (card.title === "Sucesso ChatBot") return { ...card, data: dadosVindosDoBack.sucessoBot };
          if (card.title === "Atendimento por ChatBot") return { ...card, data: dadosVindosDoBack.chatsConcluidosBot};
          if (card.title === "Média Avaliação") return { ...card, data: dadosVindosDoBack.mediaAvaliacao };
          if (card.title === "Total Pendentes") return { ...card, data: dadosVindosDoBack.totalPendentes };

          if (card.title === "Total de Chats") return { ...card, data: dadosVindosDoBack.totalChats };
          return card;
        })
      );

      // Função que padroniza os IDs, cores e calcula as fatias porcentuais (pct)
      const prepararDados = (lista) => {
        const total = lista.reduce((a, b) => a + b.value, 0);
        return lista.map((item, idx) => ({
          id: idx,
          value: item.value,
          label: item.label,
          color: getCorGeral(item.label),
          pct: total > 0 ? ((item.value / total) * 100).toFixed(1) : "0"
        })).sort((a, b) => b.value - a.value);
      };

      // Alimenta os estados do componente com as estruturas prontas
      setDadosMensagens(prepararDados([
        { label: 'Recebidas', value: dadosVindosDoBack.totalRecebidas },
        { label: 'Enviadas', value: dadosVindosDoBack.totalEnviadas }
      ]));

      setDadosChats(prepararDados([
        { label: 'Agente Humano', value: dadosVindosDoBack.chatsConcluidosHumano },
        { label: 'Agente Virtual / Bot', value: dadosVindosDoBack.chatsConcluidosBot }
      ]));
    };

    buscarDadosDoBanco();
  }, []);

  const periodos = ["Hoje", "7 dias", "15 dias", "30 dias"];

  return (
    <>
      <NavBar />
      <div className="background--box">

        {/* CARDS KPI */}
        <div className="cards--container">
          <div className="dashboard--filtros">
            <span className="filtros--titulo">Filtrar por Período:</span>
            <div className="filtros--botoes">
              {periodos.map((periodo) => (
                <button
                  key={periodo}
                  className={`btn--data ${periodoSelecionado === periodo ? 'active' : ''}`}
                  onClick={() => setPeriodoSelecionado(periodo)}
                >
                  {periodo}
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
              <PieChart
                series={[{ data: dadosMensagens, innerRadius: 40 }]}
                width={400} height={200}
              />
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
              <PieChart
                series={[{ data: dadosChats, innerRadius: 40 }]}
                width={400} height={200}
              />
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
                  <span className="resumo--label">Taxa de Conclusão: {dadosChats[0]?.label || "..."}</span>
                  <span className="resumo--valor">{dadosChats[0]?.pct || "0"}%</span>
                </div>
                <div className="pequena--box">
                  <span className="resumo--label">Taxa de Conclusão: {dadosChats[1]?.label || "..."}</span>
                  <span className="resumo--valor">{dadosChats[1]?.pct || "0"}%</span>
                </div>
              </div>
            </div>

            <div className="alocar">
              <h3 className="box--title">Avaliações</h3>
              <div className="alocar--conteudo">
            <BarChart
              xAxis={[{ data: ['1 Estrelas', '2 Estrelas' , '3 Estrelas' , '4 Estrelas' , '5 Estrelas' ] }]}
                yAxis={[{ min: 0, max: 5 }]}
              series={[{ data: [4, 3, 5, 4, 7] }]}
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