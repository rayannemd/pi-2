import React, { useState, useEffect, useRef } from 'react';
import { Box, Snackbar, Alert } from '@mui/material';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';
import authedFetch from '../../services/authFetch';
import BarraLateral from "../../components/BarraLateral/BarraLateral.jsx"; 
import LayoutChat from '../../components/LayoutChat/LayoutChat.jsx';
import "./TelaChatClient.css"; 

export default function TelaChatClient() {
  const [conversaSelecionada, setConversaSelecionada] = useState(null);
  const [conversas, setConversas] = useState([]);
  const [exibirMensagem, setExibirMensagem] = useState(false);
  const [filtro, setFiltro] = useState('todos');
  const clientRef = useRef(null);

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";
  const WS_URL = import.meta.env.VITE_WS_URL || "http://localhost:8080";

  // Função separada para buscar conversas — reutilizada pelo WebSocket
  function buscarConversas() {
    fetch(`${API_URL}/api/chats`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
    })
      .then(res => res.json())
      .then(data => {
        const conversasFormatadas = data.map(chat => ({
          id: chat.id,
          nome: chat.user?.name || "Cliente",
          ultimaMsg: chat.lastMessage || "Sem mensagens",
          categoria: chat.type === "NORMAL" ? "pendente" : "resolvido",
          horario: new Date(chat.updateDate).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          foto: "",
          updateDate: chat.updateDate
        }));

        // Ordena a lista de chats do mais recente ao menos recente
        conversasFormatadas.sort((a, b) => new Date(b.updateDate) - new Date(a.updateDate));
        setConversas(conversasFormatadas);
      })
      .catch(err => console.error("Erro ao buscar conversas:", err));
  }

  // Busca inicial das conversas
  useEffect(() => {
    buscarConversas();
  }, []);

  // WebSocket para atualizar a lista quando chegar mensagem nova
  useEffect(() => {
    const client = new Client({
      // Socket novo a cada conexão (ver useWebSocket.js).
      webSocketFactory: () => new SockJS(`${WS_URL}/ws-chat`),
      onConnect: () => {
        console.log("✅ Admin conectado ao WebSocket");

        // Escuta atualizações gerais da lista de conversas
        client.subscribe("/topic/chats/atualizacao", () => {
          buscarConversas();
        });
      },
      onDisconnect: () => console.log("❌ Admin desconectado do WebSocket"),
    });

    client.activate();
    clientRef.current = client;

    return () => {
      client.deactivate();
    };
  }, []);

  const conversasFiltradas = conversas.filter(
    conversa => filtro === 'todos' || conversa.categoria === filtro
  );

  function resolverConversa(id) {
    authedFetch(`${API_URL}/api/chats/${id}/resolve-chat`, {
      method: "PUT",
    })
    .then(res => {
      if (!res.ok) throw new Error("Erro ao resolver conversa");
      
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
    })
    .catch(err => console.error("Erro ao resolver conversa:", err));
  }

  const handleFecharMensagem = (event, reason) => {
    if (reason === 'clickaway') return;
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
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        sx={{ zIndex: 9999 }}
      >
        <Alert onClose={handleFecharMensagem} severity="success" variant="filled" sx={{ width: '100%' }}>
          Conversa encerrada com sucesso!
        </Alert>
      </Snackbar>

    </Box>
  );
}