import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import TelaLogin from "./pages/TelaLogin/TelaLogin";
import TelaChatClient from "./pages/TelaChatClient/TelaChatClient";
import Dashboard from "./pages/Dashboard/Dashboard";
import Chat from "./pages/chat/Chat";

export const AppRountes = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<TelaLogin />} />
        <Route path="/login" element={<TelaLogin />} />
        <Route path="/chat-admin" element={<TelaChatClient />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/chat-client" element={<Chat />} />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
};
