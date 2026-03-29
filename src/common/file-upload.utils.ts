import { v4 as uuidv4 } from 'uuid';
import { Request } from 'express';
import { extname } from 'path';

export const editFileName = (
  req: Request,
  file: Express.Multer.File,
  callback: (error: Error | null, filename: string) => void,
): void => {
  const fileExt = extname(file.originalname);
  const randomName = uuidv4() + fileExt;

  callback(null, randomName);
};

export const imageFileFilter = (
  req: Request,
  file: Express.Multer.File,
  callback: (error: Error | null, acceptFile: boolean) => void,
): void => {
  if (!/\.(jpg|jpeg|png|gif)$/.test(file.originalname)) {
    return callback(new Error('Only image files are allowed!'), false);
  }

  callback(null, true);
};
