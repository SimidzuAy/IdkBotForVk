import {chatModel, chatSchema} from '../database'
import {ExtractDoc} from 'ts-mongoose'
import {MessagesConversationMember} from 'vk-io/lib/api/schemas/objects'
import {IStat, LANG} from '@types'

interface IUserInChat {
    userId:     number
    permission: number
    inChat:     boolean
    stat:       IStat
}


const stat = {
    symbols:       0,
    audio_message: 0,
    forwards:      0,
    photo:         0,
    video:         0,
    audio:         0,
    doc:           0,
    sticker:       0,
    commands:      0,
    emoji:         0,
    wall:          0,
    messages:      0
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
                inChat: true,
                stat
            })

            this.users.filter(x => x.is_admin && !x.is_owner).forEach(admin => {
                users.push({
                    userId: admin.member_id,
                    permission: 80,
                    inChat: true,
                    stat
                })
            })
            this.users.filter(x => !x.is_admin).forEach(user => {
                users.push({
                    userId: user.member_id,
                    permission: 0,
                    inChat: true,
                    stat
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
                bans: [],
                stat
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
                inChat: true,
                stat
            })

        else
            chat.users![userIndex].inChat = true
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
