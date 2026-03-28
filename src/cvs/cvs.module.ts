import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { CvsService } from './cvs.service';
import { CvsController } from './cvs.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CvEntity } from './entities/cv.entity';
import { AuthMiddleware } from '../auth/auth.middleware';

@Module({
  controllers: [CvsController],
  providers: [CvsService],
  imports: [TypeOrmModule.forFeature([CvEntity])],
})
export class CvModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware)
      .forRoutes('cvs');
  }
}