import {HearManager} from '@vk-io/hear'
import {MContext} from '@types'
import Logger from '@class/Logger'


import ping from '@modules/useless_shit/ping'
import role from '@modules/moderation/role/setRole'
import roleEmoji from '@modules/moderation/role/roleEmoji'
import rp from '@modules/rp'
import banUser from '@modules/moderation/bans/ban'
import unBanUser from '@modules/moderation/bans/unban'
import setPrefix from '@modules/moderation/editChatSettings/changePrefix'
import createNewRight from '@modules/moderation/editChatSettings/createNewRight'
import getAdminList from '@modules/moderation/getAdminList'
import editCommandPermission from '@modules/moderation/editChatSettings/editCommandPermission'

const commands = [
    role,
    roleEmoji,
    ping,
    getAdminList,
    banUser,
    unBanUser,
    setPrefix,
    createNewRight,
    editCommandPermission,
    rp
]

function load(hearManager: HearManager<MContext>, logger: Logger): void {
    commands.forEach(command => {
        const path = new command(hearManager).PATH
            .replace(`${__dirname}`, '')
            .replace(/\\/g, '/')

        logger.module(path)
    })
}


export default load
