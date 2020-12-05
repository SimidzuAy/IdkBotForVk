import {ERRORS, MContext, getUserReg, hear} from '@types'
import {
    getIdByMatch,
    getIdFromReply,
    isThisCommand,
    sendError,
    sendCommandUsage, genCommand
} from '@utils'
import ICommand from '@command'
import Chat from '@class/Chat'


export default class implements ICommand {
    readonly hears: hear[] =  [
        (value: string, context: MContext): boolean => {
            const regExps = [
                new RegExp(`${genCommand(context.chat.prefix, 'ban')} ${getUserReg}`, 'i'),
                new RegExp(`${genCommand(context.chat.prefix, 'ban')}`, 'i')
            ]

            return isThisCommand(value, context, regExps)
        }
    ];

    readonly handler = async (context: MContext): Promise<void> => {

        if (context.chat.commands['ban'].permission > Chat.getUserFromChat(context.chat, context.senderId)!.permission)
            return await sendError(ERRORS.NOT_ENOUGH_RIGHTS, context.peerId, context.chat.lang, context.vk)

        try {
            const id: number | null = await getIdByMatch(context.vk, [context.$match[1], context.$match[2]]) ||
                await getIdFromReply(context)

            if (id === context.senderId)
                return await sendError(ERRORS.USE_AT_YOURSELF, context.peerId, context.chat.lang, context.vk)

            if (id) {
                await context.vk.api.messages.removeChatUser({
                    chat_id: context.chatId!,
                    member_id: id
                })

                context.chat.bans.push({
                    bannedId: id,
                    byId: context.senderId,
                    from: Date.now(),
                    to: -1
                })

                Chat.removeUserFromChat(context.chat, id)
            } else {
                sendCommandUsage('ban', context.peerId, context.chat.lang, context.vk)
            }

        } catch (err) {
            await sendError(ERRORS.IN_KICK_USER, context.peerId, context.chat.lang, context.vk)
        }
    };

}
