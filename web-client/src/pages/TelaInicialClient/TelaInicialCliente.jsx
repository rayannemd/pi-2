import "./TelaInicialCliente.css";
import SearchBox from "../../components/SearchBox/SearchBox.jsx";
import Logo from "../../components/Logo/Logo.jsx";
import { Link } from "react-router-dom";

import userIcon from "../../assets/icons/User.svg";
import configIcon from "../../assets/icons/Config.svg";
import  {useNavigate} from "react-router-dom";

export default function TelaInicialCliente() {
  const navigate = useNavigate();

  function handleSend(text) {
    console.log("Enviar:", text);
    navigate("/chat-client");
  }

  return (
    <div className="tela-root">
      <div className="tela-inner">
        <div className="flex">
          <Logo />
          <h1 className="brand">
            PLANETA NET <span className="dot-telecom">.TELECOM</span>
          </h1>
        </div>
        <p className="help-text">Como posso te ajudar?</p>

        <SearchBox placeholder="Pergunte alguma coisa." onSend={handleSend} />
      </div>

      <div className="tela-options">
        <div className="user-icon">
          <Link to={"/login"}>
            <i>
              <img src={userIcon} alt="Usuário" className="icon-img" />
            </i>
          </Link>
        </div>

        <div className="config-icon">
          <i>
            <img src={configIcon} alt="Configurações" className="icon-img" />
          </i>
        </div>
      </div>
    </div>
  );
}
