import * as React from 'react'
import { useIntl } from 'react-intl'
import { observer } from 'mobx-react-lite'

import { Button } from '@/components/common/Button'
import { Icon } from '@/components/common/Icon'
import { useP2PFormStoreContext } from '@/modules/LimitOrders/context/P2PFormStoreContext'

const defineDisabled = (
    isConnected: boolean,
    isLimitOrderRootDeployed: boolean,
    enoughAmount: boolean,
    isLimitOrderRootDeploying: boolean,
    isLimitOrderCreating: boolean,
    isConfirmationAwait: boolean,
    bothGreaterZero: boolean,
    isBusy: boolean,
    isRightAmountLteTotalSupply: boolean,
    isLimitOrderRootLoading: boolean,
): boolean => {
    if (!isConnected) return false
    if (!isLimitOrderRootDeployed) return false
    return isLimitOrderRootDeploying
        || isLimitOrderCreating
        || isConfirmationAwait
        || !enoughAmount
        || !bothGreaterZero
        || isBusy
        || isLimitOrderRootLoading
        || !isRightAmountLteTotalSupply
}


function MakeOrderButtonComponent(): JSX.Element {
    const intl = useIntl()
    const p2pForm = useP2PFormStoreContext()

    const bothGreaterZero = p2pForm?.leftAmountNumber.isGreaterThan(0)
        && p2pForm?.rightAmountNumber.isGreaterThan(0)
    if (
        p2pForm.isPreparing
        || p2pForm.isBusy
        || p2pForm.isLoading
        || !p2pForm.tokensCache.isReady
        || p2pForm.wallet.isInitializing
        || p2pForm.isLimitOrderRootLoading
    ) {

        return (
            <Button
                block
                size="lg"
                type="primary"
                className="form-submit"
                aria-disabled="true"
                disabled
            >
                <Icon icon="loader" className="spin" />
            </Button>
        )
    }
    const handleSubmit = async (): Promise<void> => {
        if (!p2pForm.wallet.isConnected) {
            await p2pForm.wallet.connect()
            return
        }
        if (!p2pForm?.isLimitOrderRootDeployed) {
            p2pForm.deployLimitOrderRoot()
        }
        else {
            p2pForm.setState('isCreateConfirmationAwait', true)
        }
    }

    const disableButton = defineDisabled(
        p2pForm.wallet.isConnected,
        p2pForm?.isLimitOrderRootDeployed,
        p2pForm?.leftAmountNumber.isLessThanOrEqualTo(p2pForm.leftBalanceNumber),
        p2pForm.isLimitOrderRootDeploying,
        p2pForm.isLimitOrderCreating,
        p2pForm.isConfirmationAwait,
        bothGreaterZero,
        p2pForm.isBusy,
        p2pForm.isRightAmountLteTotalSupply,
        p2pForm.isLimitOrderRootLoading,
    )

    return (
        <Button
            block
            size="lg"
            type="primary"
            className="form-submit"
            onClick={handleSubmit}
            disabled={disableButton || p2pForm.leftToken === undefined || p2pForm.rightToken === undefined}
        >
            {(() => {
                switch (true) {
                    case !p2pForm.wallet.isConnected:
                        return (intl.formatMessage({
                            id: 'EVER_WALLET_CONNECT_BTN_TEXT',
                        }))
                    case p2pForm.leftToken === undefined || p2pForm.rightToken === undefined:
                        return (intl.formatMessage({
                            id: 'SWAP_BTN_TEXT_SELECT_A_TOKEN',
                        }))
                    case !p2pForm?.isLimitOrderRootDeployed
                        && !p2pForm.isBusy
                        && !p2pForm.isLimitOrderRootLoading
                        && p2pForm.isLimitOrderRootLoading !== undefined:
                        return (intl.formatMessage({
                            id: 'P2P_BTN_TEXT_NO_TOKEN_CONTRACT',
                        }))
                    case !p2pForm?.isRightAmountLteTotalSupply:
                        return (intl.formatMessage({
                            id: 'P2P_BTN_TEXT_GREATER_THAN_TOTAL_SUPPLY',
                        }, {
                            // eslint-disable-next-line react/no-multi-comp,react/destructuring-assignment,react/no-unstable-nested-components
                            s: parts => `${parts.join('')}`,
                            token: p2pForm.rightToken?.symbol || '',
                        }))
                    case !bothGreaterZero:
                        return (intl.formatMessage({
                            id: 'SWAP_BTN_TEXT_ENTER_AN_AMOUNT',
                        }))
                    case !p2pForm?.leftAmountNumber.isLessThanOrEqualTo(p2pForm.leftBalanceNumber):
                        return (intl.formatMessage({
                            id: 'SWAP_BTN_TEXT_INSUFFICIENT_TOKEN_BALANCE',
                        }, {
                            // eslint-disable-next-line react/no-multi-comp,react/destructuring-assignment,react/no-unstable-nested-components
                            s: parts => `${parts.join('')}`,
                            symbol: p2pForm.leftToken?.symbol || '',
                        }))
                    default:
                        return (intl.formatMessage({
                            id: 'P2P_BTN_TEXT_SUBMIT',
                        }))
                }
            })()}
        </Button>
    )
}

export const MakeOrderButton = observer(MakeOrderButtonComponent)
