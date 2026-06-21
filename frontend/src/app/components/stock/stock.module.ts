import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { StockListComponent } from './stock-list.component';

const routes: Routes = [{ path: '', component: StockListComponent }];

@NgModule({
  declarations: [StockListComponent],
  imports: [SharedModule, RouterModule.forChild(routes)]
})
export class StockModule {}
