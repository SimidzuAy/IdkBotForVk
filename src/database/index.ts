import mongoose from 'mongoose'
import Logger from '@class/Logger'

export * from './users'
export * from './chats'

export class DB {


    constructor(url: string, logger: Logger) {

        mongoose.connect(url, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useFindAndModify: true,
            useCreateIndex: true
        }).then().catch(err => {
            logger.error(`Ошибка при подключении к базе данных: ${err.message}`, '@database/index')
        })

        const db = mongoose.connection

        db.once('open', () => {
            logger.info('Успешное подключение к БД')
        })
        db.on('error', err => {
            logger.error(`Ошибка в базе данных: ${err.message}`, '@database/index')
        })
    }
}
