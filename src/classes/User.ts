import {RIGHTS} from "@types"
import cfg from "@config"
import {userModel} from "../dataBase"
import {VK} from "vk-io"

export default class User {
    private vkId: number
    private right: RIGHTS[] = [RIGHTS.USER]
    private FullName: string
    public readonly sex: 0 | 1 | 2

    constructor(vkId: number, sex: 0 | 1 | 2, fullName: string) {
        this.sex = sex
        this.vkId = vkId
        this.FullName = fullName

        if (cfg["force-admin"].includes(this.vkId)) {
            this.right.push(RIGHTS.DEVELOPER)
            this.right.push(RIGHTS.ADMIN)
        }

    }

    async getUser(id?: number, vk?: VK) {

        if (!id) {
            const user = (await userModel.getByVkId(this.vkId))[0]

            if (user) {
            } else {
            }
        } else {
            const user = (await userModel.getByVkId(id))[0]

            if (user) {
                this.FullName = user.vkFullName
                this.vkId = user.vkId
                this.right = user.rights!
            } else {

                const _user = (await vk?.api.users.get({
                    user_ids: String(id)
                }))![0]

                this.FullName = `${_user.first_name} ${_user.last_name}`

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


    get fullName() {
        return this.FullName;
    }

}
