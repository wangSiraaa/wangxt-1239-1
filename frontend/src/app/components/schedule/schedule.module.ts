import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AppModule } from '../../app.module';
import { ScheduleListComponent } from './schedule-list.component';

const routes: Routes = [{ path: '', component: ScheduleListComponent }];

@NgModule({
  declarations: [ScheduleListComponent],
  imports: [CommonModule, AppModule, RouterModule.forChild(routes)]
})
export class ScheduleModule {}
