import React, { useState, useEffect } from "react";
import "./Dashboard.css";

import NavBar from "../../components/Navbar/NavBar.jsx";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import MovingIcon from "@mui/icons-material/Moving";
import ChatBubbleIcon from "@mui/icons-material/ChatBubble";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import AccessTimeIcon from "@mui/icons-material/AccessTime";

// Importação do Gráfico do MUI
import { PieChart } from '@mui/x-charts/PieChart';

export default function Dashboard() {
  const [dadosCards, setDadosCards] = useState([
    { title: "Atendimento por ChatBot", icon: SmartToyIcon, data: "..." },
    { title: "Sucesso ChatBot", icon: SmartToyIcon, data: "..." },
    { title: "Média Avaliação", icon: MovingIcon, data: "..." },
    { title: "Total atendimentos", icon: ChatBubbleIcon, data: "..." },
    { title: "Fila de espera", icon: PeopleAltIcon, data: "..." },
    { title: "Tempo médio", icon: AccessTimeIcon, data: "..." },
  ]);

  const [dadosCanais, setDadosCanais] = useState([]); // Enviados
  const [dadosRecebidos, setDadosRecebidos] = useState([]); // Recebidos
  const [dadosSetores, setDadosSetores] = useState([]);

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
          { label: 'WhatsApp', value: 1000 },
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

    buscarDadosDoBanco();
  }, []);

  return (
    <>
      <NavBar />
      <div className="background--box">
        
        {/* CARDS KPI */}
        <div className="cards--container">
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
        <div className="content--container">
          <div className="grande--box">
            <h3 className="box--title">Atendimento por canal</h3>
            <PieChart
              series={[{ data: dadosCanais, innerRadius: 40 }]}
              width={400} height={200}
            />
          </div>
          <div className="grande--box">
            <h3 className="box--title">Atendimento por setor</h3>
            <PieChart
              series={[{ data: dadosSetores, innerRadius: 40 }]}
              width={400} height={200}
            />
          </div>
        </div>

        {/* RESUMOS */}
        <div className="resumo--container">
          <div className="resumo--grupo">
            <div className="pequena--box">
              <span className="resumo--label">Líder: {dadosCanais[0]?.label}</span>
              <span className="resumo--valor">{dadosCanais[0]?.pct}%</span>
            </div>
            <div className="pequena--box">
              <span className="resumo--label">Menor: {dadosCanais[dadosCanais.length-1]?.label}</span>
              <span className="resumo--valor">{dadosCanais[dadosCanais.length-1]?.pct}%</span>
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

              <div className="divisor--vertical"></div>

              <div className="coluna--dados">
                <h4 className="coluna--titulo-principal">Mensagens Recebidas:</h4>
                <div className="lista--canais">
                  {dadosRecebidos.map((canal) => (
                    <div key={canal.id} className="item--canal">
                      <span style={{ color: canal.color, fontWeight: 'bold' }}>{canal.label}</span>
                      <span className="valor--stats">{canal.value}</span>
                    </div>
                  ))}
                </div>
                <div className="grafico--proporcao">
                  <PieChart
                    series={[{ data: dadosRecebidos, innerRadius: 35 }]}
                    width={280} height={180}
                    slotProps={{ legend: { hidden: true } }}
                    sx={{ marginBottom: '-15px' }}
                  />
                  <p className="legenda--grafico">Proporção de Recebimentos</p>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </>
  );
}
