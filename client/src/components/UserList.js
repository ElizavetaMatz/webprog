import React from 'react';
import './UserList.css';

const UserList = ({ users }) => {
  // Рендерин списка
  
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