import * as React from 'react'
import { useIntl } from 'react-intl'
import { observer } from 'mobx-react-lite'

import { useDexAccount } from '@/stores/DexAccountService'
import { error } from '@/utils'
import { Button } from '@/components/common/Button'

export const ConnectAccount = observer((): JSX.Element => {
    const intl = useIntl()
    const dex = useDexAccount()
    const [loading, setLoading] = React.useState(false)

    const connect = async () => {
        setLoading(true)
        try {
            await dex.connectOrCreate()
            await dex.checkConnect()
            await dex.sync()
        }
        catch (e) {
            error(e)
        }
        setLoading(false)
    }

    return (
        <div className="card card--small card--flat">
            <div className="message message_system">
                <p>
                    {intl.formatMessage({ id: 'ACCOUNT_CONNECTOR_NOTE' })}
                </p>

                <Button
                    type="secondary"
                    disabled={loading}
                    onClick={connect}
                >
                    {intl.formatMessage({ id: 'EVER_WALLET_CONNECT_BTN_TEXT' })}
                </Button>
            </div>
        </div>
    )
})
