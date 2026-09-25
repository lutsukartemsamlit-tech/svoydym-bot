require('dotenv').config();
const { Redis } = require('@upstash/redis');

async function addCottonPhotos() {
  try {
    const redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });

    let data = await redis.get('products');
    if (!data) throw new Error('Нет данных в Redis');

    // Данные хранятся как объект { products: [...], categories: [...] }
    let products = Array.isArray(data) ? data : data.products;
    if (typeof products === 'string') products = JSON.parse(products);

    const photos = {
      'cotton_iceberg': 'AgACAgIAAxkBAAPSarZ1VQsvnH4vdhCLvFHr6ncyuLMAAhUhaxuEDLFJPlBUr0_0pSMBAAMCAAN5AAM9BA',
      'cotton_red':     'AgACAgIAAxkBAAPWarZ1jMXQZPStx4EoMALxjl6SYJgAAgYhaxuEDLFJX3LsMtXtGzABAAMCAAN5AAM9BA',
    };

    let updated = 0;
    for (const [productId, fileId] of Object.entries(photos)) {
      const product = products.find(p => p.id === productId);
      if (product) {
        product.image = fileId;
        updated++;
        console.log(`✅ ${product.name}: фото добавлено`);
      } else {
        console.log(`❌ Товар ${productId} не найден`);
      }
    }

    // Сохраняем обратно в том же формате
    const saveData = Array.isArray(data) ? products : { ...data, products };
    await redis.set('products', JSON.stringify(saveData));
    console.log(`\n✅ Обновлено ${updated} товаров с фото!`);

  } catch (e) {
    console.error('Ошибка:', e);
  }
}

addCottonPhotos();
