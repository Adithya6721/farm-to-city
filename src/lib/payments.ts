// Mock payment integration for Farm2City
// In production, this would integrate with Stripe, Razorpay, or other payment gateways

export interface PaymentRequest {
  amount: number
  currency: string
  orderId: string
  customerEmail: string
  customerName: string
  description: string
}

export interface PaymentResponse {
  success: boolean
  transactionId?: string
  paymentUrl?: string
  error?: string
}

export interface PaymentStatus {
  transactionId: string
  status: 'pending' | 'completed' | 'failed' | 'cancelled'
  amount: number
  currency: string
  timestamp: string
}

// Mock payment methods
export const PAYMENT_METHODS = {
  UPI: {
    id: 'upi',
    name: 'UPI',
    icon: '📱',
    description: 'Pay using UPI ID or QR code',
  },
  CARD: {
    id: 'card',
    name: 'Credit/Debit Card',
    icon: '💳',
    description: 'Pay using credit or debit card',
  },
  NET_BANKING: {
    id: 'netbanking',
    name: 'Net Banking',
    icon: '🏦',
    description: 'Pay using online banking',
  },
  WALLET: {
    id: 'wallet',
    name: 'Digital Wallet',
    icon: '💰',
    description: 'Pay using digital wallet',
  },
}

export class PaymentService {
  private static instance: PaymentService
  private mockTransactions: Map<string, PaymentStatus> = new Map()

  static getInstance(): PaymentService {
    if (!PaymentService.instance) {
      PaymentService.instance = new PaymentService()
    }
    return PaymentService.instance
  }

  async initiatePayment(paymentRequest: PaymentRequest): Promise<PaymentResponse> {
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Generate mock transaction ID
      const transactionId = `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

      // Mock successful payment initiation
      const response: PaymentResponse = {
        success: true,
        transactionId,
        paymentUrl: `/payment/process/${transactionId}`,
      }

      // Store transaction status
      this.mockTransactions.set(transactionId, {
        transactionId,
        status: 'pending',
        amount: paymentRequest.amount,
        currency: paymentRequest.currency,
        timestamp: new Date().toISOString(),
      })

      console.log('Payment initiated:', {
        transactionId,
        amount: paymentRequest.amount,
        orderId: paymentRequest.orderId,
      })

      return response
    } catch (error) {
      console.error('Payment initiation failed:', error)
      return {
        success: false,
        error: 'Failed to initiate payment',
      }
    }
  }

  async processPayment(transactionId: string, paymentMethod: string): Promise<PaymentResponse> {
    try {
      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 2000))

      const transaction = this.mockTransactions.get(transactionId)
      if (!transaction) {
        return {
          success: false,
          error: 'Transaction not found',
        }
      }

      // Mock 90% success rate
      const isSuccess = Math.random() > 0.1

      if (isSuccess) {
        transaction.status = 'completed'
        this.mockTransactions.set(transactionId, transaction)

        console.log('Payment completed:', {
          transactionId,
          amount: transaction.amount,
          paymentMethod,
        })

        return {
          success: true,
          transactionId,
        }
      } else {
        transaction.status = 'failed'
        this.mockTransactions.set(transactionId, transaction)

        return {
          success: false,
          error: 'Payment failed. Please try again.',
        }
      }
    } catch (error) {
      console.error('Payment processing failed:', error)
      return {
        success: false,
        error: 'Payment processing failed',
      }
    }
  }

  async getPaymentStatus(transactionId: string): Promise<PaymentStatus | null> {
    return this.mockTransactions.get(transactionId) || null
  }

  async refundPayment(transactionId: string, amount?: number): Promise<PaymentResponse> {
    try {
      const transaction = this.mockTransactions.get(transactionId)
      if (!transaction) {
        return {
          success: false,
          error: 'Transaction not found',
        }
      }

      if (transaction.status !== 'completed') {
        return {
          success: false,
          error: 'Only completed transactions can be refunded',
        }
      }

      // Simulate refund processing
      await new Promise(resolve => setTimeout(resolve, 1500))

      const refundAmount = amount || transaction.amount
      const refundTransactionId = `refund_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

      console.log('Refund processed:', {
        originalTransactionId: transactionId,
        refundTransactionId,
        amount: refundAmount,
      })

      return {
        success: true,
        transactionId: refundTransactionId,
      }
    } catch (error) {
      console.error('Refund failed:', error)
      return {
        success: false,
        error: 'Refund processing failed',
      }
    }
  }

  // Mock UPI payment
  async initiateUPIPayment(paymentRequest: PaymentRequest): Promise<PaymentResponse> {
    const response = await this.initiatePayment(paymentRequest)
    
    if (response.success) {
      // Simulate UPI-specific flow
      response.paymentUrl = `/payment/upi/${response.transactionId}`
    }

    return response
  }

  // Mock card payment
  async initiateCardPayment(paymentRequest: PaymentRequest, cardDetails: any): Promise<PaymentResponse> {
    // Validate card details (mock validation)
    if (!cardDetails.cardNumber || !cardDetails.expiryDate || !cardDetails.cvv) {
      return {
        success: false,
        error: 'Invalid card details',
      }
    }

    return await this.initiatePayment(paymentRequest)
  }
}

export const paymentService = PaymentService.getInstance()

// Utility functions
export const formatPaymentAmount = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
  }).format(amount)
}

export const generateUPIId = (): string => {
  const randomString = Math.random().toString(36).substr(2, 8)
  return `${randomString}@paytm`
}

export const validateUPIId = (upiId: string): boolean => {
  const upiRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+$/
  return upiRegex.test(upiId)
}

export const maskCardNumber = (cardNumber: string): string => {
  if (cardNumber.length < 8) return cardNumber
  const start = cardNumber.substring(0, 4)
  const end = cardNumber.substring(cardNumber.length - 4)
  const middle = '*'.repeat(cardNumber.length - 8)
  return `${start}${middle}${end}`
}

