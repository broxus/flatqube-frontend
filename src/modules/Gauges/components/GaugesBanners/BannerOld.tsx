import * as React from 'react'
import { useIntl } from 'react-intl'

import { Button } from '@/components/common/Button'
import { appRoutes } from '@/routes'
import { Icon } from '@/components/common/Icon'
import { storage } from '@/utils'
import { getDays } from '@/modules/Gauges/components/GaugesBanners/dayX'

import styles from './index.module.scss'

export function GaugesBannerOld(): JSX.Element | null {
    const intl = useIntl()
    const [visible, setVisible] = React.useState(false)

    const days = React.useMemo(
        () => getDays(),
        [],
    )

    const hide = () => {
        storage.set('gauges-banner-old-closed', '1')
        setVisible(false)
    }

    React.useEffect(() => {
        setVisible(storage.get('gauges-banner-old-closed') !== '1')
    }, [])

    if (!visible) {
        return null
    }

    return (
        <div className={`${styles.banner} ${styles.old}`}>
            <button
                type="button"
                className={styles.close}
                onClick={hide}
            >
                <Icon icon="close" />
            </button>

            <h2 className={styles.title}>
                {intl.formatMessage({
                    id: 'GAUGE_BANNER_OLD_TITLE',
                }, {
                    days,
                })}
            </h2>

            <p
                className={styles.text}
                dangerouslySetInnerHTML={{
                    __html: intl.formatMessage({
                        id: 'GAUGE_BANNER_OLD_TEXT',
                    }, {
                        days,
                    }),
                }}
            />

            <div className={styles.actions}>
                <Button
                    block
                    type="secondary"
                    className={styles.btn}
                    href="https://broxus.medium.com/how-to-transfer-lp-tokens-from-old-farming-pools-to-new-c02752202176"
                >
                    {intl.formatMessage({
                        id: 'GAUGE_BANNER_LEARN_MORE',
                    })}
                </Button>
                <Button
                    block
                    type="secondary"
                    className={styles.btn}
                    link={appRoutes.gauges.makeUrl()}
                >
                    {intl.formatMessage({
                        id: 'GAUGE_BANNER_NEW_BTN',
                    })}
                </Button>
            </div>
        </div>
    )
}
