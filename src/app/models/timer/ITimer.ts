import { TimerStatus } from './ENUM_TimerStatus';

export interface ITimer {
    id: number;
    name: string;
    timerLengthInSeconds: number;
    state: TimerStatus;
    startTime: Date;
}
