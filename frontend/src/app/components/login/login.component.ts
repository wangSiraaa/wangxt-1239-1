import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  template: `
    <div style="min-height:100vh;display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg,#1677ff 0%,#0958d9 100%);">
      <nz-card style="width:400px;border-radius:12px;">
        <div style="text-align:center;margin-bottom:24px;">
          <h1 style="color:#1677ff;margin:0 0 8px;">印染配方管理系统</h1>
          <p style="color:#8c8c8c;margin:0;">Dyeing Formula Management System</p>
        </div>
        <form nz-form [nzLayout]="'vertical'" (ngSubmit)="onLogin()">
          <nz-form-item>
            <nz-form-label>用户名</nz-form-label>
            <nz-form-control>
              <input nz-input [(ngModel)]="username" name="username" placeholder="请输入用户名"/>
            </nz-form-control>
          </nz-form-item>
          <nz-form-item>
            <nz-form-label>密码</nz-form-label>
            <nz-form-control>
              <input nz-input type="password" [(ngModel)]="password" name="password" placeholder="请输入密码"/>
            </nz-form-control>
          </nz-form-item>
          <nz-form-item>
            <nz-form-control>
              <button nz-button nzType="primary" nzBlock [nzLoading]="loading">登 录</button>
            </nz-form-control>
          </nz-form-item>
        </form>
        <div style="color:#8c8c8c;font-size:12px;text-align:center;">
          测试账号：tech01(工艺员) / lab01(实验室) / env01(环保员) / prod01(生产主管) / admin
        </div>
      </nz-card>
    </div>
  `
})
export class LoginComponent {
  username = 'tech01';
  password = '123456';
  loading = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private message: NzMessageService
  ) {}

  onLogin(): void {
    if (!this.username || !this.password) {
      this.message.warning('请输入用户名和密码');
      return;
    }
    this.loading = true;
    this.authService.login(this.username, this.password).subscribe({
      next: () => {
        this.message.success('登录成功');
        this.router.navigate(['/formula']);
      },
      error: (err) => {
        this.loading = false;
        this.message.error(err.message || '登录失败');
      }
    });
  }
}
