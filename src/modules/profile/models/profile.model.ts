import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType('Profile')
export class ProfileModel {
  @Field(() => ID)
  id: string;

  @Field()
  slug: string;

  @Field()
  name: string;

  @Field({ description: 'Специализация одной строкой' })
  headline: string;

  @Field({ description: 'Краткое описание' })
  description: string;
}
