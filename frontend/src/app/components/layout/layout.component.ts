import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AuthService } from '../../services/auth.service';
import { User } from '../../models';

@Component({
  selector: 'app-layout',
  template: `
    <nz-layout style="min-height:100vh;">
      <nz-sider nzCollapsible nzWidth="220">
        <div class="logo">
          <span>印染配方管理</span>
        </div>
        <ul nz-menu nzTheme="dark" nzMode="inline">
          <li nz-menu-item nzMatchRouter [routerLink]="['/formula']">
            <i nz-icon nzType="file-text" nzTheme="outline"></i>
            <span>配方管理</span>
          </li>
          <li nz-menu-item nzMatchRouter [routerLink]="['/sample']">
            <i nz-icon nzType="experiment" nzTheme="outline"></i>
            <span>小样测试</span>
          </li>
          <li nz-menu-item nzMatchRouter [routerLink]="['/auxiliary']">
            <i nz-icon nzType="database" nzTheme="outline"></i>
            <span>助剂档案</span>
          </li>
          <li nz-menu-item nzMatchRouter [routerLink]="['/stock']">
            <i nz-icon nzType="stock" nzTheme="outline"></i>
            <span>库存管理</span>
          </li>
          <li nz-menu-item nzMatchRouter [routerLink]="['/wastewater']">
            <i nz-icon nzType="cloud" nzTheme="outline"></i>
            <span>废水排放</span>
          </li>
          <li nz-menu-item nzMatchRouter [routerLink]="['/schedule']">
            <i nz-icon nzType="schedule" nzTheme="outline"></i>
            <span>生产排产</span>
          </li>
        </ul>
      </nz-sider>
      <nz-layout>
        <nz-header class="header">
          <nz-breadcrumb>
            <nz-breadcrumb-item>首页</nz-breadcrumb-item>
            <nz-breadcrumb-item>{{ pageTitle }}</nz-breadcrumb-item>
          </nz-breadcrumb>
          <div class="user-info">
            <span class="user-name">{{ currentUser?.realName }}（{{ currentUser?.roleName }}）</span>
            <a class="logout-link" (click)="onLogout()">退出登录</a>
          </div>
        </nz-header>
        <nz-content style="padding:24px;">
          <router-outlet></router-outlet>
        </nz-content>
      </nz-layout>
    </nz-layout>
  `,
  styles: [`
    .logo {
      height: 64px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #001529;
      color: #fff;
      font-size: 16px;
      font-weight: 600;
    }
    .header {
      background: #fff;
      padding: 0 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid #f0f0f0;
    }
    .user-info {
      display: flex;
      align-items: center;
      gap: 16px;
    }
    .user-name {
      color: #1f1f1f;
    }
    .logout-link {
      color: #1677ff;
      cursor: pointer;
    }
    .logout-link:hover {
      color: #4096ff;
    }
  `]
})
export class LayoutComponent implements OnInit {
  currentUser: User | null = null;
  pageTitle = '配方管理';

  private titleMap: Record<string, string> = {
    '/formula': '配方管理',
    '/sample': '小样测试',
    '/auxiliary': '助剂档案',
    '/stock': '库存管理',
    '/wastewater': '废水排放',
    '/schedule': '生产排产'
  };

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.updateTitle(this.router.url);
    this.router.events
      .pipe(filter(e => e instanceof NavigationEnd))
      .subscribe(e => this.updateTitle((e as NavigationEnd).urlAfterRedirects));
  }

  private updateTitle(url: string): void {
    const path = '/' + url.split('/').filter(Boolean)[1];
    this.pageTitle = this.titleMap[path] || '配方管理';
  }

  onLogout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
