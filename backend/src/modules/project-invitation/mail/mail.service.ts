import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';

interface SendInvitationParams {
  to: string;
  projectName: string;
  token: string;
  inviterName: string;
}

@Injectable()
export class MailService {
    constructor(
        private mailerService: MailerService,
        private configService: ConfigService,
    ) {}

    async sendInvitation({ to, projectName, token, inviterName }: SendInvitationParams) {
    const frontendUrl = this.configService.get<string>('FRONTEND_URL');
    const acceptUrl = `${frontendUrl}/invitations/accept?token=${token}`;

    await this.mailerService.sendMail({
    to,
    subject: `${inviterName} đã mời bạn tham gia dự án "${projectName}" trên Collab PMS`,
    html: `
    <div style="background-color: #f4f5f7; padding: 40px 0; font-family: Arial, sans-serif;">
        <div style="max-width: 600px; margin: 0 auto;">
            <div style="text-align: center; margin-bottom: 24px;">
                <span style="font-size: 24px; font-weight: 700; color: #5663ee;">⚡ Collab PMS</span>
            </div>

            <div style="background: #ffffff; border-radius: 8px; padding: 40px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                <p style="font-size: 18px; margin-top: 0;">👋 Xin chào,</p>
                
                <h2 style="font-size: 22px; font-weight: 700; color: #172b4d; margin-bottom: 8px;">
                ${inviterName} đã mời bạn tham gia dự án trên Collab PMS
                </h2>

                <div style="border: 1px solid #e0e0e0; border-radius: 8px; padding: 12px 16px; margin: 20px 0;">
                    <span style="font-size: 20px;">📋</span>
                    <span style="font-size: 16px; font-weight: 600; color: #172b4d;">${projectName}</span>
                </div>

                <p style="color: #555; font-size: 15px;">
                Collab PMS là công cụ quản lý dự án và công việc dành cho nhóm của bạn.
                </p>

                <div style="text-align: center; margin: 32px 0;">
                <a href="${acceptUrl}"
                    style="background-color: #5663ee; color: white; padding: 14px 0;
                        text-decoration: none; border-radius: 6px; font-size: 16px;
                        font-weight: 600; display: block; text-align: center;">
                    Chấp nhận lời mời
                </a>
                </div>

                <p style="color: #888; font-size: 13px; text-align: center; margin-bottom: 0;">
                Lời mời có hiệu lực trong <strong>7 ngày</strong>. 
                Nếu bạn không muốn nhận email này, hãy bỏ qua.
                </p>
            </div>
        </div>
    </div>
    `,
});
}
}