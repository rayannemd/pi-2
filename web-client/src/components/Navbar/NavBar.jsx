import "./NavBar.css";
import * as React from "react";
import { Link } from "react-router-dom";

// Componentes MUI
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Menu from "@mui/material/Menu";
import Divider from "@mui/material/Divider";
import Container from "@mui/material/Container";
import Button from "@mui/material/Button";
import MenuItem from "@mui/material/MenuItem";

// Ícones
import HomeIcon from "@mui/icons-material/Home";
import MenuIcon from "@mui/icons-material/Menu"; // Adicionei para o Mobile

const pages = [
  { name: "ChatBot", path: "/chatbot" },
  { name: "Conversas", path: "/chat-client" },
  
];

export default function NavBar() {
  const [anchorElNav, setAnchorElNav] = React.useState(null);

  const handleOpenNavMenu = (event) => {
    setAnchorElNav(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  return (
    <AppBar
      position="static"
      sx={{
        // Mantive o gradiente, mas se quiser o estilo "Black", use: background: "#000"
        background: "linear-gradient(180deg, #AE3841 0%, #8D212A 100%)",
        boxShadow: "none",
        borderBottom: "1px solid rgba(255,255,255,0.1)"
      }}
    >
      <Container maxWidth="xl">
        <Toolbar disableGutters={true}> {/* Corrigido: booleano real */}
          
          {/* LOGO / HOME ICON */}
          <Link to={"/home"} style={{ textDecoration: 'none' }}>
            <IconButton size="large">
              <HomeIcon sx={{ color: "white" }} />
            </IconButton>
          </Link>

          <Divider 
            orientation="vertical" 
            flexItem 
            sx={{ mx: 2, bgcolor: "rgba(255,255,255,0.3)" }} 
          />

          {/* MOBILE MENU (Hambúrguer) */}
          <Box sx={{ flexGrow: 1, display: { xs: "flex", md: "none" } }}>
            <IconButton
              size="large"
              onClick={handleOpenNavMenu}
              color="inherit"
            >
              <MenuIcon />
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorElNav}
              open={Boolean(anchorElNav)}
              onClose={handleCloseNavMenu}
              sx={{ display: { xs: "block", md: "none" } }}
            >
              {pages.map((page) => (
                <MenuItem 
                  key={page.name} 
                  onClick={handleCloseNavMenu}
                  component={Link}
                  to={page.path}
                >
                  <Typography textAlign="center">{page.name}</Typography>
                </MenuItem>
              ))}
            </Menu>
          </Box>

          {/* DESKTOP MENU */}
          <Box sx={{ flexGrow: 1, display: { xs: "none", md: "flex" } }}>
            {pages.map((page) => (
              <Button
                key={page.name}
                component={Link}
                to={page.path}
                onClick={handleCloseNavMenu}
                sx={{ 
                  my: 2, 
                  color: "white", 
                  display: "block",
                  fontWeight: 500,
                  "&:hover": { backgroundColor: "rgba(255,255,255,0.1)" }
                }}
              >
                {page.name}
              </Button>
            ))}
          </Box>

        </Toolbar>
      </Container>
    </AppBar>
  );
}