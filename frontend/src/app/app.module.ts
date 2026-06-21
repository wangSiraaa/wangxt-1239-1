import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzMessageModule, NzMessageService } from 'ng-zorro-antd/message';

import { IconDefinition } from '@ant-design/icons-angular';
import {
  FileTextOutline, ExperimentOutline, DatabaseOutline, StockOutline,
  CloudOutline, ScheduleOutline, PlusOutline, SearchOutline, ReloadOutline,
  ArrowLeftOutline, LogoutOutline, UserOutline, SafetyOutline
} from '@ant-design/icons-angular/icons';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';

const icons: IconDefinition[] = [
  FileTextOutline, ExperimentOutline, DatabaseOutline, StockOutline,
  CloudOutline, ScheduleOutline, PlusOutline, SearchOutline, ReloadOutline,
  ArrowLeftOutline, LogoutOutline, UserOutline, SafetyOutline
];

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    NzIconModule.forRoot(icons),
    AppRoutingModule
  ],
  providers: [NzMessageService],
  bootstrap: [AppComponent]
})
export class AppModule {}
