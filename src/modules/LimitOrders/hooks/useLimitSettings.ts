import BigNumber from 'bignumber.js'
import * as React from 'react'

import { DEFAULT_SLIPPAGE_VALUE } from '@/modules/Swap/constants'
import { isGoodBignumber } from '@/utils'
import { useP2PStoreContext } from '@/modules/LimitOrders/context/P2PStoreContext-legacy'


type SwapSettingsShape = {
    popupRef: React.RefObject<HTMLDivElement>;
    triggerRef: React.RefObject<HTMLButtonElement>;
    isOpen: boolean;
    show: () => void;
    hide: () => void;
    handleOuterClick: (event: MouseEvent | TouchEvent) => void;
    onBlur: React.FormEventHandler<HTMLInputElement>;
    onChange: React.ChangeEventHandler<HTMLInputElement>;
}


export function useLimitSettings(): SwapSettingsShape {
    const p2pStore = useP2PStoreContext()

    const popupRef = React.useRef<HTMLDivElement>(null)

    const triggerRef = React.useRef<HTMLButtonElement>(null)

    const [isOpen, setOpen] = React.useState(false)

    const show = (): void => {
        if (p2pStore.isProcessing) {
            return
        }
        setOpen(true)
    }

    const hide = (): void => {
        setOpen(false)
    }

    const handleOuterClick = (event: MouseEvent | TouchEvent): void => {
        if (
            !popupRef.current?.contains(event.target as Node)
            && !triggerRef.current?.contains(event.target as Node)
            && (event.target as Node)?.parentNode
        ) {
            hide()
        }
    }

    const onBlur: React.FormEventHandler<HTMLInputElement> = event => {
        const value = new BigNumber(event.currentTarget.value || 0)
        if (!isGoodBignumber(value)) {
            p2pStore.setData('slippage', DEFAULT_SLIPPAGE_VALUE)
        }
    }

    // const onKeyPress = React.useCallback(debounce(async () => {
    //     // await p2pStore.recalculate(true)
    // }, 1000), [])

    const onChange: React.ChangeEventHandler<HTMLInputElement> = async event => {
        let { value } = event.target
        value = value.replace(/[,]/g, '.')
        if (
            p2pStore.slippage
            && p2pStore.slippage.indexOf('.') > -1
            && value.length > p2pStore.slippage.length
            && value.charAt(value.length - 1) === '.'
        ) {
            return
        }
        value = value.replace(/[.]+/g, '.')
        value = value.replace(/(?!- )[^0-9.]/g, '')
        await p2pStore.changeSlippage(value)
        // await onKeyPress()
    }

    React.useEffect(() => {
        document.addEventListener('click', handleOuterClick, false)
        document.addEventListener('touchend', handleOuterClick, false)

        return () => {
            document.removeEventListener('click', handleOuterClick, false)
            document.removeEventListener('touchend', handleOuterClick, false)
        }
    }, [])

    return {
        handleOuterClick,
        hide,
        isOpen,
        popupRef,
        show,
        triggerRef,
        // eslint-disable-next-line sort-keys
        onBlur,
        onChange,
    }
}
