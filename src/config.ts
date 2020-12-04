import {readFileSync} from 'fs'

interface IConfig {
    token: string
    'force-admin': number[],
    payload: string,
    rp: {
        [key: string]: string[]
    },
    db: {
        url: string
    },
    errors: {
        [key: string]: string[]
    }
}

const config: IConfig = JSON.parse(readFileSync(`${__dirname}/../config/bot.json`).toString())
config.rp = JSON.parse(readFileSync(`${__dirname}/../config/rp.json`).toString())
config.db = JSON.parse(readFileSync(`${__dirname}/../config/db.json`).toString())
config.errors = JSON.parse(readFileSync(`${__dirname}/../config/errors.json`).toString())

export default config


