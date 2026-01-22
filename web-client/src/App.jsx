import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import TelaInicialCliente from "./pages/TelaInicialCliente";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<TelaInicialCliente />} />
        {/* outras rotas depois */}
      </Routes>
    </BrowserRouter>
  );
}
