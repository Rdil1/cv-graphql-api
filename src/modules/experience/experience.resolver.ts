import { Context, Int, Parent, ResolveField, Resolver } from '@nestjs/graphql';
import { Loaders } from '../../graphql/loaders/loaders.factory';
import { ExperienceService } from './experience.service';
import { AchievementModel, ExperienceModel } from './models/experience.model';

@Resolver(() => ExperienceModel)
export class ExperienceResolver {
  constructor(private readonly experience: ExperienceService) {}

  @ResolveField(() => [AchievementModel], { description: 'Достижения на этом месте работы' })
  achievements(
    @Parent() experience: ExperienceModel,
    @Context('loaders') loaders: Loaders,
  ): Promise<AchievementModel[]> {
    return loaders.achievementsByExperienceId.load(experience.id);
  }

  @ResolveField(() => String, {
    description: 'Период работы, например «Январь 2025 — Сентябрь 2025»',
  })
  period(@Parent() experience: ExperienceModel): string {
    return this.experience.formatPeriod(experience);
  }

  @ResolveField(() => Boolean, { description: 'Работаю здесь сейчас' })
  isCurrent(@Parent() experience: ExperienceModel): boolean {
    return this.experience.isCurrent(experience);
  }

  @ResolveField(() => Int, { description: 'Длительность в месяцах (включительно)' })
  durationMonths(@Parent() experience: ExperienceModel): number {
    return this.experience.durationMonths(experience);
  }
}
