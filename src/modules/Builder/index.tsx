import * as React from 'react'

import { BuilderTokensList } from '@/modules/Builder/components/BuilderTokensList'
import { useBuilderStore } from '@/modules/Builder/stores/BuilderStore'

import './index.scss'


export function Builder(): JSX.Element {
    const builder = useBuilderStore()

    React.useEffect(() => {
        (async () => {
            await builder.init()
        })()

        return () => {
            builder.dispose()
        }
    }, [])

    return (
        <div className="card card--small card--flat">
            <div className="card__wrap">
                <BuilderTokensList />
            </div>
        </div>
    )
}
