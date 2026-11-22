import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType('Project')
export class ProjectModel {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field()
  description: string;

  @Field(() => String, { nullable: true, description: 'Ссылка на работающий проект' })
  url: string | null;

  @Field(() => String, { nullable: true, description: 'Ссылка на репозиторий' })
  repositoryUrl: string | null;

  @Field(() => [String])
  technologies: string[];
}
