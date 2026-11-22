import { Field, ID, ObjectType, registerEnumType } from '@nestjs/graphql';
import { LinkKind } from '@prisma/client';

registerEnumType(LinkKind, { name: 'LinkKind', description: 'Тип контакта / ресурса' });

@ObjectType('Link', { description: 'Контакт или профессиональный ресурс' })
export class LinkModel {
  @Field(() => ID)
  id: string;

  @Field(() => LinkKind)
  kind: LinkKind;

  @Field()
  label: string;

  @Field()
  url: string;
}
