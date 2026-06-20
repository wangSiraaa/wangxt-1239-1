import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AppModule } from '../../app.module';
import { WastewaterListComponent } from './wastewater-list.component';

const routes: Routes = [{ path: '', component: WastewaterListComponent }];

@NgModule({
  declarations: [WastewaterListComponent],
  imports: [CommonModule, AppModule, RouterModule.forChild(routes)]
})
export class WastewaterModule {}
