import {aliasesToCommand, isThisCommand, sendError} from "@utils"
import Command from "@command"
import {commands, ERRORS, MContext} from "@types"
import {HearManager} from "@vk-io/hear"

const emojiReg = new RegExp("[\\u{1f300}-\\u{1f5ff}\\u{1f900}-\\u{1f9ff}\\u{1f600}-\\u{1f64f}\\u{1f680}-\\u{1f6ff}\\u{2600}-" +
    "\\u{26ff}\\u{2700}-\\u{27bf}\\u{1f1e6}-\\u{1f1ff}\\u{1f191}-\\u{1f251}\\u{1f004}\\u{1f0cf}\\u{1f170}-\\u{1f171}" +
    "\\u{1f17e}-\\u{1f17f}\\u{1f18e}\\u{3030}\\u{2b50}\\u{2b55}\\u{2934}-\\u{2935}\\u{2b05}-\\u{2b07}\\u{2b1b}-" +
    "\\u{2b1c}\\u{3297}\\u{3299}\\u{303d}\\u{00a9}\\u{00ae}\\u{2122}\\u{23f3}\\u{24c2}\\u{23e9}-\\u{23ef}\\u{25b6}" +
    "\\u{23f8}-\\u{23fa}]", "ui")

export default class extends Command {
    readonly hears: any[] = [
        (value: string, context: MContext) => {
            const regExps = [
                new RegExp(`^${context.chat.getPrefix()}\\s*${aliasesToCommand(commands.roleEmoji.aliases)} (\\d{1,3}) (.+)`, "i")
            ]

            return isThisCommand(value, context, regExps)
        }
    ];

    readonly handler = async (context: MContext) => {

        if (context.chat.getCommandPermission('roleEmoji') > context.chat.userGetPermission(context.senderId))
            return

        if (!emojiReg.test(context.$match[2]))
            return await context.send("Я хуй знает что тут написать, неверное emoji")

        const right = context.chat.chatGetRights().find(x => x.permission === Number(context.$match[1]))
        const emoji = context.$match[2].match(emojiReg)![0]

        if (!right)
            return await sendError(ERRORS.ROLE_DOESNT_CREATED, context.peerId, context.chat.getLang(), context.vk)

        context.chat.roleSetEmoji(Number(context.$match[1]), emoji)
        await context.send([
            `Emoji роли с названием ${right.name} успешно измененно!`,
            `Emoji role with name ${right.name} has been changed`
        ][context.chat.getLang()])

    }

    constructor(hearManager: HearManager<MContext>) {
        super(hearManager)

        hearManager.hear(this.hears, this.handler)
    }

}
