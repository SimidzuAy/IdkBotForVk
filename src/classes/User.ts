import {RIGHTS} from '@types'
import {userModel, userSchema} from '../database'
import {ExtractDoc} from 'ts-mongoose'
import {VK} from 'vk-io'

export default class User {
    private readonly vkId: number;
    private user!: ExtractDoc<typeof userSchema>;


    constructor(vkId: number) {
        this.vkId = vkId
    }

    async getUser(id?: number, vk?: VK): Promise<ExtractDoc<typeof userSchema>> {

        if (id && vk) {
            const user = (await userModel.getByVkId(id))[0]

            if (user)
                return user
            else {
                const _user = (await vk.api.users.get({
                    user_ids: String(id),
                    fields: ['sex']
                }))[0]

                const fullName = `${_user.first_name} ${_user.last_name}`

                return await userModel.create({
                    fullName: fullName,
                    vkId: id,
                    sex: _user.sex,
                    right: [RIGHTS.USER]
                })
            }
        }

        else if ( vk ) {
            const user = (await userModel.getByVkId(this.vkId))[0]

            if (user) {
                return user
            } else {

                const _user = (await vk.api.users.get({
                    user_ids: String(this.vkId),
                    fields: ['sex']
                }))[0]

                const fullName = `${_user.first_name} ${_user.last_name}`

                return await userModel.create({
                    fullName: fullName,
                    sex: _user.sex,
                    vkId: this.vkId,
                    right: [RIGHTS.USER]
                })

            }

        }
        return this.user

    }
}
