//import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./ConversasInit.css";
import Sidebar from "../components/BarraLateral";
import LayoutChat from "../../components/LayoutChat/LayoutChat";
import { useEffect, useState } from "react";
import ListaConversa from "../../components/ListaConversa/ListaConversa";
import BarraLateral from "../../components/BarraLateral/BarraLateral";

export default function ConversasInit() {


 const [conversas, attConversas] = useState([]);
 const [conversaSelecionada, attConversaSelecionada] = useState(null);
 const [filtro, filtroSelecionado] = useState('todos');
 const [mensagens, setMensagens] = useState([]);


useEffect(() => {
  attConversas([{id: 1, nome: "joão", ultimaMsg: "Olá, sou o contato 1", categoria: "pendentes", horario: "12:50", foto: "" },
    {id: 2, nome: "Maria", ultimaMsg: "Olá, sou o contato 2", categoria: "todos", horario: "09:50", foto: "" }
  ]);
}, []);



const conversasFiltradas = conversas.filter(c => filtro === 'todos' || c.categoria === filtro);

 
 
  return (
    <>
      

         < BarraLateral 
        filtroAtivo={filtro}
        conversas={conversasFiltradas}
        aoSelecionarChat={attConversaSelecionada}
        aoSelecionarFiltro={filtroSelecionado}
        
        />  


        <ListaConversa 
        conversas={conversasFiltradas}
        aoClicarNoChat={attConversaSelecionada}
        
        
        
        />
        <LayoutChat 
        conversaAtual ={conversaSelecionada}
        mensagens = {mensagens}
        aoResolver={resolverConversa}
        />

      
       
    </>  
    
  );
}
