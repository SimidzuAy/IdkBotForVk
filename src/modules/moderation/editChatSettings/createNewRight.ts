import ICommand from '@command'
import {ERRORS, MContext} from '@types'
import {genCommand, isThisCommand, sendCommandUsage, sendError} from '@utils'
import Chat from '@class/Chat'

export default class implements ICommand {

    readonly hears: any[] = [
        (value: string, context: MContext): boolean => {
            const regExps = [
                new RegExp(`${genCommand(context.chat.prefix, 'createRole')}\\s+(.+)\\s+(\\d{1,3})$`, 'i')
            ]

            const ans = isThisCommand(value, context, regExps)

            if ( !ans ) {
                if (new RegExp(genCommand(context.chat.prefix, 'createRole')).test(value)) {
                    sendCommandUsage('createRole', context.peerId, context.chat.lang, context.vk)
                }
            }
            return ans
        }
    ];

    readonly handler = async (context: MContext): Promise<unknown> => {

        if (context.chat.commands['createRole'].permission > Chat.getUserFromChat(context.chat, context.senderId)!.permission)
            return await sendError(ERRORS.NOT_ENOUGH_RIGHTS, context.peerId, context.chat.lang, context.vk)

        const num = Number(context.$match[2])

        if (num >= -100 && num <= 99) {
            context.chat.rights.push({
                name: context.$match[1],
                permission: num,
                emoji: ''
            })
            context.chat.save()
            await context.send('Ну создал и чё.')
        } else {
            await sendError(ERRORS.TOO_BIG_SMALL_RIGHT_LEVEL, context.peerId, context.chat.lang, context.vk)
        }

    };

}
