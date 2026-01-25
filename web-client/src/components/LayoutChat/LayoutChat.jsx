// layout chat original


import React, { useState, useEffect } from 'react';
import { Box, Typography, Avatar, TextField, IconButton, Menu, MenuItem } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import MoreVertIcon from '@mui/icons-material/MoreVert';



export default function LayoutChat({ conversaAtual, mensagens, aoResolver }) {
  
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);

  
  // ----------------------------------------------

  const [mensagem, setMensagem] = useState('');
  const [mensagensDoBackEnd, setMensagensDoBackEnd] = useState([]);

  useEffect(() => {
    if (conversaAtual?.id) {
     
      setMensagensDoBackEnd([]);
      return;
    }
  }, [conversaAtual]);

  const enviarMensagem = () => {
    if (mensagem.trim() === "") return;
    const novaMsg = {
      id: Math.random(),
      texto: mensagem,
      remetente: 'adm',
      hora: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMensagensDoBackEnd([...mensagensDoBackEnd, novaMsg]);
    setMensagem('');
  };

  // Se não tiver conversa selecionada, mostra aviso
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
      
      {/* 1. CABEÇALHO */}
      <Box sx={{ p: 2, bgcolor: 'white', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0px 2px 5px rgba(0,0,0,0.1)', zIndex: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Avatar sx={{ mr: 2, bgcolor: '#3f51b5' }}>
            {conversaAtual.nome ? conversaAtual.nome[0] : "?"}
          </Avatar>
          <Box>
            <Typography variant="body1" sx={{ fontWeight: 'bold' }}>{conversa.nome}</Typography>
            <Typography variant="caption" color="success.main">Online</Typography>
          </Box>
        </Box>

        <Box>
          <IconButton onClick={handleClick}>
            <MoreVertIcon />
          </IconButton>
          <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
            <MenuItem onClick={clicarResolvido} sx={{ color: 'green', fontWeight: 'bold' }}>
              Marcar como Resolvida
            </MenuItem>
          </Menu>
        </Box>
      </Box>

      {/* 2. MENSAGENS */}
      <Box sx={{ flex: 1, overflowY: 'auto', p: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
        {mensagensDoBackEnd.map((msg) => (
          <Box 
            key={msg.id}
            sx={{ 
              alignSelf: msg.remetente === 'cliente' ? 'flex-start' : 'flex-end', 
              maxWidth: '70%', 
              bgcolor: msg.remetente === 'cliente' ? 'white' : '#dcf8c6', 
              p: 1.5, 
              borderRadius: msg.remetente === 'cliente' ? '0px 15px 15px 15px' : '15px 15px 0px 15px', 
              boxShadow: '0px 1px 3px rgba(0,0,0,0.1)' 
            }}
          >
            <Typography variant="body2">{msg.texto}</Typography>
            <Typography variant="caption" sx={{ display: 'block', textAlign: 'right', mt: 0.5, color: 'gray' }}>
              {msg.hora}
            </Typography>
          </Box>
        ))}
      </Box>

      {/* 3. INPUT */}
      <Box sx={{ p: 2, bgcolor: 'white', display: 'flex', alignItems: 'center', gap: 2 }}>
        <TextField
          fullWidth
          placeholder="Digite sua mensagem..."
          size="small"
          value={mensagem}
          onChange={(e) => setMensagem(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && enviarMensagem()}
          sx={{ '& .MuiOutlinedInput-root': { borderRadius: '25px' } }}
        />
        <IconButton onClick={enviarMensagem} sx={{ bgcolor: '#A3313A', color: 'white', '&:hover': { bgcolor: '#8e2a32' } }}>
          <SendIcon />
        </IconButton>
      </Box>
    </Box>
  );
}