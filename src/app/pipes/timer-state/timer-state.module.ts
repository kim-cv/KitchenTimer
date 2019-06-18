import { NgModule  } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TimerStatePipe } from './timer-state.pipe';

@NgModule({
    declarations: [TimerStatePipe],
    imports: [CommonModule],
    exports: [TimerStatePipe]
})

export class TimerStatePipeModule {
}
