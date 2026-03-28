import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { verify } from 'jsonwebtoken';
import { RequestWithUser } from './types/request-with-user.type';
@Injectable()
export class AuthMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const request = req as unknown as RequestWithUser;

    const token = request.headers['auth-user'] as string | undefined;

    if (!token) {
      throw new UnauthorizedException('Token missing');
    }

    try {
      const decoded = verify(token, 'SECRET') as { id?: number };

      if (!decoded.id) {
        throw new UnauthorizedException('Invalid token payload');
      }

      request.user = { id: decoded.id };

      next();
    } catch {
      throw new UnauthorizedException('Invalid token');
    }
  }
}