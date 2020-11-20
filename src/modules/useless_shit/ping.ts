import Command from "@command"
import {MContext} from "@types"
import {HearManager} from "@vk-io/hear"
import {isThisCommand} from "@utils"

export default class extends Command {
    readonly hears: any[] = [
        (value: string, context: MContext) => {
            const regExps = [
                new RegExp(`^${context.chat.getPrefix()}(ping|пинг)`, "i")
            ]

            return isThisCommand(value, context, regExps)
        }
    ]

    readonly handler = async (context: MContext) => {
        const vkTime: number = await context.vk.api.utils.getServerTime({})

        await context.send(`Ping: ${vkTime - context.createdAt} Seconds`)
    }

    constructor(hearManager: HearManager<MContext>) {
        super(hearManager)

        hearManager.hear(this.hears, this.handler)
    }

}
