import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import { Response } from 'express';

@Catch(HttpException)
export class CustomExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse<Response>();
    response.statusCode = exception.getStatus();
    console.log(exception.getResponse(),'exception.getResponse()');
    

    // 告诉 TypeScript：“将 exception.getResponse() 的结果强制当作 { message: string[] } 类型处理”
    const res = exception.getResponse() as { message: string[] };
    response.json({
      code: exception.getStatus(),
      message: 'fail',
      data: res?.message?.join ? res?.message?.join(',') : exception.message
    }).end();
  }
}