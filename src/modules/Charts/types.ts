import { OhlcData } from 'lightweight-charts'

export type Timeframe = 'H1' | 'D1'

export interface OhlcvData extends OhlcData {
    volume: number
}

export type OhlcvGraphModel = {
    close: string;
    high: string;
    low: string;
    open: string;
    timestamp: number;
    volume: string;
}

export type TvlGraphModel = {
    data: string;
    timestamp: number;
}

export type VolumeGraphModel = {
    data: string;
    timestamp: number;
}
