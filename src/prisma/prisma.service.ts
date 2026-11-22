import { Inject, Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Prisma, PrismaClient } from '@prisma/client';
import { APP_CONFIG, AppConfig } from '../config/app.config';

@Injectable()
export class PrismaService
  extends PrismaClient<Prisma.PrismaClientOptions, 'query'>
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger('Prisma');

  constructor(@Inject(APP_CONFIG) config: AppConfig) {
    super({ log: config.logQueries ? [{ emit: 'event', level: 'query' }] : [] });
    if (config.logQueries) {
      this.$on('query', (event) => this.logger.log(`${event.query} — ${event.duration}ms`));
    }
  }

  async onModuleInit(): Promise<void> {
    await this.$connect();
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }
}
