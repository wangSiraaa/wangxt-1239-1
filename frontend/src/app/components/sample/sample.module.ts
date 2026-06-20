import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AppModule } from '../../app.module';
import { SampleListComponent } from './sample-list.component';

const routes: Routes = [{ path: '', component: SampleListComponent }];

@NgModule({
  declarations: [SampleListComponent],
  imports: [CommonModule, AppModule, RouterModule.forChild(routes)]
})
export class SampleModule {}
