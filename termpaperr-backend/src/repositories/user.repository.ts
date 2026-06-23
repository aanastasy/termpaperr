import { AppDataSource } from "../config/data-source.js";
import { User } from "../models/user.entity.js";

export async function findUserByEmail(email: string): Promise<User | null> {
  return AppDataSource.getRepository(User).findOne({ where: { email } });
}

export async function findUserById(id: string): Promise<User | null> {
  return AppDataSource.getRepository(User).findOne({ where: { id } });
}

export async function createUser(
  name: string,
  email: string,
  passwordHash: string,
  options: {
    emailVerified?: boolean;
    emailVerification?: { tokenHash: string; tokenExpiresAt: Date };
  } = {},
): Promise<User> {
  const repo = AppDataSource.getRepository(User);
  const emailVerified = options.emailVerified ?? false;
  const user = repo.create({
    name,
    email,
    passwordHash,
    emailVerifiedAt: emailVerified ? new Date() : null,
    emailVerificationTokenHash: emailVerified
      ? null
      : (options.emailVerification?.tokenHash ?? null),
    emailVerificationTokenExpiresAt: emailVerified
      ? null
      : (options.emailVerification?.tokenExpiresAt ?? null),
  });
  return repo.save(user);
}

export async function findUserByVerificationTokenHash(
  tokenHash: string,
): Promise<User | null> {
  return AppDataSource.getRepository(User).findOne({
    where: { emailVerificationTokenHash: tokenHash },
  });
}

export async function markUserEmailVerified(userId: string): Promise<void> {
  await AppDataSource.getRepository(User).update(
    { id: userId },
    {
      emailVerifiedAt: new Date(),
      emailVerificationTokenHash: null,
      emailVerificationTokenExpiresAt: null,
    },
  );
}

export async function setUserEmailVerificationToken(
  userId: string,
  tokenHash: string,
  tokenExpiresAt: Date,
): Promise<void> {
  await AppDataSource.getRepository(User).update(
    { id: userId },
    {
      emailVerificationTokenHash: tokenHash,
      emailVerificationTokenExpiresAt: tokenExpiresAt,
    },
  );
}

export async function deleteUser(id: string): Promise<void> {
  await AppDataSource.getRepository(User).delete(id);
}

export async function updateUserName(id: string, name: string): Promise<void> {
  await AppDataSource.getRepository(User).update({ id }, { name });
}
