import React, { useState } from 'react';
import { Button, Menu, MenuItem, Box, Chip, Typography } from '@mui/material';
import FilterListIcon from '@mui/icons-material/FilterList';

export default function FiltrosConversas({ aoSelecionarFiltro, filtroAtivo = 'todos' }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = (filtro) => {
    setAnchorEl(null);
    if (filtro && aoSelecionarFiltro) {
      aoSelecionarFiltro(filtro);
    }
  };

  return (
    <Box>
      {/* O Botão de Filtrar que você já tinha */}
      <Button
        onClick={handleClick}
        startIcon={<FilterListIcon />}
        sx={{ color: 'white', textTransform: 'none' }}
      >
        Filtrar
      </Button>

      <Menu anchorEl={anchorEl} open={open} onClose={() => handleClose()}>
        <MenuItem onClick={() => handleClose('todos')}>Todos</MenuItem>
        <MenuItem onClick={() => handleClose('urgente')}>Urgente</MenuItem>
        <MenuItem onClick={() => handleClose('pendentes')}>Pendentes</MenuItem>
      </Menu>

      {/* --- O MARCADOR AGORA VIVE AQUI DENTRO --- */}
      {filtroAtivo !== 'todos' && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
          <Chip 
            label={filtroAtivo.toUpperCase()} 
            size="small" 
            onDelete={() => aoSelecionarFiltro('todos')} // Botão de fechar volta para 'todos'
            sx={{ 
              bgcolor: 'rgba(255,255,255,0.1)', 
              color: 'white', 
              fontSize: '0.65rem',
              '& .MuiChip-deleteIcon': { color: 'white' }
            }} 
          />
        </Box>
      )}
    </Box>
  );
}