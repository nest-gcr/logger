import { Resolver, Query } from '@nestjs/graphql';
import { Logger } from 'winston';
import { Inject } from '@nestjs/common';
import { LOGGER } from '../../constants';

@Resolver()
export class TestResolver {

  constructor(
    @Inject(LOGGER.PROVIDERS.REQUEST_LOGGER) private readonly logger: Logger,
  ) {
  }

  @Query(returns => String)
  foo() {
    this.logger.debug('This is a query resolver');
    return 'bar';
  }

  @Query(returns => String)
  someRootError() {
    throw new Error('This is an error!');
  }
}
