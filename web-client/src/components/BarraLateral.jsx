import { Outlet, useNavigate } from "react-router-dom";
import "./BarraLateral.css";
import logoPlanetaNet from "../assets/images/logoPlanetaNet.png";
import { HomeIcon } from "lucide-react";



export default function Sidebar(){
const navigate = useNavigate();
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Noto+Sans+Bengali&display=swap
" />

  return (
    <div className="sidebar">
      <h2>

        <div className="logo-pn">
        <img src={logoPlanetaNet}  
        alt="Planeta Net"
        className="logoConversas"
        draggable= "false"       
        />
      </div>
        
      </h2>
      <h2>
        <nav className="filtros-nav">
          <div className="filtro-bottom"
         // onClick={() => }
              style={{ cursor: "pointer" }}
              
              
          > Filtros&nbsp;▾


          </div>
        </nav>
      </h2>

      <h2>
        <div className="line-horizontal">
        </div>
      </h2>
      

      <h3>
        <div className="filtro-atual">
          
        </div>
      </h3>

  
    
     <div
  className="homeIcon"
  onClick={() => navigate("/")}
  style={{ cursor: "pointer" }}
>
  <HomeIcon size={25} />
</div>

<div className="box-chat">

</div>

   
  











    </div>
   



  );
}
