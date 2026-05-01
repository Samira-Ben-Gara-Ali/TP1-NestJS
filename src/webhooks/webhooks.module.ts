// webhooks/webhooks.module.ts
import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { WebhooksController } from './webhooks.controller';
import { WebhooksService } from './webhooks.service';
import { WebhooksListener } from './webhooks.listener';
import { CvsModule } from '../cvs/cvs.module';

@Module({
  imports: [HttpModule, CvsModule],
  controllers: [WebhooksController],
  providers: [WebhooksService, WebhooksListener],
})
export class WebhooksModule {}
