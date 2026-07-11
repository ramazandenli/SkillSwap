import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const SKILLS = [
  ['Graphic Design', 'Design'],
  ['Illustration', 'Design'],
  ['Video Editing', 'Media'],
  ['Photography', 'Media'],
  ['Writing', 'Media'],
  ['Animation', 'Media'],
  ['Music Production', 'Music'],
  ['Voice Acting', 'Music'],
  ['Playing Guitar', 'Music'],
  ['Playing Piano', 'Music'],
  ['Singing', 'Music'],
  ['Speaking English', 'Language'],
  ['Speaking Turkish', 'Language'],
  ['Speaking Spanish', 'Language'],
  ['Speaking German', 'Language'],
  ['Game Development', 'Tech'],
  ['UI/UX Design', 'Design'],
  ['Web Development', 'Tech'],
  ['Data Analysis', 'Tech'],
  ['IT Troubleshooting', 'Tech'],
  ['Playing Football', 'Sports'],
  ['Playing Basketball', 'Sports'],
] as const;

async function main() {
  for (const [name, category] of SKILLS) {
    await prisma.skill.upsert({
      where: { name },
      update: { category },
      create: { name, category },
    });
  }
  console.log(`Seeded ${SKILLS.length} skills.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
