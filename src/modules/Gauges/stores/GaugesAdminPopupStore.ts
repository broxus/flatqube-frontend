import { makeAutoObservable } from 'mobx'

export enum GaugesAdminPopupNav {
    Speed, EndDate,
}

export class GaugesAdminPopupStore {

    public visible = false

    public endDateConfirmationVisible = false

    public activeTab = GaugesAdminPopupNav.Speed

    constructor() {
        makeAutoObservable(this, {}, {
            autoBind: true,
        })
    }

    public setActiveTab(value: GaugesAdminPopupNav): void {
        this.activeTab = value
    }

    public show(): void {
        this.visible = true
    }

    public hide(): void {
        this.visible = false
        this.endDateConfirmationVisible = false
        this.activeTab = GaugesAdminPopupNav.Speed
    }

    public showEndDateConfirmation(): void {
        this.endDateConfirmationVisible = true
    }

    public hideEndDateConfirmation(): void {
        this.endDateConfirmationVisible = false
    }

}
