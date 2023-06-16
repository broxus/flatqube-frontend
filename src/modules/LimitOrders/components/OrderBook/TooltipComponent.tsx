import * as React from 'react'

import { formattedAmount } from '@/utils'

import './index.scss'

export function TooltipComponent(
    { active, payload, label }:
        { active?: boolean, payload?: any, label?: any },
): JSX.Element {
    if (active && payload && payload.length) {
        return (
            <div className="custom-tooltip">
                {payload.map((elem: any) => (
                    <div key={label}>
                        <h3>{elem.name}</h3>
                        <p className="intro">
                            {`Price: ${formattedAmount(label)}  
                                ${elem.name === 'Asks'
                        ? elem.payload.askReceiveSymbol
                        : elem.payload.bidReceiveSymbol}`}
                            /
                            {elem.name === 'Asks'
                                ? elem.payload.askSpentSymbol
                                : elem.payload.bidSpentSymbol}

                        </p>
                        <p className="intro">
                            {`Total Size, ${elem.name === 'Asks'
                                ? elem.payload.askSpentSymbol
                                : elem.payload.bidSpentSymbol}: ${formattedAmount(elem.value)}`}

                        </p>
                        {/* <p className="intro">
                            {`Total Cost, ${elem.name === 'Asks'
                                ? elem.payload.askReceiveSymbol
                                : elem.payload.bidReceiveSymbol}: ${elem.name === 'Asks' ? elem.payload.askCost : elem.payload.bidCost}`}

                        </p> */}
                    </div>
                ))}
            </div>
        )
    }
    return <> </>
}
