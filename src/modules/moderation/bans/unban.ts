import ICommand from '@command'
import {ERRORS, getUserReg, hear, MContext} from '@types'
import {genCommand, getIdByMatch, getIdFromReply, isThisCommand} from '@utils'
import Chat from '@class/Chat'

export default class implements ICommand {
    readonly hears: hear[] = [
        (value: string, context: MContext): boolean => {

            const regExps = [
                new RegExp(`${genCommand(context.chat.settings.prefix, 'unBan')} ${getUserReg}`, 'i'),
                new RegExp(genCommand(context.chat.settings.prefix, 'unBan'), 'i')
            ]
            return isThisCommand(value, context, regExps)
        }
    ];

    readonly handler = async (context: MContext): Promise<void> => {

        if (!Chat.isEnoughPermission('unBan', context))
            return await Chat.sendError(ERRORS.NOT_ENOUGH_RIGHTS, context)

        const id: number | null = await getIdByMatch(context.vk, [context.$match[1], context.$match[2]]) ||
                await getIdFromReply(context)

        if (id === context.senderId)
            return await Chat.sendError(ERRORS.USE_AT_YOURSELF, context)

        if (id) {
            if (context.chat.bans.find(x => x.bannedId === id)) {
                context.chat.bans = context.chat.bans.filter(x => x.bannedId !== id)
                await context.send(`Пользователь @id${id} успешно разбанен!`)
            } else
                return await Chat.sendError(ERRORS.USER_ARE_NOT_BANNED, context)
        }

    };

}
