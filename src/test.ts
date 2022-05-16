import { NestFactory } from '@nestjs/core';
import { Controller, Get, Module, Req } from '@nestjs/common';
import { LoggerModule } from './logger.module';
import {Request} from 'express';

@Controller()
class TestController {

  @Get('/test')
  handleRequest(@Req() req: Request) {
    // tslint:disable-next-line:no-console
    console.log(JSON.stringify(req.headers, null, 2));
    return req.headers;
  }
}

@Module({
  imports: [LoggerModule],
  controllers: [TestController],
})
class AppModule {}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(process.env.PORT || 3000);
}
bootstrap();
