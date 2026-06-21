import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { LayoutComponent } from './layout.component';

const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      { path: '', redirectTo: 'formula', pathMatch: 'full' },
      { path: 'formula', loadChildren: () => import('../formula/formula.module').then(m => m.FormulaModule) },
      { path: 'sample', loadChildren: () => import('../sample/sample.module').then(m => m.SampleModule) },
      { path: 'auxiliary', loadChildren: () => import('../auxiliary/auxiliary.module').then(m => m.AuxiliaryModule) },
      { path: 'stock', loadChildren: () => import('../stock/stock.module').then(m => m.StockModule) },
      { path: 'wastewater', loadChildren: () => import('../wastewater/wastewater.module').then(m => m.WastewaterModule) },
      { path: 'schedule', loadChildren: () => import('../schedule/schedule.module').then(m => m.ScheduleModule) }
    ]
  }
];

@NgModule({
  declarations: [LayoutComponent],
  imports: [
    SharedModule,
    RouterModule.forChild(routes)
  ]
})
export class LayoutModule {}
