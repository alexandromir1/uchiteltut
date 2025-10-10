// client/src/pages/Register.jsx
import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";

export default function Register() {
  const [role, setRole] = useState("teacher");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError(""); // Очищаем ошибку при изменении поля
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!form.name || !form.email || !form.password) {
      setError("Заполните все поля");
      return;
    }

    if (form.password.length < 6) {
      setError("Пароль должен содержать минимум 6 символов");
      return;
    }

    try {
      setError("");
      setLoading(true);
      
      await register({ ...form, role });
      navigate("/");
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>Регистрация</h1>
        
        {error && (
          <div style={styles.error}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={styles.form}>
          <input 
            name="name" 
            placeholder="Имя" 
            value={form.name}
            onChange={handleChange} 
            style={styles.input}
            required 
          />
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
          <select 
            value={role} 
            onChange={e => setRole(e.target.value)}
            style={styles.select}
          >
            <option value="teacher">Учитель</option>
            <option value="school">Школа</option>
            <option value="admin">Администратор</option>
          </select>
          <button 
            type="submit" 
            style={styles.button}
            disabled={loading}
          >
            {loading ? "Регистрация..." : "Зарегистрироваться"}
          </button>
        </form>

        <div style={styles.linkContainer}>
          <span>Уже есть аккаунт? </span>
          <Link to="/login" style={styles.link}>
            Войти
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
  select: {
    padding: '15px 20px',
    fontSize: 16,
    border: '2px solid #E8F6FF',
    borderRadius: 12,
    fontFamily: 'Raleway, sans-serif',
    outline: 'none',
    backgroundColor: 'white',
    cursor: 'pointer'
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