import ICommand from '@command'
import {ERRORS, MContext} from '@types'
import {genCommand, isThisCommand} from '@utils'
import Chat from '@class/Chat'

export default class implements ICommand {
    hears = [
        (value: string, context: MContext): boolean => {
            const regExps = [
                new RegExp(genCommand(context.chat.prefix, 'statInChat'))
            ]


            return isThisCommand(value, context, regExps)
        }
    ]

    handler = async ( context: MContext ) => {
        if ( !Chat.isEnoughPermission('statInChat', context) )
            return await Chat.sendError(ERRORS.NOT_ENOUGH_RIGHTS, context)
    }
}
