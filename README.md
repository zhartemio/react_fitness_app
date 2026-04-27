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
