import "./NavBar.css";

import * as React from "react";
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
import HomeIcon from "@mui/icons-material/Home";
import { Link } from "react-router-dom";

const pages = ["ChatBot", "Conversas"];

export default function NavBar() {
  return (
    <AppBar
      position="static"
      sx={{
        background: "linear-gradient(180deg, #AE3841 0%, #8D212A 100%)",
      }}
    >
      <Container maxWidth="xl">
        <Toolbar disableGutters="true">
          {/* HOME */}
          <Link to={"/home"}>
            <IconButton>
              <HomeIcon sx={{ color: "white" }} />
            </IconButton>
          </Link>

          <Divider orientation="vertical" flexItem />

          {/* MOBILE MENU */}
          <Box sx={{ flexGrow: 1, display: { xs: "flex", md: "none" } }}>
            <Menu
              id="menu-appbar"
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "left",
              }}
              keepMounted
              transformOrigin={{
                vertical: "top",
                horizontal: "left",
              }}
              sx={{ display: { xs: "block", md: "none" } }}
            >
              {pages.map((page) => (
                <MenuItem
                  key={page}
                  component={Link}
                  to={page === "ChatBot" ? "/chatbot" : "/conversas"}
                >
                  <Typography>{page}</Typography>
                </MenuItem>
              ))}
            </Menu>
          </Box>

          {/* DESKTOP MENU */}
          <Box sx={{ flexGrow: 1, display: { xs: "none", md: "flex" } }}>
            {pages.map((page) => (
              <Button
                key={page}
                component={Link}
                to={page === "ChatBot" ? "/chatbot" : "/conversas"}
                sx={{ my: 2, color: "white", display: "block" }}
              >
                {page}
              </Button>
            ))}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}
