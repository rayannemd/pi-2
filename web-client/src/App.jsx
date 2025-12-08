import './App.css';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import TelaInicialADM from "./pages/telaInicialADM";
import ConversasInit from "./pages/ConversasInit";
import ChatBot from './pages/ChatBot';
import Painel from "./pages/Painel"; // <-- nova tela

function App() {
  return (
    <Router>
      <Routes>

  
        <Route path="/" element={<TelaInicialADM />} />
        <Route path="/ConversasInit" element={<ConversasInit />} />
        <Route path="/ChatBot" element={<ChatBot />} />
        

        {/* NOVA TELA COM SIDEBAR */}
        <Route path="/painel" element={<Painel />} />

      </Routes>
    </Router>
  );
}

export default App;
