import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Response } from 'express';
import { map, Observable } from 'rxjs';

@Injectable()
export class FormatResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {

    const response = context.switchToHttp().getResponse<Response>();


    // 先放行请求（next.handle()）--再修改响应
    // 通过 map 操作符修改了原始响应数据（data），将其包装为固定格式
    return next.handle().pipe(map((data)=>{
      return {
        code:response.statusCode,
        message:'success',
        data
      }
    }))


  }
}
