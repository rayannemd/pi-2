import React, { useState } from 'react';
import { Box } from '@mui/material';
import BarraLateral from "../../components/BarraLateral/BarraLateral.jsx";
import LayoutChat from '../../components/LayoutChat/LayoutChat.jsx';
import "./TelaChatClient.css"; // Certifique-se de que o CSS está importado

export default function TelaChatClient() {
  const [conversaSelecionada, setConversaSelecionada] = useState(null);

  return (
    /* ADICIONADO: className="container" e removido possíveis conflitos */
    <Box className="container" sx={{ display: 'flex', width: '100vw', height: '100vh', overflow: 'hidden' }}>
      
      <BarraLateral aoSelecionarChat={setConversaSelecionada} />

      {/* Ajustado para flex: 1 e fundo transparente para mostrar o gradiente do .container */}
      <Box sx={{ flex: 1, height: '100vh', position: 'relative', bgcolor: 'transparent' }}>
        <LayoutChat conversa={conversaSelecionada} />
      </Box>

    </Box>
  );
}