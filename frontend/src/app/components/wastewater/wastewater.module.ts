import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { WastewaterListComponent } from './wastewater-list.component';

const routes: Routes = [{ path: '', component: WastewaterListComponent }];

@NgModule({
  declarations: [WastewaterListComponent],
  imports: [SharedModule, RouterModule.forChild(routes)]
})
export class WastewaterModule {}
