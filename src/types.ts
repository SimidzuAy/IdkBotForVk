import {MessageContext, VK} from 'vk-io'
import User from './classes/User'
import Chat from './classes/Chat'

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

export const getUserReg = '(?:\\[(\\S+?)\\|(?:.+?)]|(?:http(?:s|):\\/\\/|)vk\\.com\\/(.+))'

export enum RIGHTS {
    USER,
    ADMIN,
    DEVELOPER
}

export enum LANG {
    RUSSIAN,
    ENGLISH
}

// eslint-disable-next-line @typescript-eslint/naming-convention
export interface MContext extends MessageContext {
    user: User,
    chat: Chat,
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
