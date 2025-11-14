import React from 'react';
import './UserList.css';

const UserList = ({ users }) => {
  // РЕНДЕРИНГ СПИСКА - преобразуем массив в JSX элементы
  
  // Если пользователей нет
  if (!users || users.length === 0) {
    return (
      <div className="user-list">
        <h3>Список пользователей</h3>
        <p>Нет пользователей для отображения</p>
      </div>
    );
  }

  return (
    <div className="user-list">
      <h3>Список пользователей ({users.length})</h3>
      
      {/* РЕНДЕРИНГ СПИСКА с помощью map() */}
      <div className="users">
        {users.map(user => (
          <div key={user.id} className="user-item">
            <span className="username">{user.username}</span>
            <span className={`status ${user.isOnline ? 'online' : 'offline'}`}>
              {user.isOnline ? '🟢 Online' : '⚫ Offline'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserList;