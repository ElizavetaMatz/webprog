import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import UserProfile from './components/UserProfile';
import UserList from './components/UserList';
import './App.css';

// Простые тестовые данные
const demoUsers = [
  { id: 1, username: 'Алексей', isOnline: true },
  { id: 2, username: 'Мария', isOnline: false },
  { id: 3, username: 'Иван', isOnline: true }
];

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [currentForm, setCurrentForm] = useState('login');

  const handleLogin = (loginData) => {
    const user = {
      id: Date.now(),
      username: loginData.username
    };
    setCurrentUser(user);
  };

  const handleRegister = (registerData) => {
    const user = {
      id: Date.now(),
      username: registerData.username
    };
    setCurrentUser(user);
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  return (
    <Router>
      <div className="App">
        <div className="app-container">
          <Routes>
            {/* Перенаправление с корня на auth */}
            <Route path="/" element={<Navigate to="/auth" />} />
            
            {/* Представление 1: Авторизация с условным рендерингом */}
            <Route path="/auth" element={
              <AuthPage 
                currentForm={currentForm}
                setCurrentForm={setCurrentForm}
                onLogin={handleLogin}
                onRegister={handleRegister}
              />
            } />
            
            {/* Представление 2: Список пользователей с рендерингом листа */}
            <Route path="/users" element={
              <UsersPage 
                currentUser={currentUser}
                demoUsers={demoUsers}
                onLogout={handleLogout}
              />
            } />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

// Компонент страницы авторизации
const AuthPage = ({ currentForm, setCurrentForm, onLogin, onRegister }) => {
  return (
    <div>
      {/* Навигация как на картинке */}
      <div className="page-navigation">
        <div className="nav-buttons">
          <button 
            className={`nav-btn ${currentForm === 'login' ? 'active' : ''}`}
            onClick={() => setCurrentForm('login')}
          >
            Вход
          </button>
          <button 
            className={`nav-btn ${currentForm === 'register' ? 'active' : ''}`}
            onClick={() => setCurrentForm('register')}
          >
            Регистрация
          </button>
          <button 
            className="nav-btn"
            onClick={() => window.location.pathname = '/users'}
          >
            Список
          </button>
        </div>
      </div>

      {/* Заголовок страницы */}
      <div className="page-header">
        <h2>{currentForm === 'login' ? 'Вход' : 'Регистрация'}</h2>
      </div>

      {/* Форма */}
      <div className="page-content">
        {currentForm === 'login' ? (
          <Login 
            onLogin={onLogin}
            switchToRegister={() => setCurrentForm('register')}
          />
        ) : (
          <Register 
            onRegister={onRegister}
            switchToLogin={() => setCurrentForm('login')}
          />
        )}
      </div>
    </div>
  );
};

// Компонент страницы пользователей
const UsersPage = ({ currentUser, demoUsers, onLogout }) => {
  return (
    <div>
      {/* Навигация */}
      <div className="page-navigation">
        <div className="nav-buttons">
          <button 
            className="nav-btn"
            onClick={() => window.location.pathname = '/auth'}
          >
            Вход
          </button>
          <button 
            className="nav-btn"
            onClick={() => window.location.pathname = '/auth'}
          >
            Регистрация
          </button>
          <button 
            className="nav-btn active"
          >
            Список
          </button>
        </div>
      </div>

      {/* Заголовок страницы */}
      <div className="page-header">
        <h2>Список пользователей</h2>
      </div>

      {/* Контент */}
      <div className="page-content">
        <UserProfile 
          user={currentUser}
          isLoggedIn={!!currentUser}
          onLogout={onLogout}
        />
        <UserList users={demoUsers} />
      </div>
    </div>
  );
};

export default App;