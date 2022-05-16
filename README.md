<h1 align="center"></h1>

<div align="center">
  <a href="http://nestjs.com/" target="_blank">
    <img src="https://nestjs.com/img/logo_text.svg" width="150" alt="Nest Logo" />
  </a>
</div>

<h3 align="center">NestJS Logger for Google Cloud Run</h3>

<div align="center">
  <a href="https://nestjs.com" target="_blank">
    <img src="https://img.shields.io/badge/built%20with-NestJs-red.svg" alt="Built with NestJS">
  </a>
</div>

## Installation

1. Install the dependency
```
yarn add @nest-gcr/logger
```

2. Register the module

```typescript
import { Module } from '@nestjs/common';
import { LoggerModule } from '@nest-gcr/logger';

@Module({
  imports: [LoggerModule]
})
export class AppModule {}
```

## Usage

Use it anywhere in your application. You have access to two providers:

```typescript
import { Inject, Injectable } from '@nestjs/common';
import { LOGGER, Logger } from '@nest-gcr/logger'

@Injectable()
export class MyProvider {
  constructor(
    @Inject(LOGGER.PROVIDERS.LOGGER) logger: Logger,
    @Inject(LOGGER.PROVIDERS.REQUEST_LOGGER) requestLogger: Logger
  ) {}
  
  foo () {
    this.requestLogger.debug('Hello World!')
  }
}
```

## Configuration on Google Cloud RUN

In order for logs to be correctly logged to Google Cloud Logging from Cloud Run instances, you need to set the following environment variable into your container:

```
LOGGER_DRIVER=gcp
```

## Change Log

See [Changelog](CHANGELOG.md) for more information.

## Contributing

Contributions welcome! See [Contributing](CONTRIBUTING.md).

## Author

**John Biundo (Y Prospect on [Discord](https://discord.gg/G7Qnnhy))**

## License

Licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
