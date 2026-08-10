# rybushk.in

Личный сайт в стиле CLI (Command Line Interface) с ASCII/Terminal дизайном.

## 🚀 Деплой

Сайт доступен на GitHub Pages: https://rybushkin.github.io/rybushk-in/

## 📁 Структура проекта

```
rybushk-in/
├── index.html          # Главная страница
├── styles.css          # Основные стили
├── styles-ascii.css    # ASCII/Terminal стили
├── texts.js            # Тексты и контент
├── game-arkanoid.js    # Игра Arkanoid
├── content-md/         # Markdown контент для команд
│   ├── commands/       # Команды сайта
│   │   ├── about.md
│   │   ├── clients.md
│   │   ├── contacts.md
│   │   ├── cv.md
│   │   ├── game.md
│   │   ├── help.md
│   │   ├── menu.md
│   │   ├── theme.md
│   │   └── works.md
│   ├── boot.md         # Загрузочный экран
│   ├── facts.md        # Факты
│   ├── loader.md       # Лоадер
│   └── themes.md       # Темы оформления
├── doom/               # DOOM player files
│   ├── index.html      # Standalone player route
│   ├── doom.js         # js-dos bootstrap and setup state
│   ├── doom-inline.js  # Inline terminal player lifecycle
│   ├── doom.css        # CRT/terminal player styles
│   └── README.md       # Bundle setup instructions
└── 404.html            # Страница 404
```

## 🎮 Команды

- `help` - список доступных команд
- `about` - информация обо мне
- `works` - мои работы
- `clients` - клиенты
- `cv` - резюме
- `contacts` - контакты
- `game` - запустить игру Arkanoid
- `doom` - открыть компактный DOOM player внутри терминала
- `theme [название]` - сменить тему оформления
- `menu` - показать меню

## 🎨 Особенности

- **ASCII/Terminal дизайн** - полностью текстовый интерфейс
- **Интерактивные игры** - Arkanoid и DOOM
- **Темы оформления** - несколько цветовых схем
- **Markdown контент** - команды загружаются из .md файлов

## 🔧 Разработка

### Локальный запуск

```bash
# Простой HTTP сервер
python3 -m http.server 8000
# или
npx serve .

# Открыть в браузере
open http://localhost:8000
```

### Структура версий

- `v0001` - первая версия
- `v0002` - текущая версия (CLI стиль с ASCII дизайном)
- `_git` - версия для GitHub

## 🎮 Настройка DOOM

Команда `doom` запускает компактный локальный player внутри терминала.
Страница `/doom/` остаётся отдельным полноэкранным режимом. Обе версии используют
локальный `doom/doom.jsdos` через js-dos v8.

Подробные инструкции: [doom/README.md](./doom/README.md)

## 📝 Лицензия

MIT
