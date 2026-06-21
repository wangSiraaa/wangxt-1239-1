import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { ScheduleListComponent } from './schedule-list.component';

const routes: Routes = [{ path: '', component: ScheduleListComponent }];

@NgModule({
  declarations: [ScheduleListComponent],
  imports: [SharedModule, RouterModule.forChild(routes)]
})
export class ScheduleModule {}
