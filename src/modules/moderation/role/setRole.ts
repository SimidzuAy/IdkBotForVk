import ICommand from '@command'
import {ERRORS, getUserReg, hear, MContext} from '@types'
import {genCommand, getIdByMatch, getIdFromReply, isThisCommand} from '@utils'
import Chat from '@class/Chat'
import User from '@class/User'

export default class implements ICommand {

    readonly hears: hear[] = [
        (value: string, context: MContext): boolean => {

            const regExps = [
                new RegExp(`${genCommand(context.chat.settings.prefix, 'setRole')} ${getUserReg} (\\d{1,3})$`, 'i'),
                new RegExp(`${genCommand(context.chat.settings.prefix, 'setRole')} (\\d{1,3})$`, 'i'),
                new RegExp(genCommand(context.chat.settings.prefix, 'myRole'), 'i')
            ]

            return isThisCommand(value, context, regExps)
        }
    ];

    readonly handler = async (context: MContext): Promise<unknown> => {
        const id = await getIdFromReply(context) ||
            await getIdByMatch(context.vk, [context.$match[1], context.$match[2]])

        if (!id || !Chat.isEnoughPermission('setRole', context)) {
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
            return await Chat.sendError(ERRORS.USE_AT_YOURSELF, context)

        if (!Chat.getUserFromChat(context.chat, id))
            return await Chat.sendError(ERRORS.USER_ARE_NOT_IN_THE_CHAT, context)

        if (thisUser.permission <= Chat.getUserFromChat(context.chat, id)!.permission)
            return await Chat.sendError(ERRORS.USER_HAVE_BIGGER_RIGHT, context)

        if (thisUser.permission <= permission)
            return await context.send('Вы не можете выдавать права которые выше или равняются вашему!')

        if (!context.chat.rights.find(x => x.permission === permission))
            return await Chat.sendError(ERRORS.ROLE_DOESNT_CREATED, context)

        Chat.getUserFromChat(context.chat, id)!.permission = permission

        const user = await new User(id).getUser(id, context.vk)

        await context.send(`Теперь у [id${id}|${user.name.gen.first} ${user.name.gen.last}] роль [${
            Chat.getRoleByPermission(context.chat, permission)!.name}]`, {
            disable_mentions: 1
        })


    };
}
