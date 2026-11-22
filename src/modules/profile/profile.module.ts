import { Module } from '@nestjs/common';
import { SkillModule } from '../skill/skill.module';
import { ProfileRepository } from './profile.repository';
import { ProfileResolver } from './profile.resolver';
import { ProfileService } from './profile.service';

@Module({
  imports: [SkillModule],
  providers: [ProfileRepository, ProfileService, ProfileResolver],
  exports: [ProfileRepository],
})
export class ProfileModule {}
