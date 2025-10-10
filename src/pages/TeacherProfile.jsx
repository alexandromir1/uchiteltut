import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import background from "../assets/background.png";
import herb from "../assets/herb.png";
import Home from "./Home";

const ProfileTeacher = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(() => {
    // Загружаем сохранённые данные, если они есть
    const saved = localStorage.getItem("teacherProfile");
    return saved ? JSON.parse(saved) : {
      name: currentUser?.name || "",
      surname: "",
      patronymic: "",
      birthDate: "",
      education: "",
      experience: "",
      skills: "",
      diplomas: [],
      viewedJobs: [],
    };
  });

  const [selectedFiles, setSelectedFiles] = useState([]);

  // Сохраняем профиль при изменении
  useEffect(() => {
    localStorage.setItem("teacherProfile", JSON.stringify(profile));
  }, [profile]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    const newFiles = files.map((f) => ({
      name: f.name,
      url: URL.createObjectURL(f),
    }));

    setProfile((prev) => ({
      ...prev,
      diplomas: [...prev.diplomas, ...newFiles],
    }));
    setSelectedFiles([]);
  };

  const removeFile = (name) => {
    setProfile((prev) => ({
      ...prev,
      diplomas: prev.diplomas.filter((f) => f.name !== name),
    }));
  };

  if (!currentUser) {
    return (
      <div style={styles.container}>
        <p style={styles.textCenter}>Вы не авторизованы 😢</p>
        <button
          onClick={() => navigate("/login")}
          style={styles.loginButton}
        >
          Войти
        </button>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Хедер */}
      <div style={{ ...styles.header, backgroundImage: `url(${background})` }}>
        <div style={styles.bar}>
          <div style={styles.headerLeft}>
            <Link
              to={'/'}>
              <img src={herb} alt="Герб" style={styles.herb} />
            </Link>
            <span style={styles.headerTitle}>Профиль учителя</span>
          </div>

          <button
            onClick={() => {
              logout();
              navigate("/");
            }}
            style={styles.logoutButton}
          >
            Выйти
          </button>
        </div>

        <h1 style={styles.title}>{profile.name || "Ваш профиль"}</h1>
        <p style={styles.text}>
          Управляйте своими данными, загружайте документы и следите за вакансиями
        </p>
      </div>

      {/* Контент */}
      <main style={styles.main}>
        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>👤 Личные данные</h2>

          <div style={styles.form}>
            <input
              name="surname"
              placeholder="Фамилия"
              value={profile.surname}
              onChange={handleChange}
              style={styles.input}
            />
            <input
              name="name"
              placeholder="Имя"
              value={profile.name}
              onChange={handleChange}
              style={styles.input}
            />
            <input
              name="patronymic"
              placeholder="Отчество"
              value={profile.patronymic}
              onChange={handleChange}
              style={styles.input}
            />
            <input
              name="birthDate"
              type="date"
              value={profile.birthDate}
              onChange={handleChange}
              style={styles.input}
            />
            <input
              name="education"
              placeholder="Образование"
              value={profile.education}
              onChange={handleChange}
              style={styles.input}
            />
            <input
              name="experience"
              placeholder="Опыт работы"
              value={profile.experience}
              onChange={handleChange}
              style={styles.input}
            />
            <textarea
              name="skills"
              placeholder="Ключевые навыки"
              value={profile.skills}
              onChange={handleChange}
              style={styles.textarea}
            />
          </div>
        </section>

        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>📄 Дипломы и сертификаты</h2>
          <input
            type="file"
            multiple
            onChange={handleFileUpload}
            style={styles.fileInput}
          />
          <div style={styles.filesContainer}>
            {profile.diplomas.length > 0 ? (
              profile.diplomas.map((file, i) => (
                <div key={i} style={styles.fileCard}>
                  <a href={file.url} target="_blank" rel="noreferrer">
                    {file.name}
                  </a>
                  <button
                    onClick={() => removeFile(file.name)}
                    style={styles.removeBtn}
                  >
                    ✖
                  </button>
                </div>
              ))
            ) : (
              <p style={styles.noFiles}>Файлы не загружены</p>
            )}
          </div>
        </section>

        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>⭐ Просмотренные вакансии</h2>
          {profile.viewedJobs.length === 0 ? (
            <p style={styles.noFiles}>Вы пока не просматривали вакансии</p>
          ) : (
            <ul>
              {profile.viewedJobs.map((job, i) => (
                <li key={i} style={styles.jobItem}>
                  <strong>{job.position}</strong> — {job.school}
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
};

const styles = {
  container: {
    width: "100%",
    maxWidth: 1000,
    margin: "0 auto"
  },
  header: {
    overflow: "hidden",
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    padding: 30,
    backgroundSize: "cover",
    backgroundPosition: "center",
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
  },
  bar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    height: 70,
    backgroundColor: "#fff",
    borderRadius: 40,
    padding: "0 20px",
  },
  herb: {
    height: 40,
    marginRight: 12
  },
  headerTitle: {
    fontSize: 18,
    color: "#313137",
    fontFamily: "Raleway, sans-serif",
  },
  logoutButton: {
    backgroundColor: "#2637A1",
    color: "#fff",
    border: "none",
    borderRadius: 46,
    padding: "10px 24px",
    cursor: "pointer",
  },
  title: {
    fontSize: 60,
    color: "#fff",
    fontFamily: "Raleway, sans-serif",
    fontWeight: 500,
    marginTop: 120,
    marginBottom: 10,
  },
  text: {
    fontSize: 20,
    color: "#fff",
    maxWidth: 500,
    fontFamily: "Raleway, sans-serif",
  },
  main: {
    padding: 20
  },
  section: {
    backgroundColor: "#FAFAFF",
    borderRadius: 20,
    padding: 30,
    marginBottom: 30,
    boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
  },
  sectionTitle: {
    fontSize: 24,
    color: "#25258E",
    marginBottom: 20,
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: 15
  },
  input: {
    borderRadius: 10,
    padding: 12,
    border: "1px solid #ddd",
    fontSize: 16,
  },
  textarea: {
    borderRadius: 10,
    padding: 12,
    border: "1px solid #ddd",
    fontSize: 16,
    minHeight: 80,
    resize: "vertical",
  },
  fileInput: {
    marginBottom: 15
  },
  filesContainer: {
    display: "flex",
    flexWrap: "wrap",
    gap: 10
  },
  fileCard: {
    backgroundColor: "#E8F6FF",
    borderRadius: 10,
    padding: "10px 15px",
    display: "flex",
    alignItems: "center",
    gap: 10,
  },
  removeBtn: {
    background: "none",
    border: "none",
    color: "#d9534f",
    cursor: "pointer",
    fontSize: 18,
  },
  noFiles: {
    color: "#666",
    fontSize: 16
  },
  jobItem: {
    background: "#E8F6FF",
    borderRadius: 10,
    padding: "8px 12px",
    marginBottom: 8,
  },
  textCenter: {
    textAlign: "center",
    marginTop: 50,
    fontSize: 20
  },
  loginButton: {
    margin: "20px auto",
    display: "block",
    backgroundColor: "#2637A1",
    color: "#fff",
    border: "none",
    borderRadius: 46,
    padding: "12px 40px",
    cursor: "pointer",
  },
};

export default ProfileTeacher;
