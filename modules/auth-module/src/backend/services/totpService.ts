import { prisma } from './db';
import { authenticator } from 'otplib';
import qrcode from 'qrcode';

export async function generateTOTPSecret(userId: string) {
  const secret = authenticator.generateSecret();
  await prisma.user.update({
    where: { id: userId },
    data: { totpSecret: secret },
  });

  const user = await prisma.user.findUnique({ where: { id: userId } });
  const otpauth = authenticator.keyuri(user!.email, 'SUKIT', secret);
  const qrCode = await qrcode.toDataURL(otpauth);

  return { secret, qrCode };
}

export async function verifyTOTP(
  userId: string,
  token: string
): Promise<boolean> {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user?.totpSecret) return false;
  return authenticator.verify({ token, secret: user.totpSecret });
}

export async function enableTOTP(userId: string) {
  await prisma.user.update({
    where: { id: userId },
    data: { totpEnabled: true },
  });
}

export async function disableTOTP(userId: string) {
  await prisma.user.update({
    where: { id: userId },
    data: { totpEnabled: false, totpSecret: null },
  });
}
