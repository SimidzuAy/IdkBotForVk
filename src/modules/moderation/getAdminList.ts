import Command from "@command"
import {MContext} from "@types"
import {HearManager} from "@vk-io/hear"
import {isThisCommand} from "@utils"

export default class extends Command {
    readonly hears: any[] = [
        (value: string, context: MContext) => {
            const regExps = [
                new RegExp(`^${context.chat.getPrefix()}\\s*(?:admins|админы)`, "i")
            ]

            return isThisCommand(value, context, regExps)
        }
    ]

    readonly handler = async (context: MContext) => {
        const users = context.chat.getAllUsers()

        const admins = users.filter(x => x.permission >= 1 && x.userId > 0)

        // @ts-ignore
        const rights = context.chat.chatGetRights().sort((a, b) => {
            if (a.permission > b.permission) return -1
            if (a.permission == b.permission) return 0
            if (a.permission < b.permission) return 1
        })

        let msg: string = "";

        for (const right of rights) {

            if (!context.chat.getAllUsers().find(x => x.permission === right.permission && x.userId > 0)
                || right.permission <= 0)
                continue;

            msg += `\n\n${right.emoji} ${right.name}:`;

            for (const admin of admins) {
                if (right.permission === context.chat.getUser(admin.userId)!.permission) {
                    const user = await context.user.getUser(admin.userId, context.vk);

                    msg += `\n[id${admin.userId}|${user.fullName}] ${context.chat.getUser(admin.userId)!.inChat ? "" : "🚪"}`
                }
            }
        }

        await context.send(msg, {
            disable_mentions: 1
        })
    };

    constructor(hearManager: HearManager<MContext>) {
        super(hearManager)

        hearManager.hear(this.hears, this.handler)
    }

}
