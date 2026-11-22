import { Args, Context, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { Loaders } from '../../graphql/loaders/loaders.factory';
import { ExperienceModel } from '../experience/models/experience.model';
import { ProjectModel } from '../project/models/project.model';
import { SkillCategory } from '../skill/models/skill-category.enum';
import { SkillGroupModel, SkillModel } from '../skill/models/skill.model';
import { SkillService } from '../skill/skill.service';
import { LinkModel } from './models/link.model';
import { ProfileModel } from './models/profile.model';
import { ProfileService } from './profile.service';

@Resolver(() => ProfileModel)
export class ProfileResolver {
  constructor(
    private readonly profiles: ProfileService,
    private readonly skillService: SkillService,
  ) {}

  @Query(() => ProfileModel, {
    description: 'Профиль специалиста (по умолчанию — владелец визитки)',
  })
  profile(
    @Args('slug', { type: () => String, nullable: true }) slug?: string | null,
  ): Promise<ProfileModel> {
    return this.profiles.getBySlug(slug);
  }

  @ResolveField(() => [LinkModel], { description: 'Контакты и профессиональные ресурсы' })
  links(
    @Parent() profile: ProfileModel,
    @Context('loaders') loaders: Loaders,
  ): Promise<LinkModel[]> {
    return loaders.linksByProfileId.load(profile.id);
  }

  @ResolveField(() => [SkillModel])
  async skills(
    @Parent() profile: ProfileModel,
    @Context('loaders') loaders: Loaders,
    @Args('category', { type: () => SkillCategory, nullable: true })
    category?: SkillCategory | null,
  ): Promise<SkillModel[]> {
    const skills = await loaders.skillsByProfileId.load(profile.id);
    return this.skillService.filterByCategory(skills, category);
  }

  @ResolveField(() => [SkillGroupModel], { description: 'Навыки, сгруппированные по категориям' })
  async skillGroups(
    @Parent() profile: ProfileModel,
    @Context('loaders') loaders: Loaders,
  ): Promise<SkillGroupModel[]> {
    const skills = await loaders.skillsByProfileId.load(profile.id);
    return this.skillService.groupByCategory(skills);
  }

  @ResolveField(() => [ExperienceModel], { description: 'Опыт работы, начиная с последнего места' })
  experience(
    @Parent() profile: ProfileModel,
    @Context('loaders') loaders: Loaders,
  ): Promise<ExperienceModel[]> {
    return loaders.experiencesByProfileId.load(profile.id);
  }

  @ResolveField(() => [ProjectModel])
  projects(
    @Parent() profile: ProfileModel,
    @Context('loaders') loaders: Loaders,
  ): Promise<ProjectModel[]> {
    return loaders.projectsByProfileId.load(profile.id);
  }
}
