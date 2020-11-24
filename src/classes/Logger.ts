import { existsSync, mkdirSync, createWriteStream, writeFileSync } from 'fs'

export default class {

    private stream;

    constructor() {
        if ( !existsSync('./logs') ) {
            mkdirSync('./logs')
        }

        const date = new Date()

        // Haha long string goes brrrrrrrrrrrrrrrrr
        const fileName = `${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}-${date.getHours()}-${date.getMinutes()}-${date.getSeconds()}`
        writeFileSync(`./logs/${fileName}.log`, '')
        this.stream = createWriteStream(`./logs/${fileName}.log`)

    }

    info(info: string): void {
        const date = new Date().toLocaleString('ru-RU')

        this.stream.write(`[INFO] ( ${date} ) ${info}\n`)
        console.log(`[${COLORS.CYAN}INFO${COLORS.NONE}]: ( ${COLORS.YELLOW}${date}${COLORS.NONE} ): ${info}`)
    }

    module(path: string): void {
        const date = new Date().toLocaleString('ru-RU')

        this.stream.write(`[LOAD MODULE] ( ${date} ): @${path.substr(1, path.length - 4)}\n`)
        console.log(`[${COLORS.PINK}LOAD MODULE${COLORS.NONE}] ( ${COLORS.YELLOW}${date}${COLORS.NONE} ): `
            + `${COLORS.GREEN}@${path.substr(1, path.length - 4)}${COLORS.NONE}`)
    }

    error(error: string, moduleName?: string): void {
        const date = new Date().toLocaleString('ru-RU')

        this.stream.write(`[ERROR] ${error}\n`)
        console.log(`[${COLORS.RED}ERROR${COLORS.NONE}] `
            + `${moduleName ? ` in [${COLORS.GREEN}${moduleName}${COLORS.NONE}]` : ''} `
            + `( ${COLORS.YELLOW}${date}${COLORS.NONE} ): ${error}`)
    }

}


enum COLORS {
    NONE = '\x1b[0m',
    CYAN = '\x1b[36m',
    PINK = '\x1b[35m',
    RED = '\x1b[31m',
    GREEN = '\x1b[32m',
    YELLOW = '\x1b[33m'
}
