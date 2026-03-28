import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';

import { UsersService } from '../users/users.service';
import { CvsService } from '../cvs/cvs.service';
import { SkillsService } from '../skills/skills.service';

import {
  randEmail,
  randUserName,
  randPassword,
  randFirstName,
  randLastName,
  randNumber,
  randJobTitle,
  randSkill,
} from '@ngneat/falso';

import { SkillEntity } from '../skills/entities/skill.entity';
import { UserEntity } from '../users/entities/user.entity';
import * as bcrypt from 'bcrypt';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);

  const userService = app.get(UsersService);
  const cvService = app.get(CvsService);
  const skillService = app.get(SkillsService);

  // =========================
  // CREATE SKILLS
  // =========================
  const skills: SkillEntity[] = [];

  for (let i = 0; i < 5; i++) {
    const designation = randSkill();

    // éviter doublons
    const exists = await skillService.findAll();
    if (exists.some((s) => s.designation === designation)) continue;

    const skill = await skillService.create({ designation });
    skills.push(skill);
  }

  console.log('Skills created:', skills.length);

  // =========================
  // CREATE USERS
  // =========================
  const users: UserEntity[] = [];

  for (let i = 0; i < 3; i++) {
    const rawPassword = randPassword();
    const hashedPassword = await bcrypt.hash(rawPassword, 10);

    const user = await userService.create({
      username: randUserName(),
      email: randEmail().toLowerCase(),
      password: hashedPassword,
      role: 'user',
    });

    const savedUser = await userService.findOne(user.id);

    if (!savedUser) {
      throw new Error('User not found after creation');
    }

    users.push(savedUser);
  }

  console.log('Users created:', users.length);

  // =========================
  // CREATE CVS
  // =========================
  for (let i = 0; i < 10; i++) {
    const user = users[Math.floor(Math.random() * users.length)];

    const randomSkills = skills
      .sort(() => 0.5 - Math.random())
      .slice(0, 2);

    await cvService.createCv(
      {
        firstname: randFirstName(),
        name: randLastName(),
        age: randNumber({ min: 18, max: 60 }),
        cin: randNumber({ min: 10000000, max: 99999999 }),
        job: randJobTitle(),
        skills: randomSkills,
      },
      user,
    );
  }

  console.log('CVs created');

  console.log('✅ Seed terminé');

  await app.close();
}

bootstrap();