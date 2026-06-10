export type MpesaEnvironment = 'sandbox' | 'production';

export interface MpesaConfig {
  consumerKey: string;
  consumerSecret: string;
  passkey: string;
  shortCode: string;
  environment: MpesaEnvironment;
  callbackUrl?: string;
  initiatorName?: string;
  securityCredential?: string;
}

export interface DarajaAuthResponse {
  access_token: string;
  expires_in: string;
}

export interface StkPushRequest {
  phoneNumber: string;
  amount: number;
  accountReference: string;
  transactionDesc?: string;
  transactionType?: 'CustomerPayBillOnline' | 'CustomerBuyGoodsOnline';
}

export interface StkPushResponse {
  MerchantRequestID: string;
  CheckoutRequestID: string;
  ResponseCode: string;
  ResponseDescription: string;
  CustomerMessage: string;
}

export interface StkPushQueryRequest {
  checkoutRequestId: string;
}

export interface StkPushQueryResponse {
  ResponseCode: string;
  ResponseDescription: string;
  MerchantRequestID: string;
  CheckoutRequestID: string;
  ResultCode: string;
  ResultDesc: string;
}

export interface StkCallbackBody {
  Body: {
    stkCallback: {
      MerchantRequestID: string;
      CheckoutRequestID: string;
      ResultCode: number;
      ResultDesc: string;
      CallbackMetadata?: {
        Item: Array<{
          Name: string;
          Value: string | number;
        }>;
      };
    };
  };
}

export interface B2CRequest {
  partyB: string;
  amount: number;
  remarks: string;
  occasion?: string;
  commandId?: 'BusinessPayment' | 'SalaryPayment' | 'PromotionPayment';
}

export interface B2CResponse {
  ConversationID: string;
  OriginatorCoversationID: string;
  ResponseCode: string;
  ResponseDescription: string;
}

export interface AccountBalanceRequest {
  queueTimeOutURL: string;
  resultURL: string;
  remarks?: string;
}

export interface AccountBalanceResponse {
  ConversationID: string;
  OriginatorCoversationID: string;
  ResponseCode: string;
  ResponseDescription: string;
}

export interface TransactionStatusRequest {
  transactionId: string;
  queueTimeOutURL: string;
  resultURL: string;
  remarks?: string;
}

export interface TransactionStatusResponse {
  ConversationID: string;
  OriginatorCoversationID: string;
  ResponseCode: string;
  ResponseDescription: string;
}

export interface ReversalRequest {
  transactionId: string;
  amount: number;
  receiverParty: string;
  receiverIdentifierType?: 1 | 4;
  queueTimeOutURL: string;
  resultURL: string;
  remarks?: string;
  occasion?: string;
}

export interface ReversalResponse {
  ConversationID: string;
  OriginatorCoversationID: string;
  ResponseCode: string;
  ResponseDescription: string;
}

export interface MpesaTransactionRecord {
  id: string;
  siteId: string;
  orderId?: string;
  phoneNumber: string;
  amount: number;
  currency: string;
  accountReference: string;
  transactionDesc: string;

  merchantRequestId: string;
  checkoutRequestId: string;

  resultCode: number;
  resultDesc: string;

  mpesaReceiptNumber?: string;
  transactionDate?: string;
  phoneNumberPaid?: string;

  status: 'PENDING' | 'SUCCESS' | 'FAILED' | 'CANCELLED' | 'TIMEOUT';
  rawCallback?: string;

  createdAt: string;
  updatedAt: string;
}
