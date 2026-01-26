//throw new Error("TESTE LISTA CONVERSA CARREGOU");



import React from 'react';
import { Box, Typography, Avatar } from '@mui/material';



export default function ListaConversa({ conversas = [], aoClicarNoChat }) {
  
  //console.log("TESTE LISTA CONVERSA CARREGOU");



  // 3. Função das cores das bordas
 const definirCorBorda = (categoria) => {
if(categoria == 'todos')
  return ('transparent')
  // Se não estiver resolvido, ele segue a cor da categoria
  switch (categoria) {
    case 'urgente': return '#ff0033';
    case 'pendentes': return '#ffc95d';
    default: return 'transparent';
  }
}

  return (
    
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, p: 1 }}>
      {conversas.map((conversa) => (
        <Box
          key={conversa.id}
          onClick={() => aoClicarNoChat(conversa)}
          sx={{
            display: 'flex',
            alignItems: 'flex-start', 
            p: 1.5,
            borderRadius: '12px',
            cursor: 'pointer',
            bgcolor: 'rgba(255, 255, 255, 1)', 
            transition: '0.3s',
            borderLeft: `5px solid ${definirCorBorda(conversa.categoria)}`,
            
            '&:hover': {
              bgcolor: 'rgba(230, 230, 230, 1)',
              transform: 'translateX(5px)' 
            }
          }}
        >
          <Avatar src={conversa.foto} sx={{ mr: 2 }}>{conversa.nome[0]}</Avatar>
          
          <Box sx={{ flex: 1 }}>
            {/* Linha superior: Nome e Horário */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="body1" sx={{ color: 'black', fontWeight: 'bold' }}>
                {conversa.nome}
              </Typography>
              
              <Typography variant="caption" sx={{ color: 'rgba(0, 0, 0, 0.5)', fontWeight: '500' }}>
                {conversa.horario}
              </Typography>
            </Box>

            {/* Linha inferior: Mensagem */}
            <Typography 
              variant="caption" 
              sx={{ 
                color: 'rgba(0, 0, 0, 0.84)',
                display: '-webkit-box',
                WebkitLineClamp: 1, // Limita a uma linha
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden'
              }}
            >
              {conversa.ultimaMsg}
            </Typography>
          </Box>
        </Box>
      ))}

      {/* Caso o filtro não encontre nada */}
      {conversas.length === 0 && (
        <Typography sx={{ color: 'white', textAlign: 'center', mt: 4, opacity: 0.4 }}>
          Nenhuma conversa encontrada nesta categoria.
        </Typography>
      )}
    </Box>
  );
}