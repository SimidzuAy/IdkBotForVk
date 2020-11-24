import ICommand from '@command'
import {commands, MContext} from '@types'
import {HearManager} from '@vk-io/hear'
import {aliasesToCommand, isThisCommand} from '@utils'

export default class implements ICommand {

    readonly PATH: string = __filename;

    readonly hears: any[] = [
        (value: string, context: MContext): boolean => {
            const regExps = [
                new RegExp(`^${context.chat.getPrefix()}${aliasesToCommand(commands.ping.aliases)}`, 'i')
            ]

            const isThis: boolean = isThisCommand(value, context, regExps)

            if ( !isThis ) {
                new RegExp(`${context.chat.getPrefix()}`)
            }

            return isThis

        }
    ];

    readonly handler = async (context: MContext): Promise<unknown> => {

        if (context.chat.getCommandPermission('ping') > context.chat.userGetPermission(context.senderId))
            return

        await context.send(`Ping: ${ Math.round( Date.now() / 1000 )  - context.createdAt} Seconds`)
    };

    constructor(hearManager: HearManager<MContext>) {
        hearManager.hear(this.hears, this.handler)
    }

}

export const PATH = __filename
