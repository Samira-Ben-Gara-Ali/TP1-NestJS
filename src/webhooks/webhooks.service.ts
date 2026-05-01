// webhooks/webhooks.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { CvEventPayload } from '../cvs/entities/cvEventPayload.interface';

@Injectable()
export class WebhooksService {
  private readonly logger = new Logger(WebhooksService.name);

  constructor(private readonly httpService: HttpService) {}

  async sendToAiService(payload: CvEventPayload): Promise<void> {
    try {
      await firstValueFrom(
        this.httpService.post('http://localhost:4000/analyze', {
          cvId: payload.entityId,
          filePath: payload.path,
        }),
      );
      this.logger.log(`✅ Envoyé au service IA : cvId=${payload.entityId}`);
    } catch (error) {
      this.logger.error(`❌ Erreur envoi service IA`, error.message);
    }
  }
}
