import { Skill, SkillCategory } from '@prisma/client';
import { SkillService } from './skill.service';

const skill = (name: string, category: SkillCategory, sortOrder: number): Skill => ({
  id: name,
  profileId: 'p1',
  name,
  category,
  sortOrder,
});

describe('SkillService', () => {
  const service = new SkillService();
  const skills = [
    skill('TypeScript', SkillCategory.LANGUAGE, 0),
    skill('React', SkillCategory.FRONTEND, 1),
    skill('Go', SkillCategory.LANGUAGE, 2),
  ];

  it('groups skills by category preserving order', () => {
    const groups = service.groupByCategory(skills);
    expect(groups.map((g) => g.category)).toEqual([SkillCategory.LANGUAGE, SkillCategory.FRONTEND]);
    expect(groups[0].skills.map((s) => s.name)).toEqual(['TypeScript', 'Go']);
  });

  it('returns all skills when category is not set', () => {
    expect(service.filterByCategory(skills)).toHaveLength(3);
    expect(service.filterByCategory(skills, SkillCategory.FRONTEND).map((s) => s.name)).toEqual([
      'React',
    ]);
  });
});
