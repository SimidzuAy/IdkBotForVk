import {genCommand, isThisCommand, sendCommandUsage, sendError} from '@utils'
import ICommand from '@command'
import {emojiReg, ERRORS, MContext} from '@types'
import Chat from '@class/Chat'

export default class implements ICommand {

    readonly hears: any[] = [
        (value: string, context: MContext): boolean => {
            const regExps = [
                new RegExp(`${genCommand(context.chat.prefix, 'roleEmoji')} (\\d{1,3}) (.+)`, 'i')
            ]

            const ans = isThisCommand(value, context, regExps)

            if ( !ans ) {
                if (new RegExp(genCommand(context.chat.prefix, 'roleEmoji')).test(value)) {
                    sendCommandUsage('roleEmoji', context.peerId, context.chat.lang, context.vk)
                }
            }
            return ans
        }
    ];

    readonly handler = async (context: MContext): Promise<unknown> => {

        if (context.chat.commands['roleEmoji'].permission > Chat.getUserFromChat(context.chat, context.senderId)!.permission)
            return await sendError(ERRORS.NOT_ENOUGH_RIGHTS, context.peerId, context.chat.lang, context.vk)

        if (!emojiReg.test(context.$match[2]))
            return await context.send('Неверное emoji')

        const right = context.chat.rights.find(x => x.permission === Number(context.$match[1]))
        const emoji = context.$match[2].match(emojiReg)![0]

        if (!right)
            return await sendError(ERRORS.ROLE_DOESNT_CREATED, context.peerId, context.chat.lang, context.vk)

        context.chat.rights.find(x => x.permission === Number(context.$match[1]))!.emoji = emoji

        await context.send([
            `Emoji роли с названием ${right.name} успешно измененно!`,
            `Emoji role with name ${right.name} has been changed`
        ][context.chat.lang])

    };
}
