import { IsOptional, IsString, IsEmail, IsNotEmpty, IsBoolean, IsDate, IsISO8601 } from 'class-validator';
import { Type } from 'class-transformer';

export class UsersDto {
  @IsOptional()
  @Type(() => Number) 
  user_id?: number;

  @IsOptional() 
  @IsString()
  name?: string;

  @IsNotEmpty() 
  @IsEmail() 
  @IsString()
  email: string;

  @IsOptional() 
  @IsString()
  google_id?: string;

  @IsOptional() 
  @IsString()
  password?: string;

  @IsOptional() 
  @IsDate() 
  @Type(() => Date) 
  created_at?: Date;

  @IsOptional()
  @IsString()
  picture?: string;
}