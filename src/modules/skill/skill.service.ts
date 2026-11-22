import { Injectable } from '@nestjs/common';
import { Skill, SkillCategory } from '@prisma/client';

export interface SkillGroup {
  category: SkillCategory;
  skills: Skill[];
}

@Injectable()
export class SkillService {
  filterByCategory(skills: Skill[], category?: SkillCategory | null): Skill[] {
    return category ? skills.filter((skill) => skill.category === category) : skills;
  }

  groupByCategory(skills: Skill[]): SkillGroup[] {
    const groups = new Map<SkillCategory, Skill[]>();
    for (const skill of skills) {
      const group = groups.get(skill.category);
      if (group) group.push(skill);
      else groups.set(skill.category, [skill]);
    }
    return [...groups].map(([category, items]) => ({ category, skills: items }));
  }
}
