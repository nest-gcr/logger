import { Injectable, Module } from '@nestjs/common';

@Injectable()
export class Logger {
  constructor() {
  }
}

@Module({
  providers: [],
  exports: [],
})
export class LoggerModule {}
