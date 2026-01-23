import logo from "../../assets/images/logo.png";

export default function Logo({ size = 60 }) {
  return (
    <img
      src={logo}
      alt="Planeta Net logo"
      style={{ width: size, 
        height: size,      // Mantém um quadrado para não distorcer no Avatar
        objectFit: "contain", // <--- ISSO impede que a imagem seja cortada
        display: "block" }}
    />
  );
}
