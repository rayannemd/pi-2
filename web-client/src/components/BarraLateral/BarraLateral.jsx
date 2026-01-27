import React, { useState } from 'react'; 
import "./BarraLateral.css";
import Logo from "../../components/Logo/Logo.jsx";
import ListaConversa from "../ListaConversa/ListaConversa.jsx";
import HomeIcon from '@mui/icons-material/Home';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { useNavigate } from 'react-router-dom';

import { 
  Avatar, 
  Box, 
  Divider, 
  Drawer, 
  useTheme, 
  Stack, 
  Typography, 
  Menu, 
  MenuItem
} from "@mui/material";

import FiltrosConversas from "../FiltrosConversas/FiltrosConversas.jsx";
import { Navigate } from 'react-router-dom';

// Adicionamos 'listaDeConversas' vinda do Pai (ConversasInit)
export default function BarraLateral({filtroAtivo, conversas, aoSelecionarChat, aoSelecionarFiltro }) {

  //console.log("BarraLateral recebeu conversas:", conversas);
//console.log("Filtro ativo:", filtroAtivo);
const [anchorEl, setAnchorEl] = useState(null);
const open = Boolean(anchorEl);
const navigate = useNavigate();

  // Abrir menu
const handleClick = (event) => setAnchorEl(event.currentTarget);
const handleClose = () => setAnchorEl(null);
const irPara = (rota) => { navigate(rota); handleClose(); }

  const theme = useTheme();

  console.log("Conversas recebidas na BarraLateral:", conversas);

  return (
    <Drawer 
      variant="permanent" 
      className="BarraLateral"
      sx={{
        width: theme.spacing(35), 
        flexShrink: 0,
        height: '100vh',
        '& .MuiDrawer-paper': {
          width: theme.spacing(35),
          display: 'flex',
          flexDirection: 'column',
          boxSizing: 'border-box',
          borderRight: 'none',
          position: 'relative', 
        },
      }}
    >
      {/* TOPO: Logo e Filtro */}
      <Box 
        sx={{ 
          width: '100%', 
          height: theme.spacing(13), 
          display: 'flex', 
          flexDirection: 'row', 
          alignItems: 'center', 
          justifyContent: 'space-between', 
          px: 2 
        }}
      >
        <Avatar sx={{ width: 60, height: 60, bgcolor: 'transparent' }}>
          <Logo />
        </Avatar>

        <Box>
          <FiltrosConversas 
            aoSelecionarFiltro={aoSelecionarFiltro}
            filtroAtivo={filtroAtivo} 
          />
        </Box>
      </Box>

      <Divider sx={{ borderColor: 'rgba(238, 230, 230, 0.5)', mb: 2, mx: 2 }} />

      {/* MEIO: Lista de Conversas */}
      <Box sx={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
        {/* Passamos a listaDeConversas que veio do Pai para o Neto */}
        <ListaConversa 
          aoClicarNoChat={aoSelecionarChat}
          conversas={conversas}
        />
      </Box>

      {/* RODAPÉ */}
<Box sx={{ mt: 'auto', p: 2 }}> 
  <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.5)', mb: 2, mx: 1 }} />

  <Stack 
    direction="row" 
    spacing={4} 
    justifyContent="space-between" 
    alignItems="center"
    sx={{ px: 1 }}
  >
    {/* Botão Início */}
    <Box 
      sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer', color: 'white', '&:hover': { opacity: 0.8 } }}
      onClick={() => navigate("/home")}
    >
      <HomeIcon sx={{ mr: 0.5 }} />
      <Typography variant="body2">Início</Typography>
    </Box>

    {/* Menu Mais */}
    <Box 
      sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer', color: 'white', '&:hover': { opacity: 0.8 } }}
      onClick={handleClick} // abre o menu
    >
      <MoreVertIcon sx={{ mr: 0.5 }} />
      <Typography variant="body2">Mais</Typography>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose} // fecha clicando fora
      >
        <MenuItem onClick={() => irPara("/dashboard")}>Dashboard</MenuItem>
      </Menu>
    </Box>
  </Stack>
</Box>

    </Drawer>
  );
}