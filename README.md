# Fitness App (React Native + Expo)

Учебный проект для лабораторных работ 1-4.

## Что реализовано

### Лабораторная работа 1
- UI из 4 экранов: Workouts, API, Settings, Profile + экран деталей записи.
- Сплеш-экран через `expo-splash-screen`.
- Локализация RU/EN.
- Светлая/темная тема с сохранением.
- Локальная БД для тренировок через SQLite (если `expo-sqlite` доступен) с fallback на локальное хранилище, CRUD для `title`, `description`, `date`, `category`.

### Лабораторная работа 2
- Архитектура MVVM (`src/viewmodels`) + репозиторий (`src/repositories`) + сервисы (`src/services`).
- Web API: Open-Meteo.
- Проверка сети (`navigator.onLine` + fallback ping).
- Оффлайн-кэш API в локальном хранилище.

### Лабораторная работа 3
- Поиск, фильтрация, сортировка, нечеткий поиск (Levenshtein).
- Напоминания (in-app timer уведомления).
- «Удаленная БД» и обновления через подписку (`cloudService` demo).

### Лабораторная работа 4
- Регистрация и вход (demo auth в локальном хранилище).
- Обновления данных в реальном времени через подписку на cloudService.
- Platform API: геолокация.
- Соцсети: системный Share.

## Запуск

```bash
npm install
npm run start
```

## Важно

Из-за ограничений окружения зависимости для production-реализации (Firebase/SQLite/Push notifications) не добавлялись. В проекте сделаны учебные аналоги на встроенных API.

## ImageKit

Загрузка изображений реализована через `src/services/imageService.ts`. Клиентское приложение не хранит private key ImageKit: для безопасной загрузки нужен backend endpoint, который возвращает одноразовые параметры `signature`, `expire` и `token`.

Перед запуском задайте переменные окружения:

```bash
export EXPO_PUBLIC_IMAGEKIT_PUBLIC_KEY="your_public_key"
export EXPO_PUBLIC_IMAGEKIT_URL_ENDPOINT="https://ik.imagekit.io/your_imagekit_id"
export EXPO_PUBLIC_IMAGEKIT_AUTH_ENDPOINT="https://your-backend.example.com/imagekit-auth"
npm run start
```

Пример ответа `EXPO_PUBLIC_IMAGEKIT_AUTH_ENDPOINT`:

```json
{
  "signature": "generated_signature",
  "expire": 1710000000,
  "token": "unique_upload_token",
  "publicKey": "your_public_key"
}
```

В форме тренировки можно указать URL/URI изображения, загрузить его в ImageKit и сохранить полученные `url`, `fileId`, `filePath` вместе с записью тренировки. При отображении списка и детального экрана приложение получает картинку обратно по ImageKit CDN URL.
