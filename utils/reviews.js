const fs = require('fs');
const path = require('path');

const REVIEWS_FILE = path.join(__dirname, '..', 'data', 'reviews.json');

// Redis клиент
let redis = null;
try {
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    const { Redis } = require('@upstash/redis');
    redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });
  }
} catch (e) {}

// Кеш отзывов в памяти
let reviewsCache = null;

async function loadReviewsFromRedis() {
  if (!redis) return false;
  try {
    const data = await redis.get('reviews');
    if (data) {
      reviewsCache = typeof data === 'string' ? JSON.parse(data) : data;
      // Синхронизируем файл
      try { fs.writeFileSync(REVIEWS_FILE, JSON.stringify(reviewsCache, null, 2)); } catch(e) {}
      return true;
    }
  } catch (e) {}
  return false;
}

function ensureFile() {
  const dir = path.dirname(REVIEWS_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  if (!fs.existsSync(REVIEWS_FILE)) fs.writeFileSync(REVIEWS_FILE, JSON.stringify([], null, 2));
}

function getReviews() {
  // Сначала из кеша
  if (reviewsCache !== null) return reviewsCache;
  // Затем из файла
  ensureFile();
  try {
    reviewsCache = JSON.parse(fs.readFileSync(REVIEWS_FILE, 'utf8'));
    return reviewsCache;
  } catch {
    return [];
  }
}

function saveReview(review) {
  const reviews = getReviews();
  reviews.unshift(review); // новые сверху
  reviewsCache = reviews;
  // Сохраняем в файл (fallback)
  try { fs.writeFileSync(REVIEWS_FILE, JSON.stringify(reviews, null, 2)); } catch(e) {}
  // Сохраняем в Redis (основное)
  if (redis) {
    redis.set('reviews', JSON.stringify(reviews)).catch(e => console.error('Redis reviews save error:', e));
  }
}

function deleteReview(id) {
  const reviews = getReviews();
  const filtered = reviews.filter(r => r.id !== id);
  reviewsCache = filtered;
  try { fs.writeFileSync(REVIEWS_FILE, JSON.stringify(filtered, null, 2)); } catch(e) {}
  if (redis) {
    redis.set('reviews', JSON.stringify(filtered)).catch(e => console.error('Redis reviews save error:', e));
  }
  return reviews.length !== filtered.length;
}

function getStats() {
  const reviews = getReviews();
  if (reviews.length === 0) return { count: 0, avg: 0 };
  const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
  return {
    count: reviews.length,
    avg: (sum / reviews.length).toFixed(1)
  };
}

// Проверяем, оставлял ли пользователь отзыв за последние N дней
function hasRecentReview(userId, days = 30) {
  const reviews = getReviews();
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
  return reviews.some(r => r.userId === userId && new Date(r.date).getTime() > cutoff);
}

module.exports = { getReviews, saveReview, deleteReview, getStats, hasRecentReview, loadReviewsFromRedis };
