import * as React from 'react'
import { observer } from 'mobx-react-lite'

import { Farmings } from '@/modules/Farming'
import { useWallet } from '@/stores/WalletService'

function PageInner(): JSX.Element | null {
    const everWalet = useWallet()

    if (!everWalet.isInitialized) {
        return null
    }

    return <Farmings />
}

const Page = observer(PageInner)

export default Page
