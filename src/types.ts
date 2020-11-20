import {MessageContext, VK} from "vk-io"
import User from "@class/User"
import Chat from "@class/Chat"

export enum ERRORS {
    USER_NOT_FOUND,
    USE_AT_YOURSELF,
    IN_KICK_USER,
    USER_ARE_NOT_BANNED,
    NOT_ENOUGH_RIGHTS,
    ROLE_DOESNT_CREATED,
    USER_ARE_NOT_IN_THE_CHAT,
    USER_HAVE_BIGGER_RIGHT
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
