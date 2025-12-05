import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import UserProfile from './components/UserProfile';
import UserList from './components/UserList';
import './App.css';

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [currentForm, setCurrentForm] = useState('login');
  const [users, setUsers] = useState([]);

  // Загружаем пользователей при запуске
  useEffect(() => {
    fetchUsers();
  }, []);

  // Функция для загрузки пользователей с сервера
  const fetchUsers = async () => {
    try {
      console.log('🔄 Загружаю пользователей с сервера...');
      const response = await fetch('/table');
      
      if (!response.ok) {
        throw new Error(`Ошибка HTTP: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('✅ Пользователи загружены:', data);
      
      if (data.success) {
        setUsers(data.users);
      }
    } catch (error) {
      console.error('❌ Ошибка загрузки пользователей:', error);
      // Демо-данные на случай ошибки
      setUsers([
        { id: 1, username: 'Алексей', isOnline: true },
        { id: 2, username: 'Мария', isOnline: false }
      ]);
    }
  };

  // Обработка входа
  const handleLogin = async (loginData) => {
    console.log('🔐 Попытка входа:', loginData);
    
    try {
      const response = await fetch('/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: loginData.username,
          password: loginData.password
        })
      });
      
      console.log('📥 Статус ответа:', response.status);
      
      const data = await response.json();
      console.log('📦 Ответ сервера:', data);
      
      if (data.success) {
        alert('✅ Вход выполнен успешно!');
        setCurrentUser(data.user);
        // Обновляем список пользователей
        fetchUsers();
      } else {
        alert(`❌ ${data.message || 'Ошибка авторизации'}`);
      }
    } catch (error) {
      console.error('🚨 Ошибка при входе:', error);
      alert('🚨 Ошибка соединения с сервером. Проверьте, что сервер запущен на порту 5000.');
    }
  };

  // Обработка регистрации
  const handleRegister = async (registerData) => {
    console.log('📝 Попытка регистрации:', registerData);
    
    try {
      const response = await fetch('/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: registerData.username,
          email: registerData.email,
          password: registerData.password
        })
      });
      
      console.log('📥 Статус ответа:', response.status);
      
      const data = await response.json();
      console.log('📦 Ответ сервера:', data);
      
      if (data.success) {
        alert('✅ Регистрация успешна!');
        setCurrentUser(data.user);
        // Обновляем список пользователей
        fetchUsers();
      } else {
        alert(`❌ ${data.message || 'Ошибка регистрации'}`);
      }
    } catch (error) {
      console.error('🚨 Ошибка при регистрации:', error);
      alert('🚨 Ошибка соединения с сервером.');
    }
  };

  // Обработка выхода
  const handleLogout = () => {
    setCurrentUser(null);
    alert('👋 Вы вышли из системы');
    fetchUsers();
  };

  return (
    <Router>
      <div className="App">
        <div className="app-container">
          <Routes>
            <Route path="/" element={<Navigate to="/auth" />} />
            
            <Route path="/auth" element={
              <AuthPage 
                currentForm={currentForm}
                setCurrentForm={setCurrentForm}
                onLogin={handleLogin}
                onRegister={handleRegister}
              />
            } />
            
            <Route path="/users" element={
              <UsersPage 
                currentUser={currentUser}
                users={users}
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
            onClick={() => window.location.href = '/users'}
          >
            Список
          </button>
        </div>
      </div>

      <div className="page-header">
        <h2>{currentForm === 'login' ? 'Вход' : 'Регистрация'}</h2>
      </div>

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
const UsersPage = ({ currentUser, users, onLogout }) => {
  return (
    <div>
      <div className="page-navigation">
        <div className="nav-buttons">
          <button 
            className="nav-btn"
            onClick={() => window.location.href = '/auth'}
          >
            Вход
          </button>
          <button 
            className="nav-btn"
            onClick={() => window.location.href = '/auth'}
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

      <div className="page-header">
        <h2>Список пользователей</h2>
      </div>

      <div className="page-content">
        <UserProfile 
          user={currentUser}
          isLoggedIn={!!currentUser}
          onLogout={onLogout}
        />
        <UserList users={users} />
      </div>
    </div>
  );
};

export default App;