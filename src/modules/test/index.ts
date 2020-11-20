import Command from "@command"
import {MContext} from "@types"
import {HearManager} from "@vk-io/hear"
import {isThisCommand} from "@utils"

export default class extends Command {
    readonly hears: any[] = [
        (value: string, context: MContext) => {
            const regExps = [
                new RegExp(`^${context.chat.getPrefix()}\\s*test`, "i")
            ]

            return isThisCommand(value, context, regExps)
        }
    ]

    readonly handler = async (context: MContext) => {
        await context.reply(String(context.senderId))
    }

    constructor(hearManager: HearManager<MContext>) {
        super(hearManager)

        hearManager.hear(this.hears, this.handler)
    }

}
