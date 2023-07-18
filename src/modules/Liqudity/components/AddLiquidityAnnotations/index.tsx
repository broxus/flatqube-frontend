import * as React from 'react'
import { observer } from 'mobx-react-lite'
import { useIntl } from 'react-intl'

import { Icon } from '@/components/common/Icon'
import { CustomTokensAlerts } from '@/modules/Liqudity/components/CustomTokensAlerts'
import { useAddLiquidityFormStoreContext } from '@/modules/Liqudity/context'

import './index.scss'


function AddLiquidityAnnotationsInternal(): JSX.Element | null {
    const intl = useIntl()
    const formStore = useAddLiquidityFormStoreContext()

    switch (true) {
        case formStore.hasCustomToken:
            return <CustomTokensAlerts />

        case !formStore.wallet.isReady:
        case formStore.isCheckingDexAccount === undefined || formStore.isCheckingDexAccount:
            return null

        case formStore.isConnectingDexAccount:
            return (
                <>
                    <div className="pool-annotation-main">
                        <div className="pool-annotation-main__loader">
                            <Icon icon="loader" />
                        </div>
                        <div className="pool-annotation-main__lead">
                            {intl.formatMessage({
                                id: 'LIQUIDITY_ADD_STEP_NOTE_LEAD_CONNECTING_ACCOUNT',
                            })}
                        </div>
                    </div>
                    <div className="pool-annotation-txt">
                        {intl.formatMessage({
                            id: 'LIQUIDITY_ADD_STEP_NOTE_TEXT_CONNECT_ACCOUNT',
                        })}
                    </div>
                </>
            )

        case formStore.isConnectingPool:
            return (
                <>
                    <div className="pool-annotation-main">
                        <div key="loader" className="pool-annotation-main__loader">
                            <Icon icon="loader" />
                        </div>
                        <div className="pool-annotation-main__lead">
                            {intl.formatMessage({
                                id: 'LIQUIDITY_ADD_STEP_NOTE_LEAD_POOL_CONNECTING',
                            })}
                        </div>
                    </div>
                    <div key="note" className="pool-annotation-txt">
                        {intl.formatMessage({
                            id: 'LIQUIDITY_ADD_STEP_NOTE_TEXT_CONNECT_POOL',
                        })}
                    </div>
                </>
            )

        case formStore.isCreatingPool:
            return (
                <>
                    <div className="pool-annotation-main">
                        <div key="loader" className="pool-annotation-main__loader">
                            <Icon icon="loader" />
                        </div>
                        <div className="pool-annotation-main__lead">
                            {intl.formatMessage({
                                id: 'LIQUIDITY_ADD_STEP_NOTE_LEAD_POOL_CREATING',
                            })}
                        </div>
                    </div>
                    <div key="note" className="pool-annotation-txt">
                        {intl.formatMessage({
                            id: 'LIQUIDITY_ADD_STEP_NOTE_TEXT_CREATE_POOL',
                        })}
                    </div>
                </>
            )

        case formStore.dex.address === undefined && formStore.isCheckingDexAccount === false:
            return (
                <>
                    <div className="pool-annotation-main">
                        <div className="pool-annotation-main__ava error" />
                        <div className="pool-annotation-main__lead">
                            {intl.formatMessage({
                                id: 'LIQUIDITY_ADD_STEP_NOTE_LEAD_CONNECT_ACCOUNT',
                            })}
                        </div>
                    </div>
                    <div className="pool-annotation-txt">
                        {intl.formatMessage({
                            id: 'LIQUIDITY_ADD_STEP_NOTE_TEXT_CONNECT_ACCOUNT',
                        })}
                    </div>
                </>
            )

        case formStore.leftToken === undefined || formStore.rightToken === undefined:
            return (
                <div key="note" className="pool-annotation-txt">
                    {intl.formatMessage({
                        id: 'LIQUIDITY_ADD_STEP_NOTE_TEXT_SELECT_TOKEN',
                    })}
                </div>
            )

        case formStore.pool?.address === undefined && formStore.isSyncingPool === false:
            return (
                <>
                    <div className="pool-annotation-main">
                        <div className="pool-annotation-main__ava error" />
                        <div className="pool-annotation-main__lead">
                            {intl.formatMessage({
                                id: 'LIQUIDITY_ADD_STEP_NOTE_LEAD_POOL_NOT_EXIST',
                            })}
                        </div>
                    </div>
                    <div className="pool-annotation-txt">
                        {intl.formatMessage({
                            id: 'LIQUIDITY_ADD_STEP_NOTE_TEXT_CREATE_POOL',
                        })}
                    </div>
                </>
            )

        case !formStore.isPoolConnected && formStore.isSyncingPool === false:
            return (
                <>
                    <div className="pool-annotation-main">
                        <div className="pool-annotation-main__ava error" />
                        <div className="pool-annotation-main__lead">
                            {intl.formatMessage({
                                id: 'LIQUIDITY_ADD_STEP_NOTE_LEAD_POOL_NOT_CONNECTED',
                            })}
                        </div>
                    </div>
                    <div key="note" className="pool-annotation-txt">
                        {intl.formatMessage({
                            id: 'LIQUIDITY_ADD_STEP_NOTE_TEXT_CONNECT_POOL',
                        })}
                    </div>
                </>
            )

        default:
            return null
    }
}

export const AddLiquidityAnnotations = observer(AddLiquidityAnnotationsInternal)
