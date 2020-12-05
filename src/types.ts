import {MessageContext, VK} from 'vk-io'
import {ExtractDoc} from 'ts-mongoose'
import {chatSchema, userSchema} from './database'
import {Stat} from './database/types'

export enum ERRORS {
    USER_NOT_FOUND,
    USE_AT_YOURSELF,
    IN_KICK_USER,
    USER_ARE_NOT_BANNED,
    NOT_ENOUGH_RIGHTS,
    ROLE_DOESNT_CREATED,
    USER_ARE_NOT_IN_THE_CHAT,
    USER_HAVE_BIGGER_RIGHT,
    UNKNOWN_COMMAND,
    TOO_BIG_SMALL_RIGHT_LEVEL
}

export type IStat = {
    [key in keyof typeof Stat]: number
}

export const getUserReg = '(?:\\[(\\S+?)\\|(?:.+?)]|(?:http(?:s|):\\/\\/|)vk\\.com\\/(.+))'
export const emojiReg = new RegExp('[\\u{1f300}-\\u{1f5ff}\\u{1f900}-\\u{1f9ff}\\u{1f600}-\\u{1f64f}\\u{1f680}-\\u{1f6ff}\\u{2600}-' +
    '\\u{26ff}\\u{2700}-\\u{27bf}\\u{1f1e6}-\\u{1f1ff}\\u{1f191}-\\u{1f251}\\u{1f004}\\u{1f0cf}\\u{1f170}-\\u{1f171}' +
    '\\u{1f17e}-\\u{1f17f}\\u{1f18e}\\u{3030}\\u{2b50}\\u{2b55}\\u{2934}-\\u{2935}\\u{2b05}-\\u{2b07}\\u{2b1b}-' +
    '\\u{2b1c}\\u{3297}\\u{3299}\\u{303d}\\u{00a9}\\u{00ae}\\u{2122}\\u{23f3}\\u{24c2}\\u{23e9}-\\u{23ef}\\u{25b6}' +
    '\\u{23f8}-\\u{23fa}]', 'uig')

export enum RIGHTS {
    USER,
    ADMIN,
    DEVELOPER
}

export enum LANG {
    RUSSIAN,
    ENGLISH
}

export type hear = (value: string, context: MContext) => boolean

// eslint-disable-next-line @typescript-eslint/naming-convention
export interface MContext extends MessageContext {
    user: ExtractDoc<typeof userSchema>
    chat: ExtractDoc<typeof chatSchema>
    vk: VK
}

export const commands = {
    ban: {
        aliases: [
            'бан',
            'ban',
            'заблокировать'
        ],
        usages: [[
            '!ban @user',
            '!ban vk.com/user',
            '!ban - с ответом'
        ], [
            '!ban @user',
            '!ban vk.com/user',
            '!ban - with reply'
        ]]

    },
    unBan: {
        aliases: [
            'разбан',
            'анбан',
            'unban',
            'разблокировать'
        ],
        usages: [[
            '!unban @user',
            '!unban vk.com/user',
            '!unban - с ответом'
        ], [
            '!unban @user',
            '!unban vk.com/user',
            '!unban - with reply'
        ]]
    },
    prefix: {
        aliases: [
            'prefix',
            'префикс'
        ],
        usages: [[
            '!префикс *символ*'
        ], [
            '!prefix *symbol*'
        ]]
    },
    createRole: {
        aliases: [
            'создать роль',
            'create role'
        ],
        usages: [[
            '!создать роль *название* *уровень прав*'
        ], [
            '!create role *name* *right level*'
        ]]
    },
    changeRoleRight: {
        aliases: [
            'right',
            'permission',
            'право'
        ],
        usages: [[
            '!право *команда* *уровень прав*'
        ], [
            '!right *command* *right level*'
        ]]
    },
    roleEmoji: {
        aliases: [
            'emoji',
            'емоджи',
            'эмоджи'
        ],
        usages: [[
            '!емоджи *уровень прав* *эмоджи*'
        ], [
            '!emoji *right level* *emoji*'
        ]]
    },
    setRole: {
        aliases: [
            'роль',
            'role'
        ],
        usages: [[
            '!роль @user *уровень прав*',
            '!роль *уровень прав* - на ответ',
        ], [
            '!role @user *right level*',
            '!role *right level* - on answer'
        ]]
    },
    myRole: {
        aliases: [
            'роль',
            'моя\\s*роль',
            'role',
            'my\\s*role'
        ],
        usages: [['!роль'], ['!role']]
    },
    getAdminList: {
        aliases: [
            'админы',
            'администраторы',
            'управляющие',
            'admins'
        ],
        usages: [['!админы'], ['!admins']]
    },
    ping: {
        aliases: [
            'ping',
            'пинг'
        ],
        usages: [['!пинг'], ['!ping']]
    }

}

export type commandsName = keyof typeof commands
