import React, { useState } from 'react';
import './Login.css';

const Login = ({ onLogin, switchToRegister }) => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onLogin) {
      onLogin(formData);
    }
    console.log('Login attempt:', formData);
  };

  return (
    <div className="login-container">
      <form onSubmit={handleSubmit} className="login-form">
        <div className="form-group">
          <label htmlFor="username">Имя пользователя:</label>
          <input
            type="text"
            id="username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            placeholder="Введите ваше имя"
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="password">Пароль:</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Введите ваш пароль"
            required
          />
        </div>
        
        <button type="submit" className="login-btn">
          Войти
        </button>
      </form>
      
      <p className="switch-text">
        Нет аккаунта?{' '}
        <span onClick={switchToRegister} className="switch-link">
          Зарегистрироваться
        </span>
      </p>
    </div>
  );
};

export default Login;