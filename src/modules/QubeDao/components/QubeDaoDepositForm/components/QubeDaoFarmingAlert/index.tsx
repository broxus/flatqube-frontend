import * as React from 'react'
import classNames from 'classnames'
import { Observer } from 'mobx-react-lite'
import * as ReactDOM from 'react-dom'

import { Button } from '@/components/common/Button'
import { Icon } from '@/components/common/Icon'
import { QubeDaoCandidateItem } from '@/modules/QubeDao/components/QubeDaoCommon'
import { useQubeDaoDepositFormContext } from '@/modules/QubeDao/providers/QubeDaoDepositFormStoreProvider'

import styles from './index.module.scss'

export function QubeDaoFarmingAlert(): JSX.Element {
    const depositForm = useQubeDaoDepositFormContext()

    const dismiss = () => {
        depositForm.setData('userGauges', [])
    }

    return (
        <Observer>
            {() => (depositForm.userGauges.length > 0 ? ReactDOM.createPortal(
                <div className="popup">
                    <div className="popup-overlay" />
                    <div className={classNames('popup__wrap', styles.popup)}>
                        <Button
                            type="icon"
                            className="popup-close"
                            onClick={dismiss}
                        >
                            <Icon icon="close" />
                        </Button>
                        <h2 className="popup-title">
                            Tokens successfully deposited
                        </h2>
                        <p className="margin-vertical">
                            Claim available reward tokens from each farming pool you participate in to
                            receive higher income
                        </p>
                        <div className="text-muted margin-bottom">Your farming pools:</div>
                        <ul className={styles.list}>
                            {depositForm.userGauges.map(gauge => (
                                <li key={gauge.address}>
                                    <QubeDaoCandidateItem address={gauge.address} gaugeDetails={gauge.poolTokens} />
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>,
                document.body,
            ) : null)}
        </Observer>
    )
}
