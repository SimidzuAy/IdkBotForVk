import ICommand from '@command'
import {ERRORS, MContext, getUserReg} from '@types'
import {genCommand, getIdByMatch, getIdFromReply, isThisCommand, sendError} from '@utils'
import Chat from '@class/Chat'

export default class implements ICommand {

    readonly hears: any[] = [
        (value: string, context: MContext): boolean => {

            const regExps = [
                new RegExp(`${genCommand(context.chat.prefix, 'setRole')} ${getUserReg} (\\d{1,3})$`, 'i'),
                new RegExp(`${genCommand(context.chat.prefix, 'setRole')} (\\d{1,3})$`, 'i'),
                new RegExp(genCommand(context.chat.prefix, 'myRole'), 'i')
            ]

            return  isThisCommand(value, context, regExps)
        }
    ];

    readonly handler = async (context: MContext): Promise<unknown> => {
        const id = await getIdFromReply(context) ||
            await getIdByMatch(context.vk, [context.$match[1], context.$match[2]])

        if (!id) {
            const userPermission = Chat.getUserFromChat(context.chat, context.senderId)!.permission
            const name = context.chat.rights.find(x => x.permission === userPermission)!.name

            return await context.send(`Роль: ${name}`)
        }

        const thisUser = Chat.getUserFromChat(context.chat, context.senderId)!
        let permission: number

        if (!isNaN(Number(context.$match[3]))) {
            permission = Number(context.$match[3])
        } else {
            permission = Number(context.$match[2])
        }

        if (id === context.senderId)
            return await sendError(ERRORS.USE_AT_YOURSELF, context.peerId, context.chat.lang, context.vk)

        if (!Chat.getUserFromChat(context.chat, id))
            return await sendError(ERRORS.USER_ARE_NOT_IN_THE_CHAT, context.peerId, context.chat.lang, context.vk)

        if (thisUser.permission <= Chat.getUserFromChat(context.chat, id)!.permission)
            return await sendError(ERRORS.USER_HAVE_BIGGER_RIGHT, context.peerId, context.chat.lang, context.vk)

        if (thisUser.permission <= permission)
            return await context.send([
                'Вы не можете выдавать права которые выше или равняются вашему!',
                'You cannot issue rights that are higher than or equal to yours!'
            ][context.chat.lang])

        if (!context.chat.rights.find(x => x.permission === permission))
            return await sendError(ERRORS.ROLE_DOESNT_CREATED, context.peerId, context.chat.lang, context.vk)

        Chat.getUserFromChat(context.chat, id)!.permission = permission
        context.chat.save()

        await context.send(['Уровень прав успешно изменён!', 'Permission level successfully changed!'][context.chat.lang])

    };
}
