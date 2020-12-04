import ICommand from '@command'
import {MContext} from '@types'
import {genCommand, isThisCommand} from '@utils'
import Chat from '@class/Chat'
import User from '@class/User'

export default class implements ICommand {
    readonly hears: any[] = [
        (value: string, context: MContext): boolean => {
            const regExps = [
                new RegExp(genCommand(context.chat.prefix, 'getAdminList'), 'i')
            ]

            return isThisCommand(value, context, regExps)
        }
    ];

    readonly handler = async (context: MContext): Promise<unknown> => {

        if (context.chat.commands['getAdminList'].permission > Chat.getUserFromChat(context.chat, context.senderId)!.permission)
            return

        const users = context.chat.users

        const admins = users.filter(x => x.permission >= 1 && x.userId > 0)

        const rights = context.chat.rights.sort((a, b) => {
            if (a.permission > b.permission) return -1
            else if (a.permission == b.permission) return 0
            return 1
        })

        let msg = ''

        for (const right of rights) {

            if (!users.find(x => x.permission === right.permission && x.userId > 0 )
                || right.permission <= 0)
                continue

            msg += `\n\n${right.emoji} ${right.name}:`

            for (const admin of admins) {
                if (right.permission === Chat.getUserFromChat(context.chat, admin.userId)!.permission) {
                    const user = await new User(admin.userId).getUser(admin.userId, context.vk)

                    msg += `\n[id${admin.userId}|${user.fullName}] ${Chat.getUserFromChat(context.chat, admin.userId)!.inChat ? '' : '🚪'}`
                }
            }
        }

        await context.send(msg, {
            disable_mentions: 1
        })
    };
}
