/* eslint-disable */
/* tslint:disable */
/*
 * ---------------------------------------------------------------
 * ## THIS FILE WAS GENERATED VIA SWAGGER-TYPESCRIPT-API        ##
 * ##                                                           ##
 * ## AUTHOR: acacode                                           ##
 * ## SOURCE: https://github.com/acacode/swagger-typescript-api ##
 * ---------------------------------------------------------------
 */

export interface Deposit {
  /** Decimal value */
  boost: string;

  /** @format uint32 */
  endLock: number | null;

  /** @format uint32 */
  lockPeriod: number | null;

  /** Decimal value */
  lpAmount: string;
  state: DepositState;

  /** @format uint32 */
  timestamp: number;
}

export interface DepositRequest {
  gaugeAddress: string;

  /** @format uint32 */
  limit: number;

  /** @format uint32 */
  offset: number;
  userAddress: string;
}

export interface DepositResponse {
  deposits: Deposit[];

  /** @format uint32 */
  total: number;
}

/**
 * @example locked
 */
export enum DepositState {
  Locked = "locked",
  Unlocked = "unlocked",
  NoBoost = "noBoost",
}

/**
 * @example claim
 */
export enum EventType {
  Claim = "claim",
  Deposit = "deposit",
  Withdraw = "withdraw",
  RewardDeposit = "rewardDeposit",
}

export interface FromTo {
  /** Decimal value */
  from?: string;

  /** Decimal value */
  to?: string;
}

export interface GaugeBatchRequest {
  gauges: string[];
}

export interface GaugeBatchResponse {
  gauges: GaugeItem[];
}

export interface GaugeItem {
  address: string;
  depositTokenRoot: string;

  /** @format uint32 */
  endTime: number | null;
  isLowBalance: boolean;

  /** Decimal value */
  maxApr: string;

  /** Decimal value */
  maxAprChange: string;

  /** Decimal value */
  minApr: string;

  /** Decimal value */
  minAprChange: string;
  poolTokens: PoolTokenInfo[];
  rewardTokens: RewardTokenInfo[];

  /** @format uint32 */
  startTime: number | null;

  /** Decimal value */
  tvl: string;

  /** Decimal value */
  tvlChange: string;
}

export interface GaugeListRequest {
  additionalTokenRoots?: string[];

  /** @format uint32 */
  limit: number;
  maxApr?: FromTo;
  minApr?: FromTo;

  /** @format uint32 */
  offset: number;
  showLowBalance?: boolean | null;
  starredGauges?: string[] | null;
  tvl?: FromTo;
  whitelistUri: string;
}

export interface GaugeResponse {
  gauges: GaugeItem[];

  /** @format uint32 */
  total: number;
}

export interface HistoryBalance {
  /** Decimal value */
  balance: string;

  /** @format int64 */
  lastUpdated: number | null;
  lpBreakdown: PoolTokenInfo[];
}

export interface PoolTokenInfo {
  /** Decimal value */
  amount: string;
  tokenRoot: string;
  tokenSymbol: string;
}

export interface RewardRound {
  /** @format uint64 */
  endDate: number | null;

  /** @format uint32 */
  id: number;
  rewardTokens: RewardToken[];

  /** @format uint64 */
  startDate: number;
}

export interface RewardRoundRequest {
  gaugeAddress: string;

  /** @format int32 */
  limit: number;

  /** @format int32 */
  offset: number;
}

export interface RewardRoundResponse {
  rewardRounds: RewardRound[];

  /** @format uint32 */
  total: number;
}

export interface RewardToken {
  /** Decimal value */
  budget: string;

  /** Decimal value */
  farmingSpeed: string;
  tokenRoot: string;
  tokenSymbol: string;
}

export interface RewardTokenInfo {
  tokenRoot: string;
  tokenSymbol: string;
}

export interface SingleGaugeRequest {
  gaugeAddress: string;
}

export interface SingleGaugeResponse {
  gauge: GaugeItem;
}

export interface StarredGaugeRequest {
  gaugeAddresses: string[];

  /** @format uint32 */
  limit: number;

  /** @format uint32 */
  offset: number;
}

export interface StatRequest {
  /** @format uint64 */
  from: number;
  gaugeAddress: string;
  timeframe: Timeframe;

  /** @format uint64 */
  to: number;
}

export interface StatResponse {
  stats: StatValue[];
}

export interface StatValue {
  /** @format uint64 */
  timestamp: number;

  /** Decimal value */
  value: string;
}

/**
 * @example H1
 */
export enum Timeframe {
  H1 = "H1",
  D1 = "D1",
}

export interface Token {
  /** Decimal value */
  amount: string;
  tokenRoot: string;
  tokenSymbol: string;

  /** Decimal value */
  value: string;
}

export interface Transaction {
  gaugeAddress: string;
  kind: EventType;

  /** @format uint64 */
  timestamp: number;
  tokens: Token[];
  txHash: string;
  userAddress: string;
}

export interface TransactionRequest {
  eventTypes: EventType[];
  gaugeAddress: string;

  /** @format uint32 */
  limit: number;

  /** @format uint32 */
  offset: number;
  userAddress: string | null;
}

export interface TransactionResponse {
  /** @format uint32 */
  total: number;
  transactions: Transaction[];
}

export interface UserBalanceRequest {
  gaugeAddress: string;
  userAddress: string;
}

export interface UserBalancesResponse {
  historyBalance: HistoryBalance;
}
