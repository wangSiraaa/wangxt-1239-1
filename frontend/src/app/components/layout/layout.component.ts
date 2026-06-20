import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { User } from '../../models';

@Component({
  selector: 'app-layout',
  template: `
    <nz-layout style="min-height:100vh;">
      <nz-sider nzCollapsible nzWidth="220">
        <div style="height:64px;display:flex;align-items:center;justify-content:center;background:#001529;">
          <span style="color:#fff;font-size:16px;font-weight:600;">印染配方管理</span>
        </div>
        <ul nz-menu nzTheme="dark" nzMode="inline" [nzSelectedKeys]="[selectedKey]" (nzClick)="onMenuClick($event)">
          <li nz-menu-item nzMatchRouter nzMatchRouterExact key="/formula">
            <i nz-icon nzType="file-text"></i>
            <span>配方管理</span>
          </li>
          <li nz-menu-item nzMatchRouter key="/sample">
            <i nz-icon nzType="experiment"></i>
            <span>小样测试</span>
          </li>
          <li nz-menu-item nzMatchRouter key="/auxiliary">
            <i nz-icon nzType="database"></i>
            <span>助剂档案</span>
          </li>
          <li nz-menu-item nzMatchRouter key="/stock">
            <i nz-icon nzType="stock"></i>
            <span>库存管理</span>
          </li>
          <li nz-menu-item nzMatchRouter key="/wastewater">
            <i nz-icon nzType="cloud"></i>
            <span>废水排放</span>
          </li>
          <li nz-menu-item nzMatchRouter key="/schedule">
            <i nz-icon nzType="schedule"></i>
            <span>生产排产</span>
          </li>
        </ul>
      </nz-sider>
      <nz-layout>
        <nz-header style="background:#fff;padding:0 24px;display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid #f0f0f0;">
          <nz-breadcrumb>
            <nz-breadcrumb-item>首页</nz-breadcrumb-item>
            <nz-breadcrumb-item>{{ pageTitle }}</nz-breadcrumb-item>
          </nz-breadcrumb>
          <div style="display:flex;align-items:center;gap:16px;">
            <span>{{ currentUser?.realName }}（{{ currentUser?.roleName }}）</span>
            <button nz-button nzType="link" (click)="onLogout()">退出登录</button>
          </div>
        </nz-header>
        <nz-content style="padding:24px;">
          <router-outlet></router-outlet>
        </nz-content>
      </nz-layout>
    </nz-layout>
  `
})
export class LayoutComponent implements OnInit {
  currentUser: User | null = null;
  selectedKey = '/formula';
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
    const url = this.router.url.split('?')[0];
    this.selectedKey = url;
    this.pageTitle = this.titleMap[url] || '配方管理';
  }

  onMenuClick(event: any): void {
    const key = event.item?.keys?.[0] || event.key;
    if (key) {
      this.selectedKey = key;
      this.pageTitle = this.titleMap[key] || '';
    }
  }

  onLogout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
