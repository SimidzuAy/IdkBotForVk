import ICommand from '@command'
import { ERRORS, MContext, getUserReg} from '@types'
import {
    getIdByMatch,
    getIdFromReply,
    isThisCommand,
    sendError,
    sendCommandUsage,
    genCommand
} from '@utils'
import Chat from '@class/Chat'

export default class implements ICommand {
    readonly hears: any[] = [
        (value: string, context: MContext): boolean => {

            const regExps = [
                new RegExp(`${genCommand(context.chat.prefix, 'unBan')} ${getUserReg}`, 'i'),
                new RegExp(genCommand(context.chat.prefix, 'unBan'))
            ]

            return isThisCommand(value, context, regExps)
        }
    ];

    readonly handler = async (context: MContext): Promise<void> => {

        if (context.chat.commands['unBan'].permission > Chat.getUserFromChat(context.chat, context.senderId)!.permission)
            return await sendError(ERRORS.NOT_ENOUGH_RIGHTS, context.peerId, context.chat.lang, context.vk)

        const id: number | null = await getIdByMatch(context.vk, [context.$match[1], context.$match[2]]) ||
                await getIdFromReply(context)

        if (id === context.senderId)
            return await sendError(ERRORS.USE_AT_YOURSELF, context.peerId, context.chat.lang, context.vk)

        if (id) {
            if (context.chat.bans.find(x => x.bannedId === id)) {
                context.chat.bans = context.chat.bans.filter(x => x.bannedId !== id)
                context.chat.save()
                await context.send(`Пользователь @id${id} успешно разбанен!`)
            } else
                return await sendError(ERRORS.USER_ARE_NOT_BANNED, context.peerId, context.chat.lang, context.vk)
        } else {
            sendCommandUsage('unBan', context.peerId, context.chat.lang, context.vk)
        }

    };

}
