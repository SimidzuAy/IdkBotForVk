import {HearManager} from "@vk-io/hear"
import {MContext} from "@types"

export default abstract class Command {

    readonly abstract PATH: string = __filename

    readonly abstract hears: any[] = []
    readonly abstract handler = async (context: MContext, next?: Function): Promise<any> => {
    }

    protected constructor(hearManager: HearManager<MContext>) {
    }
}
