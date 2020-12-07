import {MessageContext, VK} from 'vk-io'
import {ExtractDoc} from 'ts-mongoose'
import {chatSchema, userSchema} from './database'
import {Commands, Stat} from './database/types'

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

export type hear = (value: string, context: MContext) => boolean

// eslint-disable-next-line @typescript-eslint/naming-convention
export interface MContext extends MessageContext {
    user: ExtractDoc<typeof userSchema>
    chat: ExtractDoc<typeof chatSchema>
    vk: VK
}

type commandArgs = 'участник' | 'время' | 'префикс' | 'эмоджи' | 'уровень прав' | 'название' | 'команда'
export const commands: {
    [key in keyof typeof Commands]: {
        aliases: string[]
        params: {
            required: commandArgs[]
            notRequired: commandArgs[]
        }
    }
} = {
    ban: {
        aliases: ['бан', 'ban', 'заблокировать'],
        params: {
            required: ['участник'],
            notRequired: []
        }

    },
    unBan: {
        aliases: ['разбан', 'анбан', 'unban', 'разблокировать'],
        params: {
            required: ['участник'],
            notRequired: []
        }
    },
    prefix: {
        aliases: ['prefix', 'префикс'],
        params: {
            required: ['префикс'],
            notRequired: []
        }
    },
    createRole: {
        aliases: ['создать роль', 'create role'],
        params: {
            required: ['название', 'уровень прав'],
            notRequired: []
        }
    },
    changeRoleRight: {
        aliases: ['right', 'permission', 'право'],
        params: {
            required: ['команда', 'уровень прав'],
            notRequired: []
        }
    },
    roleEmoji: {
        aliases: ['emoji', 'емоджи', 'эмоджи'],
        params: {
            required: ['уровень прав', 'эмоджи'],
            notRequired: []
        }
    },
    setRole: {
        aliases: ['роль', 'role'],
        params: {
            required: ['участник', 'уровень прав'],
            notRequired: []
        }
    },
    myRole: {
        aliases: ['роль', 'моя\\s*роль', 'role', 'my\\s*role'],
        params: {
            required: [],
            notRequired: []
        }
    },
    getAdminList: {
        aliases: ['админы', 'администраторы', 'управляющие', 'admins'],
        params: {
            required: [],
            notRequired: []
        }
    },
    ping: {
        aliases: ['ping', 'пинг'],
        params: {
            required: [],
            notRequired: []
        }
    },
    statInChat: {
        aliases: ['моястата', 'стата', 'stat', 'statistic'],
        params: {
            required: [],
            notRequired: []
        }
    },
    allUserStat: {
        aliases: ['общая\\s*стата', 'общая\\s*статистика', 'total\\s*stats'],
        params: {
            required: [],
            notRequired: []
        }
    },
    chatStat: {
        aliases: ['статистика', 'statistic'],
        params: {
            required: [],
            notRequired: []
        }
    }

}

export type commandsName = keyof typeof Commands
