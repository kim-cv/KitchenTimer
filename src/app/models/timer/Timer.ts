import { ITimer } from './ITimer';
import { TimerStatus } from './ENUM_TimerStatus';

export class Timer implements ITimer {

    public state: TimerStatus = TimerStatus.IDLE;

    public id = 0;
    public name = '';
    public saveTimer = false;

    private _timerLengthInSeconds = 0;
    set timerLengthInSeconds(value) {
        this._timerLengthInSeconds = value;
        this.CalculateRemainingSeconds();
    }
    get timerLengthInSeconds() {
        return this._timerLengthInSeconds;
    }

    private _timerProgressInSeconds = 0;
    private set timerProgressInSeconds(value) {
        this._timerProgressInSeconds = value;
        this.CalculateRemainingSeconds();
    }
    private get timerProgressInSeconds() {
        return this._timerProgressInSeconds;
    }

    private _remainingSeconds: number;
    get remainingSeconds(): number {
        return this._remainingSeconds;
    }

    public remainingTimeFormattet: string;

    public startTime: Date | null = null;

    constructor(
        _shouldSaveTimer: boolean,
        _id: number,
        _name: string,
        _timerLengthInSeconds: number
    ) {
        this.saveTimer = _shouldSaveTimer;
        this.id = _id;
        this.name = _name;
        this.timerLengthInSeconds = _timerLengthInSeconds;
    }

    private CalculateRemainingSeconds() {
        this._remainingSeconds = (this.timerLengthInSeconds - this.timerProgressInSeconds);
        this.FormatRemainingSecondsAsHumanReadable();
    }

    private FormatRemainingSecondsAsHumanReadable() {
        const readableTime = new Date(null);
        readableTime.setSeconds(this.remainingSeconds);
        this.remainingTimeFormattet = readableTime.toISOString().substr(11, 8);
    }

    public Count() {
        if (this.remainingSeconds <= 0) {
            this.Done();
        } else {
            this.timerProgressInSeconds += 1;
        }
    }


    Start() {
        this.state = TimerStatus.COUNTING;
        this.startTime = new Date();
    }

    Pause() {
        this.state = TimerStatus.PAUSED;
    }

    Reset() {
        this.timerProgressInSeconds = 0;
        this.state = TimerStatus.IDLE;
        this.startTime = null;
    }

    Resume(previousStartTime: Date) {
        const secondsBetweenTwoDates = Math.round((new Date().getTime() - previousStartTime.getTime()) / 1000);
        console.log('Resume() secondsBetweenTwoDates', secondsBetweenTwoDates);
        console.log('Resume() timerLengthInSeconds', this.timerLengthInSeconds);
        this.timerProgressInSeconds = (secondsBetweenTwoDates > this.timerLengthInSeconds) ? this.timerLengthInSeconds : secondsBetweenTwoDates;
        console.log('Resume() remainingSeconds', this.remainingSeconds);
    }

    public Done() {
        this.startTime = null;
        this.state = TimerStatus.DONE;
    }


    Update(name: string, lengthInSeconds: number, saveTimer: boolean) {
        this.name = name;
        this.timerLengthInSeconds = lengthInSeconds;
        this.saveTimer = saveTimer;
    }

    toJSON() {
        return {
            id: this.id,
            name: this.name,
            timerLengthInSeconds: this.timerLengthInSeconds,
            state: this.state,
            startTime: this.startTime
        };
    }
}
