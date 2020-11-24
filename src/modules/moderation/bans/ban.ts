import {ERRORS, MContext, commands, getUserReg} from '@types'
import {HearManager} from '@vk-io/hear'
import {getIdByMatch, getIdFromReply, isThisCommand, sendError, aliasesToCommand, sendCommandUsage} from '@utils'
import ICommand from '@command'


export default class implements ICommand {

    readonly PATH: string = __filename;

    readonly hears: any[] = [
        (value: string, context: MContext): boolean => {
            const regExps = [
                new RegExp(`^${context.chat.getPrefix()}\\s*${aliasesToCommand(commands.ban.aliases)} ${getUserReg}`, 'i'),
                new RegExp(`^${context.chat.getPrefix()}\\s*${aliasesToCommand(commands.ban.aliases)}`, 'i')
            ]

            return isThisCommand(value, context, regExps)
        }
    ];

    readonly handler = async (context: MContext): Promise<void> => {

        if (context.chat.getCommandPermission('ban') > context.chat.userGetPermission(context.senderId))
            return await sendError(ERRORS.NOT_ENOUGH_RIGHTS, context.peerId, context.chat.getLang(), context.vk)

        try {
            const id: number | null = await getIdByMatch(context.vk, [context.$match[1], context.$match[2]]) ||
                await getIdFromReply(context)

            if (id === context.senderId)
                return await sendError(ERRORS.USE_AT_YOURSELF, context.peerId, context.chat.getLang(), context.vk)

            if (id) {
                await context.vk.api.messages.removeChatUser({
                    chat_id: context.chatId!,
                    member_id: id
                })

                context.chat.ban(id, context.senderId)
                context.chat.removeChatUser(id)
                context.chat.save()
            } else {
                sendCommandUsage('ban', context.peerId, context.chat.getLang(), context.vk)
            }

        } catch (err) {
            await sendError(ERRORS.IN_KICK_USER, context.peerId, context.chat.getLang(), context.vk)
        }
    };

    constructor(hearManager: HearManager<MContext>) {
        hearManager.hear(this.hears, this.handler)
    }

}
