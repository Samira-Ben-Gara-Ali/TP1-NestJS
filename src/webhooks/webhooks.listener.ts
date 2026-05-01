// webhooks/webhooks.listener.ts
import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { WebhooksService } from './webhooks.service';
import type {CvEventPayload} from "../cvs/entities/cvEventPayload.interface";

@Injectable()
export class WebhooksListener {
  private readonly logger = new Logger(WebhooksListener.name);

  constructor(private readonly webhooksService: WebhooksService) {}

  @OnEvent('cv.created')
  async handleCvCreated(payload: CvEventPayload) {
    this.logger.log(
      `CV créé, envoi vers service IA : cvId=${payload.entityId}`,
    );
    await this.webhooksService.sendToAiService(payload);
  }
}
