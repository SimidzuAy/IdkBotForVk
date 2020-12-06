[![Codacy Badge](https://app.codacy.com/project/badge/Grade/854a5523c7e948439d78243d4db76aaa)](https://www.codacy.com/gh/SimidzuAy/IdkBotForVk/dashboard?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=SimidzuAy/IdkBotForVk&amp;utm_campaign=Badge_Grade)

## 🐛 Возможности бота | 🖼️ [Скриншоты](screenshots)
  * Блокировка пользователей
  * Префикс у чатов
  * Создание новых ролей
  * Роли как у [Чат-менеджера](https://vk.com/cm)
  * Смена необходимой роли для команды
  * Эмоджи у ролей
  * Выдача ролей
  * Рп команды с inline кнопкой в ответ

## 🛠️ Конфиги

**bot.json**:
  * token - Токен вашей группы
  * payload - Используется для клавиатур

**db.json**:
  * url - ссылка для подключения к вашей базе данных [MongoDb](https://www.mongodb.com)

**errors.json**:
  * Key: название ошибки из [ERRORS](https://github.com/SimidzuAy/IdkBotForVk/blob/master/src/types.ts#L5)
    * Первый элемент - текст ошибки на русском
    * Второй элемент - текст ошибки на английском
    
**rp.json**:
  * Key - РП команда.
    * Первый элемент - неизвестный пол
    * Второй элемент - женский пол
    * Третий элемент - мужской пол
    
### ⚙️ Билд и запуск
Task | npm | yarn
-----|-----|-----
Установка зависимостей | `npm install`   | `yarn install`
Сборка бота            | `npm run build` | `yarn build`
Запуск:                | `npm start`     | `yarn start`


#### 🚩 Todo

  - [x] Создание ролей
  - [x] Выдача ролей
  - [x] Смена префикса
  - [ ] Удаление ролей с заменой прав у пользователей/команд
  - [x] Помощь по командам (Не проверенно)
  - [x] Логгер
  - [ ] Полноценные команды для модерации
  - [x] Статистика
