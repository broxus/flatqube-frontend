import * as React from 'react'

import { uniqueId } from '@/utils'

export const Placeholder = React.memo(() => {
    const firstFilterId = React.useRef(`placeholder${uniqueId()}`)
    const secondFilterId = React.useRef(`placeholder${uniqueId()}`)
    return (
        <svg
            className="chart-placeholder"
            width="100%"
            height="100%"
            preserveAspectRatio="none"
            viewBox="0 0 842 320"
            color="text"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path
                d="M0 125.516L64.8017 171.032C80.5171 187.363 106.172 188.796 123.609 174.318V174.318C134.008 165.685 147.843 162.407 161.01 165.458L173.63 168.382C181.39 170.18 189.468 170.098 197.189 168.143L223.109 161.58C229.894 159.862 236.243 156.739 241.745 152.412L276.609 124.993C281.833 120.885 286.186 115.777 289.412 109.967L305.821 80.4206C316.774 60.6989 343.942 57.746 358.876 74.6544V74.6544C368.275 85.2956 383.469 88.6499 396.474 82.9542L397.268 82.6066C412.015 76.1481 429.27 80.965 438.54 94.1279L444.235 102.216C458.334 122.237 485.653 127.692 506.36 114.62L507.694 113.778C513.448 110.146 518.357 105.323 522.09 99.6342L544.466 65.5368C554.754 49.8592 572.949 41.2562 591.595 43.2538L604.901 44.6794C608.45 45.0596 611.948 45.8186 615.335 46.9435L657.674 61.0051L679.832 69.6872C695.139 75.6851 712.486 73.0329 725.302 62.7351V62.7351C741.884 49.4114 765.449 49.2344 782.229 62.3074L842 92.5128"
                stroke="#c5e4f3"
                strokeWidth={2}
                strokeDasharray={1000}
                strokeDashoffset={1000}
                fill="transparent"
                opacity={0.2}
                filter={`url(#${firstFilterId.current})`}
            >
                <animate
                    id="firstline"
                    attributeName="stroke-dashoffset"
                    dur="2s"
                    from={1000}
                    to={-1000}
                    begin="0s;firstline.end+0.5s"
                />
            </path>
            <path
                d="M0 125.516L64.8017 171.032C80.5171 187.363 106.172 188.796 123.609 174.318V174.318C134.008 165.685 147.843 162.407 161.01 165.458L173.63 168.382C181.39 170.18 189.468 170.098 197.189 168.143L223.109 161.58C229.894 159.862 236.243 156.739 241.745 152.412L276.609 124.993C281.833 120.885 286.186 115.777 289.412 109.967L305.821 80.4206C316.774 60.6989 343.942 57.746 358.876 74.6544V74.6544C368.275 85.2956 383.469 88.6499 396.474 82.9542L397.268 82.6066C412.015 76.1481 429.27 80.965 438.54 94.1279L444.235 102.216C458.334 122.237 485.653 127.692 506.36 114.62L507.694 113.778C513.448 110.146 518.357 105.323 522.09 99.6342L544.466 65.5368C554.754 49.8592 572.949 41.2562 591.595 43.2538L604.901 44.6794C608.45 45.0596 611.948 45.8186 615.335 46.9435L657.674 61.0051L679.832 69.6872C695.139 75.6851 712.486 73.0329 725.302 62.7351V62.7351C741.884 49.4114 765.449 49.2344 782.229 62.3074L842 92.5128"
                stroke="#c5e4f3"
                strokeWidth={2}
                strokeDasharray={1000}
                strokeDashoffset={1000}
                fill="transparent"
                opacity={0.2}
                filter={`url(#${firstFilterId.current})`}
            >
                <animate
                    id="secondline"
                    attributeName="stroke-dashoffset"
                    dur="2s"
                    from={1000}
                    to={-1000}
                    begin="1.3s;secondline.end+0.5s"
                />
            </path>

            <path
                d="M0 169.099L76.8157 198.592C86.7082 203.82 98.0682 205.578 109.078 203.586L133.059 199.246C139.764 198.033 146.646 198.203 153.283 199.746L169.06 203.413C178.844 205.687 187.716 210.856 194.52 218.245L206.8 231.581C221.781 247.849 245.669 252.343 265.538 242.632L269.363 240.762C277.841 236.618 284.974 230.159 289.936 222.133L303.011 200.982C314.57 182.285 340.594 179.369 356.004 195.043V195.043C365.533 204.735 379.93 207.796 392.578 202.82L406.693 197.267C414.938 194.023 422.173 188.646 427.657 181.688L459.386 141.427C473.018 124.13 500.576 130.043 505.911 151.41L509.806 167.006C513.889 183.356 535.443 187.083 544.779 173.053V173.053C545.499 171.971 546.326 170.964 547.247 170.048L567.595 149.804C585.477 132.012 613.812 130.327 633.677 145.875L649.729 158.439L669.114 174.554C686.656 189.138 711.845 189.999 730.342 176.647L744.564 166.381C746.537 164.958 748.61 163.68 750.768 162.558L842 126.052"
                stroke="#C5E4F3"
                strokeWidth={2}
                strokeDasharray={1000}
                strokeDashoffset={1000}
                fill="transparent"
                opacity={0.1}
                filter={`url(#${secondFilterId.current})`}
            >
                <animate
                    id="thirdline"
                    attributeName="stroke-dashoffset"
                    dur="1.8s"
                    from={1000}
                    to={-1000}
                    begin="0s;thirdline.end+0.5s"
                />
            </path>

            <path
                d="M0 169.099L76.8157 198.592C86.7082 203.82 98.0682 205.578 109.078 203.586L133.059 199.246C139.764 198.033 146.646 198.203 153.283 199.746L169.06 203.413C178.844 205.687 187.716 210.856 194.52 218.245L206.8 231.581C221.781 247.849 245.669 252.343 265.538 242.632L269.363 240.762C277.841 236.618 284.974 230.159 289.936 222.133L303.011 200.982C314.57 182.285 340.594 179.369 356.004 195.043V195.043C365.533 204.735 379.93 207.796 392.578 202.82L406.693 197.267C414.938 194.023 422.173 188.646 427.657 181.688L459.386 141.427C473.018 124.13 500.576 130.043 505.911 151.41L509.806 167.006C513.889 183.356 535.443 187.083 544.779 173.053V173.053C545.499 171.971 546.326 170.964 547.247 170.048L567.595 149.804C585.477 132.012 613.812 130.327 633.677 145.875L649.729 158.439L669.114 174.554C686.656 189.138 711.845 189.999 730.342 176.647L744.564 166.381C746.537 164.958 748.61 163.68 750.768 162.558L842 126.052"
                stroke="#C5E4F3"
                strokeWidth={2}
                strokeDasharray={1000}
                strokeDashoffset={1000}
                fill="transparent"
                opacity={0.1}
                filter={`url(#${secondFilterId.current})`}
            >
                <animate
                    id="fourthline"
                    attributeName="stroke-dashoffset"
                    dur="1.8s"
                    from={1000}
                    to={-1000}
                    begin="1.1s;fourthline.end+0.5s"
                />
            </path>
            <defs>
                <filter
                    id={firstFilterId.current}
                    filterUnits="userSpaceOnUse"
                    colorInterpolationFilters="sRGB"
                >
                    <feFlood floodOpacity="0" result="BackgroundImageFix" />
                    <feColorMatrix
                        in="SourceAlpha"
                        type="matrix"
                        values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                        result="hardAlpha"
                    />
                    <feOffset />
                    <feGaussianBlur stdDeviation="10" />
                    <feComposite in2="hardAlpha" operator="out" />
                    <feColorMatrix
                        type="matrix"
                        values="0 0 0 0 0.772549 0 0 0 0 0.894118 0 0 0 0 0.952941 0 0 0 1 0"
                    />
                    <feBlend
                        mode="normal"
                        in2="BackgroundImageFix"
                        result="effect1_dropShadow_0_1"
                    />
                    <feBlend
                        mode="normal"
                        in="SourceGraphic"
                        in2="effect1_dropShadow_0_1"
                        result="shape"
                    />
                </filter>
                <filter
                    id={secondFilterId.current}
                    filterUnits="userSpaceOnUse"
                    colorInterpolationFilters="sRGB"
                >
                    <feFlood floodOpacity="0" result="BackgroundImageFix" />
                    <feColorMatrix
                        in="SourceAlpha"
                        type="matrix"
                        values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                        result="hardAlpha"
                    />
                    <feOffset />
                    <feGaussianBlur stdDeviation="10" />
                    <feComposite in2="hardAlpha" operator="out" />
                    <feColorMatrix
                        type="matrix"
                        values="0 0 0 0 0.772549 0 0 0 0 0.894118 0 0 0 0 0.952941 0 0 0 1 0"
                    />
                    <feBlend
                        mode="normal"
                        in2="BackgroundImageFix"
                        result="effect1_dropShadow_0_1"
                    />
                    <feBlend
                        mode="normal"
                        in="SourceGraphic"
                        in2="effect1_dropShadow_0_1"
                        result="shape"
                    />
                </filter>
            </defs>
        </svg>
    )
})
