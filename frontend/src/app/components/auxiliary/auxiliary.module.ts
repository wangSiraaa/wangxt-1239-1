import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { AuxiliaryListComponent } from './auxiliary-list.component';

const routes: Routes = [{ path: '', component: AuxiliaryListComponent }];

@NgModule({
  declarations: [AuxiliaryListComponent],
  imports: [SharedModule, RouterModule.forChild(routes)]
})
export class AuxiliaryModule {}
