import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { SampleListComponent } from './sample-list.component';

const routes: Routes = [{ path: '', component: SampleListComponent }];

@NgModule({
  declarations: [SampleListComponent],
  imports: [SharedModule, RouterModule.forChild(routes)]
})
export class SampleModule {}
