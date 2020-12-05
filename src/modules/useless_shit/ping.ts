import ICommand from '@command'
import {ERRORS, hear, MContext} from '@types'
import {genCommand, isThisCommand} from '@utils'
import Chat from '@class/Chat'

export default class implements ICommand {

    readonly hears: hear[] = [
        (value: string, context: MContext): boolean => {
            const regExps = [
                new RegExp(genCommand(context.chat.prefix, 'ping'), 'i')
            ]

            const isThis: boolean = isThisCommand(value, context, regExps)

            if ( !isThis ) {
                new RegExp(`${context.chat.prefix}`)
            }

            return isThis

        }
    ];

    readonly handler = async (context: MContext): Promise<unknown> => {

        if (context.chat.commands['ping'].permission > Chat.getUserFromChat(context.chat, context.senderId)!.permission)
            return await Chat.sendError(ERRORS.NOT_ENOUGH_RIGHTS, context)

        await context.send(`Ping: ${ Math.round( Date.now() / 1000 )  - context.createdAt} Seconds`)
    };

}
