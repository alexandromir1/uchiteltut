import React, { useState, useEffect, useRef, useMemo } from "react";
import { gql, useQuery } from "@apollo/client";
import { Link, useNavigate } from "react-router-dom";

import herb from "../assets/herb.png";
import background from "../assets/background.png";
import profileIcon from "../assets/teacherProfileIcon.png";
import "../assets/Home.css";

import { useAuth } from "../context/AuthContext";

const GET_JOBS = gql`
  query GetJobs {
    jobs {
      id
      position
      school
      hours
      salary
      region
      housing
      benefits
      contacts
      email
      support
      studentEmployment
      duties
      openDate
    }
  }
`;

const Home = () => {
  const { loading, error, data } = useQuery(GET_JOBS);
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState("");
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const jobs = data?.jobs || [];

  // Закрытие меню при клике вне блока
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Поиск вакансий
  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);

    if (query.trim() === "") {
      setFilteredJobs(jobs);
    } else {
      const filtered = jobs.filter(
        (job) =>
          job.position?.toLowerCase().includes(query) ||
          job.school?.toLowerCase().includes(query) ||
          job.region?.toLowerCase().includes(query)
      );
      setFilteredJobs(filtered);
    }
  };

  useEffect(() => {
    const timeout = setTimeout(() => {
      setFilteredJobs(
        jobs.filter(job =>
          job.position?.toLowerCase().includes(searchQuery) ||
          job.school?.toLowerCase().includes(searchQuery) ||
          job.region?.toLowerCase().includes(searchQuery)
        )
      );
    }, 300);

    return () => clearTimeout(timeout);
  }, [searchQuery, jobs]);

  const displayJobs = useMemo(() => {
    if (!searchQuery.trim()) return jobs;
    return jobs.filter(job =>
      job.position?.toLowerCase().includes(searchQuery) ||
      job.school?.toLowerCase().includes(searchQuery) ||
      job.region?.toLowerCase().includes(searchQuery)
    );
  }, [jobs, searchQuery]);

  // 🔹 Хедер (общий для всех состояний)
  const Header = ({ jobCount }) => (
    <div style={{ ...styles.header, backgroundImage: `url(${background})` }}>
      <div style={styles.bar}>
        <div style={styles.headerLeft}>
          <Link
            to={'/'}
          >
            <img src={herb} alt="Герб" style={styles.herb} />
          </Link>
          <span style={styles.headerTitle}>Республика Саха (Якутия)</span>
        </div>

        <div style={styles.headerRight}>
          <div style={styles.headerVakancies}>Вакансии: {jobCount}</div>

          {currentUser ? (
            <div style={styles.userSection} ref={menuRef}>
              <span style={styles.userName}>Привет, {currentUser.name}</span>

              <div
                style={styles.profileIconContainer}
                onClick={() => setIsMenuOpen((prev) => !prev)}
              >
                <img
                  src={profileIcon}
                  alt="Профиль"
                  style={styles.profileIcon}
                />
              </div>

              {isMenuOpen && (
                <div style={styles.dropdownMenu}>
                  <div
                    style={styles.dropdownItem}
                    onClick={() =>
                      navigate(
                        currentUser.role === "teacher"
                          ? "/profile/teacher"
                          : "/profile/school"
                      )
                    }
                  >
                    🧑‍🏫 Мой профиль
                  </div>
                  <div
                    style={{ ...styles.dropdownItem, color: "#d9534f" }}
                    onClick={() => {
                      logout();
                      navigate("/");
                    }}
                  >
                    🚪 Выйти
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => navigate("/login")}
              style={styles.headerRightLogin}
            >
              <span style={styles.headerRightLoginLink}>Войти</span>
            </button>
          )}
        </div>
      </div>

      <h1 style={styles.title}>Найдите работу мечты</h1>
      <p style={styles.text}>
        Лучшие вакансии для учителей по всей Республике Саха
      </p>

      <div style={styles.inputContainer}>
        <input
          style={styles.input}
          placeholder="Поиск вакансий..."
          value={searchQuery}
          onChange={handleSearch}
        />
        <button style={styles.searchButton}>
          <span style={{ color: "#fff" }}>🔍</span>
        </button>
      </div>
    </div>
  );

  if (loading)
    return (
      <div style={styles.container}>
        <Header jobCount={0} />
        <div style={styles.loadingContainer}>
          <p style={styles.loadingText}>Загрузка вакансий...</p>
        </div>
      </div>
    );

  if (error)
    return (
      <div style={styles.container}>
        <Header jobCount={0} />
        <div style={styles.errorContainer}>
          <p style={styles.errorText}>Ошибка загрузки данных 😢</p>
          <p style={styles.errorSubtext}>Попробуйте обновить страницу</p>
        </div>
      </div>
    );

  return (
    <div style={styles.container}>
      <Header jobCount={jobs.length} />

      <main style={styles.main}>
        {displayJobs.length === 0 ? (
          <div style={styles.noJobs}>
            <p style={styles.noJobsText}>
              {searchQuery
                ? "Ничего не найдено по вашему запросу"
                : "Нет доступных вакансий"}
            </p>
          </div>
        ) : (
          <div style={styles.grid}>
            {displayJobs.map((job) => {
              const date =
                job.openDate && !isNaN(Number(job.openDate))
                  ? new Date(Number(job.openDate)).toLocaleDateString("ru-RU")
                  : job.openDate || "Дата не указана";

              return (
                <div key={job.id} style={styles.item} className="job-item">
                  <h3 style={styles.titleItem}>
                    {job.position || "Без названия"}
                  </h3>

                  <div style={styles.rateContainer}>
                    <span style={styles.price}>
                      {job.salary || "Зарплата не указана"}
                    </span>
                    <span style={styles.rate}>
                      {job.hours || "Часы не указаны"}
                    </span>
                  </div>

                  <p style={styles.textItem}>
                    <strong style={{ marginRight: 10 }}>Школа:</strong>{" "}
                    {job.school}
                    {job.region && ` • ${job.region}`}
                  </p>

                  <p style={styles.textItem}>
                    <strong>Дата открытия:</strong> {date}
                  </p>

                  <div style={styles.categoryContainer}>
                    {job.housing && (
                      <div style={styles.category}>
                        <span style={styles.categoryText}>{job.housing}</span>
                      </div>
                    )}
                    {job.benefits && (
                      <div style={styles.category}>
                        <span style={styles.categoryText}>Льготы</span>
                      </div>
                    )}
                    {job.studentEmployment && (
                      <div style={styles.category}>
                        <span style={styles.categoryText}>Для студентов</span>
                      </div>
                    )}
                  </div>

                  <Link
                    to={`/job/${job.id}`}
                    style={styles.moreLink}
                    className="more-link"
                  >
                    <span style={styles.more} className="more-text">
                      Подробнее
                    </span>
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

// Стили
const styles = {
  container: {
    width: '100%',
    maxWidth: 1200,
    margin: '0 auto',
  },
  header: {
    overflow: 'hidden',
    borderBottomLeftRadius: 50,
    borderBottomRightRadius: 50,
    padding: 30,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    position: 'relative',
  },
  bar: {
    height: 72,
    backgroundColor: '#fff',
    borderRadius: 40,
    paddingRight: 18,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'relative',
    zIndex: 2,
  },
  herb: {
    height: 50,
    width: 50,
    marginLeft: 10,
    marginRight: 14,
    objectFit: 'contain'
  },
  headerTitle: {
    fontSize: 16,
    color: '#313137',
    fontFamily: 'Inter, sans-serif',
    fontWeight: 300
  },
  headerRight: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center'
  },
  headerVakancies: {
    marginRight: 50,
    fontSize: 16,
    color: '#313137'
  },
  headerRightLogin: {
    padding: '10px 40px',
    backgroundColor: '#2637A1',
    borderRadius: 46,
    border: 'none',
    cursor: 'pointer',
    transition: 'background-color 0.3s ease'
  },
  headerRightLoginLink: {
    color: '#FFFFFF',
    textDecoration: 'none',
    fontSize: 16
  },
  userSection: {
    display: 'flex',
    alignItems: 'center',
    gap: 15
  },
  userName: {
    color: '#313137',
    fontSize: 14,
    fontFamily: 'Inter, sans-serif'
  },
  headerLeft: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center'
  },
  profileIconContainer: {
    width: 40,
    height: 40,
    borderRadius: "50%",
    overflow: "hidden",
    cursor: "pointer",
    border: "2px solid #2637A1",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "transform 0.2s ease",
  },
  profileIcon: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  dropdownMenu: {
    position: "absolute",
    top: 55,
    right: 0,
    backgroundColor: "#fff",
    borderRadius: 10,
    boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
    padding: "10px 0",
    zIndex: 10,
    minWidth: 180,
  },
  dropdownItem: {
    padding: "10px 18px",
    fontSize: 15,
    fontFamily: "Inter, sans-serif",
    color: "#313137",
    cursor: "pointer",
    transition: "background-color 0.2s ease",
  },
  logoutButton: {
    padding: '10px 24px',
    backgroundColor: '#2637A1',
    borderRadius: 46,
    border: 'none',
    color: '#fff',
    fontSize: 16,
    cursor: 'pointer',
    transition: 'background-color 0.3s ease, transform 0.2s ease',
  },
  logoutButtonHover: {
    backgroundColor: '#1f2c80',
  },
  title: {
    fontSize: 72,
    color: '#fff',
    fontFamily: 'Raleway, sans-serif',
    fontWeight: 500,
    marginTop: 180,
    marginBottom: 0,
    lineHeight: 1.1,
    position: 'relative',
    zIndex: 2,
    textShadow: '0 2px 4px rgba(0,0,0,0.3)'
  },
  text: {
    marginTop: 30,
    marginBottom: 35,
    fontSize: 24,
    color: '#fff',
    fontFamily: 'Raleway, sans-serif',
    fontWeight: 500,
    maxWidth: 450,
    lineHeight: 1.4,
    position: 'relative',
    zIndex: 2,
    textShadow: '0 2px 4px rgba(0,0,0,0.3)'
  },
  inputContainer: {
    height: 62,
    backgroundColor: '#fff',
    borderRadius: 38,
    display: 'flex',
    alignItems: 'center',
    paddingLeft: 30,
    maxWidth: 1100,
    position: 'relative',
    zIndex: 2
  },
  input: {
    flex: 1,
    color: '#000',
    fontFamily: 'Raleway, sans-serif',
    fontWeight: 400,
    fontSize: 20,
    border: 'none',
    outline: 'none',
    background: 'transparent'
  },
  searchButton: {
    backgroundColor: '#2637A1',
    height: 44,
    width: 44,
    borderRadius: 22,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    border: 'none',
    cursor: 'pointer',
    transition: 'background-color 0.3s ease'
  },
  main: {
    padding: 20
  },
  grid: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 20,
    marginVertical: 12
  },
  loadingContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40
  },
  loadingText: {
    fontSize: 20,
    color: '#313137',
    fontFamily: 'Raleway, sans-serif'
  },
  errorContainer: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    textAlign: 'center'
  },
  errorText: {
    fontSize: 24,
    color: '#ff4444',
    fontFamily: 'Raleway, sans-serif',
    fontWeight: 500,
    marginBottom: 10
  },
  errorSubtext: {
    fontSize: 16,
    color: '#666',
    fontFamily: 'Raleway, sans-serif'
  },
  noJobs: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40
  },
  noJobsText: {
    fontSize: 20,
    color: '#666',
    fontFamily: 'Raleway, sans-serif'
  },
  item: {
    padding: 30,
    backgroundColor: '#FAFAFF',
    borderRadius: 16,
    flex: '1 1 calc(33.333% - 20px)',
    minWidth: 300,
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    transition: 'transform 0.3s ease, box-shadow 0.3s ease'
  },
  titleItem: {
    color: '#313137',
    fontFamily: 'Raleway, sans-serif',
    fontWeight: 600,
    fontSize: 30,
    marginBottom: 20,
    marginTop: 0,
    lineHeight: 1.2
  },
  rateContainer: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: 20
  },
  price: {
    color: '#25258E',
    fontFamily: 'Raleway, sans-serif',
    fontWeight: 400,
    fontSize: 20,
    marginRight: 12
  },
  rate: {
    color: '#313137',
    fontFamily: 'Raleway, sans-serif',
    fontWeight: 400,
    fontSize: 20
  },
  textItem: {
    display: 'flex',
    justifyContent: 'start',
    color: '#313137',
    fontFamily: 'Raleway, sans-serif',
    fontWeight: 400,
    fontSize: 20,
    marginBottom: 40,
    lineHeight: 1.4
  },
  moreLink: {
    textDecoration: 'none'
  },
  more: {
    color: '#25258E',
    fontFamily: 'Raleway, sans-serif',
    fontWeight: 600,
    fontSize: 20
  },
  categoryContainer: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
    marginBottom: 20
  },
  category: {
    display: 'flex',
    flexDirection: 'row',
    padding: '7px 12px',
    borderRadius: 9,
    backgroundColor: '#E8F6FF',
    marginBottom: 10,
    marginRight: 10
  },
  categoryText: {
    color: '#00516F',
    fontFamily: 'Raleway, sans-serif',
    fontWeight: 400,
    fontSize: 14
  }
};

export default Home;