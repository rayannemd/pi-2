import React, { useState, useEffect } from 'react';
import { Box, Snackbar, Alert } from '@mui/material';
import BarraLateral from "../../components/BarraLateral/BarraLateral.jsx"; 
import LayoutChat from '../../components/LayoutChat/LayoutChat.jsx';
import "./TelaChatClient.css"; 

export default function TelaChatClient() {
  const [conversaSelecionada, setConversaSelecionada] = useState(null); // conver. selec. aparece nulo. Por isso no começo ele aparece a msg pra selecionar uma conversa
  const [conversas, setConversas] = useState([]);
  const [exibirMensagem, setExibirMensagem] = useState(false);

  const [filtro, setFiltro] = useState('todos'); //mudar filtro, valor inicial == todos; 

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

  useEffect(() => {
    fetch(`${API_URL}/api/chats`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
    })
      .then(res => res.json())
      .then(data => {
        const conversasFormatadas = data.map(chat => ({
          id: chat.id,
          nome: chat.user?.name || "Cliente",
          ultimaMsg: chat.summary || "Sem mensagens",
          categoria: chat.type === "NORMAL" ? "pendente" : "resolvido",
          horario: new Date(chat.updateDate).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          foto: ""
        }));
        setConversas(conversasFormatadas);
      })
      .catch(err => console.error("Erro ao buscar conversas:", err));
  }, []);

  // Filtra a lista de conversas pela categoria selecionada
  const conversasFiltradas = conversas.filter(
    conversa => filtro === 'todos' || conversa.categoria === filtro
  );

function resolverConversa(id) {
  //  setExbirMensagem(true);
  setConversas(prev =>
    prev.map(conversa => {
      if (conversa.id === id) {
        const conversaAtualizada = { ...conversa, categoria: "resolvido" };
        setConversaSelecionada(conversaAtualizada);
        return conversaAtualizada;
      }
     

      return conversa;
    })
  );
}


const handleFecharMensagem = (event, reason) => {
  if (reason === 'clickaway') return; // Impede fechar se clicar fora sem querer
  setExibirMensagem(false);
};





  return (
    <Box className="container" sx={{ display: 'flex', width: '100vw', height: '100vh', overflow: 'hidden' }}>
      
      <BarraLateral 
        mudarChatSelecionado={setConversaSelecionada} 
        conversas={conversasFiltradas} 
        filtroAtivo={filtro} 
        mudarFiltroSelecionado={setFiltro} 
      />

      <Box sx={{ flex: 1, height: '100vh', position: 'relative', bgcolor: 'transparent' }}>
        <LayoutChat 
          conversaAtual={conversaSelecionada} 
          resolverConversa={resolverConversa}
          setExibirMensagem={setExibirMensagem}
        />
      </Box>

      <Snackbar 
        open={exibirMensagem} 
        autoHideDuration={2000} 
        onClose={handleFecharMensagem}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }} // Aparece centralizado no topo
        sx={{ zIndex: 9999 }} // Garante que fica na frente de tudo
      >
        <Alert onClose={handleFecharMensagem} severity="success" variant="filled" sx={{ width: '100%' }}>
          Conversa encerrada com sucesso!
        </Alert>
      </Snackbar>

    </Box>
  );
}