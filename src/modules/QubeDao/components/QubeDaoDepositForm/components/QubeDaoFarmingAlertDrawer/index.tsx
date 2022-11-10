import * as React from 'react'
import { reaction } from 'mobx'
import { Observer } from 'mobx-react-lite'

import { Button } from '@/components/common/Button'
import { Drawer, DrawerRef } from '@/components/common/Drawer'
import { Icon } from '@/components/common/Icon'
import { QubeDaoCandidateItem } from '@/modules/QubeDao/components/QubeDaoCommon'
import { useQubeDaoDepositFormContext } from '@/modules/QubeDao/providers/QubeDaoDepositFormStoreProvider'

import styles from './index.module.scss'

export function QubeDaoFarmingAlertDrawer(): JSX.Element {
    const depositForm = useQubeDaoDepositFormContext()

    const drawer = React.useRef<DrawerRef | null>(null)

    const collapse = () => {
        drawer.current?.collapse()
        depositForm.setData('userGauges', [])
    }

    React.useEffect(() => reaction(() => depositForm.userGauges, gauges => {
        if (gauges.length > 0) {
            drawer.current?.expand()
        }
    }, { fireImmediately: true }))

    return (
        <Drawer
            ref={drawer}
            closable
            destroyOnClose
            height="480px"
            width="100vw"
            placement="bottom"
        >
            <div className="device-drawer-content-inner">
                <div className="device-drawer-header margin-bottom">
                    <div className="device-drawer-header-inner width-expand">
                        <h4 className="device-drawer-title width-expand">
                            Tokens successfully deposited
                        </h4>
                        <Button
                            type="icon"
                            className="btn-close-drawer"
                            onClick={collapse}
                        >
                            <Icon icon="close" />
                        </Button>
                    </div>
                </div>
                <p className="margin-vertical">
                    Claim available reward tokens from each farming pool you participate in
                    to receive higher income
                </p>
                <div className="text-muted margin-bottom">Your farming pools:</div>
                <Observer>
                    {() => (
                        <ul className={styles.list}>
                            {depositForm.userGauges.map(gauge => (
                                <li key={gauge.address}>
                                    <QubeDaoCandidateItem
                                        address={gauge.address}
                                        gaugeDetails={gauge.poolTokens}
                                    />
                                </li>
                            ))}
                        </ul>
                    )}
                </Observer>
            </div>
        </Drawer>
    )
}
