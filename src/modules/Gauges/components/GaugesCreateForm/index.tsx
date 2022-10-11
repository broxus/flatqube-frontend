import * as React from 'react'
import { useIntl } from 'react-intl'
import { observer } from 'mobx-react-lite'
import { Redirect } from 'react-router-dom'

import { CreateFormMain } from '@/modules/Gauges/components/GaugesCreateForm/Main'
import { CreateFormSide } from '@/modules/Gauges/components/GaugesCreateForm/Side'
import { GaugesCreateFormContext } from '@/modules/Gauges/providers/GaugesCreateFormProvider'
import { useContext } from '@/hooks/useContext'
import { appRoutes } from '@/routes'

import styles from './index.module.scss'

function GaugesCreateFormInner(): JSX.Element {
    const intl = useIntl()
    const form = useContext(GaugesCreateFormContext)

    const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        form.create()
    }

    if (form.address) {
        return (
            <Redirect
                to={appRoutes.gaugesItem.makeUrl({
                    address: form.address,
                })}
            />
        )
    }

    return (
        <form
            className={styles.createForm}
            onSubmit={onSubmit}
        >
            <h1 className={styles.head}>
                {intl.formatMessage({
                    id: 'GAUGE_HEADER_CREATE_LINK_TEXT',
                })}
            </h1>

            <div className={styles.content}>
                <CreateFormMain />
                <CreateFormSide />
            </div>
        </form>
    )
}

export const GaugesCreateForm = observer(GaugesCreateFormInner)
