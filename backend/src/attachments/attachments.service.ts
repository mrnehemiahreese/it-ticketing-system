import { Injectable, NotFoundException, ForbiddenException, Inject, forwardRef, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Attachment } from './entities/attachment.entity';
import { CreateAttachmentInput } from './dto/create-attachment.input';
import { User } from '../users/entities/user.entity';
import { Role } from '../common/enums/role.enum';
import { SlackService } from '../slack/slack.service';
import { Ticket } from '../tickets/entities/ticket.entity';
import { validateFile, sanitizeFilename } from '../common/utils/file-validation';
import * as fs from 'fs/promises';
import * as path from 'path';

@Injectable()
export class AttachmentsService {
  constructor(
    @InjectRepository(Attachment)
    private attachmentsRepository: Repository<Attachment>,
    @InjectRepository(Ticket)
    private ticketsRepository: Repository<Ticket>,
    @Inject(forwardRef(() => SlackService))
    private slackService: SlackService,
  ) {}

  async create(createAttachmentInput: CreateAttachmentInput, userId: string): Promise<Attachment> {
    const attachment = this.attachmentsRepository.create({
      ...createAttachmentInput,
      uploadedById: userId,
    });

    return this.attachmentsRepository.save(attachment);
  }

  async findAll(): Promise<Attachment[]> {
    return this.attachmentsRepository.find({
      relations: ['uploadedBy', 'ticket'],
      order: { createdAt: 'DESC' },
    });
  }

  async findByTicket(ticketId: string): Promise<Attachment[]> {
    return this.attachmentsRepository.find({
      where: { ticketId },
      relations: ['uploadedBy'],
      order: { createdAt: 'ASC' },
    });
  }

  async findOne(id: string): Promise<Attachment> {
    const attachment = await this.attachmentsRepository.findOne({
      where: { id },
      relations: ['uploadedBy', 'ticket'],
    });

    if (!attachment) {
      throw new NotFoundException(`Attachment with ID ${id} not found`);
    }

    return attachment;
  }

  async remove(id: string, user: User): Promise<boolean> {
    const attachment = await this.findOne(id);

    // Only the uploader or admins can delete
    if (attachment.uploadedById !== user.id && !user.roles.includes(Role.ADMIN)) {
      throw new ForbiddenException('You do not have permission to delete this attachment');
    }

    // Delete physical file
    try {
      await fs.unlink(attachment.filepath);
    } catch (error) {
      // Log but don't fail if file doesn't exist
      console.error('Error deleting file:', error);
    }

    await this.attachmentsRepository.remove(attachment);
    return true;
  }

  async handleFileUpload(file: any, ticketId: string, userId: string): Promise<Attachment> {
    // Validate file before processing
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    // Security: Validate file type, size, and extension
    validateFile({
      originalname: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      buffer: file.buffer,
    });

    // Verify ticket exists and user has access
    const ticket = await this.ticketsRepository.findOne({ 
      where: { id: ticketId },
      relations: ['createdBy', 'assignedTo'],
    });
    
    if (!ticket) {
      throw new NotFoundException(`Ticket with ID ${ticketId} not found`);
    }

    const uploadDir = path.join(process.cwd(), 'uploads', ticketId);

    // Create directory if it doesn't exist
    await fs.mkdir(uploadDir, { recursive: true });

    // Security: Sanitize filename to prevent path traversal attacks
    const sanitizedName = sanitizeFilename(file.originalname);
    const filename = `${Date.now()}-${sanitizedName}`;
    const filepath = path.join(uploadDir, filename);

    // Security: Ensure the resolved path is within the uploads directory
    const resolvedPath = path.resolve(filepath);
    const uploadsBase = path.resolve(process.cwd(), 'uploads');
    if (!resolvedPath.startsWith(uploadsBase)) {
      throw new BadRequestException('Invalid file path');
    }

    // Save file
    await fs.writeFile(filepath, file.buffer);

    // Store relative path instead of absolute path
    const relativePath = path.join('uploads', ticketId, filename);

    const attachment = await this.create({
      filename: sanitizedName,
      filepath: relativePath,
      mimetype: file.mimetype,
      size: file.size,
      ticketId,
    }, userId);

    // Upload to Slack if it's an image
    if (file.mimetype?.startsWith('image/')) {
      console.log(`[AttachmentsService] Image upload - ticket ${ticketId}, slackThreadTs: ${ticket?.slackThreadTs || 'NOT SET'}`);
      if (ticket?.slackThreadTs) {
        await this.slackService.uploadAttachmentToSlack(attachment, ticket.slackThreadTs).catch(err => {
          console.error('Failed to upload attachment to Slack:', err);
        });
      } else {
        console.log(`[AttachmentsService] Skipping Slack upload - no slackThreadTs for ticket ${ticketId}`);
      }
    }

    return attachment;
  }
}
