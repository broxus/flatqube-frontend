import * as React from 'react'

import { TokenIcon, TokenIconProps } from '@/components/common/TokenIcon'
import { Tooltip } from '@/components/common/Tooltip'

import './index.scss'

export type TokenIconsProps = {
    icons: TokenIconProps[];
    limit?: number;
    size?: TokenIconProps['size'];
    title?: string;
    showDesc?: boolean;
}

export function TokenIcons({
    icons,
    title,
    limit = icons.length,
    size = 'small',
    showDesc,
}: TokenIconsProps): JSX.Element {
    const moreIconRef = React.useRef<HTMLSpanElement | null>(null)
    const innerRef = React.useRef<HTMLDivElement>(null)
    const visibleIcons = icons.slice(0, limit)

    return (
        <div className="token-icons">
            <div className="token-icons__inner" ref={innerRef}>
                {visibleIcons.map(item => (
                    <div className="token-icons__item" key={item.address || item.icon}>
                        <TokenIcon {...item} size={size} />
                    </div>
                ))}

                {!showDesc && icons.length > limit && (
                    <div className="token-icons__item">
                        <span className="token-icons__more" ref={moreIconRef}>
                            +
                            {icons.length - limit}
                        </span>

                        <Tooltip target={moreIconRef}>
                            {title && <h4>{title}</h4>}
                            {icons.map(({ name }) => (
                                <p key={name}>{name}</p>
                            ))}
                        </Tooltip>
                    </div>
                )}
            </div>

            {showDesc && (
                <Tooltip target={innerRef}>
                    {title && <h4>{title}</h4>}
                    {icons.map(({ name }) => (
                        <p key={name}>{name}</p>
                    ))}
                </Tooltip>
            )}
        </div>
    )
}
