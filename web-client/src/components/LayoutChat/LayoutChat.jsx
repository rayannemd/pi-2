import { useEffect, useRef, useState } from 'react';
import { useWebSocket } from '../../services/useWebSocket';
import authedFetch from "../../services/authFetch";
import { Box, Typography, Avatar, TextField, IconButton, Menu, MenuItem } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import Rating from '@mui/material/Rating';

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";


export default function LayoutChat({ conversaAtual, resolverConversa, setExibirMensagem }) {

  const [chatResolvido, setChatResolvido] = useState(false);
  const [ratingCliente, setRatingCliente] = useState(conversaAtual?.chatRating || 0);

  const [mensagem, setMensagem] = useState('');
  const [mensagensDoBackEnd, setMensagensDoBackEnd] = useState([]);
  const messagesEndRef = useRef(null);


  useWebSocket(conversaAtual?.id, (novaMensagem) => {
    console.log("📨 LayoutChat recebeu mensagem:", novaMensagem);
    // A própria mensagem do admin já é exibida de forma otimista no envio
    if (novaMensagem.issuer === "ADMIN") return;

    // Renderiza as mensagens do agente
    if(novaMensagem.issuer === "AGENT"){
      setMensagensDoBackEnd(prev => [...prev, {
        id: Math.random(),
        content: novaMensagem.content,
        remetente: "agent",
        hora: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      }]);
    } else{ // Rederiza as mensagens do cliente
      setMensagensDoBackEnd(prev => [...prev, {
        id: Math.random(),
        content: novaMensagem.content,
        remetente: "cliente",
        hora: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      }]);
    }
  },
  () => {
    setChatResolvido(true);
  },
  (rating) => {
    setRatingCliente(rating);
  }
);

  // Scroll automático
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [mensagensDoBackEnd]);

  // Sincroniza o status "resolvido" e o rating com a conversa selecionada
  // (cobre o caso de reabrir um chat que já foi concluído/avaliado antes)
  useEffect(() => {
    if (!conversaAtual) return;

    setChatResolvido(conversaAtual.categoria === 'resolvido');

    fetch(`${API_URL}/api/chats/${conversaAtual.id}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
    })
      .then(res => res.json())
      .then(data => setRatingCliente(data.chatRating ?? 0)) // ajustar nome do campo depois de ver o model
      .catch(err => console.error("Erro ao buscar avaliação:", err));
  }, [conversaAtual]);

  //O mesmo useEffect da tela do client para carregar as mensagens antigas do chat, apenas algumas alterações
  useEffect(() => {
    if (!conversaAtual) return;

    fetch(`${API_URL}/api/chats/${conversaAtual.id}/messages`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
    })
      .then(res => res.json())
      .then(data => {
        const mensagensFormatadas = data.map(msg => ({
          id: msg.id,
          content: msg.content,
          remetente: msg.issuer === "USER" ? "cliente" : "adm",
          hora: new Date(msg.createDate).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        }));
        setMensagensDoBackEnd(mensagensFormatadas);
      })
      .catch(err => console.error("Erro ao buscar mensagens:", err));
  }, [conversaAtual]);


  // Código referente ao envio e salvamento de mensagens do admin no chat
  const enviarMensagem = async () => {
    if (mensagem.trim() === "") return;

    const adminMessage = {
      id: Math.random(),
      content: mensagem,
      remetente: 'adm',
      hora: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    // Exibe a mensagem na tela imediatamente (render otimista)
    setMensagensDoBackEnd(prev => [...prev, adminMessage]);
    setMensagem('');

    try{
      const response = await authedFetch(
        `${API_URL}/api/chats/${conversaAtual.id}/admin-message`,
      {
        method: "POST",
        body: JSON.stringify({ message: adminMessage.content}),
      });

      if (!response.ok) throw new Error("Erro ao enviar mensagem");

    }catch(err){ // Caso a mensagem não envie, ela é removida da tela do chat
      const idToRemove = adminMessage.id;
      setMensagensDoBackEnd(prev => prev.filter(msg => msg.id !== idToRemove));
      console.error("Erro no envio:", err);
      alert("Erro ao enviar mensagem! Tente novamente.");
    }
  };

  // Mensagem de "nenhuma conversa selecionada"
  if (!conversaAtual) {
    return (
      <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', bgcolor: '#f0f2f5' }}>
        <Typography variant="h6" sx={{ color: '#667781' }}>
          Selecione uma conversa para começar.
        </Typography>
      </Box>
    );
  }



  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', bgcolor: '#f0f2f5', flex: 1 }}> 
      
      {/* CABEÇALHO */}
      <Box sx={{ p: 2, bgcolor: 'white', display: 'flex', alignItems: 'center', justifyContent: 'space-between',    boxShadow: '0px 2px 5px rgba(0,0,0,0.1)', zIndex: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Avatar sx={{ mr: 2, bgcolor: '#9d1a1a' }}>
            {conversaAtual.nome ? conversaAtual.nome[0] : "?"}
          </Avatar>
          <Box>
            <Typography variant="body1" sx={{ fontWeight: 'bold' }}>{conversaAtual.nome} </Typography>
          </Box>
        </Box>

        <Box onClick={() => {resolverConversa(conversaAtual.id); setChatResolvido(true); setExibirMensagem(true)}} sx={{ color: 'green', fontWeight: 'bold', cursor: 'pointer' }}>
              Marcar como Resolvida
        </Box>

      </Box>


    {/* MENSAGENS */}
<Box
  sx={{
    flex: 1,
    overflowY: "auto",
    p: 3,
    display: "flex",
    flexDirection: "column",
    gap: 2,
    scrollbarWidth: "none",
  }}
>
  {mensagensDoBackEnd.map((msg) => (
    <Box
      key={msg.id}
      sx={{
        alignSelf: msg.remetente === "cliente" ? "flex-start" : "flex-end",
        maxWidth: "50%",
        bgcolor: msg.remetente === "cliente" ? "white" : "#dcf8c6",
        p: 1.5,
        borderRadius:
          msg.remetente === "cliente"
            ? "0px 15px 15px 15px"
            : "15px 15px 0px 15px",
        boxShadow: "0px 1px 3px rgba(0,0,0,0.2)",
        wordBreak: "break-word",
      }}
    >
      <Typography variant="body2">{msg.content}</Typography>

      <Typography
        variant="caption"
        sx={{
          display: "block",
          textAlign: "right",
          mt: 0.5,
          color: "gray",
        }}
      >
        {msg.hora}
      </Typography>
    </Box>
  ))}

  {chatResolvido && ratingCliente > 0 && (
    <Box
      sx={{
        alignSelf: "flex-start",
        maxWidth: "80%",
        bgcolor: "#fefefe",
        color: "#000000",
        p: 2,
        borderRadius: "12px",
        textAlign: "center",
        flexDirection: "column",
        boxShadow: "0px 1px 3px rgba(0,0,0,0.2)",
      }}
    >

      {ratingCliente > 0 && (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Typography component="legend" variant="title" sx={{ fontWeight: 'bold', color: '#000000' }}>Avaliação do cliente</Typography>
          <Rating name="read-only" value={ratingCliente} readOnly size="large" />
        </Box>
      )}
    </Box>
  )}

  <div ref={messagesEndRef} />
</Box>



      {/* INPUT */} 
      <Box sx={{ p: 2, bgcolor: 'white', display: 'flex', alignItems: 'center', gap: 2 }}>
        <TextField
          fullWidth
          placeholder={chatResolvido ?"Essa conversa foi finalizada. Não é possível enviar mais mensagens." : "Digite sua mensagem..."}
          size="small"
          value={mensagem}
          onChange={(evento) => setMensagem(evento.target.value)}
          onKeyDown={(evento) => evento.key === 'Enter' && enviarMensagem()}
          disabled={chatResolvido}
          sx={{ '& .MuiOutlinedInput-root': { borderRadius: '25px' } }}
        />
        <IconButton onClick={enviarMensagem} sx={{ bgcolor: '#A3313A', color: 'white', '&:hover': { bgcolor: '#8e2a32' } }}>
          <SendIcon />
        </IconButton>
      </Box>
    </Box>
  );
}