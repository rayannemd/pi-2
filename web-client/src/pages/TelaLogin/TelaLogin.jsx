import "./TelaLogin.css";
import "../../styles/StandardScreen.css"
import authedFetch from "../../services/authFetch";
import { useNavigate } from "react-router-dom";
import { useState, state } from "react";
import { z } from "zod";
import Logo from "../../components/Logo/Logo.jsx";

const loginSchema = z.object({
  email: z.string().min(1, "Email é obrigatório").email("Email inválido"),
  password: z.string().min(1, "Senha é obrigatória"),
});

export default function TelaLogin() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [erros, setErros] = useState({});

  function handleChange(e) {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  }

  function handleSubmit(e) {
    e.preventDefault(); // evita refresh da página

    const result = loginSchema.safeParse(formData);

    if (!result.success) {
      const formatted = {};
      result.error.errors.forEach((err) => {
        formatted[err.path[0]] = err.message;
      });
      setErros(formatted);
      return;
    }

    setErros({});

    // Criei um usuário cliente fixo pra login
    const userDataCliente1 = {
      name: "Usuário Teste1",
      email: "teste1@gmail.com",
      password: "123456",
      cpfCnpj: "11111111111",
      type: "CUSTOMER",
    };

    // Criei um usuário cliente fixo pra login
    const userDataCliente2 = {
      name: "Usuário Teste2",
      email: "teste2@gmail.com",
      password: "123321",
      cpfCnpj: "99999999999",
      type: "CUSTOMER",
    };

    // Criei um usuário admin fixo pra login
    const userDataAdmin = {
      name: "Usuário Admin",
      email: "admin@gmail.com",
      password: "654321",
      cpfCnpj: "22222222222",
      type: "ADMIN",
    };

    // Criar o usuário cliente 1
    fetch("http://localhost:8080/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userDataCliente1),
    })
      .then((response) => {
        if (!response.ok && response.status !== 400) {
          // se der erro diferente de BAD_REQUEST, mostra alerta
          console.log("Usuário 1 existente no banco");
        }
        if(response.ok){
          console.log("Usuário 1 salvo no banco de dados")
        }
        return response;
      })
    // Criar o usuário cliente 2
    fetch("http://localhost:8080/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userDataCliente2),
    })
      .then((response) => {
        if (!response.ok && response.status !== 400) {
          // se der erro diferente de BAD_REQUEST, mostra alerta
          console.log("Usuário 2 existente no banco");
        }
        if(response.ok){
          console.log("Usuário 2 salvo no banco de dados")
        }
        return response;
      })
      .finally(() => {
        // Criar usuário admin
        fetch("http://localhost:8080/api/auth", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(userDataAdmin),
        })
        .then((response) => {
          if (!response.ok && response.status !== 400) {
            console.log("Admin existente no banco");
          }
          if(response.ok){
            console.log("Usuário admin salvo no banco de dados")
          }
          return response;
        })

        //Cria uma const com o que o usuário digita em 'login' e 'senha'
        const loginData = {
          email: formData.email,
          password: formData.password
        };

        // faz o login enviando o const acima
        fetch("http://localhost:8080/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(loginData),
        })
          .then(async (response) => {
            if (!response.ok) {
              window.alert("Email ou senha inválidos");
              throw new Error("Email ou senha inválidos");
            }
            return response.json();
          })
          .then((data) => {
            alert("Login realizado com sucesso");
            console.log("Resposta do backend:", data);

            localStorage.setItem("token", data.token);
            localStorage.setItem("userId", data.id);

            if(data.userType == "ADMIN"){
              navigate("/chat-admin")
              return;
            } else if(data.userType == "CUSTOMER"){
              navigate("/chat-client")
              return;
            }

            console.warn("Tipo do usuário não reconhecido!")
          })

          .catch(() => {
            console.error({ password: "Email ou senha inválidos" });
          });
      });
  }

  return (
    <div className="tela-root flex">
      <div className="flex">
        <div>
          <Logo size={300} />
          <h1 className="brand">
            PLANETA NET <span className="dot-telecom">.TELECOM</span>
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="forms">
          {/* email */}
          <input
            type="email"
            name="email"
            placeholder="Digite seu email"
            className="input-field"
            value={formData.email}
            onChange={handleChange}
          />
          {erros.email && <p className="error-text">{erros.email}</p>}

          {/* senha */}
          <input
            type="password"
            name="password"
            placeholder="Digite sua senha"
            className="input-field"
            value={formData.password}
            onChange={handleChange}
          />
          {erros.password && <p className="error-text">{erros.password}</p>}

          <button className="btn-login" type="submit">
            Entrar
          </button>
        </form>
      </div>
    </div>
  );
}
