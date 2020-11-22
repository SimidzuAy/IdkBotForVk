import {chatModel, chatSchema} from "../dataBase"
import {ExtractDoc} from "ts-mongoose"
import {MessagesConversationMember} from "vk-io/lib/api/schemas/objects"
import {LANG} from "@types"



type commands = 'ban' | 'unBan' | 'prefix' | 'createRole' | 'changeRoleRight'
    | 'roleEmoji' | 'setRole' | 'getAdminList' | 'ping'

export default class {
    private readonly peerId: number
    private chat!: ExtractDoc<typeof chatSchema>

    private readonly users: MessagesConversationMember[]

    constructor(peerId: number, users: MessagesConversationMember[]) {
        this.peerId = peerId

        this.users = users
    }

    async getChat() {
        const chat = (await chatModel.getByPeerId(this.peerId))[0]

        if (chat)
            this.chat = chat
        else {

            const users = [];

            const ownerId = this.users.find(x => x.is_owner);

            users.push({
                userId: ownerId!.member_id,
                permission: 100,
                inChat: true
            });

            this.users.filter(x => x.is_admin && !x.is_owner).forEach(admin => {
                users.push({
                    userId: admin.member_id,
                    permission: 80,
                    inChat: true
                })
            });
            this.users.filter(x => !x.is_admin).forEach(user => {
                users.push({
                    userId: user.member_id,
                    permission: 0,
                    inChat: true
                })
            });

            this.chat = await chatModel.create({
                peerId: this.peerId,
                users: users,
                lang: LANG.RUSSIAN,
                rights: [{
                    name: "Создатель беседы",
                    permission: 100,
                    emoji: "👑"
                }, {
                    name: "Администратор",
                    permission: 80,
                    emoji: "💎"
                }, {
                    name: "Ст. Хелпер",
                    permission: 60,
                    emoji: "🦊"
                }, {
                    name: "Хелпер",
                    permission: 40,
                    emoji: "❤️"
                }, {
                    name: "Помощник",
                    permission: 20,
                    emoji: "👻"
                }, {
                    name: "Участник",
                    permission: 0,
                    emoji: ""
                }],
                commands: {
                    ban: { permission: 60 },
                    unBan: { permission: 60 },
                    prefix: { permission: 80 },
                    createRole: { permission: 100 },
                    changeRoleRight: {permission: 80},
                    roleEmoji: {permission: 80},
                    setRole: {permission: 80},
                    getAdminList: {permission: 0},
                    ping: {permission: 0}
                }

            });
        }

        return this
    }

    userHasPermission(userId: number, permission: number) {
        return this.getUser(userId)!.permission >= permission
    }

    userGetPermission(userId: number) {
        return this.getUser(userId)!.permission
    }

    userSetPermission(userId: number, permission: number) {
        this.getUser(userId)!.permission = permission;
        this.chat.save();
    }


    getUser(userId: number) {
        return this.chat.users!.find(x => x.userId === userId);
    }

    getAllUsers() {
        return this.chat.users!
    }

    roleSetEmoji(permission: number, emoji: string) {
        this.chat.rights!.find(x => x.permission === permission)!.emoji = emoji;

        this.chat.save();
    }


    newChatUser(userId: number) {

        const userIndex = this.chat.users!.findIndex(user => user.userId === userId);
        if (userIndex < 0)
            this.chat.users!.push({
                userId,
                permission: 0,
                inChat: true
            });

        else
            this.chat.users![userIndex].inChat = true;

        this.chat.save();
    }

    removeChatUser(userId: number) {

        const userIndex = this.chat.users!.findIndex(user => user.userId === userId);

        if (userIndex > -1)
            this.chat.users![userIndex].inChat = false;

        this.chat.save();
    }

    chatGetRights() {
        return this.chat.rights!
    }

    ban(bannedId: number, who: number, to: number = -1) {
        this.chat.bans!.push({
            bannedId,
            byId: who,
            from: Date.now(),
            to: to
        });

        this.chat.save();
    }

    unBan(userId: number) {
        this.chat.bans = this.chat.bans!.filter(x => x.bannedId !== userId);

        this.chat.save()
    }

    setPrefix(prefix: string) {
        this.chat.prefix = prefix;

        this.chat.save();
    }


    getPrefix() {
        return `\\${this.chat.prefix}`;
    }

    crateRight(permission: number, name: string) {
        this.chat.rights!.push({
            name,
            permission,
            emoji: ""
        });

        this.chat.save()
    }

    getBanned() {
        return this.chat.bans!
    }

    getLang() {
        return this.chat.lang
    }


    getCommandPermission(command: commands): number {
        return this.chat.commands[command].permission
    }

    chatSetCommandPermission(command: commands, permission: number) {
        this.chat.commands[command].permission = permission

        this.chat.markModified('commands')

        this.chat.save().then(console.log)
    }
}
