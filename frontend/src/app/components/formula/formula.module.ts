import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { FormulaListComponent } from './formula-list.component';
import { FormulaDetailComponent } from './formula-detail.component';

const routes: Routes = [
  { path: '', component: FormulaListComponent },
  { path: 'edit/:id', component: FormulaDetailComponent },
  { path: 'edit', component: FormulaDetailComponent },
  { path: 'view/:id', component: FormulaDetailComponent }
];

@NgModule({
  declarations: [FormulaListComponent, FormulaDetailComponent],
  imports: [
    SharedModule,
    RouterModule.forChild(routes)
  ]
})
export class FormulaModule {}
