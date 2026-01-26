import "./TelaLogin.css";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
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
    //lembrar de colocar pra redirecionar pro dashboard
    //navigate("/");
    console.log("Login enviado:", formData);

    fetch("http://localhost:8080/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
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

      navigate("/home");
    })
    .catch(() => {
      console.error( {password: "Email ou senha inválidos"});
    });
  }

  return (
    <div className="tela-root flex">
      <div className="flex">
        <div>
          <Logo size={300}/>
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
