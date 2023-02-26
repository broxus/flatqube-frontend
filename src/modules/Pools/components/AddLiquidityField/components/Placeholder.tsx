import * as React from 'react'

import { Button } from '@/components/common/Button'
import { Placeholder } from '@/components/common/Placeholder'

export function FieldPlaceholder(): JSX.Element {
    return (
        <label className="form-label">
            <fieldset className="form-fieldset">
                <div className="form-fieldset__main">
                    <input
                        className="form-input"
                        placeholder="0.0"
                        readOnly
                    />

                    <Button
                        key="change-token"
                        className="form-drop form-drop-extra disabled"
                        disabled
                    >
                        <span className="form-drop__logo">
                            <Placeholder circle width={24} />
                        </span>
                        <span className="form-drop__name">
                            <Placeholder height={20} width={50} />
                        </span>
                    </Button>
                </div>
            </fieldset>
        </label>
    )
}
