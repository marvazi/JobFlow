import { useEffect, useState } from "react";
import "./App.css";
const API_URL = import.meta.env.VITE_API_URL;

function App() {
  const [applications, setApplications] = useState([]);

  const [showProfile, setShowProfile] = useState(false);
  const [profileName, setProfileName] = useState("");
  const [profileAvatar, setProfileAvatar] = useState("");

  const [company, setCompany] = useState("");
  const [position, setPosition] = useState("");
  const [salary, setSalary] = useState("");
  const [status, setStatus] = useState("applied");
  const [notes, setNotes] = useState("");
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("");

  const [token, setToken] = useState(
    localStorage.getItem("token")
  );

  const [authMode, setAuthMode] = useState("login");

  const [registerName, setRegisterName] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  const [currentUser, setCurrentUser] = useState(null);

  const filteredApplications =
    filter === "all"
      ? applications
      : applications.filter(
          (application) => application.status === filter
        );

  useEffect(() => {
 const params = new URLSearchParams();

if (search) {
  params.append("search", search);
}

if (sort) {
  params.append("sort", sort);
}

fetch(
  `${API_URL}/applications?${params.toString()}`,
  {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }
)
  .then((response) => {
    if (response.status === 401) {
      localStorage.removeItem("token");
      setToken(null);
      setApplications([]);
      throw new Error("Token expired");
    }

    if (!response.ok) {
      throw new Error("Ошибка загрузки откликов");
    }

    return response.json();
  })
  .then((data) => {
    setApplications(data);
  })
  .catch((error) => {
    console.error(error);
  });

  fetch(`${API_URL}/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
    .then((response) => {
      if (response.status === 401) {
        localStorage.removeItem("token");
        setToken(null);
        setCurrentUser(null);
        throw new Error("Token expired");
      }

      if (!response.ok) {
        throw new Error("Ошибка загрузки профиля");
      }

      return response.json();
    })
    .then((data) => {
      setCurrentUser(data);
      setProfileName(data.name || "");
      setProfileAvatar(data.avatar_url || "");
    })
    .catch((error) => {
      console.error(error);
    });
}, [token,search,sort]);

  function createApplication(event) {
    event.preventDefault();

    fetch(`${API_URL}/applications`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
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

  function updateProfile(event) {
    event.preventDefault();

    fetch(`${API_URL}/me`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        name: profileName,
        avatar_url: profileAvatar,
      }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Ошибка обновления профиля");
        }

        return response.json();
      })
      .then((updatedUser) => {
        setCurrentUser(updatedUser);
        setProfileName(updatedUser.name || "");
        setProfileAvatar(updatedUser.avatar_url || "");
        setShowProfile(false);
      });
  }

  function loginUser(event) {
    event.preventDefault();

    const formData = new URLSearchParams();

    formData.append("username", loginEmail);
    formData.append("password", loginPassword);

    fetch(`${API_URL}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData,
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Неверный email или пароль");
        }

        return response.json();
      })
      .then((data) => {
        localStorage.setItem("token", data.access_token);
        setApplications([]);
        setCurrentUser(null);
        setToken(data.access_token);
      });
  }

  function logoutUser() {
    localStorage.removeItem("token");

    setToken(null);
    setCurrentUser(null);
    setApplications([]);
    setShowProfile(false);
  }

  function deleteApplication(id) {
    fetch(`${API_URL}/applications/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }).then((response) => {
      if (!response.ok) {
        throw new Error("Ошибка удаления");
      }

      setApplications(
        applications.filter(
          (application) => application.id !== id
        )
      );
    });
  }

  function updateStatus(id, newStatus) {
    const application = applications.find(
      (application) => application.id === id
    );

    fetch(`${API_URL}/applications/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
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

  function registerUser(event) {
    event.preventDefault();

    fetch(`${API_URL}/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: registerName,
        email: registerEmail,
        password: registerPassword,
      }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Ошибка регистрации");
        }

        return response.json();
      })
      .then(() => {
        setLoginEmail(registerEmail);

        setRegisterName("");
        setRegisterEmail("");
        setRegisterPassword("");

        setAuthMode("login");
      });
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

  if (!token) {
    return (
      <div className="login-page">
        <div className="login-card">
          <div className="logo-icon">J</div>

          <h1>JobFlow</h1>

          <div className="auth-tabs">
            <button
              className={
                authMode === "login"
                  ? "auth-tab active"
                  : "auth-tab"
              }
              onClick={() => setAuthMode("login")}
            >
              Войти
            </button>

            <button
              className={
                authMode === "register"
                  ? "auth-tab active"
                  : "auth-tab"
              }
              onClick={() => setAuthMode("register")}
            >
              Регистрация
            </button>
          </div>

          {authMode === "login" ? (
            <form onSubmit={loginUser}>
              <input
                type="email"
                placeholder="Email"
                value={loginEmail}
                onChange={(event) =>
                  setLoginEmail(event.target.value)
                }
                required
              />

              <input
                type="password"
                placeholder="Пароль"
                value={loginPassword}
                onChange={(event) =>
                  setLoginPassword(event.target.value)
                }
                required
              />

              <button
                type="submit"
                className="submit-button"
              >
                Войти
              </button>
            </form>
          ) : (
            <form onSubmit={registerUser}>
              <input
                type="text"
                placeholder="Имя"
                value={registerName}
                onChange={(event) =>
                  setRegisterName(event.target.value)
                }
                required
              />

              <input
                type="email"
                placeholder="Email"
                value={registerEmail}
                onChange={(event) =>
                  setRegisterEmail(event.target.value)
                }
                required
              />

              <input
                type="password"
                placeholder="Пароль"
                value={registerPassword}
                onChange={(event) =>
                  setRegisterPassword(event.target.value)
                }
                required
              />

              <button
                type="submit"
                className="submit-button"
              >
                Создать аккаунт
              </button>
            </form>
          )}
        </div>
      </div>
    );
  }

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
          {currentUser?.avatar_url ? (
            <img
              className="profile-avatar"
              src={currentUser.avatar_url}
              alt="avatar"
            />
          ) : (
            <div className="profile-avatar-fallback">
              {currentUser?.name
                ?.charAt(0)
                .toUpperCase()}
            </div>
          )}

          <span>{currentUser?.name}</span>

          <button
            className="profile-button"
            onClick={() =>
              setShowProfile(!showProfile)
            }
          >
            Профиль
          </button>

          <button
            className="logout-button"
            onClick={logoutUser}
          >
            Выйти
          </button>
        </div>
      </header>

      {showProfile && (
        <div className="profile-panel">
          <h3>Профиль</h3>

          <form onSubmit={updateProfile}>
            <label>
              Имя
              <input
                type="text"
                value={profileName}
                onChange={(event) =>
                  setProfileName(event.target.value)
                }
              />
            </label>

            <label>
              URL аватарки
              <input
                type="text"
                placeholder="https://..."
                value={profileAvatar}
                onChange={(event) =>
                  setProfileAvatar(event.target.value)
                }
              />
            </label>

            {profileAvatar && (
              <img
                className="profile-preview"
                src={profileAvatar}
                alt="preview"
              />
            )}

            <button
              className="submit-button"
              type="submit"
            >
              Сохранить
            </button>
          </form>
        </div>
      )}

      <main className="container">
        <section className="hero">
          <div>
            <span className="eyebrow">
              YOUR CAREER DASHBOARD
            </span>

            <h2>
              Найди работу.
              <br />
              <span>
                Не потеряй ни один отклик.
              </span>
            </h2>

            <p>
              Управляй вакансиями, следи за этапами и
              смотри, как растёт твоя конверсия.
            </p>
          </div>
        </section>

        <section className="stats">
          <div className="stat-card">
            <div className="stat-icon purple">◎</div>
            <div>
              <span>Всего откликов</span>
              <strong>
                {applications.length}
              </strong>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon blue">⌁</div>
            <div>
              <span>Интервью</span>
              <strong>
                {interviewCount}
              </strong>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon green">✓</div>
            <div>
              <span>Офферы</span>
              <strong>
                {offerCount}
              </strong>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon red">×</div>
            <div>
              <span>Отказы</span>
              <strong>
                {rejectedCount}
              </strong>
            </div>
          </div>
        </section>

        <section className="content-grid">
          <div className="panel form-panel">
            <div className="panel-title">
              <div>
                <span className="small-label">
                  NEW APPLICATION
                </span>

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
                  onChange={(event) =>
                    setCompany(event.target.value)
                  }
                  required
                />
              </label>

              <label>
                Должность
                <input
                  type="text"
                  placeholder="Python Backend Developer"
                  value={position}
                  onChange={(event) =>
                    setPosition(event.target.value)
                  }
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
                    onChange={(event) =>
                      setSalary(event.target.value)
                    }
                    required
                  />
                </label>

                <label>
                  Статус
                  <select
                    value={status}
                    onChange={(event) =>
                      setStatus(event.target.value)
                    }
                  >
                    <option value="applied">
                      Отклик
                    </option>
                    <option value="screening">
                      Скрининг
                    </option>
                    <option value="interview">
                      Интервью
                    </option>
                    <option value="test_task">
                      Тестовое
                    </option>
                    <option value="offer">
                      Оффер
                    </option>
                    <option value="rejected">
                      Отказ
                    </option>
                  </select>
                </label>
              </div>

              <label>
                Заметки
                <textarea
                  placeholder="Рекрутер, этапы, ссылка, впечатления..."
                  value={notes}
                  onChange={(event) =>
                    setNotes(event.target.value)
                  }
                />
              </label>

              <button
                className="submit-button"
                type="submit"
              >
                <span>
                  Добавить вакансию
                </span>
                <span>→</span>
              </button>
            </form>
          </div>

          <div className="applications-section">
            <div className="applications-header">
              <div className="search-box">
  <input
    type="text"
    placeholder="Поиск по компании или должности..."
    value={search}
    onChange={(event) => setSearch(event.target.value)}
  />
                <select
  value={sort}
  onChange={(event) => setSort(event.target.value)}
>
  <option value="">Без сортировки</option>
  <option value="salary_asc">Зарплата ↑</option>
  <option value="salary_desc">Зарплата ↓</option>
  <option value="company_asc">Компания А–Я</option>
</select>
</div>
              <div>
                <span className="small-label">
                  PIPELINE
                </span>

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
                onClick={() =>
                  setFilter("screening")
                }
              >
                Скрининг
              </button>

              <button
                className={
                  filter === "interview"
                    ? "filter-button active"
                    : "filter-button"
                }
                onClick={() =>
                  setFilter("interview")
                }
              >
                Интервью
              </button>

              <button
                className={
                  filter === "test_task"
                    ? "filter-button active"
                    : "filter-button"
                }
                onClick={() =>
                  setFilter("test_task")
                }
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
                onClick={() =>
                  setFilter("rejected")
                }
              >
                Отказ
              </button>
            </div>

            <div className="applications-list">
              {filteredApplications.length === 0 ? (
                <div className="empty-state">
                  <div>⌕</div>
                  <h3>Ничего не найдено</h3>
                  <p>
                    Для этого фильтра пока нет вакансий.
                  </p>
                </div>
              ) : (
                filteredApplications.map(
                  (application) => (
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
                            <h4>
                              {application.company}
                            </h4>
                            <p>
                              {application.position}
                            </p>
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
                            <option value="applied">
                              Отклик
                            </option>
                            <option value="screening">
                              Скрининг
                            </option>
                            <option value="interview">
                              Интервью
                            </option>
                            <option value="test_task">
                              Тестовое
                            </option>
                            <option value="offer">
                              Оффер
                            </option>
                            <option value="rejected">
                              Отказ
                            </option>
                          </select>
                        </div>

                        <div className="application-bottom">
                          <span className="salary">
                            {formatSalary(
                              application.salary
                            )}{" "}
                            ₽
                          </span>

                          {application.notes && (
                            <span className="notes">
                              {
                                application.notes
                              }
                            </span>
                          )}
                        </div>
                      </div>

                      <button
                        className="delete-button"
                        onClick={() =>
                          deleteApplication(
                            application.id
                          )
                        }
                        title="Удалить"
                      >
                        ×
                      </button>
                    </article>
                  )
                )
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;