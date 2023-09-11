import { makeAutoObservable, runInAction } from 'mobx'

import { DaoRootContractAddress } from '@/config'
import { DaoAbi } from '@/misc'
import { error } from '@/utils'
import { ProposalConfig } from '@/modules/Governance/types'
import { useStaticRpc } from '@/hooks'

type Data = {
    config?: ProposalConfig
}

export class DaoConfigStore {

    protected data: Data = {}

    static tokenDecimals = 9

    constructor() {
        makeAutoObservable(this)
    }

    public init(): void {
        this.sync()
    }

    public dispose(): void {
        this.data = {}
    }

    public async sync(): Promise<void> {
        let config: ProposalConfig

        try {
            const staticRpc = useStaticRpc()
            const daoContract = new staticRpc.Contract(DaoAbi.Root, DaoRootContractAddress)
            const result = await daoContract.methods.proposalConfiguration({}).call()
            config = result.proposalConfiguration
        }
        catch (e) {
            error(e)
        }

        runInAction(() => {
            this.data.config = config
        })
    }

    public get threshold(): string | undefined {
        return this.data?.config?.threshold
    }

}
