import React from 'react';
import { Box, Typography, Avatar } from '@mui/material';

// 1. Mock atualizado com o campo 'horario' para a futura API
const conversasMock = [
  { id: 1, nome: "João Silva", ultimaMensagem: "Preciso de ajuda com o código", categoria: "urgente", horario: "14:30", foto: "" },
  { id: 2, nome: "Maria Souza", ultimaMensagem: "O relatório está pronto", categoria: "todos", horario: "10:15", foto: "" },
  { id: 3, nome: "Suporte Técnico", ultimaMensagem: "Chamado em aberto", categoria: "pendentes", horario: "Ontem", foto: "" },
  { id: 4, nome: "Ana Paula", ultimaMensagem: "Até amanhã!", categoria: "todos", horario: "Segunda", foto: "" },
];

export default function ListaConversa({ filtro, aoClicarNoChat }) {
  
  // 2. Lógica de filtragem
  const conversasFiltradas = conversasMock.filter(conversa => {
    if (filtro === 'todos') return true;
    return conversa.categoria === filtro;
  });

  // 3. Função das cores das bordas
  const definirCorBorda = (categoria) => {
    switch (categoria) {
      case 'urgente': return '#ff0033ff'; 
      case 'pendentes': return '#ffc95dff'; 
      default: return 'transparent';    
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, p: 1 }}>
      {conversasFiltradas.map((conversa) => (
        <Box
          key={conversa.id}
          onClick={() => aoClicarNoChat(conversa)}
          sx={{
            display: 'flex',
            alignItems: 'flex-start', // Alinhado ao topo para o horário ficar correto
            p: 1.5,
            borderRadius: '12px',
            cursor: 'pointer',
            bgcolor: 'rgba(255, 255, 255, 1)', // Balão 100% branco
            transition: '0.3s',
            borderLeft: `5px solid ${definirCorBorda(conversa.categoria)}`,
            
            '&:hover': {
              bgcolor: 'rgba(230, 230, 230, 1)', // Um cinza mais suave que o 164 para não sumir o texto
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
              {conversa.ultimaMensagem}
            </Typography>
          </Box>
        </Box>
      ))}

      {/* Caso o filtro não encontre nada */}
      {conversasFiltradas.length === 0 && (
        <Typography sx={{ color: 'black', textAlign: 'center', mt: 4 }}>
          Nenhuma conversa encontrada nesta categoria.
        </Typography>
      )}
    </Box>
  );
}