import React, { useEffect } from "react";
import { gql, useQuery } from "@apollo/client";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const GET_JOB = gql`
  query GetJob($id: ID!) {
    job(id: $id) {
      id
      position
      school
      hours
      salary
      housing
      benefits
      contacts
      support
      studentEmployment
      duties
      openDate
      region
      email
    }
  }
`;
function JobDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { loading, error, data } = useQuery(GET_JOB, { variables: { id } });

  // ✅ сохраняем просмотренные вакансии у пользователя
  useEffect(() => {
    if (data?.job && currentUser?.role === "teacher") {
      const viewed = JSON.parse(localStorage.getItem("viewedJobs") || "[]");
      const updated = [...new Set([...viewed, data.job.id])];
      localStorage.setItem("viewedJobs", JSON.stringify(updated));
    }
  }, [data, currentUser]);

  if (loading) return (
    <div style={styles.container}>
      <div style={styles.loading}>
        <p style={styles.loadingText}>Загрузка вакансии...</p>
      </div>
    </div>
  );

  if (error) return (
    <div style={styles.container}>
      <div style={styles.error}>
        <p style={styles.errorText}>Ошибка загрузки вакансии</p>
        <p style={styles.errorSubtext}>{error.message}</p>
        <button 
          onClick={() => navigate(-1)} 
          style={styles.backButton}
        >
          ← Назад
        </button>
      </div>
    </div>
  );

  const job = data.job;

  return (
    <div style={styles.container}>
      {/* Хлебные крошки */}
      <div style={styles.breadcrumb}>
        <button 
          onClick={() => navigate(-1)} 
          style={styles.backButton}
        >
          ← Назад к вакансиям
        </button>
      </div>

      <div style={styles.content}>
        <div style={styles.left}>
          {/* Заголовок */}
          <div style={styles.header}>
            <h1 style={styles.title}>{job.position}</h1>
            <div style={styles.meta}>
              <span style={styles.school}>{job.school}</span>
              <span style={styles.region}>{job.region}</span>
            </div>
          </div>

          {/* Основная информация */}
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>Основная информация</h2>
            <div style={styles.infoGrid}>
              <div style={styles.infoItem}>
                <span style={styles.infoLabel}>Часы работы:</span>
                <span style={styles.infoValue}>{job.hours || "Не указано"}</span>
              </div>
              <div style={styles.infoItem}>
                <span style={styles.infoLabel}>Зарплата:</span>
                <span style={styles.infoValue}>{job.salary || "Не указана"}</span>
              </div>
              <div style={styles.infoItem}>
                <span style={styles.infoLabel}>Жильё:</span>
                <span style={styles.infoValue}>{job.housing || "Не предоставляется"}</span>
              </div>
              <div style={styles.infoItem}>
                <span style={styles.infoLabel}>Льготы:</span>
                <span style={styles.infoValue}>{job.benefits || "Не указаны"}</span>
              </div>
            </div>
          </div>

          {/* Обязанности */}
          {job.duties && (
            <div style={styles.section}>
              <h2 style={styles.sectionTitle}>Обязанности</h2>
              <p style={styles.duties}>{job.duties}</p>
            </div>
          )}

          {/* Меры поддержки */}
          {job.support && (
            <div style={styles.section}>
              <h2 style={styles.sectionTitle}>Меры поддержки</h2>
              <p style={styles.support}>{job.support}</p>
            </div>
          )}
        </div>

        <div style={styles.right}>
          {/* Боковая панель с контактами */}
          <div style={styles.sidebar}>
            <div style={styles.contactCard}>
              <h3 style={styles.contactTitle}>Контактная информация</h3>
              
              <div style={styles.contactItem}>
                <span style={styles.contactLabel}>Школа:</span>
                <span style={styles.contactValue}>{job.school}</span>
              </div>

              <div style={styles.contactItem}>
                <span style={styles.contactLabel}>Регион:</span>
                <span style={styles.contactValue}>{job.region}</span>
              </div>

              {job.contacts && (
                <div style={styles.contactItem}>
                  <span style={styles.contactLabel}>Контакты:</span>
                  <span style={styles.contactValue}>{job.contacts}</span>
                </div>
              )}

              {job.email && (
                <div style={styles.contactItem}>
                  <span style={styles.contactLabel}>Email:</span>
                  <span style={styles.contactValue}>
                    <a href={`mailto:${job.email}`} style={styles.emailLink}>
                      {job.email}
                    </a>
                  </span>
                </div>
              )}

              <div style={styles.contactItem}>
                <span style={styles.contactLabel}>Дата открытия:</span>
                <span style={styles.contactValue}>
                  {job.openDate
                    ? new Date(Number(job.openDate)).toLocaleDateString("ru-RU", {
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit",
                      })
                    : "Не указана"}
                </span>
              </div>

              {job.studentEmployment && (
                <div style={styles.studentBadge}>
                  ✅ Готовы взять студента старшего курса
                </div>
              )}

              <button style={styles.applyButton}>
                Откликнуться на вакансию
              </button>

              {currentUser?.role === "teacher" && (
                <div style={styles.saveInfo}>
                  📌 Вакансия сохранена в истории просмотров
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    width: '100%',
    maxWidth: 1200,
    margin: '0 auto',
    padding: '20px',
    fontFamily: 'Raleway, sans-serif'
  },
  breadcrumb: {
    marginBottom: 30
  },
  backButton: {
    background: 'none',
    border: 'none',
    color: '#2637A1',
    fontSize: 16,
    fontFamily: 'Raleway, sans-serif',
    cursor: 'pointer',
    padding: '10px 0',
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    transition: 'color 0.3s ease'
  },
  content: {
    display: 'flex',
    gap: 30,
    alignItems: 'flex-start'
  },
  left: {
    flex: 2,
    background: '#FAFAFF',
    padding: 40,
    borderRadius: 20,
    boxShadow: '0 2px 20px rgba(0,0,0,0.08)'
  },
  right: {
    flex: 1,
    minWidth: 300
  },
  header: {
    marginBottom: 40,
    borderBottom: '2px solid #E8F6FF',
    paddingBottom: 30
  },
  title: {
    fontSize: 42,
    color: '#313137',
    fontFamily: 'Raleway, sans-serif',
    fontWeight: 600,
    margin: '0 0 15px 0',
    lineHeight: 1.2
  },
  meta: {
    display: 'flex',
    flexDirection: 'column',
    gap: 10
  },
  school: {
    fontSize: 20,
    color: '#25258E',
    fontWeight: 500
  },
  region: {
    fontSize: 16,
    color: '#666',
    fontWeight: 400
  },
  section: {
    marginBottom: 40
  },
  sectionTitle: {
    fontSize: 24,
    color: '#313137',
    fontFamily: 'Raleway, sans-serif',
    fontWeight: 600,
    margin: '0 0 20px 0',
    paddingBottom: 10,
    borderBottom: '1px solid #E8F6FF'
  },
  infoGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: 15
  },
  infoItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 0',
    borderBottom: '1px solid #f0f0f0'
  },
  infoLabel: {
    color: '#666',
    fontSize: 16,
    fontWeight: 500
  },
  infoValue: {
    color: '#313137',
    fontSize: 16,
    fontWeight: 400,
    textAlign: 'right'
  },
  duties: {
    fontSize: 16,
    color: '#313137',
    lineHeight: 1.6,
    margin: 0
  },
  support: {
    fontSize: 16,
    color: '#313137',
    lineHeight: 1.6,
    margin: 0
  },
  sidebar: {
    position: 'sticky',
    top: 20
  },
  contactCard: {
    background: '#FAFAFF',
    padding: 30,
    borderRadius: 20,
    boxShadow: '0 2px 20px rgba(0,0,0,0.08)',
    border: '1px solid #E8F6FF'
  },
  contactTitle: {
    fontSize: 20,
    color: '#313137',
    fontFamily: 'Raleway, sans-serif',
    fontWeight: 600,
    margin: '0 0 25px 0',
    textAlign: 'center'
  },
  contactItem: {
    marginBottom: 20,
    paddingBottom: 20,
    borderBottom: '1px solid #E8F6FF'
  },
  contactLabel: {
    display: 'block',
    color: '#666',
    fontSize: 14,
    fontWeight: 500,
    marginBottom: 5
  },
  contactValue: {
    display: 'block',
    color: '#313137',
    fontSize: 16,
    fontWeight: 400,
    lineHeight: 1.4
  },
  emailLink: {
    color: '#2637A1',
    textDecoration: 'none',
    transition: 'color 0.3s ease'
  },
  studentBadge: {
    background: '#E8F6FF',
    color: '#00516F',
    padding: '12px 16px',
    borderRadius: 10,
    fontSize: 14,
    fontWeight: 500,
    textAlign: 'center',
    margin: '20px 0',
    border: '1px solid #b8e2f7'
  },
  applyButton: {
    width: '100%',
    padding: '16px 20px',
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
  saveInfo: {
    textAlign: 'center',
    color: '#666',
    fontSize: 12,
    marginTop: 15,
    fontStyle: 'italic'
  },
  loading: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '50vh'
  },
  loadingText: {
    fontSize: 20,
    color: '#313137',
    fontFamily: 'Raleway, sans-serif'
  },
  error: {
    textAlign: 'center',
    padding: 40,
    background: '#FAFAFF',
    borderRadius: 20,
    marginTop: 40
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
    fontFamily: 'Raleway, sans-serif',
    marginBottom: 20
  }
};

// Добавляем hover эффекты через CSS или инлайн
styles.backButton[':hover'] = {
  color: '#1c2a7a'
};

styles.emailLink[':hover'] = {
  color: '#1c2a7a'
};

styles.applyButton[':hover'] = {
  backgroundColor: '#1c2a7a'
};

export default JobDetail;