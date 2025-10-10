import React from "react";
import { Link } from "react-router-dom";

export default function Header() {
  return (
    <header style={styles.header}>
      <div style={styles.logo}>
        <Link to="/" style={styles.link}>Учитель.ру</Link>
      </div>
      <nav>
        <Link to="/login" style={styles.button}>Войти</Link>
        <Link to="/register" style={{ ...styles.button, background: "#2637A1", color: "#fff" }}>Регистрация</Link>
      </nav>
    </header>
  );
}

const styles = {
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "15px 30px",
    background: "#fff",
    borderBottom: "1px solid #eee"
  },
  logo: { fontSize: 20, fontWeight: "bold" },
  link: { textDecoration: "none", color: "#000" },
  button: {
    marginLeft: 15,
    padding: "8px 16px",
    borderRadius: 6,
    textDecoration: "none",
    background: "#f2f2f2",
    color: "#000"
  }
};
