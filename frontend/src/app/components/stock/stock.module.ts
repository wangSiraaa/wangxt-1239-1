import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AppModule } from '../../app.module';
import { StockListComponent } from './stock-list.component';

const routes: Routes = [{ path: '', component: StockListComponent }];

@NgModule({
  declarations: [StockListComponent],
  imports: [CommonModule, AppModule, RouterModule.forChild(routes)]
})
export class StockModule {}
