import { Module } from '@nestjs/common';
import { LoggerModule } from '../../logger.module';
import { TestController } from './test.controller';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { TestResolver } from './test.resolver';
import { LoggerPlugin } from '../../logger.plugin';

@Module({
  imports: [
    LoggerModule,
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: true,
    }),
  ],
  controllers: [TestController],
  providers: [TestResolver, LoggerPlugin],
})
export class TestModule {}
