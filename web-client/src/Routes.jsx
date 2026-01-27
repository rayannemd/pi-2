import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import TelaInicialCliente from "./pages/TelaInicialClient/TelaInicialCliente";
import TelaLogin from "./pages/TelaLogin/TelaLogin";
import TelaChatClient from "./pages/TelaChatAdmin/TelaChatAdmin";
import Dashboard from "./pages/Dashboard/Dashboard";
import Chat from "./pages/chat/Chat";

export const AppRountes = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<TelaLogin />} />
        <Route path="/home" element={<TelaInicialCliente />} />
        <Route path="/login" element={<TelaLogin />} />
        <Route path="/chat-admin" element={<TelaChatClient />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/chat-client" element={<Chat />} />
        <Route path="*" element={<Navigate to="/home" />} />
      </Routes>
    </BrowserRouter>
  );
};
