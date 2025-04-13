import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Inject,
  UnauthorizedException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { Permission } from './user/entities/permission.entity';
import { UnLoginException } from './unlogin.filter';
interface JwtUserData {
  userId: number;
  username: string;
  roles: string[];
  email:string,
  permissions: Permission[];
}

declare module 'express' {
  interface Request {
    user: JwtUserData;
  }
}

@Injectable()
export class LoginGuard implements CanActivate {
  @Inject()
  private reflector: Reflector;

  @Inject(JwtService)
  private jwtService: JwtService;

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request: Request = context.switchToHttp().getRequest();

    // reflector--通过反射机制从控制器类或方法上获取元数据（metadata）
    // 检查 context.getClass()（控制器类) 和
    // context.getHandler()（当前方法）是否被装饰器标记为需要登录
    const requireLogin = this.reflector.getAllAndOverride('require-login', [
      context.getClass(),
      context.getHandler(),
    ]);

    if (!requireLogin) {
      return true;
    }

    const authorization = request.headers.authorization;
    if (!authorization) {
      throw new UnLoginException();
    }

    try {
      // 验证token
      const token = authorization.split(' ')[1];
      const data = this.jwtService.verify(token);
      request.user = {
        userId: data.userId,
        username: data.username,
        roles: data.roles,
        email: data.email,
        permissions: data.permissions,
      };
      return true;
    } catch (error) {
      throw new UnauthorizedException('token 失效，请重新登录');
    }
  }
}
