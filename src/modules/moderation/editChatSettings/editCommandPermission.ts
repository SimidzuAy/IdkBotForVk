import Command from "@command"
import {commands, MContext} from "@types"
import {aliasesToCommand, isThisCommand} from "@utils"
import {HearManager} from "@vk-io/hear"

export default class extends Command {
    readonly hears: any[] = [
        (value: string, context: MContext) => {
            const regExps = [
                new RegExp(`^${context.chat.getPrefix()}\\s*${aliasesToCommand(commands.changeRoleRight.aliases)} (\w+) (\d{1,3})`, "i")
            ]

            return isThisCommand(value, context, regExps)
        }
    ];

    readonly handler = async (context: MContext) => {

    }

    constructor(hearManager: HearManager<MContext>) {
        super(hearManager)

        hearManager.hear(this.hears, this.handler)
    }

}
