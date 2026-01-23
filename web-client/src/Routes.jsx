import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import TelaInicialCliente from "./pages/TelaInicialClient/TelaInicialCliente";
import TelaLogin from "./pages/TelaLogin/TelaLogin";
import TelaChatClient from "./pages/TelaChatClient/TelaChatClient";
import Dashboard from "./pages/Dashboard/Dashboard";

export const AppRountes = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/home" element={<TelaInicialCliente />} />
        <Route path="/login" element={<TelaLogin />} />
        <Route path="/chat-client" element={<TelaChatClient />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="*" element={<Navigate to="/home" />} />
      </Routes>
    </BrowserRouter>
  );
};
