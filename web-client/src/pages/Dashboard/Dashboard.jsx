import React, { useState, useEffect } from "react";
import "./Dashboard.css";

import NavBar from "../../components/Navbar/NavBar.jsx";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import MovingIcon from "@mui/icons-material/Moving";
import ChatBubbleIcon from "@mui/icons-material/ChatBubble";

import { BarChart } from "@mui/x-charts/BarChart";
// Importação do Gráfico do MUI
import { PieChart } from '@mui/x-charts/PieChart';

export default function Dashboard() {

  // esse useState indica que os dados de "dadosCard" devem começar com os dados que estão na lista []
  // e setDados indica a fubnção que vai atualizar esses dados algum momento. 
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

// Função para definir a cor de cada item (Canais e Setores)
  const getCorGeral = (label) => {
    const cores = {
      // Canais
      'WhatsApp': '#075E54',  
      'Instagram': '#C13584', 
      'E-mail': '#005A9E',    
      // Setores
      'Suporte': '#FF8C00',   
      'Vendas': '#4CAF50',    
      'Financeiro': '#607D8B', 
    };
    return cores[label] || '#777777';
  };

  useEffect(() => {
    const buscarDadosDoBanco = async () => {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const dadosVindosDoBack = {
        atendimentosBot: 150,
        sucessoBot: "95%",
        mediaAvaliacao: "4.8/5",
        totalGeral: 200,
        fila: 5,
        tempoMedio: "10 min",
        envios: [
          { label: 'WhatsApp', value: 200  },
          { label: 'Instagram', value: 45 },
          { label: 'E-mail', value: 11 }
        ],
        recebimentos: [
          { label: 'WhatsApp', value: 312 },
          { label: 'Instagram', value: 98 },
          { label: 'E-mail', value: 54 }
        ],
        setores: [
          { label: 'Suporte', value: 100 },
          { label: 'Vendas', value: 80 },
          { label: 'Financeiro', value: 20 }
        ]
      };

      setDadosCards((prev) =>
        prev.map((card) => {
          if (card.title === "Atendimento por ChatBot") return { ...card, data: dadosVindosDoBack.atendimentosBot };
          if (card.title === "Sucesso ChatBot") return { ...card, data: dadosVindosDoBack.sucessoBot };
          if (card.title === "Média Avaliação") return { ...card, data: dadosVindosDoBack.mediaAvaliacao };
          if (card.title === "Total atendimentos") return { ...card, data: dadosVindosDoBack.totalGeral };
          if (card.title === "Fila de espera") return { ...card, data: dadosVindosDoBack.fila };
          if (card.title === "Tempo médio") return { ...card, data: dadosVindosDoBack.tempoMedio };
          return card;
        })
      );

      const prepararDados = (lista) => {
        const total = lista.reduce((a, b) => a + b.value, 0);
        return lista.map((item, idx) => ({
          id: idx,
          value: item.value,
          label: item.label,
          color: getCorGeral(item.label),
          pct: total > 0 ? ((item.value / total) * 100).toFixed(1) : 0
        })).sort((a, b) => b.value - a.value);
      };

      setDadosCanais(prepararDados(dadosVindosDoBack.envios));
      setDadosRecebidos(prepararDados(dadosVindosDoBack.recebimentos));
      setDadosSetores(prepararDados(dadosVindosDoBack.setores));
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

        <div className="graficos-estatisticos">
          <p>GRÁFICOS ESTATÍSTICOS</p>
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
          <div className="resumo--grupo">
            <div className="pequena--box">
              <span className="resumo--label">Setor Ativo: {dadosSetores[0]?.label}</span>
              <span className="resumo--valor">{dadosSetores[0]?.pct}%</span>
            </div>
            <div className="pequena--box">
              <span className="resumo--label">Setor Inativo: {dadosSetores[dadosSetores.length-1]?.label}</span>
              <span className="resumo--valor">{dadosSetores[dadosSetores.length-1]?.pct}%</span>
            </div>
          </div>
        </div>
            
        <div className="secaoMensagens--box">
          <p>QUANTIDADE DE MENSAGENS ENVIADAS E RECEBIDAS</p>
        </div>

        {/* DETALHAMENTO DE MENSAGENS */}
        <div className="content--container">
          <div className="grande--box" style={{ height: 'auto', minHeight: '600px' }}>
            <div className="duas--colunas--container">
              
              <div className="coluna--dados">
                <h4 className="coluna--titulo-principal">Mensagens Enviadas:</h4>
                <div className="lista--canais">
                  {dadosCanais.map((canal) => (
                    <div key={canal.id} className="item--canal">
                      <span style={{ color: canal.color, fontWeight: 'bold' }}>{canal.label}</span>
                      <span className="valor--stats">{canal.value}</span>
                    </div>
                  ))}
                </div>
                <div className="grafico--proporcao">
                  <PieChart
                    series={[{ data: dadosCanais, innerRadius: 35 }]}
                    width={280} height={180}
                    slotProps={{ legend: { hidden: true } }}
                    sx={{ marginBottom: '-15px' }}
                  />
                  <p className="legenda--grafico">Proporção de Envios</p>
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
    </div>
    </>
  );
}
