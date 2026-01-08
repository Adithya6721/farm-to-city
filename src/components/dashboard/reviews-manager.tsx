'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Star, StarIcon, Plus, MessageSquare } from 'lucide-react'
import { Review } from '@/types'
import { formatDate } from '@/lib/utils'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/components/auth/auth-provider'

interface ReviewsManagerProps {
  reviews: Review[]
  onReviewsUpdate: () => void
}

export function ReviewsManager({ reviews, onReviewsUpdate }: ReviewsManagerProps) {
  const { user } = useAuth()
  const [showAddForm, setShowAddForm] = useState(false)
  const [availableFarmers, setAvailableFarmers] = useState<any[]>([])
  const [newReview, setNewReview] = useState({
    farmer_id: '',
    rating: 5,
    comment: '',
  })
  const [isLoading, setIsLoading] = useState(false)

  const fetchAvailableFarmers = async () => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('role', 'farmer')
      .order('name')

    if (data) {
      setAvailableFarmers(data)
    }
  }

  const createReview = async () => {
    if (!user || !newReview.farmer_id) return

    setIsLoading(true)

    try {
      const { error } = await supabase
        .from('reviews')
        .insert({
          shopkeeper_id: user.id,
          farmer_id: newReview.farmer_id,
          rating: newReview.rating,
          comment: newReview.comment || null,
        })

      if (error) throw error

      setNewReview({
        farmer_id: '',
        rating: 5,
        comment: '',
      })
      setShowAddForm(false)
      onReviewsUpdate()
    } catch (error) {
      console.error('Error creating review:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const renderStars = (rating: number) => {
    return [...Array(5)].map((_, i) => (
      <StarIcon
        key={i}
        className={`h-4 w-4 ${
          i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ))
  }

  const getRatingColor = (rating: number) => {
    if (rating >= 4) return 'bg-green-100 text-green-800'
    if (rating >= 3) return 'bg-yellow-100 text-yellow-800'
    return 'bg-red-100 text-red-800'
  }

  const getRatingLabel = (rating: number) => {
    switch (rating) {
      case 5:
        return 'Excellent'
      case 4:
        return 'Good'
      case 3:
        return 'Average'
      case 2:
        return 'Poor'
      case 1:
        return 'Very Poor'
      default:
        return 'Not Rated'
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center">
            <Star className="mr-2 h-5 w-5" />
            Reviews & Ratings
          </span>
          <Button
            onClick={() => {
              setShowAddForm(true)
              fetchAvailableFarmers()
            }}
            size="sm"
          >
            <Plus className="mr-1 h-4 w-4" />
            Add Review
          </Button>
        </CardTitle>
        <CardDescription>
          Rate and review farmers you've worked with
        </CardDescription>
      </CardHeader>
      <CardContent>
        {showAddForm && (
          <div className="border rounded-lg p-4 mb-6 bg-gray-50">
            <h3 className="font-medium mb-4">Add New Review</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="farmer">Farmer</Label>
                <Select value={newReview.farmer_id} onValueChange={(value) => setNewReview(prev => ({ ...prev, farmer_id: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a farmer" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableFarmers.map((farmer) => (
                      <SelectItem key={farmer.id} value={farmer.id}>
                        {farmer.name} - {farmer.location}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Rating</Label>
                <div className="flex items-center space-x-2">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <Button
                      key={rating}
                      variant="ghost"
                      size="sm"
                      onClick={() => setNewReview(prev => ({ ...prev, rating }))}
                      className={`p-1 ${
                        rating <= newReview.rating ? 'text-yellow-400' : 'text-gray-300'
                      }`}
                    >
                      <StarIcon className={`h-6 w-6 ${
                        rating <= newReview.rating ? 'fill-current' : ''
                      }`} />
                    </Button>
                  ))}
                  <span className="text-sm text-gray-600 ml-2">
                    {getRatingLabel(newReview.rating)}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="comment">Comment (Optional)</Label>
                <Textarea
                  id="comment"
                  placeholder="Share your experience with this farmer..."
                  rows={3}
                  value={newReview.comment}
                  onChange={(e) => setNewReview(prev => ({ ...prev, comment: e.target.value }))}
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setShowAddForm(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={createReview}
                  disabled={isLoading || !newReview.farmer_id}
                >
                  Add Review
                </Button>
              </div>
            </div>
          </div>
        )}

        {reviews.length === 0 ? (
          <div className="text-center py-8">
            <MessageSquare className="mx-auto h-12 w-12 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No reviews yet</h3>
            <p className="text-gray-500">Start rating farmers you work with to help others</p>
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <div key={review.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-medium">{review.farmer?.name}</h3>
                      <Badge className={getRatingColor(review.rating)}>
                        {getRatingLabel(review.rating)}
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-2 mb-2">
                      {renderStars(review.rating)}
                      <span className="text-sm text-gray-600">({review.rating}/5)</span>
                    </div>
                    <p className="text-sm text-gray-500">
                      📍 {review.farmer?.location}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">
                      {formatDate(review.created_at)}
                    </p>
                  </div>
                </div>

                {review.comment && (
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-sm text-gray-700">{review.comment}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Rating Summary */}
        {reviews.length > 0 && (
          <div className="mt-6 pt-6 border-t">
            <h3 className="font-medium mb-4">Rating Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                {[5, 4, 3, 2, 1].map((rating) => {
                  const count = reviews.filter(r => r.rating === rating).length
                  const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0
                  
                  return (
                    <div key={rating} className="flex items-center space-x-3">
                      <span className="text-sm w-8">{rating}★</span>
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-yellow-400 h-2 rounded-full"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="text-sm text-gray-600 w-12">{count}</span>
                    </div>
                  )
                })}
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-600 mb-2">
                  {(reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)}
                </div>
                <div className="flex justify-center mb-2">
                  {renderStars(Math.round(reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length))}
                </div>
                <p className="text-sm text-gray-600">
                  Based on {reviews.length} review{reviews.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}



