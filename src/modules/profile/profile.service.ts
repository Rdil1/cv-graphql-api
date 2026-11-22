import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Profile } from '@prisma/client';
import { APP_CONFIG, AppConfig } from '../../config/app.config';
import { ProfileRepository } from './profile.repository';

@Injectable()
export class ProfileService {
  constructor(
    private readonly profiles: ProfileRepository,
    @Inject(APP_CONFIG) private readonly config: AppConfig,
  ) {}

  async getBySlug(slug?: string | null): Promise<Profile> {
    const target = slug ?? this.config.defaultProfileSlug;
    const profile = await this.profiles.findBySlug(target);
    if (!profile) {
      throw new NotFoundException(`Profile "${target}" not found`);
    }
    return profile;
  }
}
