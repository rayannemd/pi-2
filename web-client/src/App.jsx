import './App.css';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import TelaInicialADM from "./pages/telaInicialADM";
import ConversasInit from "./pages/ConversasInit";
import ChatBot from './pages/ChatBot';


function App() {
  return (
    <Router>
      <Routes>

  
        <Route path="/" element={<TelaInicialADM />} />
        <Route path="/ConversasInit" element={<ConversasInit />} />
        <Route path="/ChatBot" element={<ChatBot />} />
        


      </Routes>
    </Router>
  );
}

export default App;
