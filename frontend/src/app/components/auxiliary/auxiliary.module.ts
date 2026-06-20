import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AppModule } from '../../app.module';
import { AuxiliaryListComponent } from './auxiliary-list.component';

const routes: Routes = [{ path: '', component: AuxiliaryListComponent }];

@NgModule({
  declarations: [AuxiliaryListComponent],
  imports: [CommonModule, AppModule, RouterModule.forChild(routes)]
})
export class AuxiliaryModule {}
