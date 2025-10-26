import React, { useState } from 'react';
import Login from './components/Login';
import Register from './components/Register';
import './App.css';

function App() {
  const [currentForm, setCurrentForm] = useState('login');

  const handleLogin = (loginData) => {
    alert(`Успешный вход!\nИмя пользователя: ${loginData.username}`);
  };

  const handleRegister = (registerData) => {
    alert(`Регистрация успешна!\nИмя: ${registerData.username}\nEmail: ${registerData.email}`);
  };

  return (
    <div className="App">
      <div className="auth-container">
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
    </div>
  );
}

export default App;