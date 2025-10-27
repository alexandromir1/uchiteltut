import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import background from "../assets/background.png";
import herb from "../assets/herb.png";

const SchoolProfile = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const [school, setSchool] = useState(() => {
    const saved = localStorage.getItem("schoolProfile");
    return saved
      ? JSON.parse(saved)
      : {
        name: currentUser?.name || "",
        address: "",
        directorName: "",
        directorPhone: "",
        directorEmail: "",
        awards: [],
        vacancies: [],
      };
  });

  const [newVacancy, setNewVacancy] = useState({
    position: "",
    salary: "",
    hours: "",
    description: "",
  });

  const [awardFiles, setAwardFiles] = useState([]);

  useEffect(() => {
    localStorage.setItem("schoolProfile", JSON.stringify(school));
  }, [school]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSchool((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddVacancy = (e) => {
    e.preventDefault();
    if (!newVacancy.position.trim()) return;
    setSchool((prev) => ({
      ...prev,
      vacancies: [...prev.vacancies, { ...newVacancy, id: Date.now() }],
    }));
    setNewVacancy({ position: "", salary: "", hours: "", description: "" });
  };

  const handleDeleteVacancy = (id) => {
    setSchool((prev) => ({
      ...prev,
      vacancies: prev.vacancies.filter((v) => v.id !== id),
    }));
  };

  const handleAwardUpload = (e) => {
    const files = Array.from(e.target.files);
    const uploaded = files.map((f) => ({
      name: f.name,
      url: URL.createObjectURL(f),
    }));
    setSchool((prev) => ({
      ...prev,
      awards: [...prev.awards, ...uploaded],
    }));
  };

  const handleRemoveAward = (name) => {
    setSchool((prev) => ({
      ...prev,
      awards: prev.awards.filter((a) => a.name !== name),
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
            <span style={styles.headerTitle}>Профиль школы</span>
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

        <h1 style={styles.title}>{school.name || "Ваша школа"}</h1>
        <p style={styles.text}>Редактируйте данные и добавляйте вакансии</p>
      </div>

      {/* Контент */}
      <main style={styles.main}>
        {/* Основная информация */}
        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>🏫 Информация о школе</h2>

          <div style={styles.form}>
            <input
              name="name"
              placeholder="Название школы"
              value={school.name}
              onChange={handleChange}
              style={styles.input}
            />
            <input
              name="address"
              placeholder="Адрес школы"
              value={school.address}
              onChange={handleChange}
              style={styles.input}
            />
            <input
              name="directorName"
              placeholder="ФИО директора"
              value={school.directorName}
              onChange={handleChange}
              style={styles.input}
            />
            <input
              name="directorPhone"
              placeholder="Телефон директора"
              value={school.directorPhone}
              onChange={handleChange}
              style={styles.input}
            />
            <input
              name="directorEmail"
              placeholder="Email директора"
              value={school.directorEmail}
              onChange={handleChange}
              style={styles.input}
            />
          </div>
        </section>

        {/* Вакансии */}
        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>📋 Вакансии школы</h2>

          <form onSubmit={handleAddVacancy} style={styles.form}>
            <input
              placeholder="Должность"
              value={newVacancy.position}
              onChange={(e) =>
                setNewVacancy({ ...newVacancy, position: e.target.value })
              }
              style={styles.input}
              required
            />
            <input
              placeholder="Зарплата"
              value={newVacancy.salary}
              onChange={(e) =>
                setNewVacancy({ ...newVacancy, salary: e.target.value })
              }
              style={styles.input}
            />
            <input
              placeholder="Часы/нагрузка"
              value={newVacancy.hours}
              onChange={(e) =>
                setNewVacancy({ ...newVacancy, hours: e.target.value })
              }
              style={styles.input}
            />
            <textarea
              placeholder="Описание вакансии"
              value={newVacancy.description}
              onChange={(e) =>
                setNewVacancy({ ...newVacancy, description: e.target.value })
              }
              style={styles.textarea}
            />
            <button type="submit" style={styles.addButton}>
              ➕ Добавить вакансию
            </button>
          </form>

          <div style={styles.vacancyList}>
            {school.vacancies.length > 0 ? (
              school.vacancies.map((v) => (
                <div key={v.id} style={styles.vacancyCard}>
                  <div>
                    <strong>{v.position}</strong>
                    <p>{v.description}</p>
                    <p>
                      💰 {v.salary || "не указано"} | ⏱ {v.hours || "не указано"}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDeleteVacancy(v.id)}
                    style={styles.removeBtn}
                  >
                    ✖
                  </button>
                </div>
              ))
            ) : (
              <p style={styles.noFiles}>Вакансий пока нет</p>
            )}
          </div>
        </section>

        {/* Награды */}
        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>🏅 Награды школы</h2>
          <input type="file" multiple onChange={handleAwardUpload} />
          <div style={styles.filesContainer}>
            {school.awards.length > 0 ? (
              school.awards.map((a, i) => (
                <div key={i} style={styles.fileCard}>
                  <a href={a.url} target="_blank" rel="noreferrer">
                    {a.name}
                  </a>
                  <button
                    onClick={() => handleRemoveAward(a.name)}
                    style={styles.removeBtn}
                  >
                    ✖
                  </button>
                </div>
              ))
            ) : (
              <p style={styles.noFiles}>Награды не загружены</p>
            )}
          </div>
        </section>
      </main>
    </div>
  );
};

const styles = {
  container: { width: "100%", maxWidth: 1000, margin: "0 auto" },
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
  herb: { height: 40, marginRight: 12 },
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
  main: { padding: 20 },
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
  form: { display: "flex", flexDirection: "column", gap: 15 },
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
  addButton: {
    backgroundColor: "#2637A1",
    color: "#fff",
    border: "none",
    borderRadius: 46,
    padding: "10px 24px",
    cursor: "pointer",
    fontSize: 16,
    alignSelf: "start",
  },
  vacancyList: { marginTop: 20 },
  vacancyCard: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    backgroundColor: "#E8F6FF",
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
  },
  filesContainer: { display: "flex", flexWrap: "wrap", gap: 10, marginTop: 15 },
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
  noFiles: { color: "#666", fontSize: 16 },
  textCenter: { textAlign: "center", marginTop: 50, fontSize: 20 },
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

export default SchoolProfile;
