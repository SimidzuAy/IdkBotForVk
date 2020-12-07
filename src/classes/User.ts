import {RIGHTS} from '@types'
import {userModel, userSchema} from '../database'
import {ExtractDoc} from 'ts-mongoose'
import {VK} from 'vk-io'

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

interface IName {
    first: string
    last: string
}

interface INameCases {
    nom: IName
    gen: IName
    dat: IName
    acc: IName
    ins: IName
    abl: IName
}


const nameCases = [
    'first_name_nom', 'last_name_nom',
    'first_name_gen', 'last_name_gen',
    'first_name_dat', 'last_name_dat',
    'first_name_acc', 'last_name_acc',
    'first_name_ins', 'last_name_ins',
    'first_name_abl', 'last_name_abl'
]

export default class User {
    private readonly vkId: number;
    private user!: ExtractDoc<typeof userSchema>;


    constructor(vkId: number) {
        this.vkId = vkId
    }

    async getUser(id?: number, vk?: VK): Promise<ExtractDoc<typeof userSchema>> {

        if (!id)
            id = this.vkId

        if (vk) {
            const user = (await userModel.getByVkId(id))[0]

            if (user)
                return user
            else {
                // Нерезгор не добавил типы, а получить все кейсы одним запросом хчца
                const _user = (await vk.api.users.get({
                    user_ids: String(id),
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    // @ts-ignore
                    fields: ['sex', ...nameCases]
                }))[0]
                const cases: (keyof INameCases)[] = ['nom', 'gen', 'dat', 'acc', 'ins', 'abl']
                const name: INameCases = {} as INameCases


                cases.forEach(nameCase => {
                    name[nameCase] = {} as IName
                    name[nameCase].first = _user[`first_name_${nameCase}`]
                    name[nameCase].last = _user[`last_name_${nameCase}`]
                })

                return await userModel.create({
                    name,
                    vkId: id,
                    sex: _user.sex,
                    right: [RIGHTS.USER],
                    stat
                })
            }
        }

        return this.user

    }
}
