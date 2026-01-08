'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Send, X, MessageSquare } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/components/auth/auth-provider'
import { ChatMessage, User } from '@/types'
import { getRelativeTime, getInitials } from '@/lib/utils'
import type { RealtimeChannel } from '@supabase/supabase-js'

interface ChatWindowProps {
  isOpen: boolean
  onClose: () => void
  otherUser: User | null
  orderId?: string
}

export function ChatWindow({ isOpen, onClose, otherUser, orderId }: ChatWindowProps) {
  const { user } = useAuth()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const subscriptionRef = useRef<RealtimeChannel | null>(null)

  useEffect(() => {
    if (isOpen && otherUser && user) {
      fetchMessages()
      const cleanup = subscribeToMessages()
      
      return () => {
        if (cleanup) {
          cleanup()
        }
        if (subscriptionRef.current) {
          subscriptionRef.current.unsubscribe()
          subscriptionRef.current = null
        }
      }
    }
  }, [isOpen, otherUser, user])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const fetchMessages = async () => {
    if (!otherUser || !user) return

    setIsLoading(true)

    try {
      const { data, error } = await supabase
        .from('chats')
        .select(`
          *,
          sender:users!chats_sender_id_fkey(*),
          receiver:users!chats_receiver_id_fkey(*)
        `)
        .or(`and(sender_id.eq.${user.id},receiver_id.eq.${otherUser.id}),and(sender_id.eq.${otherUser.id},receiver_id.eq.${user.id})`)
        .eq(orderId ? 'order_id' : 'order_id', orderId || null)
        .order('created_at', { ascending: true })

      if (data) {
        setMessages(data)
      }
    } catch (error) {
      console.error('Error fetching messages:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const subscribeToMessages = (): (() => void) | undefined => {
    if (!otherUser || !user) return

    const channelName = `chat-messages-${user.id}-${otherUser.id}`
    const subscription = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chats',
          filter: `or(and(sender_id=eq.${user.id},receiver_id=eq.${otherUser.id}),and(sender_id=eq.${otherUser.id},receiver_id=eq.${user.id}))`,
        },
        (payload) => {
          const newMessage = payload.new as ChatMessage
          setMessages(prev => [...prev, newMessage])
        }
      )
      .subscribe()

    subscriptionRef.current = subscription

    return () => {
      subscription.unsubscribe()
      subscriptionRef.current = null
    }
  }

  const sendMessage = async () => {
    if (!newMessage.trim() || !otherUser || !user) return

    try {
      const { error } = await supabase
        .from('chats')
        .insert({
          sender_id: user.id,
          receiver_id: otherUser.id,
          message: newMessage.trim(),
          order_id: orderId || null,
          read: false,
        })

      if (error) throw error

      setNewMessage('')
    } catch (error) {
      console.error('Error sending message:', error)
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const markMessagesAsRead = async () => {
    if (!otherUser || !user) return

    const unreadMessages = messages.filter(
      msg => msg.receiver_id === user.id && !msg.read
    )

    if (unreadMessages.length > 0) {
      const messageIds = unreadMessages.map(msg => msg.id)
      
      await supabase
        .from('chats')
        .update({ read: true })
        .in('id', messageIds)
    }
  }

  if (!isOpen || !otherUser) return null

  return (
    <div className="fixed bottom-4 right-4 w-80 h-96 bg-white border border-gray-200 rounded-lg shadow-lg z-50 flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between p-4 border-b">
        <div className="flex items-center space-x-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={otherUser.avatar_url || ''} alt={otherUser.name} />
            <AvatarFallback>{getInitials(otherUser.name)}</AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-sm">{otherUser.name}</CardTitle>
            <p className="text-xs text-gray-500">{otherUser.role}</p>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {isLoading ? (
            <div className="text-center text-gray-500">Loading messages...</div>
          ) : messages.length === 0 ? (
            <div className="text-center text-gray-500">
              <MessageSquare className="h-8 w-8 mx-auto mb-2 text-gray-300" />
              <p>No messages yet</p>
              <p className="text-xs">Start a conversation!</p>
            </div>
          ) : (
            messages.map((message) => {
              const isOwnMessage = message.sender_id === user?.id
              
              return (
                <div
                  key={message.id}
                  className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs px-3 py-2 rounded-lg ${
                      isOwnMessage
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    <p className="text-sm">{message.message}</p>
                    <p className={`text-xs mt-1 ${
                      isOwnMessage ? 'text-green-100' : 'text-gray-500'
                    }`}>
                      {getRelativeTime(message.created_at)}
                    </p>
                  </div>
                </div>
              )
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <div className="p-4 border-t">
          <div className="flex space-x-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  sendMessage()
                }
              }}
              className="flex-1"
            />
            <Button
              onClick={sendMessage}
              disabled={!newMessage.trim()}
              size="icon"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </div>
  )
}



