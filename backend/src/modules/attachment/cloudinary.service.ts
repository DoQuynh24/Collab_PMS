import { Injectable, BadRequestException, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import { Readable } from 'stream';

const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg', 'image/jpg', 'image/png', 'image/gif',
  'image/webp', 'image/svg+xml', 'image/bmp', 'image/tiff',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'text/plain', 'text/csv', 'text/markdown',
  'application/zip', 'application/x-zip-compressed',
  'application/x-rar-compressed', 'application/x-7z-compressed',
]);

const BLOCKED_EXTENSIONS = new Set([
  'exe', 'bat', 'cmd', 'com', 'msi', 'msp', 'scr', 'pif', 'vbs', 'vbe',
  'js', 'jse', 'wsf', 'wsh', 'ps1', 'ps2', 'psc1', 'psc2',
  'reg', 'inf', 'ins', 'isp', 'lnk', 'dll', 'sys', 'drv',
  'jar', 'class', 'sh', 'bash', 'zsh', 'fish',
  'php', 'asp', 'aspx', 'jsp', 'cgi', 'pl', 'py', 'rb',
  'hta', 'html', 'htm',
]);

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB

@Injectable()
export class CloudinaryService implements OnModuleInit {
  constructor(private configService: ConfigService) {}

  onModuleInit() {
    cloudinary.config({
      cloud_name: this.configService.get<string>('CLOUDINARY_CLOUD_NAME'),
      api_key: this.configService.get<string>('CLOUDINARY_API_KEY'),
      api_secret: this.configService.get<string>('CLOUDINARY_API_SECRET'),
    });
  }

  validateFile(file: Express.Multer.File): void {
    if (file.size > MAX_FILE_SIZE) {
      throw new BadRequestException(`File too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB.`);
    }

    const ext = file.originalname.split('.').pop()?.toLowerCase() ?? '';
    if (BLOCKED_EXTENSIONS.has(ext)) {
      throw new BadRequestException(`File type .${ext} is not allowed for security reasons.`);
    }

    if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
      throw new BadRequestException(`File type "${file.mimetype}" is not supported.`);
    }
  }

  getFileType(mimetype: string): 'image' | 'document' | 'other' {
    if (mimetype.startsWith('image/')) return 'image';
    if (
      mimetype === 'application/pdf' ||
      mimetype.includes('word') ||
      mimetype.includes('excel') ||
      mimetype.includes('spreadsheet') ||
      mimetype.includes('powerpoint') ||
      mimetype.includes('presentation') ||
      mimetype === 'text/plain' ||
      mimetype === 'text/csv'
    ) return 'document';
    return 'other';
  }

  async uploadFile(file: Express.Multer.File, folder = 'collab-pms'): Promise<UploadApiResponse> {
    this.validateFile(file);

    const isImage = file.mimetype.startsWith('image/');
    const resourceType = isImage ? 'image' : 'raw';

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: resourceType,
          use_filename: true,
          unique_filename: true,
          timeout: 120000,
        },
        (error, result) => {
          if (error) return reject(error);
          resolve(result!);
        },
      );

      const readable = new Readable();
      readable.push(file.buffer);
      readable.push(null);
      readable.pipe(uploadStream);
    });
  }

  async deleteFile(publicId: string, resourceType: 'image' | 'raw' = 'raw'): Promise<void> {
    await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
  }
}
