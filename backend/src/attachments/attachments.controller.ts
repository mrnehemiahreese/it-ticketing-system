import {
  Controller,
  Post,
  Get,
  Param,
  UploadedFile,
  UseInterceptors,
  Body,
  UseGuards,
  BadRequestException,
  NotFoundException,
  Res,
  StreamableFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { createReadStream } from 'fs';
import { join } from 'path';
import { AttachmentsService } from './attachments.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';

@Controller('attachments')
export class AttachmentsController {
  constructor(private readonly attachmentsService: AttachmentsService) {}

  @Post('upload')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile() file: any,
    @Body('ticketId') ticketId: string,
    @CurrentUser() user: User,
  ) {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    if (!ticketId) {
      throw new BadRequestException('Ticket ID is required');
    }

    return this.attachmentsService.handleFileUpload(file, ticketId, user.id);
  }

  @Get(':id')
  async downloadFile(
    @Param('id') id: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<StreamableFile> {
    const attachment = await this.attachmentsService.findOne(id);
    
    if (!attachment) {
      throw new NotFoundException('Attachment not found');
    }

    // Handle both absolute and relative paths
    let filePath = attachment.filepath;
    if (!filePath.startsWith('/')) {
      filePath = join(process.cwd(), filePath);
    }

    const file = createReadStream(filePath);
    
    res.set({
      'Content-Type': attachment.mimetype,
      'Content-Disposition': `inline; filename="${attachment.filename}"`,
    });

    return new StreamableFile(file);
  }
}
