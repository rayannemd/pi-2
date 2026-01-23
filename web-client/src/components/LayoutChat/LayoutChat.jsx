import React, { useState } from 'react';
import { Box, Typography, Avatar, TextField, IconButton, Divider } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import MoreVertIcon from '@mui/icons-material/MoreVert';

export default function LayoutChat({ conversa }) {
  const [mensagem, setMensagem] = useState('');

  // Se não houver conversa selecionada, mostramos um aviso
  if (!conversa) {
    return (
      <Box sx={{ 
        flex: 1, 
        display: 'flex', 
        flexDirection: 'column', // Garante alinhamento vertical
        alignItems: 'center', 
        justifyContent: 'center', 
        height: '100vh',         // Ocupa a altura toda da tela
        width: '100%',           // Ocupa a largura toda disponível
        bgcolor: 'transparent',      // Cor de fundo clara (cinza suave)
      }}>
        <Typography variant="h6" sx={{ color: '#667781', fontWeight: '400' }}>
          Selecione uma conversa para começar a interagir.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', bgcolor: '#f0f2f5' }}>
      
      {/* 1. CABEÇALHO (Header) */}
      <Box sx={{ p: 2, bgcolor: 'white', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0px 2px 5px rgba(0,0,0,0.1)', zIndex: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Avatar src={conversa.foto} sx={{ mr: 2, bgcolor: '#3f51b5' }}>
            {conversa.nome[0]}
          </Avatar>
          <Box>
            <Typography variant="body1" sx={{ fontWeight: 'bold', color: 'black' }}>
              {conversa.nome}
            </Typography>
            <Typography variant="caption" color="success.main">
              Online
            </Typography>
          </Box>
        </Box>
        <IconButton>
          <MoreVertIcon />
        </IconButton>
      </Box>

      {/* 2. ÁREA DE MENSAGENS (Onde os balões vão aparecer) */}
      <Box sx={{ flex: 1, overflowY: 'auto', p: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
        {/* Exemplo de balão da ESQUERDA (Recebido) */}
        <Box sx={{ alignSelf: 'flex-start', maxWidth: '70%', bgcolor: 'white', p: 2, borderRadius: '0px 15px 15px 15px', boxShadow: '0px 1px 3px rgba(0,0,0,0.1)' }}>
          <Typography variant="body2" sx={{ color: 'black' }}>
            Olá! Como posso te ajudar hoje?
          </Typography>
          <Typography variant="caption" sx={{ display: 'block', textAlign: 'right', mt: 0.5, color: 'gray' }}>
            14:35
          </Typography>
        </Box>

        {/* Exemplo de balão da DIREITA (Enviado por você) */}
        <Box sx={{ alignSelf: 'flex-end', maxWidth: '70%', bgcolor: '#dcf8c6', p: 2, borderRadius: '15px 15px 0px 15px', boxShadow: '0px 1px 3px rgba(0,0,0,0.1)' }}>
          <Typography variant="body2" sx={{ color: 'black' }}>
            Oi! Estou com uma dúvida sobre o meu pedido.
          </Typography>
          <Typography variant="caption" sx={{ display: 'block', textAlign: 'right', mt: 0.5, color: 'gray' }}>
            14:36
          </Typography>
        </Box>
      </Box>

      {/* 3. PARTE DE BAIXO (Campo de Texto) */}
      <Box sx={{ p: 2, bgcolor: 'white', display: 'flex', alignItems: 'center', gap: 2 }}>
        <TextField
          fullWidth
          placeholder="Digite sua mensagem..."
          variant="outlined"
          size="small"
          value={mensagem}
          onChange={(e) => setMensagem(e.target.value)}
          sx={{ '& .MuiOutlinedInput-root': { borderRadius: '25px' } }}
        />
        <IconButton color="primary" sx={{ bgcolor: '#A3313A', color: 'white', '&:hover': { bgcolor: '#0' } }}>
          <SendIcon />
        </IconButton>
      </Box>

    </Box>
  );
}