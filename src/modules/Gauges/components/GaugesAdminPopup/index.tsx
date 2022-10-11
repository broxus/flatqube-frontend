import * as React from 'react'
import * as ReactDOM from 'react-dom'
import { observer } from 'mobx-react-lite'
import { useIntl } from 'react-intl'

import { usePage } from '@/hooks/usePage'
import { useContext } from '@/hooks/useContext'
import { Tabs } from '@/components/common/Tabs'
import { GaugesAdminPopupContext } from '@/modules/Gauges/providers/GaugesAdminPopupProvider'
import { GaugesAdminPopupNav } from '@/modules/Gauges/stores/GaugesAdminPopupStore'
import { AdminPopupEndDateForm } from '@/modules/Gauges/components/GaugesAdminPopup/EndDateForm'
import { AdminPopupLayout } from '@/modules/Gauges/components/GaugesAdminPopup/Layout'
import { AdminPopupEndDateConfirmation } from '@/modules/Gauges/components/GaugesAdminPopup/EndDateConfirmation'
import { GaugesAdminSpeedFormProvider } from '@/modules/Gauges/providers/GaugesAdminSpeedFormProvider'
import { AdminPopupSpeedForm } from '@/modules/Gauges/components/GaugesAdminPopup/SpeedForm'
import { GaugesAdminEndDateFormProvider } from '@/modules/Gauges/providers/GaugesAdminEndDateFormProvider'

import styles from './index.module.scss'

function GaugesAdminPopupInner(): JSX.Element {
    const intl = useIntl()
    const page = usePage()
    const adminPopup = useContext(GaugesAdminPopupContext)

    const setActiveTabFn = (tab: GaugesAdminPopupNav) => () => {
        adminPopup.setActiveTab(tab)
    }

    const onClose = () => {
        adminPopup.hide()
    }

    React.useEffect(() => {
        page.block()

        return () => {
            page.unblock()
        }
    }, [])

    return ReactDOM.createPortal(
        <AdminPopupLayout
            onClose={onClose}
        >
            <GaugesAdminSpeedFormProvider>
                <GaugesAdminEndDateFormProvider>
                    {adminPopup.endDateConfirmationVisible ? (
                        <AdminPopupEndDateConfirmation />
                    ) : (
                        <>
                            <h2 className={styles.title}>
                                {intl.formatMessage({
                                    id: 'GAUGE_CONFIG_TITLE',
                                })}
                            </h2>

                            <Tabs
                                size="s"
                                items={[{
                                    active: adminPopup.activeTab === GaugesAdminPopupNav.Speed,
                                    label: intl.formatMessage({
                                        id: 'GAUGE_CONFIG_TAB_SPEED',
                                    }),
                                    onClick: setActiveTabFn(GaugesAdminPopupNav.Speed),
                                }, {
                                    active: adminPopup.activeTab === GaugesAdminPopupNav.EndDate,
                                    label: intl.formatMessage({
                                        id: 'GAUGE_CONFIG_TAB_END_TIME',
                                    }),
                                    onClick: setActiveTabFn(GaugesAdminPopupNav.EndDate),
                                }]}
                            />

                            {adminPopup.activeTab === GaugesAdminPopupNav.Speed && (
                                <AdminPopupSpeedForm />
                            )}

                            {adminPopup.activeTab === GaugesAdminPopupNav.EndDate && (
                                <AdminPopupEndDateForm />
                            )}
                        </>
                    )}
                </GaugesAdminEndDateFormProvider>
            </GaugesAdminSpeedFormProvider>
        </AdminPopupLayout>,
        document.body,
    )
}

export const GaugesAdminPopup = observer(GaugesAdminPopupInner)
