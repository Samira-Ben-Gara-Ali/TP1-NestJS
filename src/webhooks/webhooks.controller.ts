// webhooks/webhooks.controller.ts
import {
  Controller,
  Post,
  Body,
  Headers,
  ForbiddenException,
} from '@nestjs/common';
import { CvsService } from '../cvs/cvs.service';

interface CvValidationBody {
  cvId: number;
  isValid: boolean;
  reason: string;
  score: number;
}

@Controller('webhooks')
export class WebhooksController {
  constructor(private readonly cvsService: CvsService) {}

  @Post('cv-validation')
  async validateCv(
    @Headers('x-webhook-secret') secret: string,
    @Body() body: CvValidationBody,
  ) {
    if (secret !== process.env.WEBHOOK_SECRET) {
      throw new ForbiddenException('Invalid webhook secret');
    }

    console.log(
      `🔔 Webhook reçu : cvId=${body.cvId}, isValid=${body.isValid}, score=${body.score}`,
    );
    console.log(`📝 Raison : ${body.reason}`);

    const status = body.isValid ? 'VALID' : 'REJECTED';
    await this.cvsService.updateCvStatus(body.cvId, {
      status,
      aiReason: body.reason,
      aiScore: body.score,
    });

    console.log(`✅ CV ${body.cvId} status → ${status}`);
    return { received: true };
  }
}
