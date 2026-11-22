import { Field, GraphQLISODateTime, ID, ObjectType } from '@nestjs/graphql';

@ObjectType('Achievement')
export class AchievementModel {
  @Field(() => ID)
  id: string;

  @Field()
  text: string;
}

@ObjectType('Experience')
export class ExperienceModel {
  @Field(() => ID)
  id: string;

  @Field()
  company: string;

  @Field(() => String, { nullable: true, description: 'Чем занимается компания / продукт' })
  companyDescription: string | null;

  @Field()
  position: string;

  @Field(() => GraphQLISODateTime)
  startDate: Date;

  @Field(() => GraphQLISODateTime, { nullable: true, description: 'null — работаю сейчас' })
  endDate: Date | null;
}
