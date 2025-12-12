const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const { v4: uuidv4 } = require('uuid');
const session = require('express-session');

const app = express();
const PORT = 5000;

// ========== Middleware ==========
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

// ========== НАСТРОЙКА СЕССИЙ ==========
app.use(session({
  secret: 'your-secret-key-change-this-in-production', 
  resave: false, 
  saveUninitialized: false, 
  cookie: { 
    secure: false, 
    httpOnly: true, 
    maxAge: 24 * 60 * 60 * 1000 
  },
  name: 'auth-app-session'
}));

// ========== Middleware для проверки аутентификации ==========
const requireAuth = (req, res, next) => {
  if (req.session && req.session.userId) {
    next(); // Пользователь авторизован
  } else {
    res.status(401).json({
      success: false,
      message: 'Требуется авторизация'
    });
  }
};

// ========== База данных (временная) ==========
let users = [];

// ========== СОЗДАНИЕ ТЕСТОВЫХ ПОЛЬЗОВАТЕЛЕЙ ==========
async function createTestUsers() {
  console.log('=== СОЗДАНИЕ ТЕСТОВЫХ ПОЛЬЗОВАТЕЛЕЙ ===');
  
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);
    
    console.log('✅ Хеш пароля создан для password123');
    
    users = [
      {
        id: '1',
        username: 'Алексей',
        email: 'alexey@example.com',
        password: hashedPassword,
        isOnline: true,
        createdAt: new Date().toISOString()
      },
      {
        id: '2',
        username: 'Мария',
        email: 'maria@example.com',
        password: hashedPassword,
        isOnline: false,
        createdAt: new Date().toISOString()
      }
    ];
    
    console.log('✅ Тестовые пользователи созданы');
    
  } catch (error) {
    console.error('❌ Ошибка при создании тестовых пользователей:', error);
  }
}

createTestUsers();

// GET /table 
app.get('/table', (req, res) => {
  console.log('📋 Запрос списка пользователей');
  console.log('ID сессии:', req.sessionID);
  console.log('Данные сессии:', req.session);
  
  const usersForClient = users.map(user => ({
    id: user.id,
    username: user.username,
    isOnline: user.isOnline,
    createdAt: user.createdAt
  }));
  
  res.json({
    success: true,
    message: 'Список пользователей получен',
    count: usersForClient.length,
    users: usersForClient,
    sessionId: req.sessionID
  });
});

// POST /login 
app.post('/login',
  [
    body('username').trim().notEmpty().withMessage('Введите имя пользователя'),
    body('password').notEmpty().withMessage('Введите пароль')
  ],
  async (req, res) => {
    console.log('\n=== 🔐 ПОПЫТКА ВХОДА ===');
    console.log('ID сессии:', req.sessionID);
    console.log('Данные сессии до входа:', req.session);
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }
    
    const { username, password } = req.body;
    const user = users.find(u => u.username === username);
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Неверное имя пользователя или пароль'
      });
    }
    
    try {
      const isPasswordValid = await bcrypt.compare(password, user.password);
      
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: 'Неверное имя пользователя или пароль'
        });
      }
      
      // ========== СОХРАНЕНИЕ ДАННЫХ В СЕССИЮ ==========
      req.session.userId = user.id;
      req.session.username = user.username;
      req.session.isOnline = true;
      req.session.createdAt = new Date().toISOString();
      
      req.session.save((err) => {
        if (err) {
          console.error('❌ Ошибка сохранения сессии:', err);
          return res.status(500).json({
            success: false,
            message: 'Ошибка сервера'
          });
        }
        
        console.log('✅ Сессия сохранена:', req.session);
        console.log(`🎉 Вход успешен! Пользователь: ${username}`);
        
        user.isOnline = true;
        
        res.json({
          success: true,
          message: 'Вход выполнен успешно!',
          user: {
            id: user.id,
            username: user.username,
            isOnline: true
          },
          sessionId: req.sessionID
        });
      });
      
    } catch (error) {
      console.error('❌ Ошибка:', error);
      res.status(500).json({
        success: false,
        message: 'Ошибка сервера'
      });
    }
  }
);

// POST /register 
app.post('/register', 
  [
    body('username').trim().isLength({ min: 3, max: 30 }).withMessage('Имя должно быть от 3 до 30 символов'),
    body('email').isEmail().withMessage('Введите корректный email'),
    body('password').isLength({ min: 6 }).withMessage('Пароль должен быть не менее 6 символов')
  ],
  async (req, res) => {
    console.log('\n=== 📝 ПОПЫТКА РЕГИСТРАЦИИ ===');
    console.log('ID сессии:', req.sessionID);
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { username, email, password } = req.body;
    const existingUser = users.find(u => u.email === email);
    
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'Пользователь с таким email уже существует'
      });
    }

    try {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const newUser = {
        id: uuidv4(),
        username,
        email,
        password: hashedPassword,
        isOnline: true,
        createdAt: new Date().toISOString()
      };

      users.push(newUser);
      console.log(`✅ Пользователь ${username} добавлен`);

      // ========== СОХРАНЕНИЕ ДАННЫХ В СЕССИЮ ==========
      req.session.userId = newUser.id;
      req.session.username = newUser.username;
      req.session.isOnline = true;
      req.session.createdAt = newUser.createdAt;
      
      req.session.save((err) => {
        if (err) {
          console.error('❌ Ошибка сохранения сессии:', err);
          return res.status(500).json({
            success: false,
            message: 'Ошибка сервера'
          });
        }
        
        console.log('✅ Сессия создана для нового пользователя:', req.session);
        console.log(`🎉 Регистрация успешна! Пользователь: ${username}`);

        res.status(201).json({
          success: true,
          message: 'Регистрация прошла успешно',
          user: {
            id: newUser.id,
            username: newUser.username,
            email: newUser.email,
            isOnline: newUser.isOnline,
            createdAt: newUser.createdAt
          },
          sessionId: req.sessionID
        });
      });

    } catch (error) {
      console.error('❌ Ошибка при регистрации:', error);
      res.status(500).json({
        success: false,
        message: 'Ошибка сервера'
      });
    }
  }
);

// GET /check-auth 
// Проверка авторизации пользователя
app.get('/check-auth', (req, res) => {
  console.log('\n=== 🔍 ПРОВЕРКА АВТОРИЗАЦИИ ===');
  console.log('ID сессии:', req.sessionID);
  console.log('Данные сессии:', req.session);
  
  if (req.session && req.session.userId) {
    const user = users.find(u => u.id === req.session.userId);
    
    if (user) {
      res.json({
        success: true,
        isAuthenticated: true,
        user: {
          id: user.id,
          username: user.username,
          isOnline: user.isOnline
        }
      });
    } else {
      req.session.destroy(); 
      res.json({
        success: true,
        isAuthenticated: false,
        message: 'Сессия устарела'
      });
    }
  } else {
    res.json({
      success: true,
      isAuthenticated: false,
      message: 'Пользователь не авторизован'
    });
  }
});

// POST /logout 
// Выход из системы
app.post('/logout', (req, res) => {
  console.log('\n=== 👋 ВЫХОД ИЗ СИСТЕМЫ ===');
  console.log('ID сессии для удаления:', req.sessionID);
  
  if (req.session && req.session.userId) {
    const userId = req.session.userId;
    const user = users.find(u => u.id === userId);
    
    if (user) {
      user.isOnline = false;
      console.log(`✅ Статус пользователя ${user.username} изменен на offline`);
    }
    
    req.session.destroy((err) => {
      if (err) {
        console.error('❌ Ошибка при удалении сессии:', err);
        return res.status(500).json({
          success: false,
          message: 'Ошибка при выходе'
        });
      }
      
      console.log('✅ Сессия удалена');
      res.json({
        success: true,
        message: 'Вы успешно вышли из системы'
      });
    });
  } else {
    res.json({
      success: true,
      message: 'Сессия не найдена'
    });
  }
});

// GET /profile 
// Только для авторизованных пользователей
app.get('/profile', requireAuth, (req, res) => {
  const user = users.find(u => u.id === req.session.userId);
  
  if (user) {
    res.json({
      success: true,
      message: 'Данные профиля',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        isOnline: user.isOnline,
        createdAt: user.createdAt
      }
    });
  } else {
    res.status(404).json({
      success: false,
      message: 'Пользователь не найден'
    });
  }
});

// GET / - корневой маршрут
app.get('/', (req, res) => {
  res.json({
    message: 'Добро пожаловать в API аутентификации!',
    endpoints: {
      GET_table: '/table - получить список пользователей',
      POST_login: '/login - войти в систему',
      POST_register: '/register - зарегистрироваться',
      GET_check_auth: '/check-auth - проверить авторизацию',
      POST_logout: '/logout - выйти из системы',
      GET_profile: '/profile - данные профиля (требует авторизации)'
    },
    status: 'Сервер работает ✅',
    users_count: users.length,
    session_info: {
      hasSession: !!req.session.userId,
      sessionId: req.sessionID
    }
  });
});

// ========== Запуск сервера ==========
app.listen(PORT, () => {
  console.log('\n' + '='.repeat(60));
  console.log('✅ СЕРВЕР ЗАПУЩЕН С ПОДДЕРЖКОЙ СЕССИЙ!');
  console.log('='.repeat(60));
  console.log(`🌐 Адрес: http://localhost:${PORT}`);
  console.log(`📡 Основные эндпоинты:`);
  console.log(`   GET  http://localhost:${PORT}/`);
  console.log(`   GET  http://localhost:${PORT}/table`);
  console.log(`   POST http://localhost:${PORT}/login`);
  console.log(`   POST http://localhost:${PORT}/register`);
  console.log(`   GET  http://localhost:${PORT}/check-auth`);
  console.log(`   POST http://localhost:${PORT}/logout`);
  console.log(`   GET  http://localhost:${PORT}/profile`);
  console.log('='.repeat(60));
  console.log('💡 Тестовые пользователи:');
  console.log('   Алексей / password123');
  console.log('   Мария   / password123');
  console.log('='.repeat(60));
  console.log('🔐 Сессии настроены с временем жизни: 24 часа');
  console.log('='.repeat(60) + '\n');
});