import { makeAutoObservable } from 'mobx'

export enum UserPerformanceStep {
    Root,
    Deposit,
    Withdraw,
}

export enum BalanceType {
    All,
    Unlocked,
    Locked,
}

export class GaugesUserPerformanceStore {

    public step = UserPerformanceStep.Root

    public balanceType = BalanceType.All

    constructor() {
        makeAutoObservable(this, {}, {
            autoBind: true,
        })
    }

    public dispose(): void {
        this.step = UserPerformanceStep.Root
    }

    public setStep(value: UserPerformanceStep): void {
        this.step = value
    }

    public setRoot(): void {
        this.step = UserPerformanceStep.Root
    }

    public setWithdraw(): void {
        this.step = UserPerformanceStep.Withdraw
    }

    public setDeposit(): void {
        this.step = UserPerformanceStep.Deposit
    }

    public setAllBalance(): void {
        this.balanceType = BalanceType.All
    }

    public setLocked(): void {
        this.balanceType = BalanceType.Locked
    }

    public setUnlocked(): void {
        this.balanceType = BalanceType.Unlocked
    }

}
