import * as React from 'react'

import { Create } from '@/modules/Builder/create'


export default function Page(): JSX.Element {
    return (
        <div className="container container--small">
            <section className="section">
                <Create />
            </section>
        </div>
    )
}
