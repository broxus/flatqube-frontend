import * as React from 'react'
import { observer } from 'mobx-react-lite'
import { useIntl } from 'react-intl'

import { Button } from '@/components/common/Button'
import { GaugesAdminPopupContext } from '@/modules/Gauges/providers/GaugesAdminPopupProvider'
import { useContext } from '@/hooks/useContext'
import { GaugesAdminEndDateFormContext } from '@/modules/Gauges/providers/GaugesAdminEndDateFormProvider'
import { Spinner } from '@/components/common/Spinner'

import styles from './index.module.scss'

function AdminPopupEndDateConfirmationInner(): JSX.Element {
    const intl = useIntl()
    const adminPopup = useContext(GaugesAdminPopupContext)
    const form = useContext(GaugesAdminEndDateFormContext)

    const onClickYes = async () => {
        const success = await form.submit()
        if (success) {
            adminPopup.hide()
        }
    }

    return (
        <>
            <h2 className={styles.title}>
                {intl.formatMessage({
                    id: 'GAUGE_CONFIG_CONFIRMATION_TITLE',
                })}
            </h2>

            <div className={styles.form}>
                <div className={styles.message}>
                    {intl.formatMessage({
                        id: 'GAUGE_CONFIG_CONFIRMATION_TEXT',
                    })}
                </div>

                <div className={styles.actions}>
                    <Button
                        type="secondary"
                        disabled={form.isLoading}
                        onClick={adminPopup.hideEndDateConfirmation}
                    >
                        {intl.formatMessage({
                            id: 'GAUGE_CONFIG_CONFIRMATION_NO',
                        })}
                    </Button>

                    <Button
                        type="danger"
                        disabled={form.isLoading}
                        onClick={onClickYes}
                        className={styles.btn}
                    >
                        {intl.formatMessage({
                            id: 'GAUGE_CONFIG_CONFIRMATION_YES',
                        })}
                        {form.isLoading && (
                            <Spinner size="s" />
                        )}
                    </Button>
                </div>
            </div>
        </>
    )
}

export const AdminPopupEndDateConfirmation = observer(AdminPopupEndDateConfirmationInner)
