import { Field, ID, ObjectType } from '@nestjs/graphql';
import { SkillCategory } from './skill-category.enum';

@ObjectType('Skill')
export class SkillModel {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field(() => SkillCategory)
  category: SkillCategory;
}

@ObjectType('SkillGroup', { description: 'Навыки, сгруппированные по категории' })
export class SkillGroupModel {
  @Field(() => SkillCategory)
  category: SkillCategory;

  @Field(() => [SkillModel])
  skills: SkillModel[];
}
