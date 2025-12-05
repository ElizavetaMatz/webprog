const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = 5000;

app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

// Веременная БД 
let users = [];
const sessions = {};

// Пользователи
async function createTestUsers() {
  console.log('СОЗДАНИЕ ТЕСТОВЫХ ПОЛЬЗОВАТЕЛЕЙ');
  
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);
    
    console.log('✅ Хеш пароля создан для password123');
    console.log('📋 Хеш:', hashedPassword);
    
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
    
    console.log('✅ Тестовые пользователи созданы:');
    users.forEach(user => {
      console.log(`   - ${user.username} (пароль: password123)`);
    });
    
  } catch (error) {
    console.error('❌ Ошибка при создании тестовых пользователей:', error);
  }
}

// Создаем пользователей при запуске
createTestUsers();

// GET /table 
app.get('/table', (req, res) => {
  console.log('📋 Запрос списка пользователей');
  
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
    users: usersForClient
  });
});

// POST /login 
app.post('/login',
  [
    body('username')
      .trim()
      .notEmpty()
      .withMessage('Введите имя пользователя'),
    body('password')
      .notEmpty()
      .withMessage('Введите пароль')
  ],
  async (req, res) => {
    console.log('\n🔐 ПОПЫТКА ВХОДА ');
    console.log('📥 Полученные данные:', req.body);
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }
    
    const { username, password } = req.body;
    
    console.log(`🔍 Ищем пользователя: "${username}"`);
    const user = users.find(u => u.username === username);
    
    if (!user) {
      console.log(`❌ Пользователь "${username}" не найден`);
      return res.status(401).json({
        success: false,
        message: 'Неверное имя пользователя или пароль'
      });
    }
    
    console.log(`✅ Пользователь найден: ${user.username}`);
    
    try {
      const isPasswordValid = await bcrypt.compare(password, user.password);
      console.log(`⚖️ Результат сравнения паролей: ${isPasswordValid ? 'СОВПАДАЕТ' : 'НЕ СОВПАДАЕТ'}`);
      
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: 'Неверное имя пользователя или пароль'
        });
      }
      
      // Обновляем статус
      user.isOnline = true;
      const sessionId = uuidv4();
      sessions[sessionId] = {
        userId: user.id,
        expiresAt: Date.now() + 24 * 60 * 60 * 1000
      };
      
      console.log(`🎉 Вход успешен! Пользователь: ${username}`);
      
      const userResponse = {
        id: user.id,
        username: user.username,
        isOnline: true
      };
      
      res.json({
        success: true,
        message: 'Вход выполнен успешно!',
        user: userResponse,
        sessionId
      });
      
    } catch (error) {
      console.error('❌ Ошибка при сравнении паролей:', error);
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
    body('username')
      .trim()
      .isLength({ min: 3, max: 30 })
      .withMessage('Имя должно быть от 3 до 30 символов'),
    body('email')
      .isEmail()
      .withMessage('Введите корректный email'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Пароль должен быть не менее 6 символов')
  ],
  async (req, res) => {
    console.log('\n📝 ПОПЫТКА РЕГИСТРАЦИИ ');
    console.log('📥 Полученные данные:', req.body);
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { username, email, password } = req.body;

    // Проверка на существующего пользователя
    const existingUser = users.find(u => u.email === email);
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'Пользователь с таким email уже существует'
      });
    }

    try {
      // Хеширование пароля
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Создание нового пользователя
      const newUser = {
        id: uuidv4(),
        username,
        email,
        password: hashedPassword,
        isOnline: true,
        createdAt: new Date().toISOString()
      };

      // Сохраняем пользователя
      users.push(newUser);
      console.log(`✅ Пользователь ${username} добавлен`);

      // Создаем сессию
      const sessionId = uuidv4();
      sessions[sessionId] = {
        userId: newUser.id,
        expiresAt: Date.now() + 24 * 60 * 60 * 1000
      };

      const userResponse = {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        isOnline: newUser.isOnline,
        createdAt: newUser.createdAt
      };

      console.log(`🎉 Регистрация успешна! Пользователь: ${username}`);

      res.status(201).json({
        success: true,
        message: 'Регистрация прошла успешно',
        user: userResponse,
        sessionId
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

// GET / - корневой маршрут
app.get('/', (req, res) => {
  res.json({
    message: 'Добро пожаловать в API аутентификации!',
    endpoints: {
      GET_table: '/table - получить список пользователей',
      POST_login: '/login - войти в систему',
      POST_register: '/register - зарегистрироваться'
    },
    status: 'Сервер работает ✅',
    users_count: users.length
  });
});

// Запуск сервера
app.listen(PORT, () => {
  console.log('\n' + '='.repeat(50));
  console.log('✅ СЕРВЕР ЗАПУЩЕН!');
  console.log('='.repeat(50));
  console.log(`🌐 Адрес: http://localhost:${PORT}`);
  console.log(`📡 Доступные эндпоинты:`);
  console.log(`   GET  http://localhost:${PORT}/`);
  console.log(`   GET  http://localhost:${PORT}/table`);
  console.log(`   POST http://localhost:${PORT}/login`);
  console.log(`   POST http://localhost:${PORT}/register`);
  console.log('='.repeat(50));
  console.log('💡 Тестовые пользователи:');
  console.log('   Алексей / password123');
  console.log('   Мария   / password123');
  console.log('='.repeat(50) + '\n');
});