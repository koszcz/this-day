// Skills grow when you use them. Each level makes the matching work a little better.
export type SkillId = 'foraging' | 'labor' | 'fishing' | 'crafting';

export const SKILL_NAMES: Record<SkillId, string> = {
  foraging: 'Foraging',
  labor: 'Labor',
  fishing: 'Fishing',
  crafting: 'Crafting',
};

export type Skills = Record<SkillId, number>;

export const newSkills = (): Skills => ({ foraging: 0, labor: 0, fishing: 0, crafting: 0 });

export const skillLevel = (xp: number) => 1 + Math.floor(Math.sqrt(xp / 6));

// Returns true when the gain lifts the skill to a new level.
export function gainXp(skills: Skills, id: SkillId, amount: number): boolean {
  const before = skillLevel(skills[id]);
  skills[id] += amount;
  return skillLevel(skills[id]) > before;
}

// Work gets 4% faster per level above 1, down to at most 60% of the base time.
export const speedFactor = (xp: number) => Math.max(0.6, 1 - (skillLevel(xp) - 1) * 0.04);
