import { UserRoleEnum } from '../../users/enums/user-role.enum';

export interface JwtPayloadDto {
  username: string;
  role: UserRoleEnum;
  email: string;
}