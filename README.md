## 🐛 Возможности бота
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

* Установка зависимостей: `npm install` или `yarn install`
* Сборка бота: `npm run build` или `yarn build`
* Запуск: `npm start` или `yarn start`


#### 🚩 Todo

- [x] Создание ролей
- [x] Выдача ролей
- [x] Смена префикса
- [ ] Удаление ролей с заменой прав у пользователей/команд
- [ ] Помощь по командам
- [x] Логгер
- [ ] Полноценные команды для модерации
