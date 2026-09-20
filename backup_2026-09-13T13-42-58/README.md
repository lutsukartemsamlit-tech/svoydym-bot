# Бэкап проекта Puff_Now63

Дата создания: 13.09.2026, 17:42:58

## Быстрое восстановление:

### Товары (Redis):
```bash
node -e "
const { Redis } = require('@upstash/redis');
require('dotenv').config();
const redis = new Redis({ url: process.env.UPSTASH_REDIS_REST_URL, token: process.env.UPSTASH_REDIS_REST_TOKEN });
const products = require('./redis_products_backup.json');
redis.set('products', JSON.stringify(products)).then(() => console.log('✅ Товары восстановлены'));
"
```

### Заказы (Redis):
```bash
node -e "
const { Redis } = require('@upstash/redis');
require('dotenv').config();
const redis = new Redis({ url: process.env.UPSTASH_REDIS_REST_URL, token: process.env.UPSTASH_REDIS_REST_TOKEN });
const orders = require('./redis_orders_backup.json');
redis.set('orders', JSON.stringify(orders)).then(() => console.log('✅ Заказы восстановлены'));
"
```

## Содержимое:

- **Код:** 17 файлов
- **Товары:** 35 товаров (Redis)
- **Заказы:** 42 заказов (Redis)
- **Данные:** orders.json, chats.json, reviews.json

## Файлы:

### Исходный код:
- src/bot.js - основной бот
- utils/*.js - утилиты
- miniapp/app.js - клиентское приложение
- miniapp/api/*.js - API endpoints

### Данные:
- redis_products_backup.json - товары из Redis
- redis_orders_backup.json - заказы из Redis
- data/*.json - локальные данные

### Конфигурация:
- package.json - зависимости
- vercel.json - настройки Vercel

---

**Создан автоматически через:** `node backup.js`
