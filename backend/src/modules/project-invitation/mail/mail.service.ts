import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import sgMail from '@sendgrid/mail';

interface SendInvitationParams {
  to: string;
  projectName: string;
  token: string;
  inviterName: string;
}

interface SendJoinRequestParams {
  to: string;
  projectName: string;
  requesterName: string;
  requesterEmail: string;
  projectId: string;
}

interface SendMentionParams {
  to: string;
  mentionerName: string;
  taskTitle: string;
  projectName: string;
  projectId: string;
  taskId: number;
  commentContent: string;
}

interface SendAssignedTaskParams {
  to: string;
  assignerName: string;
  taskTitle: string;
  projectName: string;
  projectId: string;
  taskId: number;
}

interface SendStatusChangedParams {
  to: string;
  changerName: string;
  taskTitle: string;
  projectName: string;
  projectId: string;
  taskId: number;
  newStatusName: string;
  oldStatusName?: string;
}

interface SendDeadlineUpcomingParams {
  to: string;
  taskTitle: string;
  projectName: string;
  projectId: string;
  taskId: number;
  deadline: string;
}

interface SendOverdueTaskParams {
  to: string;
  taskTitle: string;
  projectName: string;
  projectId: string;
  taskId: number;
  deadline: string;
}

@Injectable()
export class MailService implements OnModuleInit {
  private from: string;

  constructor(private configService: ConfigService) {}

  onModuleInit() {
    sgMail.setApiKey(this.configService.get<string>('SENDGRID_API_KEY') || '');
    this.from = this.configService.get<string>('MAIL_FROM') || 'Collab PMS <noreply@collabpms.app>';
  }

  async sendJoinRequest({ to, projectName, requesterName, requesterEmail, projectId }: SendJoinRequestParams) {
    const frontendUrl = this.configService.get<string>('FRONTEND_URL');
    const membersUrl = `${frontendUrl}/projects/${projectId}/settings/members?tab=requests`;

    await sgMail.send({
      from: this.from,
      to,
      subject: `${requesterName} muốn tham gia dự án "${projectName}" trên Collab PMS`,
      html: `
      <div style="background-color: #f4f5f7; padding: 40px 0; font-family: Arial, sans-serif;">
        <div style="max-width: 600px; margin: 0 auto;">
          <div style="text-align: center; margin-bottom: 24px;">
            <span style="font-size: 24px; font-weight: 700; color: #5663ee;">⚡ Collab PMS</span>
          </div>
          <div style="background: #ffffff; border-radius: 8px; padding: 40px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
            <p style="font-size: 18px; margin-top: 0;">👋 Xin chào,</p>
            <h2 style="font-size: 20px; font-weight: 700; color: #172b4d; margin-bottom: 8px;">
              Có người muốn tham gia dự án của bạn
            </h2>
            <div style="border: 1px solid #e0e0e0; border-radius: 8px; padding: 12px 16px; margin: 20px 0;">
              <p style="margin: 0; font-size: 15px; color: #172b4d;">
                <strong>${requesterName}</strong> (<a href="mailto:${requesterEmail}" style="color: #5663ee;">${requesterEmail}</a>)
                đã gửi yêu cầu tham gia dự án <strong>"${projectName}"</strong>.
              </p>
            </div>
            <p style="color: #555; font-size: 14px; margin-bottom: 28px;">
              Vào trang quản lý thành viên để xem xét và xử lý yêu cầu này.
            </p>
            <div style="text-align: center; margin-bottom: 24px;">
              <a href="${membersUrl}"
                style="background-color: #5663ee; color: white; padding: 12px 40px;
                  text-decoration: none; border-radius: 6px; font-size: 15px; font-weight: 600;
                  display: inline-block;">
                Đến dự án
              </a>
            </div>
            <p style="color: #888; font-size: 12px; text-align: center; margin-bottom: 0;">
              Yêu cầu có hiệu lực trong <strong>7 ngày</strong>. Nếu bạn không muốn xử lý, hãy bỏ qua email này.
            </p>
          </div>
        </div>
      </div>
      `,
    });
  }

  async sendInvitation({ to, projectName, token, inviterName }: SendInvitationParams) {
    const frontendUrl = this.configService.get<string>('FRONTEND_URL');
    const acceptUrl = `${frontendUrl}/invitations/accept?token=${token}`;

    await sgMail.send({
      from: this.from,
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
                style="background-color: #5663ee; color: white; padding: 14px 40px;
                  text-decoration: none; border-radius: 6px; font-size: 16px;
                  font-weight: 600; display: inline-block;">
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

  async sendMention({ to, mentionerName, taskTitle, projectName, projectId, taskId, commentContent }: SendMentionParams) {
    const frontendUrl = this.configService.get<string>('FRONTEND_URL');
    const taskUrl = `${frontendUrl}/projects/${projectId}/board?taskId=${taskId}`;

    await sgMail.send({
      from: this.from,
      to,
      subject: `${mentionerName} đã nhắc đến bạn trong dự án "${projectName}"`,
      html: `
      <div style="background-color: #f4f5f7; padding: 40px 0; font-family: Arial, sans-serif;">
        <div style="max-width: 600px; margin: 0 auto;">
          <div style="text-align: center; margin-bottom: 24px;">
            <span style="font-size: 24px; font-weight: 700; color: #5663ee;">⚡ Collab PMS</span>
          </div>
          <div style="background: #ffffff; border-radius: 8px; padding: 40px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
            <p style="font-size: 18px; margin-top: 0;">👋 Xin chào,</p>
            <h2 style="font-size: 20px; font-weight: 700; color: #172b4d; margin-bottom: 8px;">
              ${mentionerName} đã nhắc đến bạn trong một bình luận
            </h2>
            <p style="color: #555; font-size: 14px; margin-bottom: 8px;">
              Trong nhiệm vụ <strong>"${taskTitle}"</strong> thuộc dự án <strong>"${projectName}"</strong>:
            </p>
            <div style="border-left: 4px solid #5663ee; padding: 12px 16px; margin: 16px 0; background: #f8f9ff; border-radius: 0 6px 6px 0;">
              <p style="margin: 0; font-size: 14px; color: #374151; font-style: italic;">${commentContent}</p>
            </div>
            <div style="text-align: center; margin: 28px 0;">
              <a href="${taskUrl}"
                style="background-color: #5663ee; color: white; padding: 12px 40px;
                  text-decoration: none; border-radius: 6px; font-size: 15px; font-weight: 600;
                  display: inline-block;">
                Xem bình luận
              </a>
            </div>
          </div>
        </div>
      </div>
      `,
    });
  }

  async sendAssignedTask({ to, assignerName, taskTitle, projectName, projectId, taskId }: SendAssignedTaskParams) {
    const frontendUrl = this.configService.get<string>('FRONTEND_URL');
    const taskUrl = `${frontendUrl}/projects/${projectId}/board?taskId=${taskId}`;

    await sgMail.send({
      from: this.from,
      to,
      subject: `Bạn được giao nhiệm vụ "${taskTitle}" trong dự án "${projectName}"`,
      html: `
      <div style="background-color: #f4f5f7; padding: 40px 0; font-family: Arial, sans-serif;">
        <div style="max-width: 600px; margin: 0 auto;">
          <div style="text-align: center; margin-bottom: 24px;">
            <span style="font-size: 24px; font-weight: 700; color: #5663ee;">⚡ Collab PMS</span>
          </div>
          <div style="background: #ffffff; border-radius: 8px; padding: 40px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
            <p style="font-size: 18px; margin-top: 0;">👋 Xin chào,</p>
            <h2 style="font-size: 20px; font-weight: 700; color: #172b4d; margin-bottom: 8px;">
              Bạn vừa được giao một nhiệm vụ mới
            </h2>
            <div style="border: 1px solid #e0e0e0; border-radius: 8px; padding: 16px; margin: 20px 0; background: #f8f9ff;">
              <p style="margin: 0 0 8px 0; font-size: 13px; color: #6b7280;">
                NHIỆM VỤ: <strong style="font-size: 16px; color: #172b4d;">${taskTitle}</strong>
              </p>
              <p style="margin: 8px 0 0 0; font-size: 13px; color: #6b7280;">
                Dự án: <strong style="color: #374151;">${projectName}</strong> · Giao bởi: <strong style="color: #374151;">${assignerName}</strong>
              </p>
            </div>
            <div style="text-align: center; margin: 28px 0;">
              <a href="${taskUrl}"
                style="background-color: #5663ee; color: white; padding: 12px 40px;
                  text-decoration: none; border-radius: 6px; font-size: 15px; font-weight: 600;
                  display: inline-block;">
                Xem nhiệm vụ
              </a>
            </div>
          </div>
        </div>
      </div>
      `,
    });
  }

  async sendStatusChanged({ to, changerName, taskTitle, projectName, projectId, taskId, newStatusName, oldStatusName }: SendStatusChangedParams) {
    const frontendUrl = this.configService.get<string>('FRONTEND_URL');
    const taskUrl = `${frontendUrl}/projects/${projectId}/board?taskId=${taskId}`;

    await sgMail.send({
      from: this.from,
      to,
      subject: `Trạng thái nhiệm vụ "${taskTitle}" đã được thay đổi`,
      html: `
      <div style="background-color: #f4f5f7; padding: 40px 0; font-family: Arial, sans-serif;">
        <div style="max-width: 600px; margin: 0 auto;">
          <div style="text-align: center; margin-bottom: 24px;">
            <span style="font-size: 24px; font-weight: 700; color: #5663ee;">⚡ Collab PMS</span>
          </div>
          <div style="background: #ffffff; border-radius: 8px; padding: 40px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
            <p style="font-size: 18px; margin-top: 0;">👋 Xin chào,</p>
            <h2 style="font-size: 20px; font-weight: 700; color: #172b4d; margin-bottom: 8px;">
              Trạng thái nhiệm vụ của bạn đã được cập nhật
            </h2>
            <div style="border: 1px solid #e0e0e0; border-radius: 8px; padding: 16px; margin: 20px 0; background: #f8f9ff;">
              <p style="margin: 0 0 8px 0; font-size: 13px; color: #6b7280;">
                NHIỆM VỤ: <strong style="font-size: 16px; color: #172b4d;">${taskTitle}</strong>
              </p>
              <p style="margin: 8px 0 0 0; font-size: 13px; color: #6b7280;">
                Dự án: <strong style="color: #374151;">${projectName}</strong>
              </p>
              <p style="margin: 6px 0 0 0; font-size: 13px; color: #6b7280;">
                ${oldStatusName ? `<strong style="color: #9ca3af;">${oldStatusName}</strong> → ` : ''}<strong style="color: #5663ee;">${newStatusName}</strong> · Thay đổi bởi: <strong style="color: #374151;">${changerName}</strong>
              </p>
            </div>
            <div style="text-align: center; margin: 28px 0;">
              <a href="${taskUrl}"
                style="background-color: #5663ee; color: white; padding: 12px 40px;
                  text-decoration: none; border-radius: 6px; font-size: 15px; font-weight: 600;
                  display: inline-block;">
                Xem nhiệm vụ
              </a>
            </div>
          </div>
        </div>
      </div>
      `,
    });
  }

  async sendDeadlineUpcoming({ to, taskTitle, projectName, projectId, taskId, deadline }: SendDeadlineUpcomingParams) {
    const frontendUrl = this.configService.get<string>('FRONTEND_URL');
    const taskUrl = `${frontendUrl}/projects/${projectId}/board?taskId=${taskId}`;

    await sgMail.send({
      from: this.from,
      to,
      subject: `Nhiệm vụ "${taskTitle}" sắp đến hạn vào ngày mai`,
      html: `
      <div style="background-color: #f4f5f7; padding: 40px 0; font-family: Arial, sans-serif;">
        <div style="max-width: 600px; margin: 0 auto;">
          <div style="text-align: center; margin-bottom: 24px;">
            <span style="font-size: 24px; font-weight: 700; color: #5663ee;">⚡ Collab PMS</span>
          </div>
          <div style="background: #ffffff; border-radius: 8px; padding: 40px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
            <p style="font-size: 18px; margin-top: 0;">👋 Xin chào,</p>
            <h2 style="font-size: 20px; font-weight: 700; color: #e53e3e; margin-bottom: 8px;">
              ⏰ Nhiệm vụ của bạn sắp đến hạn
            </h2>
            <p style="color: #555; font-size: 14px; margin-bottom: 16px;">
              Nhiệm vụ dưới đây sẽ đến hạn vào <strong>ngày mai</strong>. Hãy đảm bảo hoàn thành đúng thời hạn.
            </p>
            <div style="border: 1px solid #fed7d7; border-radius: 8px; padding: 16px; margin: 20px 0; background: #fff5f5;">
              <p style="margin: 0 0 8px 0; font-size: 13px; color: #6b7280;">
                NHIỆM VỤ: <strong style="font-size: 16px; color: #172b4d;">${taskTitle}</strong>
              </p>
              <p style="margin: 8px 0 0 0; font-size: 13px; color: #6b7280;">
                Dự án: <strong style="color: #374151;">${projectName}</strong>
              </p>
              <p style="margin: 6px 0 0 0; font-size: 13px; color: #6b7280;">
                Hạn chót: <strong style="color: #e53e3e;">${deadline}</strong>
              </p>
            </div>
            <div style="text-align: center; margin: 28px 0;">
              <a href="${taskUrl}"
                style="background-color: #e53e3e; color: white; padding: 12px 40px;
                  text-decoration: none; border-radius: 6px; font-size: 15px; font-weight: 600;
                  display: inline-block;">
                Xem nhiệm vụ
              </a>
            </div>
            <p style="color: #888; font-size: 12px; text-align: center; margin-bottom: 0;">
              Đây là email nhắc nhở tự động từ Collab PMS.
            </p>
          </div>
        </div>
      </div>
      `,
    });
  }

  async sendOverdueTask({ to, taskTitle, projectName, projectId, taskId, deadline }: SendOverdueTaskParams) {
    const frontendUrl = this.configService.get<string>('FRONTEND_URL');
    const taskUrl = `${frontendUrl}/projects/${projectId}/board?taskId=${taskId}`;

    await sgMail.send({
      from: this.from,
      to,
      subject: `Nhiệm vụ "${taskTitle}" đã quá hạn`,
      html: `
      <div style="background-color: #f4f5f7; padding: 40px 0; font-family: Arial, sans-serif;">
        <div style="max-width: 600px; margin: 0 auto;">
          <div style="text-align: center; margin-bottom: 24px;">
            <span style="font-size: 24px; font-weight: 700; color: #5663ee;">⚡ Collab PMS</span>
          </div>
          <div style="background: #ffffff; border-radius: 8px; padding: 40px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
            <p style="font-size: 18px; margin-top: 0;">👋 Xin chào,</p>
            <h2 style="font-size: 20px; font-weight: 700; color: #dc2626; margin-bottom: 8px;">
              🚨 Nhiệm vụ của bạn đã quá hạn
            </h2>
            <p style="color: #555; font-size: 14px; margin-bottom: 16px;">
              Nhiệm vụ dưới đây đã <strong>quá hạn cần phải hoàn thành</strong>. Vui lòng xử lý sớm nhất có thể.
            </p>
            <div style="border: 1px solid #fca5a5; border-radius: 8px; padding: 16px; margin: 20px 0; background: #fef2f2;">
              <p style="margin: 0 0 8px 0; font-size: 13px; color: #6b7280;">
                NHIỆM VỤ: <strong style="font-size: 16px; color: #172b4d;">${taskTitle}</strong>
              </p>
              <p style="margin: 8px 0 0 0; font-size: 13px; color: #6b7280;">
                Dự án: <strong style="color: #374151;">${projectName}</strong>
              </p>
              <p style="margin: 6px 0 0 0; font-size: 13px; color: #6b7280;">
                Hạn chót: <strong style="color: #dc2626;">${deadline}</strong>
              </p>
            </div>
            <div style="text-align: center; margin: 28px 0;">
              <a href="${taskUrl}"
                style="background-color: #dc2626; color: white; padding: 12px 40px;
                  text-decoration: none; border-radius: 6px; font-size: 15px; font-weight: 600;
                  display: inline-block;">
                Xem nhiệm vụ
              </a>
            </div>
            <p style="color: #888; font-size: 12px; text-align: center; margin-bottom: 0;">
              Đây là email nhắc nhở tự động từ Collab PMS.
            </p>
          </div>
        </div>
      </div>
      `,
    });
  }

  async sendMeetingCancelled({
    to, participantName, meetingTitle, startTime, projectName,
  }: {
    to: string;
    participantName: string;
    meetingTitle: string;
    startTime: string;
    projectName: string;
  }) {
    await sgMail.send({
      from: this.from,
      to,
      subject: `❌ Cuộc họp "${meetingTitle}" đã bị hủy`,
      html: `
      <div style="background-color: #f4f5f7; padding: 40px 0; font-family: Arial, sans-serif;">
        <div style="max-width: 600px; margin: 0 auto;">
          <div style="text-align: center; margin-bottom: 24px;">
            <span style="font-size: 24px; font-weight: 700; color: #5663ee;">⚡ Collab PMS</span>
          </div>
          <div style="background: #ffffff; border-radius: 8px; padding: 40px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
            <p style="font-size: 18px; margin-top: 0;">👋 Xin chào ${participantName},</p>
            <h2 style="font-size: 20px; font-weight: 700; color: #dc2626; margin-bottom: 8px;">
              ❌ Cuộc họp đã bị hủy
            </h2>
            <div style="border: 1px solid #fee2e2; border-radius: 8px; padding: 16px; margin: 20px 0; background: #fef2f2;">
              <p style="margin: 0 0 8px 0; font-size: 16px; font-weight: 700; color: #172b4d;">📅 ${meetingTitle}</p>
              <p style="margin: 6px 0; font-size: 13px; color: #6b7280;">⏰ Thời gian dự kiến: <strong style="color: #374151;">${startTime}</strong></p>
              <p style="margin: 6px 0; font-size: 13px; color: #6b7280;">📁 Dự án: <strong style="color: #374151;">${projectName}</strong></p>
            </div>
            <p style="color: #555; font-size: 14px; margin-bottom: 20px;">
              Cuộc họp này đã bị hủy bởi người tổ chức. Bạn có thể xem các cuộc họp khác trong lịch dự án.
            </p>
            <p style="color: #888; font-size: 12px; text-align: center; margin-bottom: 0;">
              Đây là email thông báo tự động từ Collab PMS.
            </p>
          </div>
        </div>
      </div>
      `,
      });
  }

  async sendMeetingReminder({
    to, participantName, meetingTitle, startTime, projectName, projectId,
  }: {
    to: string;
    participantName: string;
    meetingTitle: string;
    startTime: string;
    projectName: string;
    projectId: string;
  }) {
    const frontendUrl = this.configService.get<string>('FRONTEND_URL');
    const calendarUrl = `${frontendUrl}/projects/${projectId}/calendar`;

    await sgMail.send({
      from: this.from,
      to,
      subject: `⏰ Nhắc nhở: Cuộc họp "${meetingTitle}" sắp bắt đầu`,
      html: `
      <div style="background-color: #f4f5f7; padding: 40px 0; font-family: Arial, sans-serif;">
        <div style="max-width: 600px; margin: 0 auto;">
          <div style="text-align: center; margin-bottom: 24px;">
            <span style="font-size: 24px; font-weight: 700; color: #5663ee;">⚡ Collab PMS</span>
          </div>
          <div style="background: #ffffff; border-radius: 8px; padding: 40px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
            <p style="font-size: 18px; margin-top: 0;">👋 Xin chào ${participantName},</p>
            <h2 style="font-size: 20px; font-weight: 700; color: #d97706; margin-bottom: 8px;">
              ⏰ Cuộc họp sắp bắt đầu
            </h2>
            <p style="color: #555; font-size: 14px; margin-bottom: 20px;">
              Cuộc họp <strong>"${meetingTitle}"</strong> sẽ bắt đầu sau <strong style="color:#d97706;">5 phút</strong> nữa.
            </p>
            <div style="border: 1px solid #fef3c7; border-radius: 8px; padding: 16px; margin: 20px 0; background: #fffbeb;">
              <p style="margin: 0 0 8px 0; font-size: 16px; font-weight: 700; color: #172b4d;">📅 ${meetingTitle}</p>
              <p style="margin: 6px 0; font-size: 13px; color: #6b7280;">⏰ Thời gian: <strong style="color: #374151;">${startTime}</strong></p>
              <p style="margin: 6px 0; font-size: 13px; color: #6b7280;">📁 Dự án: <strong style="color: #374151;">${projectName}</strong></p>
            </div>
            <div style="text-align: center; margin: 28px 0;">
              <a href="${calendarUrl}"
                style="background-color: #d97706; color: white; padding: 12px 40px;
                  text-decoration: none; border-radius: 6px; font-size: 15px; font-weight: 600;
                  display: inline-block;">
                Vào phòng họp
              </a>
            </div>
            <p style="color: #888; font-size: 12px; text-align: center; margin-bottom: 0;">
              Đây là email nhắc nhở tự động từ Collab PMS.
            </p>
          </div>
        </div>
      </div>
      `,
    });
  }

  async sendMeetingScheduled({
    to, creatorName, meetingTitle, description, startTime, projectId, meetingId,
  }: {
    to: string; creatorName: string; meetingTitle: string;
    description: string; startTime: string; projectId: string; meetingId: number;
  }) {
    const frontendUrl = this.configService.get<string>('FRONTEND_URL');
    const calendarUrl = `${frontendUrl}/projects/${projectId}/calendar`;

    await sgMail.send({
      from: this.from,
      to,
      subject: `📅 ${creatorName} đã đặt lịch cuộc họp: "${meetingTitle}"`,
      html: `
      <div style="background-color: #f4f5f7; padding: 40px 0; font-family: Arial, sans-serif;">
        <div style="max-width: 600px; margin: 0 auto;">
          <div style="text-align: center; margin-bottom: 24px;">
            <span style="font-size: 24px; font-weight: 700; color: #5663ee;">⚡ Collab PMS</span>
          </div>
          <div style="background: #ffffff; border-radius: 8px; padding: 40px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
            <p style="font-size: 18px; margin-top: 0;">👋 Xin chào,</p>
            <h2 style="font-size: 20px; font-weight: 700; color: #172b4d; margin-bottom: 8px;">
              Bạn được mời tham gia cuộc họp
            </h2>
            <div style="border: 1px solid #e0e0e0; border-radius: 8px; padding: 16px; margin: 20px 0; background: #f8f9ff;">
              <p style="margin: 0 0 8px 0; font-size: 16px; font-weight: 700; color: #172b4d;">📅 ${meetingTitle}</p>
              <p style="margin: 6px 0; font-size: 13px; color: #6b7280;">⏰ Thời gian: <strong style="color: #374151;">${startTime}</strong></p>
              <p style="margin: 6px 0; font-size: 13px; color: #6b7280;">👤 Tổ chức bởi: <strong style="color: #374151;">${creatorName}</strong></p>
              ${description ? `<p style="margin: 10px 0 0 0; font-size: 13px; color: #374151; border-top: 1px solid #e5e7eb; padding-top: 10px;">${description}</p>` : ''}
            </div>
            <div style="text-align: center; margin: 28px 0;">
              <a href="${calendarUrl}"
                style="background-color: #5663ee; color: white; padding: 12px 40px;
                  text-decoration: none; border-radius: 6px; font-size: 15px; font-weight: 600;
                  display: inline-block;">
                Xem lịch họp
              </a>
            </div>
            <p style="color: #888; font-size: 12px; text-align: center; margin-bottom: 0;">
              Đây là email thông báo tự động từ Collab PMS.
            </p>
          </div>
        </div>
      </div>
      `,
    });
  }

}
