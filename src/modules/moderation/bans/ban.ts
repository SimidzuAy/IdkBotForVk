import {ERRORS, MContext, getUserReg, hear} from '@types'
import {
    getIdByMatch,
    getIdFromReply,
    isThisCommand,
    genCommand
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

        if (!Chat.isEnoughPermission('ban', context))
            return await Chat.sendError(ERRORS.NOT_ENOUGH_RIGHTS, context)

        try {
            const id: number | null = await getIdByMatch(context.vk, [context.$match[1], context.$match[2]]) ||
                await getIdFromReply(context)

            if (id === context.senderId)
                return await Chat.sendError(ERRORS.USE_AT_YOURSELF, context)

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
            }

        } catch (err) {
            await Chat.sendError(ERRORS.IN_KICK_USER, context)
        }
    };

}
