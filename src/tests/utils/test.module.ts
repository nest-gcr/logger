import { Module } from '@nestjs/common';
import { LoggerModule } from '../../logger.module';
import { TestController } from './test.controller';

@Module({
  imports: [LoggerModule],
  controllers: [TestController],
})
export class TestModule {}
