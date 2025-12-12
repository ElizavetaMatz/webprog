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
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuth();
    fetchUsers();
  }, []);

  const checkAuth = async () => {
    try {
      console.log('🔍 Проверяю авторизацию...');
      const response = await fetch('/check-auth', {
        credentials: 'include' 
      });
      
      const data = await response.json();
      console.log('📦 Ответ проверки авторизации:', data);
      
      if (data.success && data.isAuthenticated) {
        console.log('✅ Пользователь авторизован:', data.user);
        setCurrentUser(data.user);
      } else {
        console.log('❌ Пользователь не авторизован');
        setCurrentUser(null);
      }
    } catch (error) {
      console.error('🚨 Ошибка проверки авторизации:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Загрузка пользователей
  const fetchUsers = async () => {
    try {
      const response = await fetch('/table');
      const data = await response.json();
      
      if (data.success) {
        setUsers(data.users);
      }
    } catch (error) {
      console.error('❌ Ошибка загрузки пользователей:', error);
      setUsers([
        { id: 1, username: 'Алексей', isOnline: true },
        { id: 2, username: 'Мария', isOnline: false }
      ]);
    }
  };

  // Обработка входа
  const handleLogin = async (loginData) => {
    try {
      const response = await fetch('/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          username: loginData.username,
          password: loginData.password
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        alert('✅ Вход выполнен успешно!');
        setCurrentUser(data.user);
        fetchUsers();
      } else {
        alert(`❌ ${data.message}`);
      }
    } catch (error) {
      console.error('🚨 Ошибка при входе:', error);
      alert('🚨 Ошибка соединения с сервером.');
    }
  };

  // Обработка регистрации
  const handleRegister = async (registerData) => {
    try {
      const response = await fetch('/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', 
        body: JSON.stringify({
          username: registerData.username,
          email: registerData.email,
          password: registerData.password
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        alert('✅ Регистрация успешна!');
        setCurrentUser(data.user);
        fetchUsers();
      } else {
        alert(`❌ ${data.message}`);
      }
    } catch (error) {
      console.error('🚨 Ошибка при регистрации:', error);
      alert('🚨 Ошибка соединения с сервером.');
    }
  };

  // Обработка выхода
  const handleLogout = async () => {
    try {
      const response = await fetch('/logout', {
        method: 'POST',
        credentials: 'include' 
      });
      
      const data = await response.json();
      
      if (data.success) {
        alert('👋 Вы успешно вышли из системы');
        setCurrentUser(null);
        fetchUsers();
      }
    } catch (error) {
      console.error('🚨 Ошибка при выходе:', error);
      alert('🚨 Ошибка при выходе из системы.');
    }
  };

  // Если идет проверка авторизации, показываем загрузку
  if (isLoading) {
    return (
      <div className="App">
        <div className="app-container">
          <div className="loading">
            <h3>Проверка авторизации...</h3>
          </div>
        </div>
      </div>
    );
  }

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
                isLoggedIn={!!currentUser}
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
const AuthPage = ({ currentForm, setCurrentForm, onLogin, onRegister, isLoggedIn }) => {
  if (isLoggedIn) {
    return (
      <div>
        <div className="page-header">
          <h2>Вы уже авторизованы</h2>
        </div>
        <div className="page-content">
          <p>Перейдите в <a href="/users">список пользователей</a></p>
        </div>
      </div>
    );
  }

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
          <button className="nav-btn active">
            Список
          </button>
        </div>
      </div>

      <div className="page-header">
        <h2>Список пользователей</h2>
        {currentUser && (
          <p style={{ marginTop: '10px', color: '#666' }}>
            Вы вошли как: <strong>{currentUser.username}</strong>
          </p>
        )}
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