import Command from "@command"
import {commands, MContext} from "@types"
import {HearManager} from "@vk-io/hear"
import {aliasesToCommand, isThisCommand} from "@utils"

export default class extends Command {
    readonly hears: any[] = [
        (value: string, context: MContext) => {
            const regExps = [
                new RegExp(`^${context.chat.getPrefix()}${aliasesToCommand(commands.ping.aliases)}`, "i")
            ]

            return isThisCommand(value, context, regExps)
        }
    ]

    readonly handler = async (context: MContext) => {

        if (context.chat.getCommandPermission('ping') > context.chat.userGetPermission(context.senderId))
            return


        await context.send(`Ping: ${ Math.round( Date.now() / 1000 )  - context.createdAt} Seconds`)
    }

    constructor(hearManager: HearManager<MContext>) {
        super(hearManager)

        hearManager.hear(this.hears, this.handler)
    }

}
