import React, { useState } from 'react';
import './Register.css';

const Register = ({ onRegister, switchToLogin }) => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onRegister) {
      onRegister(formData);
    }
    console.log('Registration attempt:', formData);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(prev => !prev);
  };

  return (
    <div className="register-container">
      <form onSubmit={handleSubmit} className="register-form">
        <div className="form-group">
          <label htmlFor="reg-username">Имя:</label>
          <input
            type="text"
            id="reg-username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            placeholder="Введите ваше имя"
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="email">Электронная почта:</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Введите ваш email"
            required
          />
        </div>
        
        <div className="form-group password-group">
          <label htmlFor="reg-password">Пароль:</label>
          <div className="password-input-container">
            <input
              type={showPassword ? "text" : "password"}
              id="reg-password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Введите пароль"
              required
            />
            <button
              type="button"
              className={`toggle-password-btn ${showPassword ? 'visible' : ''}`}
              onClick={togglePasswordVisibility}
            >
              {showPassword ? 'Скрыть' : 'Показать'}
            </button>
          </div>
        </div>
        
        <button type="submit" className="register-btn">
          Зарегистрироваться
        </button>
      </form>
      
      <p className="switch-text">
        Уже есть аккаунт?{' '}
        <span onClick={switchToLogin} className="switch-link">
          Войти
        </span>
      </p>
    </div>
  );
};

export default Register;