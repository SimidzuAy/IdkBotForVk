import mongoose from "mongoose"
import {createSchema, ExtractDoc, Type, typedModel} from "ts-mongoose"
import {LANG, RIGHTS} from "@types"

const command = Type.object({ required: true}).of({
    permission: Type.number({
        max: 100,
        min: -100,
        required: true
    })
})

export const Users = createSchema({
    vkId: Type.number({
        required: true,
        unique: true
    }),
    rights: Type.array().of(Type.number({
        type: RIGHTS,
        enum: [0, 1, 2],
        required: false
    })),
    fullName: Type.string({required: true}),
    sex: Type.number()

});

export const userModel = typedModel("User", Users, undefined, undefined, {
    getByVkId(id: number) {
        return this.find({
            vkId: id
        });
    }
});


export const chatSchema = createSchema({
    peerId: Type.number({
        required: true,
        unique: true
    }),
    bans: Type.array().of({
        bannedId: Type.number({required: true}),
        byId: Type.number({required: true}),
        from: Type.number({required: true}),
        to: Type.number({required: false, default: -1})
    }),
    prefix: Type.string({
        default: "!",
        required: false
    }),
    lang: Type.number({
        required: true,
        default: LANG.RUSSIAN
    }),
    users: Type.array().of({
        userId: Type.number({required: true}),
        permission: Type.number({required: true, max: 100, min: -100}),
        inChat: Type.boolean({required: true})
    }),
    rights: Type.array({
        default: [],
        required: false
    }).of({
        name: Type.string({required: true}),
        permission: Type.number({required: true, max: 100, min: -100}),
        emoji: Type.string({required: false, default: ""})
    }),
    commands: Type.object({
        required: true
    }).of({
        ban: command,
        unBan: command,
        prefix: command,
        createRole: command,
        changeRoleRight: command,
        roleEmoji: command,
        setRole: command,
        getAdminList: command,
        ping: command
    })
});

export const chatModel = typedModel("Chat", chatSchema, undefined, undefined, {
    getByPeerId(peerId: number) {
        return this.find({
            peerId
        })
    }
});


export class DB {
    private readonly url: string;
    private readonly db: mongoose.Connection;

    public readonly user: ExtractDoc<typeof Users>;
    public readonly chat: ExtractDoc<typeof chatSchema>;


    constructor(url: string) {
        this.url = url;


        mongoose.connect(this.url, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useFindAndModify: true,
            useCreateIndex: true
        }).then();

        this.db = mongoose.connection;

        this.db.once('open', () => {
            console.log("Connected to db!")
        });
        this.db.on("error", err => {
            console.log("Error on connection", err)
        });

        this.user = new userModel();
        this.chat = new chatModel();
    }
}
