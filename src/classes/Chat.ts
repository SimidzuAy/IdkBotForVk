import {chatModel, chatSchema} from '../dataBase'
import {ExtractDoc} from 'ts-mongoose'
import {MessagesConversationMember} from 'vk-io/lib/api/schemas/objects'
import {commandsName, LANG} from '@types'

interface IUserInChat {
    userId: number,
    permission: number,
    inChat: true
}

interface IChatRight {
    name: string,
    permission: number,
    emoji: string
}

interface IBanInChat {
    bannedId: number,
    byId: number,
    from: number,
    to: number
}


// Костыль, я знаю
// Но я слишком тупой чтобы сделать по другому


export default class {
    private readonly peerId: number
    private chat!: ExtractDoc<typeof chatSchema>

    private readonly users: MessagesConversationMember[];

    constructor(peerId: number, users: MessagesConversationMember[]) {
        this.peerId = peerId

        this.users = users
    }

    async getChat(): Promise<this> {
        const chat = (await chatModel.getByPeerId(this.peerId))[0]

        if (chat)
            this.chat = chat
        else {

            const users: IUserInChat[] = []

            const ownerId = this.users.find(x => x.is_owner)

            users.push({
                userId: ownerId!.member_id,
                permission: 100,
                inChat: true
            })

            this.users.filter(x => x.is_admin && !x.is_owner).forEach(admin => {
                users.push({
                    userId: admin.member_id,
                    permission: 80,
                    inChat: true
                })
            })
            this.users.filter(x => !x.is_admin).forEach(user => {
                users.push({
                    userId: user.member_id,
                    permission: 0,
                    inChat: true
                })
            })

            this.chat = await chatModel.create({
                peerId: this.peerId,
                users,
                lang: LANG.RUSSIAN,
                rights: [{
                    name: 'Создатель беседы',
                    permission: 100,
                    emoji: '👑'
                }, {
                    name: 'Администратор',
                    permission: 80,
                    emoji: '💎'
                }, {
                    name: 'Ст. Хелпер',
                    permission: 60,
                    emoji: '🦊'
                }, {
                    name: 'Хелпер',
                    permission: 40,
                    emoji: '❤️'
                }, {
                    name: 'Помощник',
                    permission: 20,
                    emoji: '👻'
                }, {
                    name: 'Участник',
                    permission: 0,
                    emoji: ''
                }],
                commands: {
                    ban: { permission: 60 },
                    unBan: { permission: 60 },
                    prefix: { permission: 80 },
                    createRole: { permission: 100 },
                    myRole: { permission: 0 },
                    changeRoleRight: {permission: 80},
                    roleEmoji: {permission: 80},
                    setRole: {permission: 80},
                    getAdminList: {permission: 0},
                    ping: {permission: 0}
                }

            })
        }

        return this
    }

    userHasPermission(userId: number, permission: number): boolean {
        return this.getUser(userId)!.permission >= permission
    }

    userGetPermission(userId: number): number {
        return this.getUser(userId)!.permission
    }

    userSetPermission(userId: number, permission: number): void {
        this.getUser(userId)!.permission = permission
        this.chat.save()
    }


    getUser(userId: number): IUserInChat {
        return this.chat.users!.find(x => x.userId === userId) as IUserInChat
    }

    getAllUsers(): IUserInChat[] {
        return this.chat.users! as IUserInChat[]
    }

    roleSetEmoji(permission: number, emoji: string): void {
        this.chat.rights!.find(x => x.permission === permission)!.emoji = emoji
    }


    newChatUser(userId: number): void {

        const userIndex = this.chat.users!.findIndex(user => user.userId === userId)
        if (userIndex < 0)
            this.chat.users!.push({
                userId,
                permission: 0,
                inChat: true
            })

        else
            this.chat.users![userIndex].inChat = true
    }

    removeChatUser(userId: number): void {

        const userIndex = this.chat.users!.findIndex(user => user.userId === userId)

        if (userIndex > -1)
            this.chat.users![userIndex].inChat = false
    }

    chatGetRights(): IChatRight[]  {
        return this.chat.rights! as IChatRight[]
    }

    ban(bannedId: number, who: number, to = -1): void {
        this.chat.bans!.push({
            bannedId,
            byId: who,
            from: Date.now(),
            to: to
        })
    }

    unBan(userId: number): void {
        this.chat.bans = this.chat.bans!.filter(x => x.bannedId !== userId)
    }

    setPrefix(prefix: string): void {
        this.chat.prefix = prefix
    }


    getPrefix(): string {
        return `\\${this.chat.prefix}`
    }

    crateRight(permission: number, name: string): void {
        this.chat.rights!.push({
            name,
            permission,
            emoji: ''
        })
    }

    getBanned(): IBanInChat[]  {
        return this.chat.bans! as IBanInChat[]
    }

    getLang(): LANG {
        return this.chat.lang
    }


    getCommandPermission(command: commandsName): number {
        return this.chat.commands[command].permission
    }

    chatSetCommandPermission(command: commandsName, permission: number): void {
        this.chat.commands[command].permission = permission

        this.chat.markModified('commands')
    }


    save(): void {
        this.chat.save()
    }
}
