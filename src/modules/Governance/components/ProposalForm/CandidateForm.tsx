import * as React from 'react'
import { useIntl } from 'react-intl'
import { observer } from 'mobx-react-lite'

import { Select } from '@/components/common/Select'
import { useProposalCreateContext } from '@/modules/Governance/providers'
import { CandidateItem } from '@/modules/Governance/components/CandidateItem'

import './index.scss'

type Props = {
    disabled?: boolean,
    onChange: (address: string) => void,
}

function CandidateFormInner({
    disabled,
    onChange,
}: Props): JSX.Element | null {
    const intl = useIntl()
    const proposalCreate = useProposalCreateContext()
    const [value, setValue] = React.useState<string>()

    const _onChange = (address: string) => {
        setValue(address)
        onChange(address)
    }

    return (
        <div className="proposal-form-popup__field">
            <div className="proposal-form-label">
                {intl.formatMessage({
                    id: 'PROPOSAL_FORM_SELECT_CANDIDATE',
                })}
            </div>

            <Select
                disabled={disabled}
                onChange={_onChange}
                value={value}
                options={proposalCreate.candidates.map(item => ({
                    value: item.address,
                    label: (
                        <CandidateItem
                            address={item.address}
                            tokensInfo={item.poolTokens}
                        />
                    ),
                }))}
            />
        </div>
    )
}

export const CandidateForm = observer(CandidateFormInner)
