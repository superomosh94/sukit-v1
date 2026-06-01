import { NextRequest, NextResponse } from 'next/server';
import {
  createUser,
  verifyPassword,
  findUserByEmail,
  findUserById,
} from '../services/authService';
import { generateResetToken, resetPassword } from '../services/passwordService';
import {
  verifyTOTP,
  generateTOTPSecret,
  enableTOTP,
} from '../services/totpService';
import {
  createSession,
  validateSession,
  revokeSession,
  revokeAllSessions,
  enforceConcurrentSessions,
} from '../services/sessionService';
import {
  findSocialAccount,
  linkSocialAccount,
  OAUTH_CONFIGS,
} from '../services/socialService';
import { assignRole, checkPermission } from '../services/roleService';

export async function POST_register(req: NextRequest) {
  const { email, password, name } = await req.json();
  const existing = await findUserByEmail(email);
  if (existing)
    return NextResponse.json(
      { error: 'Email already registered' },
      { status: 409 }
    );

  const user = await createUser(email, password, name);
  const token = await createSession(user.id);

  return NextResponse.json(
    { user: { id: user.id, email: user.email, name: user.name }, token },
    { status: 201 }
  );
}

export async function POST_login(req: NextRequest) {
  const { email, password, totpToken } = await req.json();
  const user = await findUserByEmail(email);
  if (!user)
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });

  const valid = await verifyPassword(password, user.password);
  if (!valid)
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });

  if (user.totpEnabled) {
    if (!totpToken)
      return NextResponse.json({ requiresTotp: true }, { status: 200 });
    const totpValid = await verifyTOTP(user.id, totpToken);
    if (!totpValid)
      return NextResponse.json({ error: 'Invalid 2FA code' }, { status: 401 });
  }

  await enforceConcurrentSessions(user.id);
  const token = await createSession(user.id);

  return NextResponse.json({
    user: { id: user.id, email: user.email, name: user.name },
    token,
  });
}

export async function POST_logout(req: NextRequest) {
  const token = req.headers.get('authorization')?.replace('Bearer ', '');
  if (token) await revokeSession(token);
  return NextResponse.json({ success: true });
}

export async function POST_forgotPassword(req: NextRequest) {
  const { email } = await req.json();
  await generateResetToken(email);
  return NextResponse.json({
    success: true,
    message: 'If the email exists, a reset link has been sent',
  });
}

export async function POST_resetPassword(req: NextRequest) {
  const { token, password } = await req.json();
  await resetPassword(token, password);
  return NextResponse.json({ success: true });
}

export async function POST_setupTotp(req: NextRequest) {
  const token = req.headers.get('authorization')?.replace('Bearer ', '');
  const session = token ? await validateSession(token) : null;
  if (!session)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const result = await generateTOTPSecret(session.user.id);
  return NextResponse.json(result);
}

export async function POST_verifyTotp(req: NextRequest) {
  const token = req.headers.get('authorization')?.replace('Bearer ', '');
  const session = token ? await validateSession(token) : null;
  if (!session)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { totpToken } = await req.json();
  const valid = await verifyTOTP(session.user.id, totpToken);
  if (!valid)
    return NextResponse.json({ error: 'Invalid code' }, { status: 400 });

  await enableTOTP(session.user.id);
  return NextResponse.json({ success: true });
}

export async function GET_me(req: NextRequest) {
  const token = req.headers.get('authorization')?.replace('Bearer ', '');
  const session = token ? await validateSession(token) : null;
  if (!session)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  return NextResponse.json(session.user);
}

export async function GET_oauthUrl(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const provider = searchParams.get('provider') as string;
  const config = OAUTH_CONFIGS[provider as keyof typeof OAUTH_CONFIGS];
  if (!config)
    return NextResponse.json(
      { error: 'Unsupported provider' },
      { status: 400 }
    );

  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/callback/${provider}`;
  const params = new URLSearchParams({
    client_id: process.env[`${provider.toUpperCase()}_CLIENT_ID`] || '',
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: config.scopes.join(' '),
    state: crypto.randomBytes(16).toString('hex'),
  });

  return NextResponse.json({
    url: `${config.authorizeUrl}?${params.toString()}`,
  });
}
