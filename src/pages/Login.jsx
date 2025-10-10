// client/src/pages/Login.jsx
import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError(""); // Очищаем ошибку при изменении поля
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!form.email || !form.password) {
      setError("Заполните все поля");
      return;
    }

    try {
      setError("");
      setLoading(true);
      
      const users = JSON.parse(localStorage.getItem("users") || "[]");
      const found = users.find(u => u.email === form.email && u.password === form.password);
      
      if (found) {
        login(found);
        navigate("/");
      } else {
        setError("Неверный email или пароль");
      }
    } catch (error) {
      setError("Ошибка при входе");
      console.error("Login error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>Вход</h1>
        
        {error && (
          <div style={styles.error}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={styles.form}>
          <input 
            name="email" 
            type="email" 
            placeholder="Email" 
            value={form.email}
            onChange={handleChange} 
            style={styles.input}
            required 
          />
          <input 
            name="password" 
            type="password" 
            placeholder="Пароль" 
            value={form.password}
            onChange={handleChange} 
            style={styles.input}
            required 
          />
          <button 
            type="submit" 
            style={styles.button}
            disabled={loading}
          >
            {loading ? "Вход..." : "Войти"}
          </button>
        </form>

        <div style={styles.linkContainer}>
          <span>Ещё нет аккаунта? </span>
          <Link to="/register" style={styles.link}>
            Зарегистрироваться
          </Link>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #2637A1, #25258E)',
    padding: 20
  },
  card: {
    backgroundColor: '#fff',
    padding: 40,
    borderRadius: 20,
    boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
    width: '100%',
    maxWidth: 400
  },
  title: {
    fontSize: 32,
    color: '#313137',
    fontFamily: 'Raleway, sans-serif',
    fontWeight: 600,
    marginBottom: 30,
    textAlign: 'center'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: 20
  },
  input: {
    padding: '15px 20px',
    fontSize: 16,
    border: '2px solid #E8F6FF',
    borderRadius: 12,
    fontFamily: 'Raleway, sans-serif',
    outline: 'none',
    transition: 'border-color 0.3s ease',
  },
  button: {
    padding: '15px 20px',
    backgroundColor: '#2637A1',
    color: '#fff',
    border: 'none',
    borderRadius: 12,
    fontSize: 16,
    fontFamily: 'Raleway, sans-serif',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'background-color 0.3s ease',
    marginTop: 10
  },
  error: {
    backgroundColor: '#ffebee',
    color: '#c62828',
    padding: '12px 16px',
    borderRadius: 8,
    marginBottom: 20,
    border: '1px solid #ffcdd2',
    fontFamily: 'Raleway, sans-serif'
  },
  linkContainer: {
    textAlign: 'center',
    marginTop: 20,
    fontFamily: 'Raleway, sans-serif',
    color: '#666'
  },
  link: {
    color: '#2637A1',
    textDecoration: 'none',
    fontWeight: 600
  }
};