import * as React from 'react'
import { useIntl } from 'react-intl'
import classNames from 'classnames'
import { observer } from 'mobx-react-lite'

import { Icon } from '@/components/common/Icon'
import { useContext } from '@/hooks/useContext'
import { GaugesFavoritesContext } from '@/modules/Gauges/providers/GaugesFavoritesProvider'
import { GaugesDataStoreContext } from '@/modules/Gauges/providers/GaugesDataProvider'
import { GaugesToolBtn } from '@/modules/Gauges/components/GaugesToolBtn'
import { useWallet } from '@/stores/WalletService'

import styles from './index.module.scss'

function GaugesFavoriteBtnInner(): JSX.Element | null {
    const intl = useIntl()
    const wallet = useWallet()
    const data = useContext(GaugesDataStoreContext)
    const favorites = useContext(GaugesFavoritesContext)

    const onClick = () => {
        if (data.id) {
            favorites.toggle(data.id)
        }
    }

    if (!data.id || !wallet.address) {
        return null
    }

    return (
        <GaugesToolBtn
            onClick={onClick}
            className={styles.favoriteBtn}
        >
            <Icon
                icon="star"
                className={classNames(styles.icon, {
                    [styles.active]: favorites.addresses.includes(data.id),
                })}
            />

            {intl.formatMessage({
                id: 'GAUGE_FAVORITES',
            })}
        </GaugesToolBtn>
    )
}

export const GaugesFavoriteBtn = observer(GaugesFavoriteBtnInner)
