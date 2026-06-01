import { prisma } from './db';

const PROVIDERS = [
  'google',
  'github',
  'facebook',
  'twitter',
  'apple',
  'microsoft',
  'discord',
  'slack',
  'auth0',
  'azure',
] as const;
export type SocialProvider = (typeof PROVIDERS)[number];

export async function findSocialAccount(
  provider: SocialProvider,
  providerId: string
) {
  return prisma.socialAccount.findUnique({
    where: { provider_providerId: { provider, providerId } },
    include: { user: true },
  });
}

export async function linkSocialAccount(
  userId: string,
  provider: SocialProvider,
  providerId: string,
  email?: string,
  name?: string
) {
  return prisma.socialAccount.create({
    data: { userId, provider, providerId, email, name },
  });
}

export async function unlinkSocialAccount(
  userId: string,
  provider: SocialProvider
) {
  await prisma.socialAccount.deleteMany({ where: { userId, provider } });
}

export async function getLinkedAccounts(userId: string) {
  return prisma.socialAccount.findMany({ where: { userId } });
}

export const OAUTH_CONFIGS = {
  google: {
    authorizeUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
    tokenUrl: 'https://oauth2.googleapis.com/token',
    userInfoUrl: 'https://www.googleapis.com/oauth2/v2/userinfo',
    scopes: ['openid', 'email', 'profile'],
  },
  github: {
    authorizeUrl: 'https://github.com/login/oauth/authorize',
    tokenUrl: 'https://github.com/login/oauth/access_token',
    userInfoUrl: 'https://api.github.com/user',
    scopes: ['read:user', 'user:email'],
  },
  facebook: {
    authorizeUrl: 'https://www.facebook.com/v12.0/dialog/oauth',
    tokenUrl: 'https://graph.facebook.com/v12.0/oauth/access_token',
    userInfoUrl: 'https://graph.facebook.com/me?fields=id,name,email,picture',
    scopes: ['email', 'public_profile'],
  },
};
