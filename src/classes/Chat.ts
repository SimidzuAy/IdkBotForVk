import {chatModel, chatSchema} from '../database'
import {ExtractDoc} from 'ts-mongoose'
import {MessagesConversationMember} from 'vk-io/lib/api/schemas/objects'
import {commandsName, LANG} from '@types'

interface IUserInChat {
    userId:     number
    permission: number
    inChat:     boolean
}


export default class {
    private readonly peerId: number
    private chat!: ExtractDoc<typeof chatSchema>

    private readonly users: MessagesConversationMember[];

    constructor(peerId: number, users: MessagesConversationMember[]) {
        this.peerId = peerId

        this.users = users
    }

    async getChat(): Promise<ExtractDoc<typeof chatSchema>> {
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
                },
                prefix: '!',
                bans: []
            })
        }

        return this.chat
    }


    getUser(userId: number): IUserInChat {
        return this.chat.users!.find(x => x.userId === userId) as IUserInChat
    }


    static newChatUser(chat: ExtractDoc<typeof chatSchema>, userId: number): void {

        const userIndex = chat.users.findIndex(user => user.userId === userId)
        if (userIndex < 0)
            chat.users.push({
                userId,
                permission: 0,
                inChat: true
            })

        else
            chat.users![userIndex].inChat = true
    }

    chatSetCommandPermission(command: commandsName, permission: number): void {
        this.chat.commands[command].permission = permission

        this.chat.markModified('commands')
    }


    static removeUserFromChat(chat: ExtractDoc<typeof chatSchema>, id: number): void {
        const userIndex = chat.users.findIndex(user => user.userId === id)

        if (userIndex > -1)
            chat.users[userIndex].inChat = false
    }

    static getUserFromChat(chat: ExtractDoc<typeof chatSchema>, id: number): IUserInChat | undefined  {
        return chat.users.find(x => x.userId === id)
    }
}
