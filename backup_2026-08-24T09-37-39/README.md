# Бэкап проекта Puff_Now63

Дата создания: 24.08.2026, 13:37:39

## Содержимое:

### Исходный код:
- src/bot.js - основной код бота
- utils/*.js - утилиты (storage, helpers, productManager, reviews)
- miniapp/app.js - клиентское приложение
- miniapp/api/*.js - серверные API endpoints

### Данные:
- data/products.js - товары (файловая версия)
- data/orders.json - заказы
- data/reviews.json - отзывы
- data/chats.json - чаты
- miniapp/products.json - товары для miniapp

### Redis бэкапы:
- redis_products_backup.json - товары из Redis (N/A товаров)
- redis_orders_backup.json - заказы из Redis (4 заказов)

### Конфигурация:
- package.json - зависимости
- vercel.json - конфигурация Vercel (основной проект)
- miniapp/vercel.json - конфигурация Vercel (miniapp)
- .env.example - пример переменных окружения

## Восстановление:

### Товары:
1. Восстановить из `redis_products_backup.json` в Redis:
   ```javascript
   const { Redis } = require('@upstash/redis');
   const redis = new Redis({ url: '...', token: '...' });
   const products = require('./redis_products_backup.json');
   await redis.set('products', JSON.stringify(products));
   ```

2. Или скопировать `data/products.js` в рабочую директорию

### Заказы:
1. Восстановить из `redis_orders_backup.json` в Redis:
   ```javascript
   const orders = require('./redis_orders_backup.json');
   await redis.set('orders', JSON.stringify(orders));
   ```

2. Или скопировать `data/orders.json` в рабочую директорию

## Важные исправления в этой версии:

### 1. ✅ РАЗЪЕБАШКА 80МГ (500₽)
- Восстановлена из Redis
- Добавлена приоритетная сортировка (всегда первая в списке)
- 7 вкусов включены

### 2. ✅ Цены в вкусах
- Исправлено: используется `product.price` вместо `product.cashPrice`
- Все вкусы показывают правильную цену

### 3. ✅ Заказы из Mini App
- Проблема: Vercel serverless = readonly filesystem
- Решение: Заказы сохраняются в Redis
- Бот загружает кэш из Redis при старте
- Кэш обновляется перед обработкой кнопок (`refreshOrdersCache()`)

### 4. ✅ Кнопки подтверждения заказов
- Проблема: Кэш устаревал, новые заказы не находились
- Решение: `refreshOrdersCache()` перед поиском заказа
- Кнопки "Подтвердить/Отменить/Завершить" работают для всех заказов

### 5. ✅ Запрос отзыва
- Отправляется после завершения заказа (не после подтверждения)

### 6. ✅ Синхронизация данных
- Redis: N/A товаров
- data/products.js: синхронизирован
- miniapp/products.json: синхронизирован

## Архитектура:

```
Mini App (Vercel) → Redis (Upstash)
                      ↓
Bot (Railway) → загружает кэш при старте
              → обновляет кэш перед поиском
              → сохраняет в Redis + файл
```

## Deployment:

- **Bot**: Railway.com (загружается из GitHub main branch)
- **Mini App**: Vercel (папка miniapp/)
- **API**: Vercel serverless functions (miniapp/api/)
- **Storage**: Upstash Redis + локальные файлы (fallback)

## Переменные окружения:

См. `.env.example` для списка всех необходимых переменных.

Основные:
- `BOT_TOKEN` - токен Telegram бота
- `ADMIN_ID` / `ADMIN_IDS` - ID администраторов
- `UPSTASH_REDIS_REST_URL` - URL Redis
- `UPSTASH_REDIS_REST_TOKEN` - токен Redis
- `WEBAPP_URL` - URL Mini App
