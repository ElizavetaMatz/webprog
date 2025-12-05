import React from 'react';
import './UserProfile.css';

const UserProfile = ({ user, isLoggedIn, onLogout }) => {
  // УСЛОВНЫЙ РЕНДЕРИНГ - показываем разный контент в зависимости от условия
  if (!isLoggedIn) {
    return (
      <div className="user-profile guest">
        <h3>Вход в систему</h3>
        <p>Пожалуйста, войдите или зарегистрируйтесь</p>
      </div>
    );
  }

  return (
    <div className="user-profile logged-in">
      <h3>Добро пожаловать, {user.username}!</h3>
      <p>Вы успешно вошли в систему</p>
      <button onClick={onLogout} className="logout-btn">
        Выйти
      </button>
    </div>
  );
};

export default UserProfile;