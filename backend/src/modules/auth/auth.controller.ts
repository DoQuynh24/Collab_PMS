import { Controller, Get, Patch, Body, Req, UseGuards, Res, Query } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import express from 'express';
import { ConfigService } from '@nestjs/config';
import { IsOptional, IsString } from 'class-validator';

class UpdateProfileDto {
  @IsOptional() @IsString() name?: string;
}

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private configService: ConfigService,
  ) {}

  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth() {}

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleCallback(@Req() req: any, @Res() res: express.Response) {
    const { access_token } = await this.authService.loginGoogle(req.user);
    const frontendUrl = this.configService.get<string>('FRONTEND_URL');
    res.redirect(`${frontendUrl}/home?token=${access_token}`);
  }

  @Get('me')
  @UseGuards(AuthGuard('jwt'))
  async getMe(@Req() req: any) {
    return req.user;
  }

  @Patch('me')
  @UseGuards(AuthGuard('jwt'))
  async updateMe(@Req() req: any, @Body() dto: UpdateProfileDto) {
    return this.authService.updateName(Number(req.user.sub), dto.name);
  }

  @Get('search')
  @UseGuards(AuthGuard('jwt'))
  async searchUsers(@Query('q') q: string) {
    return this.authService.searchUsers(q);
  }
  
}