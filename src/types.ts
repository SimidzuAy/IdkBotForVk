import {MessageContext, VK} from "vk-io"
import User from "./classes/User"
import Chat from "./classes/Chat"

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

export enum RIGHTS {
    USER,
    ADMIN,
    DEVELOPER
}

export enum LANG {
    RUSSIAN,
    ENGLISH
}

export interface MContext extends MessageContext {
    user: User,
    chat: Chat,
    vk: VK
}

export const commands = {
    ban: {
        aliases: [
            'бан',
            'ban'
        ]
    },
    unBan: {
        aliases: [
            'разбан',
            'анбан',
            'unban'
        ]
    },
    prefix: {
        aliases: [
            'prefix',
            'префикс'
        ]
    },
    createRole: {
        aliases: [
            'создать роль',
            'create role'
        ]
    },
    changeRoleRight: {
        aliases: [
            'right',
            'permission',
            'право'
        ]
    },
    roleEmoji: {
        aliases: [
            'emoji',
            'емоджи',
            'эмоджи'
        ]
    },
    setRole: {
        aliases: [
            'роль',
            'role'
        ]
    },
    myRole: {
        aliases: [
            'роль',
            'моя\\s*роль',
            'role',
            'my\\s*role'
        ]
    },
    getAdminList: {
        aliases: [
            'админы',
            'администраторы',
            'управляющие',
            'admins'
        ]
    },
    ping: {
        aliases: [
            'ping',
            'пинг'
        ]
    }

}
