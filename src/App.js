import React, { useState } from 'react';
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
  const [currentForm, setCurrentForm] = useState('login');
  const [currentUser, setCurrentUser] = useState(null);

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
    <div className="App">
      <div className="container">
        {currentUser ? (
          // Пользователь вошел - показываем условный рендеринг и список
          <div className="main-content">
            <UserProfile 
              user={currentUser}
              isLoggedIn={true}
              onLogout={handleLogout}
            />
            <UserList users={demoUsers} />
          </div>
        ) : (
          // Пользователь не вошел - показываем формы
          <div className="auth-forms">
            {currentForm === 'login' ? (
              <Login 
                onLogin={handleLogin}
                switchToRegister={() => setCurrentForm('register')}
              />
            ) : (
              <Register 
                onRegister={handleRegister}
                switchToLogin={() => setCurrentForm('login')}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;