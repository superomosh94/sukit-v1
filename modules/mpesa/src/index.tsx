import type { Module, KernelForModule } from '@sukit/core';
import manifest from '../manifest.json';
import { DarajaClient } from './daraja';
import type { StkCallbackBody, MpesaTransactionRecord } from './types';

export { PayWithMpesa } from './components/PayWithMpesa';
export { MpesaSettings } from './components/MpesaSettings';
export { TransactionList } from './components/TransactionList';
export { useMpesaStore } from './stores/mpesaStore';
export { DarajaClient } from './daraja';
export type * from './types';

async function getConfig(kernel: KernelForModule) {
  const s = kernel.settings;
  const [consumerKey, consumerSecret, passkey, shortCode, environment, callbackUrl, initiatorName, securityCredential] = await Promise.all([
    s?.get?.<string>('consumerKey') ?? '',
    s?.get?.<string>('consumerSecret') ?? '',
    s?.get?.<string>('passkey') ?? '',
    s?.get?.<string>('shortCode') ?? '174379',
    s?.get?.<string>('environment') ?? 'sandbox',
    s?.get?.<string>('callbackUrl') ?? '',
    s?.get?.<string>('initiatorName') ?? '',
    s?.get?.<string>('securityCredential') ?? '',
  ]);
  return {
    consumerKey: consumerKey || process.env.MPESA_CONSUMER_KEY || '',
    consumerSecret: consumerSecret || process.env.MPESA_CONSUMER_SECRET || '',
    passkey: passkey || process.env.MPESA_PASSKEY || '',
    shortCode: shortCode || process.env.MPESA_SHORT_CODE || '174379',
    environment: (environment || process.env.MPESA_ENVIRONMENT || 'sandbox') as 'sandbox' | 'production',
    callbackUrl: callbackUrl || process.env.MPESA_CALLBACK_URL || '',
    initiatorName: initiatorName || process.env.MPESA_INITIATOR_NAME || '',
    securityCredential: securityCredential || process.env.MPESA_SECURITY_CREDENTIAL || '',
  };
}

async function getCallbackUrl(kernel: KernelForModule): Promise<string> {
  const config = await getConfig(kernel);
  if (config.callbackUrl) return config.callbackUrl;
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
  return `${baseUrl}/api/mpesa/callback`;
}

const mpesaModule: Module = {
  manifest: manifest as any,

  async activate(kernel: KernelForModule) {
    kernel.log.info('[Mpesa] Activating M-Pesa Payments module...');

    // ── STK Push (initiate payment) ──────────────────────────────
    kernel.api.post('/api/mpesa/stkpush', async (req) => {
      try {
        const body = await req.json();
        const { phoneNumber, amount, accountReference, transactionDesc, siteId, orderId } = body;

        if (!phoneNumber || !amount) {
          return new Response(
            JSON.stringify({ error: 'phoneNumber and amount are required' }),
            { status: 400, headers: { 'Content-Type': 'application/json' } }
          );
        }

        const config = await getConfig(kernel);
        if (!config.consumerKey || !config.consumerSecret) {
          return new Response(
            JSON.stringify({ error: 'M-Pesa not configured. Set Daraja API credentials in settings.' }),
            { status: 400, headers: { 'Content-Type': 'application/json' } }
          );
        }

        const client = new DarajaClient(config);
        const callbackUrl = await getCallbackUrl(kernel);

        const result = await client.stkPush(
          {
            phoneNumber,
            amount,
            accountReference: accountReference || `INV-${Date.now().toString(36).toUpperCase()}`,
            transactionDesc: transactionDesc || 'Payment',
          },
          callbackUrl
        );

        // Record the pending transaction
        const { prisma }: { prisma: any } = await import('@/lib/db/prisma');
        const txn = await prisma.mpesaTransaction.create({
          data: {
            siteId: siteId || 'global',
            orderId,
            phoneNumber,
            amount,
            currency: 'KES',
            accountReference: accountReference || '',
            transactionDesc: transactionDesc || 'Payment',
            merchantRequestId: result.MerchantRequestID,
            checkoutRequestId: result.CheckoutRequestID,
            resultCode: parseInt(result.ResponseCode),
            resultDesc: result.ResponseDescription,
            status: 'PENDING',
          },
        });

        return new Response(
          JSON.stringify({
            ...result,
            transaction: txn,
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
      } catch (err: any) {
        kernel.log.error('[Mpesa] stkpush error:', err);
        return new Response(
          JSON.stringify({ error: err.message || 'STK Push failed' }),
          { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
      }
    });

    // ── STK Push Callback ────────────────────────────────────────
    kernel.api.post('/api/mpesa/callback', async (req) => {
      try {
        const body: StkCallbackBody = await req.json();
        const parsed = DarajaClient.parseCallback(body);

        const { prisma }: { prisma: any } = await import('@/lib/db/prisma');

        const updateData: any = {
          resultCode: parsed.resultCode,
          resultDesc: parsed.resultDesc,
          rawCallback: JSON.stringify(body),
          status: parsed.success ? 'SUCCESS' : 'FAILED',
        };

        if (parsed.mpesaReceiptNumber) updateData.mpesaReceiptNumber = parsed.mpesaReceiptNumber;
        if (parsed.transactionDate) updateData.transactionDate = parsed.transactionDate;
        if (parsed.phoneNumber) updateData.phoneNumberPaid = parsed.phoneNumber;

        await prisma.mpesaTransaction.updateMany({
          where: { checkoutRequestId: parsed.checkoutRequestId },
          data: updateData,
        });

        return new Response(null, { status: 200 });
      } catch (err: any) {
        kernel.log.error('[Mpesa] callback error:', err);
        return new Response(null, { status: 200 });
      }
    });

    // ── STK Push Query ───────────────────────────────────────────
    kernel.api.post('/api/mpesa/query', async (req) => {
      try {
        const { checkoutRequestId } = await req.json();
        if (!checkoutRequestId) {
          return new Response(
            JSON.stringify({ error: 'checkoutRequestId is required' }),
            { status: 400, headers: { 'Content-Type': 'application/json' } }
          );
        }

        const config = await getConfig(kernel);
        const client = new DarajaClient(config);
        const status = await client.stkPushQuery({ checkoutRequestId });

        const { prisma }: { prisma: any } = await import('@/lib/db/prisma');

        let txn = null;
        if (status.ResultCode) {
          const statusResult = parseInt(status.ResultCode);
          await prisma.mpesaTransaction.updateMany({
            where: { checkoutRequestId },
            data: {
              resultCode: statusResult,
              resultDesc: status.ResultDesc,
              status: statusResult === 0 ? 'SUCCESS' : 'FAILED',
            },
          });
        }

        txn = await prisma.mpesaTransaction.findFirst({
          where: { checkoutRequestId },
        });

        return new Response(
          JSON.stringify({ status, transaction: txn }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
      } catch (err: any) {
        return new Response(
          JSON.stringify({ error: err.message }),
          { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
      }
    });

    // ── List Transactions ────────────────────────────────────────
    kernel.api.get('/api/mpesa/transactions', async (req) => {
      try {
        const url = new URL(req.url);
        const siteId = url.searchParams.get('siteId');
        const limit = parseInt(url.searchParams.get('limit') || '50');
        const status = url.searchParams.get('status');

        const { prisma }: { prisma: any } = await import('@/lib/db/prisma');
        const where: any = {};
        if (siteId) where.siteId = siteId;
        if (status) where.status = status;

        const transactions = await prisma.mpesaTransaction.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          take: Math.min(limit, 100),
        });

        return new Response(
          JSON.stringify(transactions),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
      } catch (err: any) {
        return new Response(
          JSON.stringify({ error: err.message }),
          { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
      }
    });

    // ── Test Connection ──────────────────────────────────────────
    kernel.api.post('/api/mpesa/test', async () => {
      try {
        const config = await getConfig(kernel);
        if (!config.consumerKey || !config.consumerSecret) {
          return new Response(
            JSON.stringify({ success: false, error: 'Daraja credentials not configured' }),
            { status: 200, headers: { 'Content-Type': 'application/json' } }
          );
        }

        const client = new DarajaClient(config);
        await client.stkPushQuery({ checkoutRequestId: 'TEST_CONNECTION' });

        return new Response(
          JSON.stringify({ success: true, message: 'Connected to Daraja API successfully' }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
      } catch (err: any) {
        return new Response(
          JSON.stringify({ success: false, error: err.message }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
      }
    });

    // ── Register settings panel ──────────────────────────────────
    kernel.settings.registerPanel({
      id: 'mpesa',
      label: 'M-Pesa Payments',
      icon: 'Smartphone',
      component: () => {
        const { MpesaSettings } = require('./components/MpesaSettings');
        return <MpesaSettings />;
      },
    });

    // ── Register block for the builder ───────────────────────────
    kernel.blocks.register({
      type: 'mpesaButton',
      name: 'M-Pesa Pay Button',
      description: 'Accept M-Pesa payments on your page',
      category: 'widgets',
      icon: 'Smartphone',
      component: () => {
        const { PayWithMpesa } = require('./components/PayWithMpesa');
        return <PayWithMpesa amount={0} siteId="" />;
      },
      schema: {
        type: 'object',
        properties: {
          amount: { type: 'number', default: 100 },
          description: { type: 'string', default: 'Payment' },
          buttonText: { type: 'string', default: 'Pay with M-Pesa' },
        },
      },
      defaultProps: { amount: 100, description: 'Payment', buttonText: 'Pay with M-Pesa' },
      defaultStyles: {},
    });

    kernel.log.info('[Mpesa] M-Pesa Payments module activated');
  },

  async deactivate(kernel: KernelForModule) {
    kernel.blocks.unregister('mpesaButton');
    kernel.log.info('[Mpesa] M-Pesa Payments module deactivated');
  },
};

export default mpesaModule;
