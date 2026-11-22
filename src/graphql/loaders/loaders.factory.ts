import { Injectable } from '@nestjs/common';
import { ExperienceRepository } from '../../modules/experience/experience.repository';
import { ProfileRepository } from '../../modules/profile/profile.repository';
import { ProjectRepository } from '../../modules/project/project.repository';
import { SkillRepository } from '../../modules/skill/skill.repository';
import { createGroupedLoader } from './create-grouped-loader';

@Injectable()
export class LoadersFactory {
  constructor(
    private readonly profiles: ProfileRepository,
    private readonly skills: SkillRepository,
    private readonly experiences: ExperienceRepository,
    private readonly projects: ProjectRepository,
  ) {}

  create() {
    return {
      linksByProfileId: createGroupedLoader(
        (ids: readonly string[]) => this.profiles.findLinksByProfileIds(ids),
        (link) => link.profileId,
      ),
      skillsByProfileId: createGroupedLoader(
        (ids: readonly string[]) => this.skills.findByProfileIds(ids),
        (skill) => skill.profileId,
      ),
      experiencesByProfileId: createGroupedLoader(
        (ids: readonly string[]) => this.experiences.findByProfileIds(ids),
        (experience) => experience.profileId,
      ),
      achievementsByExperienceId: createGroupedLoader(
        (ids: readonly string[]) => this.experiences.findAchievementsByExperienceIds(ids),
        (achievement) => achievement.experienceId,
      ),
      projectsByProfileId: createGroupedLoader(
        (ids: readonly string[]) => this.projects.findByProfileIds(ids),
        (project) => project.profileId,
      ),
    };
  }
}

export type Loaders = ReturnType<LoadersFactory['create']>;
