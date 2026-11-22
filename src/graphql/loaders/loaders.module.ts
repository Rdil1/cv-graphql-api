import { Module } from '@nestjs/common';
import { ExperienceModule } from '../../modules/experience/experience.module';
import { ProfileModule } from '../../modules/profile/profile.module';
import { ProjectModule } from '../../modules/project/project.module';
import { SkillModule } from '../../modules/skill/skill.module';
import { LoadersFactory } from './loaders.factory';

@Module({
  imports: [ProfileModule, SkillModule, ExperienceModule, ProjectModule],
  providers: [LoadersFactory],
  exports: [LoadersFactory],
})
export class LoadersModule {}
