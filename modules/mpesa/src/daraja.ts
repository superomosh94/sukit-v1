import type {
  MpesaConfig,
  DarajaAuthResponse,
  StkPushRequest,
  StkPushResponse,
  StkPushQueryRequest,
  StkPushQueryResponse,
  StkCallbackBody,
  B2CRequest,
  B2CResponse,
  AccountBalanceRequest,
  AccountBalanceResponse,
  TransactionStatusRequest,
  TransactionStatusResponse,
  ReversalRequest,
  ReversalResponse,
} from './types';

const BASE_URLS: Record<string, string> = {
  sandbox: 'https://sandbox.safaricom.co.ke',
  production: 'https://api.safaricom.co.ke',
};

function baseUrl(env: string): string {
  return BASE_URLS[env] || BASE_URLS.sandbox;
}

function timestamp(): string {
  const now = new Date();
  const y = now.getFullYear().toString();
  const m = (now.getMonth() + 1).toString().padStart(2, '0');
  const d = now.getDate().toString().padStart(2, '0');
  const h = now.getHours().toString().padStart(2, '0');
  const min = now.getMinutes().toString().padStart(2, '0');
  const s = now.getSeconds().toString().padStart(2, '0');
  return `${y}${m}${d}${h}${min}${s}`;
}

function password(shortCode: string, passkey: string, ts: string): string {
  const raw = shortCode + passkey + ts;
  return Buffer.from(raw).toString('base64');
}

function authHeader(consumerKey: string, consumerSecret: string): string {
  const raw = consumerKey + ':' + consumerSecret;
  return 'Basic ' + Buffer.from(raw).toString('base64');
}

export class DarajaClient {
  private config: MpesaConfig;
  private token: string | null = null;
  private tokenExpiry: number = 0;

  constructor(config: MpesaConfig) {
    this.config = config;
  }

  private async getToken(): Promise<string> {
    if (this.token && Date.now() < this.tokenExpiry) {
      return this.token;
    }

    const url = `${baseUrl(this.config.environment)}/oauth/v1/generate?grant_type=client_credentials`;
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: authHeader(this.config.consumerKey, this.config.consumerSecret),
      },
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Daraja auth failed (${res.status}): ${text}`);
    }

    const data: DarajaAuthResponse = await res.json();
    this.token = data.access_token;
    this.tokenExpiry = Date.now() + parseInt(data.expires_in) * 1000 - 60000;
    return this.token!;
  }

  private async request<T>(path: string, body: Record<string, unknown>): Promise<T> {
    const token = await this.getToken();
    const url = `${baseUrl(this.config.environment)}${path}`;

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Daraja API error (${res.status}): ${text}`);
    }

    return res.json();
  }

  private ts(): string {
    return timestamp();
  }

  private pass(ts: string): string {
    return password(this.config.shortCode, this.config.passkey, ts);
  }

  async stkPush(req: StkPushRequest, callbackUrl: string): Promise<StkPushResponse> {
    const ts = this.ts();
    const body = {
      BusinessShortCode: this.config.shortCode,
      Password: this.pass(ts),
      Timestamp: ts,
      TransactionType: req.transactionType || 'CustomerPayBillOnline',
      Amount: Math.round(req.amount),
      PartyA: req.phoneNumber.replace(/[^0-9]/g, ''),
      PartyB: this.config.shortCode,
      PhoneNumber: req.phoneNumber.replace(/[^0-9]/g, ''),
      CallBackURL: callbackUrl,
      AccountReference: req.accountReference.slice(0, 12),
      TransactionDesc: (req.transactionDesc || 'Payment').slice(0, 13),
    };

    return this.request<StkPushResponse>('/mpesa/stkpush/v1/processrequest', body);
  }

  async stkPushQuery(req: StkPushQueryRequest): Promise<StkPushQueryResponse> {
    const ts = this.ts();
    const body = {
      BusinessShortCode: this.config.shortCode,
      Password: this.pass(ts),
      Timestamp: ts,
      CheckoutRequestID: req.checkoutRequestId,
    };

    return this.request<StkPushQueryResponse>('/mpesa/stkpushquery/v1/query', body);
  }

  async b2c(req: B2CRequest, resultUrl: string, timeoutUrl: string): Promise<B2CResponse> {
    const body = {
      InitiatorName: this.config.initiatorName || '',
      SecurityCredential: this.config.securityCredential || '',
      CommandID: req.commandId || 'BusinessPayment',
      Amount: Math.round(req.amount),
      PartyA: this.config.shortCode,
      PartyB: req.partyB.replace(/[^0-9]/g, ''),
      Remarks: req.remarks.slice(0, 100),
      QueueTimeOutURL: timeoutUrl,
      ResultURL: resultUrl,
      Occasion: (req.occasion || '').slice(0, 100),
    };

    return this.request<B2CResponse>('/mpesa/b2c/v1/paymentrequest', body);
  }

  async accountBalance(req: AccountBalanceRequest): Promise<AccountBalanceResponse> {
    const body = {
      InitiatorName: this.config.initiatorName || '',
      SecurityCredential: this.config.securityCredential || '',
      CommandID: 'AccountBalance',
      PartyA: this.config.shortCode,
      IdentifierType: '4',
      Remarks: (req.remarks || 'Balance query').slice(0, 100),
      QueueTimeOutURL: req.queueTimeOutURL,
      ResultURL: req.resultURL,
    };

    return this.request<AccountBalanceResponse>('/mpesa/accountbalance/v1/query', body);
  }

  async transactionStatus(req: TransactionStatusRequest): Promise<TransactionStatusResponse> {
    const body = {
      InitiatorName: this.config.initiatorName || '',
      SecurityCredential: this.config.securityCredential || '',
      CommandID: 'TransactionStatusQuery',
      PartyA: this.config.shortCode,
      IdentifierType: '4',
      Remarks: (req.remarks || 'Status query').slice(0, 100),
      QueueTimeOutURL: req.queueTimeOutURL,
      ResultURL: req.resultURL,
      TransactionID: req.transactionId,
    };

    return this.request<TransactionStatusResponse>('/mpesa/transactionstatus/v1/query', body);
  }

  async reversal(req: ReversalRequest): Promise<ReversalResponse> {
    const body = {
      InitiatorName: this.config.initiatorName || '',
      SecurityCredential: this.config.securityCredential || '',
      CommandID: 'TransactionReversal',
      ReceiverParty: req.receiverParty.replace(/[^0-9]/g, ''),
      RecieverIdentifierType: req.receiverIdentifierType || 4,
      Amount: Math.round(req.amount),
      QueueTimeOutURL: req.queueTimeOutURL,
      ResultURL: req.resultURL,
      Remarks: (req.remarks || 'Reversal').slice(0, 100),
      Occasion: (req.occasion || '').slice(0, 100),
      TransactionID: req.transactionId,
    };

    return this.request<ReversalResponse>('/mpesa/reversal/v1/request', body);
  }

  static parseCallback(body: StkCallbackBody): {
    success: boolean;
    merchantRequestId: string;
    checkoutRequestId: string;
    resultCode: number;
    resultDesc: string;
    mpesaReceiptNumber?: string;
    transactionDate?: string;
    phoneNumber?: string;
    amount?: number;
  } {
    const cb = body.Body.stkCallback;
    const items: Record<string, string | number> = {};
    if (cb.CallbackMetadata?.Item) {
      for (const item of cb.CallbackMetadata.Item) {
        items[item.Name] = item.Value;
      }
    }

    return {
      success: cb.ResultCode === 0,
      merchantRequestId: cb.MerchantRequestID,
      checkoutRequestId: cb.CheckoutRequestID,
      resultCode: cb.ResultCode,
      resultDesc: cb.ResultDesc,
      mpesaReceiptNumber: items.MpesaReceiptNumber as string | undefined,
      transactionDate: items.TransactionDate as string | undefined,
      phoneNumber: items.PhoneNumber as string | undefined,
      amount: items.Amount as number | undefined,
    };
  }
}
