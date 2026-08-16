import { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [applications, setApplications] = useState([]);

  const [company, setCompany] = useState("");
  const [position, setPosition] = useState("");
  const [salary, setSalary] = useState("");
  const [status, setStatus] = useState("applied");
  const [notes, setNotes] = useState("");
  const [filter, setFilter] = useState("all");

  const filteredApplications =
    filter === "all"
      ? applications
      : applications.filter(
          (application) => application.status === filter
        );

  useEffect(() => {
    fetch("http://127.0.0.1:8000/applications")
      .then((response) => response.json())
      .then((data) => setApplications(data));
  }, []);

  function createApplication(event) {
    event.preventDefault();

    fetch("http://127.0.0.1:8000/applications", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        company,
        position,
        salary: Number(salary),
        status,
        notes,
      }),
    })
      .then((response) => response.json())
      .then((newApplication) => {
        setApplications([...applications, newApplication]);

        setCompany("");
        setPosition("");
        setSalary("");
        setStatus("applied");
        setNotes("");
      });
  }

  function deleteApplication(id) {
    fetch(`http://127.0.0.1:8000/applications/${id}`, {
      method: "DELETE",
    }).then((response) => {
      if (!response.ok) {
        throw new Error("Ошибка удаления");
      }

      setApplications(
        applications.filter((application) => application.id !== id)
      );
    });
  }

  function updateStatus(id, newStatus) {
    const application = applications.find(
      (application) => application.id === id
    );

    fetch(`http://127.0.0.1:8000/applications/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        company: application.company,
        position: application.position,
        salary: application.salary,
        notes: application.notes,
        status: newStatus,
      }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Ошибка обновления");
        }

        return response.json();
      })
      .then((updatedApplication) => {
        setApplications(
          applications.map((application) =>
            application.id === id
              ? updatedApplication
              : application
          )
        );
      });
  }

  function formatSalary(salary) {
    return new Intl.NumberFormat("ru-RU").format(salary);
  }

  const interviewCount = applications.filter(
    (application) => application.status === "interview"
  ).length;

  const offerCount = applications.filter(
    (application) => application.status === "offer"
  ).length;

  const rejectedCount = applications.filter(
    (application) => application.status === "rejected"
  ).length;

  return (
    <div className="app">
      <header className="header">
        <div className="logo">
          <div className="logo-icon">J</div>

          <div>
            <h1>JobFlow</h1>
            <span>Application Tracker</span>
          </div>
        </div>

        <div className="profile">
          <div className="profile-dot"></div>
          Backend journey
        </div>
      </header>

      <main className="container">
        <section className="hero">
          <div>
            <span className="eyebrow">YOUR CAREER DASHBOARD</span>

            <h2>
              Найди работу.
              <br />
              <span>Не потеряй ни один отклик.</span>
            </h2>

            <p>
              Управляй вакансиями, следи за этапами и смотри,
              как растёт твоя конверсия.
            </p>
          </div>
        </section>

        <section className="stats">
          <div className="stat-card">
            <div className="stat-icon purple">◎</div>
            <div>
              <span>Всего откликов</span>
              <strong>{applications.length}</strong>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon blue">⌁</div>
            <div>
              <span>Интервью</span>
              <strong>{interviewCount}</strong>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon green">✓</div>
            <div>
              <span>Офферы</span>
              <strong>{offerCount}</strong>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon red">×</div>
            <div>
              <span>Отказы</span>
              <strong>{rejectedCount}</strong>
            </div>
          </div>
        </section>

        <section className="content-grid">
          <div className="panel form-panel">
            <div className="panel-title">
              <div>
                <span className="small-label">NEW APPLICATION</span>
                <h3>Добавить вакансию</h3>
              </div>

              <div className="plus">+</div>
            </div>

            <form onSubmit={createApplication}>
              <label>
                Компания
                <input
                  type="text"
                  placeholder="Например, Ozon"
                  value={company}
                  onChange={(event) => setCompany(event.target.value)}
                  required
                />
              </label>

              <label>
                Должность
                <input
                  type="text"
                  placeholder="Python Backend Developer"
                  value={position}
                  onChange={(event) => setPosition(event.target.value)}
                  required
                />
              </label>

              <div className="form-row">
                <label>
                  Зарплата
                  <input
                    type="number"
                    placeholder="150000"
                    value={salary}
                    onChange={(event) => setSalary(event.target.value)}
                    required
                  />
                </label>

                <label>
                  Статус
                  <select
                    value={status}
                    onChange={(event) => setStatus(event.target.value)}
                  >
                    <option value="applied">Отклик</option>
                    <option value="screening">Скрининг</option>
                    <option value="interview">Интервью</option>
                    <option value="test_task">Тестовое</option>
                    <option value="offer">Оффер</option>
                    <option value="rejected">Отказ</option>
                  </select>
                </label>
              </div>

              <label>
                Заметки
                <textarea
                  placeholder="Рекрутер, этапы, ссылка, впечатления..."
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                />
              </label>

              <button className="submit-button" type="submit">
                <span>Добавить вакансию</span>
                <span>→</span>
              </button>
            </form>
          </div>

          <div className="applications-section">
            <div className="applications-header">
              <div>
                <span className="small-label">PIPELINE</span>
                <h3>Мои отклики</h3>
              </div>

              <span className="application-count">
                {filteredApplications.length} вакансий
              </span>
            </div>

            <div className="filters">
              <button
                className={
                  filter === "all"
                    ? "filter-button active"
                    : "filter-button"
                }
                onClick={() => setFilter("all")}
              >
                Все
              </button>

              <button
                className={
                  filter === "applied"
                    ? "filter-button active"
                    : "filter-button"
                }
                onClick={() => setFilter("applied")}
              >
                Отклик
              </button>

              <button
                className={
                  filter === "screening"
                    ? "filter-button active"
                    : "filter-button"
                }
                onClick={() => setFilter("screening")}
              >
                Скрининг
              </button>

              <button
                className={
                  filter === "interview"
                    ? "filter-button active"
                    : "filter-button"
                }
                onClick={() => setFilter("interview")}
              >
                Интервью
              </button>

              <button
                className={
                  filter === "test_task"
                    ? "filter-button active"
                    : "filter-button"
                }
                onClick={() => setFilter("test_task")}
              >
                Тестовое
              </button>

              <button
                className={
                  filter === "offer"
                    ? "filter-button active"
                    : "filter-button"
                }
                onClick={() => setFilter("offer")}
              >
                Оффер
              </button>

              <button
                className={
                  filter === "rejected"
                    ? "filter-button active"
                    : "filter-button"
                }
                onClick={() => setFilter("rejected")}
              >
                Отказ
              </button>
            </div>

            <div className="applications-list">
              {filteredApplications.length === 0 ? (
                <div className="empty-state">
                  <div>⌕</div>
                  <h3>Ничего не найдено</h3>
                  <p>Для этого фильтра пока нет вакансий.</p>
                </div>
              ) : (
                filteredApplications.map((application) => (
                  <article
                    className="application-card"
                    key={application.id}
                  >
                    <div className="company-avatar">
                      {application.company
                        .charAt(0)
                        .toUpperCase()}
                    </div>

                    <div className="application-info">
                      <div className="application-top">
                        <div>
                          <h4>{application.company}</h4>
                          <p>{application.position}</p>
                        </div>

                        <select
                          className={`status-select status-${application.status}`}
                          value={application.status}
                          onChange={(event) =>
                            updateStatus(
                              application.id,
                              event.target.value
                            )
                          }
                        >
                          <option value="applied">Отклик</option>
                          <option value="screening">Скрининг</option>
                          <option value="interview">Интервью</option>
                          <option value="test_task">Тестовое</option>
                          <option value="offer">Оффер</option>
                          <option value="rejected">Отказ</option>
                        </select>
                      </div>

                      <div className="application-bottom">
                        <span className="salary">
                          {formatSalary(application.salary)} ₽
                        </span>

                        {application.notes && (
                          <span className="notes">
                            {application.notes}
                          </span>
                        )}
                      </div>
                    </div>

                    <button
                      className="delete-button"
                      onClick={() =>
                        deleteApplication(application.id)
                      }
                      title="Удалить"
                    >
                      ×
                    </button>
                  </article>
                ))
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;