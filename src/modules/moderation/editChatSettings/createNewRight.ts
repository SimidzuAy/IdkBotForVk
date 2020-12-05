import ICommand from '@command'
import {ERRORS, hear, MContext} from '@types'
import {genCommand, isThisCommand} from '@utils'
import Chat from '@class/Chat'

export default class implements ICommand {

    readonly hears: hear[] = [
        (value: string, context: MContext): boolean => {
            const regExps = [
                new RegExp(`${genCommand(context.chat.prefix, 'createRole')}\\s+(.+)\\s+(\\d{1,3})$`, 'i')
            ]

            const ans = isThisCommand(value, context, regExps)

            if ( !ans ) {
                if (new RegExp(genCommand(context.chat.prefix, 'createRole')).test(value)) {
                    Chat.sendCommandUsage('createRole', context).then()
                }
            }
            return ans
        }
    ];

    readonly handler = async (context: MContext): Promise<unknown> => {

        if (!Chat.isEnoughPermission('createRole', context))
            return await Chat.sendError(ERRORS.NOT_ENOUGH_RIGHTS, context)

        const num = Number(context.$match[2])

        if (num >= -100 && num <= 99) {
            context.chat.rights.push({
                name: context.$match[1],
                permission: num,
                emoji: ''
            })
            await context.send('Ну создал и чё.')
        } else {
            await Chat.sendError(ERRORS.TOO_BIG_SMALL_RIGHT_LEVEL, context)
        }

    };

}
