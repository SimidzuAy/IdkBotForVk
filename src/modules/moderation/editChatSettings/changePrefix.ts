import ICommand from '@command'
import {ERRORS, MContext} from '@types'
import {genCommand, isThisCommand, sendCommandUsage, sendError} from '@utils'
import Chat from '@class/Chat'

export default class implements ICommand {

    readonly hears: any[] = [
        (value: string, context: MContext): boolean => {
            const regExps = [
                new RegExp(`${genCommand(context.chat.prefix, 'prefix')} (.+)`, 'i')
            ]

            const ans = isThisCommand(value, context, regExps)

            if ( !ans ) {
                if (new RegExp(genCommand(context.chat.prefix, 'prefix')).test(value)) {
                    sendCommandUsage('prefix', context.peerId, context.chat.lang, context.vk)
                }
            }
            return ans
        }
    ];

    readonly handler = async (context: MContext): Promise<unknown> => {

        if (context.chat.commands['prefix'].permission > Chat.getUserFromChat(context.chat, context.senderId)!.permission)
            return await sendError(ERRORS.NOT_ENOUGH_RIGHTS, context.peerId, context.chat.lang, context.vk)

        if (context.$match[1].length > 1) {
            return await context.send('Длинна префикса не может превышать один символ')
        }

        context.chat.prefix = context.$match[1]
        context.chat.markModified('commands')
        context.chat.save()
        await context.send(`Префикс успешно изменён на ${context.$match[1]}`)
    };

}
