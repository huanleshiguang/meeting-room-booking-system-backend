import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  Logger,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { Request, Response } from 'express';
@Injectable()
export class InvokeRecordInterceptor implements NestInterceptor {
  private readonly logger = new Logger(InvokeRecordInterceptor.name);

  // ExecutionContext 是 NestJS 提供的执行上下文，它可能是 HTTP、RPC（微服务）、WebSocket 等场景。
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    // .switchToHttp() 表示切换到 HTTP 上下文，因为 NestJS 还支持其他协议（如 gRPC、WebSocket）
    // 从 HTTP 上下文中获取 原生的 HTTP Request 对象（默认是 Express 的 Request，如果使用 Fastify 则是 Fastify 的 Request）
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();

    const userAgent = request.header['user-agent'];

    const { ip, method, path } = request;

    this.logger.debug(
      `${method} ${path} ${ip} ${userAgent}: ${context.getClass().name} ${
        context.getHandler().name
      } invoked...`,
    );

    // 为什么 interceptor 里能拿到 user 信息呢？
    // 因为这是在 LoginGuard 里从 jwt 取出来放到 request.user 的，而 Guard 在 interceptor 之前调用
    this.logger.debug(
      `user: ${request.user?.userId}, ${request.user?.username}`,
    );

    const now = Date.now();

    // ***************************pipe*************************************
    // pipe 是 RxJS 的核心方法，用于 组合多个操作符，对 Observable 的数据流进行 链式处理。
    // next.handle() 返回一个 Observable（代表即将发生的响应数据流）。
    // .pipe() 允许你在这个 Observable 上应用一系列操作（如 tap、map、catchError 等）。

    // eg:
    // next.handle().pipe(
    //operator1(), // 第一个操作
    //operator2(), // 第二个操作
    // operator3(), // 第三个操作
    //);
    // 相当于 数据流 → operator1 处理 → operator2 处理 → operator3 处理 → 返回最终结果

    /**
     * tap 是 RxJS 的 副作用（Side Effect）操作符，它：
      不会修改数据流，只是“偷看”数据并执行一些额外操作（如日志记录、调试、缓存等）。
      适用于日志记录、调试、性能监控等场景。

      tap	执行额外操作（如日志）	❌ 不影响数据流
      map	转换数据（如格式化响应）	✅ 会修改数据
     */
    return next.handle().pipe(
      tap((res) => {
        this.logger.debug(
          `${method} ${path} ${ip} ${userAgent}: ${response.statusCode}: ${Date.now() - now}ms`,
        );
        this.logger.debug(`Response: ${JSON.stringify(res)}`);
      }),
    );
  }
}
