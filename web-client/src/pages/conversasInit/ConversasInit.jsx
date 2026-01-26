
//throw new Error("CONVERSAS INIT REAL FOI CARREGADO");
/*Alguem que for ver esse pedaço de codigo aqui, saiba que
Esse arquivo não esta dentro das rotas, então, tome cuidado com a edição dele
O arquivo a ser mexido é telachatclient.




*/
//import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./ConversasInit.css";
//import Sidebar from "../components/BarraLateral";
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
    {id: 2, nome: "Maria", ultimaMsg: "Olá, sou o contato 2", categoria: "urgente", horario: "09:50", foto: "" }
  ]);
}, []);



const conversasFiltradas = conversas.filter(c => filtro === 'todos' || c.categoria === filtro);

/*console.log("FILTRO ATUAL:", filtro);
console.log("CONVERSAS ORIGINAIS:", conversas);
console.log("FILTRADAS:", conversasFiltradas);*/

 
  return (
    <>
      

         < BarraLateral 
        filtroAtivo={filtro}
        conversas={conversasFiltradas}
        aoSelecionarChat={attConversaSelecionada}
        aoSelecionarFiltro={filtroSelecionado}
        
        />  


     
        <LayoutChat 
        conversaAtual ={conversaSelecionada}
        mensagens = {mensagens}
       
        />

      
       
    </>  
    
  );
}
