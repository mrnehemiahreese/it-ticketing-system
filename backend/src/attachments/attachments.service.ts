import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Attachment } from './entities/attachment.entity';
import { CreateAttachmentInput } from './dto/create-attachment.input';
import { User } from '../users/entities/user.entity';
import { Role } from '../common/enums/role.enum';
import * as fs from 'fs/promises';
import * as path from 'path';

@Injectable()
export class AttachmentsService {
  constructor(
    @InjectRepository(Attachment)
    private attachmentsRepository: Repository<Attachment>,
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
      console.error('Error deleting file:', error);
    }

    await this.attachmentsRepository.remove(attachment);
    return true;
  }

  async handleFileUpload(file: any, ticketId: string, userId: string): Promise<Attachment> {
    const uploadDir = path.join(process.cwd(), 'uploads', ticketId);

    // Create directory if it doesn't exist
    await fs.mkdir(uploadDir, { recursive: true });

    const filename = `${Date.now()}-${file.originalname}`;
    const filepath = path.join(uploadDir, filename);

    // Save file
    await fs.writeFile(filepath, file.buffer);

    // Store relative path instead of absolute path
    const relativePath = path.join('uploads', ticketId, filename);

    return this.create({
      filename: file.originalname,
      filepath: relativePath,
      mimetype: file.mimetype,
      size: file.size,
      ticketId,
    }, userId);
  }
}
