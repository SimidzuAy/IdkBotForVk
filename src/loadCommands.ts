import {HearManager} from "@vk-io/hear"
import {MContext} from "@types"


import test from '@modules/test'
import ping from '@modules/useless_shit/ping'
import role from '@modules/moderation/role/setRole'
import roleEmoji from "@modules/moderation/role/roleEmoji"
import rp from '@modules/rp'
import banUser from '@modules/moderation/bans/ban'
import unBanUser from '@modules/moderation/bans/unban'
import setPrefix from '@modules/moderation/editChatSettings/changePrefix'
import createNewRight from "@modules/moderation/editChatSettings/createNewRight"
import getAdminList from "@modules/moderation/getAdminList"


const commands = [
    test,
    role,
    roleEmoji,
    ping,
    getAdminList,
    banUser,
    unBanUser,
    setPrefix,
    createNewRight,
    rp
];

function load(hearManager: HearManager<MContext>) {
    commands.forEach(command => {
        new command(hearManager)
    })
}


export default load
