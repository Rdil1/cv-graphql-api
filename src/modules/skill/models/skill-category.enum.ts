import { registerEnumType } from '@nestjs/graphql';
import { SkillCategory } from '@prisma/client';

registerEnumType(SkillCategory, {
  name: 'SkillCategory',
  description: 'Категория навыка',
});

export { SkillCategory };
