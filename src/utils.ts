import {MessageContext, VK} from 'vk-io'
import {commands, commandsName, MContext} from './types'

type NameCases = 'nom' | 'gen' | 'dat' | 'acc' | 'ins' | 'abl' | undefined;

export async function getFullNameById(vk: VK, id: number, name_case: NameCases = undefined): Promise<string> {
    const user = (await vk.api.users.get({
        user_ids: id.toString(),
        name_case: name_case
    }))[0]

    return `${user.first_name} ${user.last_name}`
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function getIdByMatch(vk: VK, match: Array<any>): Promise<null | number> {
    let screenName: string

    if (match[0]) {
        screenName = match[0]
    } else if (match[1]) {
        screenName = match[1]
    } else {
        return null
    }

    const id = await vk.api.utils.resolveScreenName({
        screen_name: screenName
    })
    if (id.object_id) {
        if (id.type && id.type == 'group')
            return -id.object_id
        else
            return id.object_id
    }
    return null

}

export function getIdFromReply(context: MContext): number | null {

    let id: number | null = null

    if (context.replyMessage) {
        id = context.replyMessage.senderId
    } else if (context.forwards.length) {
        id = context.forwards[0].senderId
    }

    return id

}

export function isThisCommand(value: string, context: MContext, regExps: RegExp[]): boolean {

    if (!value) return false

    for (let i = 0; i < regExps.length; i++) {
        const item = regExps[i]
        const val = value.match(item)
        if (val) {
            context.$match = val
            return true
        }
    }

    return false
}


export function aliasesToCommand(aliases: string[]): string {
    return `(?:${aliases.join('|')})`
}

export async function checkUserIsBanned(context: MContext): Promise<boolean> {

    if ( !context.chatId ) return false

    if (context.chat.bans.find(x => x.bannedId === context.eventMemberId)) {
        const methods: [Promise<MessageContext>, Promise<number>] = [
            context.send('Данный пользователь находится в бане!'),
            context.vk.api.messages.removeChatUser({
                chat_id: context.chatId,
                member_id: context.eventMemberId
            })
        ]

        await Promise.all(methods)
        return true
    }

    return false
}

export function genCommand({symbol, isRequired}: {
    symbol: string
    isRequired: boolean
}, command: commandsName): string {
    return `^(?:${symbol}${isRequired ? '' : '|'})\\s*${aliasesToCommand(commands[command].aliases)}`
}


const ranges = [
    { divider: 1e18 , suffix: 'QD' },
    { divider: 1e15 , suffix: 'QD' },
    { divider: 1e12 , suffix: 'T' },
    { divider: 1e9  , suffix: 'B' },
    { divider: 1e6  , suffix: 'M' },
    { divider: 1e3  , suffix: 'K' }
]

export function prettyNum(num: number): string {
    for (let i = 0; i < ranges.length; i++) {
        if (num >= ranges[i].divider) {
            const fNum = (num / ranges[i].divider).toFixed(2).toString()

            return fNum.endsWith('.00') ? fNum.substring(0, fNum.length - 3) + ranges[i].suffix : fNum + ranges[i].suffix
        }
    }
    return num.toString()
}
