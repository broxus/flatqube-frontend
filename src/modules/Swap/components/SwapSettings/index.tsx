import * as React from 'react'
import { observer } from 'mobx-react-lite'
import { useIntl } from 'react-intl'

import { Button } from '@/components/common/Button'
import { Icon } from '@/components/common/Icon'
import { useSwapFormStoreContext } from '@/modules/Swap/context'
import { useSwapSettings } from '@/modules/Swap/hooks/useSwapSettings'

import './index.scss'


function Settings(): JSX.Element {
    const intl = useIntl()
    const formStore = useSwapFormStoreContext()
    const settings = useSwapSettings()

    return (
        <div className="swap-settings">
            <Button
                ref={settings.triggerRef}
                className="swap-settings__btn"
                onClick={settings.isOpen ? settings.hide : settings.show}
            >
                <Icon icon="config" />
            </Button>
            {settings.isOpen && (
                <div ref={settings.popupRef} className="swap-settings__drop">
                    <h3 className="swap-settings__title">
                        {intl.formatMessage({
                            id: 'SWAP_SETTINGS_DROP_TITLE',
                        })}
                    </h3>
                    <div className="swap-settings__info">
                        <div className="swap-settings__info-txt">
                            {intl.formatMessage({
                                id: 'SWAP_SETTINGS_DROP_NOTE',
                            })}
                        </div>
                    </div>
                    <div className="swap-settings__label">
                        <div className="swap-settings__label-txt">%</div>
                        <input
                            className="swap-settings__input"
                            inputMode="decimal"
                            type="text"
                            value={formStore.slippage}
                            onBlur={settings.onBlur}
                            onChange={settings.onChange}
                        />
                    </div>
                    <div className="swap-settings__bar">
                        <label className="swap-settings__radio">
                            <input
                                type="radio"
                                name="percent"
                                value="0.1"
                                checked={formStore.slippage === '0.1'}
                                onChange={settings.onChange}
                            />
                            <span className="swap-settings__radio-txt">0.1%</span>
                        </label>
                        <label className="swap-settings__radio">
                            <input
                                type="radio"
                                name="percent"
                                value="0.5"
                                checked={formStore.slippage === '0.5'}
                                onChange={settings.onChange}
                            />
                            <span className="swap-settings__radio-txt">0.5%</span>
                        </label>
                        <label className="swap-settings__radio">
                            <input
                                type="radio"
                                name="percent"
                                value="1.0"
                                checked={formStore.slippage === '1.0'}
                                onChange={settings.onChange}
                            />
                            <span className="swap-settings__radio-txt">1.0%</span>
                        </label>
                    </div>
                </div>
            )}
        </div>
    )
}


export const SwapSettings = observer(Settings)
