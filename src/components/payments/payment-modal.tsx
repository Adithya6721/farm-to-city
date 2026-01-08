'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { X, Loader2, CreditCard, Smartphone, Building, Wallet } from 'lucide-react'
import { paymentService, PAYMENT_METHODS, formatPaymentAmount, validateUPIId } from '@/lib/payments'
import { PaymentRequest } from '@/lib/payments'

interface PaymentModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (transactionId: string) => void
  paymentRequest: PaymentRequest
}

export function PaymentModal({ isOpen, onClose, onSuccess, paymentRequest }: PaymentModalProps) {
  const [selectedMethod, setSelectedMethod] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [cardDetails, setCardDetails] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: '',
  })
  const [upiId, setUpiId] = useState('')

  const handlePayment = async () => {
    if (!selectedMethod) {
      setError('Please select a payment method')
      return
    }

    setIsProcessing(true)
    setError(null)

    try {
      let response

      switch (selectedMethod) {
        case 'upi':
          response = await paymentService.initiateUPIPayment(paymentRequest)
          break
        case 'card':
          if (!cardDetails.cardNumber || !cardDetails.expiryDate || !cardDetails.cvv || !cardDetails.cardholderName) {
            setError('Please fill in all card details')
            setIsProcessing(false)
            return
          }
          response = await paymentService.initiateCardPayment(paymentRequest, cardDetails)
          break
        default:
          response = await paymentService.initiatePayment(paymentRequest)
      }

      if (response.success) {
        // Simulate payment processing
        setTimeout(async () => {
          const processResponse = await paymentService.processPayment(response.transactionId!, selectedMethod)
          if (processResponse.success) {
            onSuccess(response.transactionId!)
          } else {
            setError(processResponse.error || 'Payment failed')
          }
          setIsProcessing(false)
        }, 3000)
      } else {
        setError(response.error || 'Payment initiation failed')
        setIsProcessing(false)
      }
    } catch (err) {
      setError('An unexpected error occurred')
      setIsProcessing(false)
    }
  }

  const getMethodIcon = (methodId: string) => {
    switch (methodId) {
      case 'upi':
        return <Smartphone className="h-5 w-5" />
      case 'card':
        return <CreditCard className="h-5 w-5" />
      case 'netbanking':
        return <Building className="h-5 w-5" />
      case 'wallet':
        return <Wallet className="h-5 w-5" />
      default:
        return null
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Complete Payment</CardTitle>
            <CardDescription>
              Pay {formatPaymentAmount(paymentRequest.amount)} for your order
            </CardDescription>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
              {error}
            </div>
          )}

          {/* Payment Method Selection */}
          <div className="space-y-3">
            <Label>Select Payment Method</Label>
            <div className="grid grid-cols-2 gap-3">
              {Object.values(PAYMENT_METHODS).map((method) => (
                <Button
                  key={method.id}
                  variant={selectedMethod === method.id ? 'default' : 'outline'}
                  onClick={() => setSelectedMethod(method.id)}
                  className="h-auto p-4 flex flex-col items-center space-y-2"
                >
                  {getMethodIcon(method.id)}
                  <span className="text-sm">{method.name}</span>
                </Button>
              ))}
            </div>
          </div>

          {/* UPI Details */}
          {selectedMethod === 'upi' && (
            <div className="space-y-3">
              <Label htmlFor="upiId">UPI ID</Label>
              <Input
                id="upiId"
                placeholder="Enter your UPI ID (e.g., 1234567890@paytm)"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
              />
              {upiId && !validateUPIId(upiId) && (
                <p className="text-sm text-red-600">Please enter a valid UPI ID</p>
              )}
            </div>
          )}

          {/* Card Details */}
          {selectedMethod === 'card' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="cardNumber">Card Number</Label>
                <Input
                  id="cardNumber"
                  placeholder="1234 5678 9012 3456"
                  value={cardDetails.cardNumber}
                  onChange={(e) => setCardDetails(prev => ({ ...prev, cardNumber: e.target.value }))}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="expiryDate">Expiry Date</Label>
                  <Input
                    id="expiryDate"
                    placeholder="MM/YY"
                    value={cardDetails.expiryDate}
                    onChange={(e) => setCardDetails(prev => ({ ...prev, expiryDate: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cvv">CVV</Label>
                  <Input
                    id="cvv"
                    placeholder="123"
                    type="password"
                    value={cardDetails.cvv}
                    onChange={(e) => setCardDetails(prev => ({ ...prev, cvv: e.target.value }))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cardholderName">Cardholder Name</Label>
                <Input
                  id="cardholderName"
                  placeholder="John Doe"
                  value={cardDetails.cardholderName}
                  onChange={(e) => setCardDetails(prev => ({ ...prev, cardholderName: e.target.value }))}
                />
              </div>
            </div>
          )}

          {/* Payment Summary */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-medium mb-2">Payment Summary</h3>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span>Order ID:</span>
                <span className="font-mono">{paymentRequest.orderId}</span>
              </div>
              <div className="flex justify-between">
                <span>Amount:</span>
                <span className="font-bold">{formatPaymentAmount(paymentRequest.amount)}</span>
              </div>
              <div className="flex justify-between">
                <span>Description:</span>
                <span>{paymentRequest.description}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-4">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button
              onClick={handlePayment}
              className="flex-1 bg-green-600 hover:bg-green-700"
              disabled={isProcessing || (selectedMethod === 'upi' && !validateUPIId(upiId))}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                `Pay ${formatPaymentAmount(paymentRequest.amount)}`
              )}
            </Button>
          </div>

          {isProcessing && (
            <div className="text-center text-sm text-gray-600">
              <p>Processing your payment...</p>
              <p className="text-xs">Please do not close this window</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}



