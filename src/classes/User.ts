import {RIGHTS} from "@types"
import {userModel, Users} from "../dataBase"
import {ExtractDoc} from "ts-mongoose"
import {VK} from "vk-io"
import {BaseSex} from "vk-io/lib/api/schemas/objects"

export default class User {
    private vkId: number
    private right: RIGHTS[] = [RIGHTS.USER]
    private fullName: string = ""
    // @ts-ignore
    private user!: ExtractDoc<typeof Users>
    private sex: BaseSex = 0


    constructor(vkId: number) {
        this.vkId = vkId

    }

    async getUser(id?: number, vk?: VK) {

        if (id && vk) {
            const user = (await userModel.getByVkId(this.vkId))[0]

            if (user) {
                this.user = user;
            } else {
                const _user = (await vk?.api.users.get({
                    user_ids: String(id),
                    fields: ['sex']
                }))[0]

                const fullName = `${_user.first_name} ${_user.last_name}`

                this.fullName = fullName
                this.sex = _user.sex!

                await userModel.create({
                    fullName: fullName,
                    vkId: id,
                    right: [RIGHTS.USER]
                })
            }
        } else if ( vk ) {
            const user = (await userModel.getByVkId(this.vkId))[0]

            if (user) {
                this.fullName = user.fullName
                this.vkId = user.vkId
                this.right = user.rights!
                // @ts-ignore
                this.sex = user.sex!
            } else {

                const _user = (await vk.api.users.get({
                    user_ids: String(this.vkId),
                    fields: ["sex"]
                }))[0]

                const fullName = `${_user.first_name} ${_user.last_name}`

                this.fullName = fullName
                this.sex = _user.sex!


                await userModel.create({
                    fullName: fullName,
                    sex: _user.sex,
                    vkId: this.vkId,
                    right: this.right
                })

            }

        }
        return this;

    }

    containRights(rights: RIGHTS[]): boolean {

        for (let i = 0; i < rights.length; i++) {
            if (this.right.includes(rights[i]))
                continue

            return false
        }

        return true
    }

    selectBySex(array: string[]): string {
        return array[this.sex].toLowerCase();
    }

    getFullName() {
        return this.fullName
    }

    save() {
        this.user.save()
    }

}
