'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { MessageSquare, Search } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/components/auth/auth-provider'
import { ChatMessage, User, ChatRoom } from '@/types'
import { getRelativeTime, getInitials } from '@/lib/utils'

interface ChatListProps {
  onSelectChat: (user: User, orderId?: string) => void
}

export function ChatList({ onSelectChat }: ChatListProps) {
  const { user } = useAuth()
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!user) return

    fetchChatRooms()
    const unsubscribe = subscribeToMessages()

    return () => {
      if (unsubscribe) {
        unsubscribe()
      }
    }
  }, [user])

  const fetchChatRooms = async () => {
    if (!user) return

    setIsLoading(true)

    try {
      // Get all unique chat participants
      const { data: messages, error } = await supabase
        .from('chats')
        .select(`
          *,
          sender:users!chats_sender_id_fkey(*),
          receiver:users!chats_receiver_id_fkey(*),
          order:orders(*)
        `)
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .order('created_at', { ascending: false })

      if (messages) {
        // Group messages by participant
        const roomMap = new Map<string, ChatRoom>()

        messages.forEach((message) => {
          const otherUser = message.sender_id === user.id ? message.receiver : message.sender
          const roomKey = `${otherUser.id}-${message.order_id || 'general'}`

          if (!roomMap.has(roomKey)) {
            roomMap.set(roomKey, {
              id: roomKey,
              participants: [otherUser],
              lastMessage: message,
              unreadCount: 0,
            })
          }

          const room = roomMap.get(roomKey)!
          if (!room.lastMessage || new Date(message.created_at) > new Date(room.lastMessage.created_at)) {
            room.lastMessage = message
          }

          // Count unread messages
          if (message.receiver_id === user.id && !message.read) {
            room.unreadCount++
          }
        })

        setChatRooms(Array.from(roomMap.values()))
      }
    } catch (error) {
      console.error('Error fetching chat rooms:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const subscribeToMessages = (): (() => void) | undefined => {
    if (!user) return

    const subscription = supabase
      .channel(`chat-list-updates-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chats',
          filter: `receiver_id=eq.${user.id}`,
        },
        () => {
          fetchChatRooms()
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'chats',
          filter: `receiver_id=eq.${user.id}`,
        },
        () => {
          fetchChatRooms()
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }

  const getRoleEmoji = (role: string) => {
    switch (role) {
      case 'farmer':
        return '🌾'
      case 'trader':
        return '🚚'
      case 'shopkeeper':
        return '🏪'
      default:
        return '👤'
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'farmer':
        return 'bg-green-100 text-green-800'
      case 'trader':
        return 'bg-blue-100 text-blue-800'
      case 'shopkeeper':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Chats</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
            <p className="text-gray-500 mt-2">Loading chats...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <MessageSquare className="mr-2 h-5 w-5" />
          Chats
        </CardTitle>
        <CardDescription>
          Your conversations with farmers, traders, and shopkeepers
        </CardDescription>
      </CardHeader>
      <CardContent>
        {chatRooms.length === 0 ? (
          <div className="text-center py-8">
            <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No conversations yet</h3>
            <p className="text-gray-500">Start chatting with farmers or traders</p>
          </div>
        ) : (
          <div className="space-y-3">
            {chatRooms.map((room) => {
              const participant = room.participants[0]
              const lastMessage = room.lastMessage

              return (
                <div
                  key={room.id}
                  className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => onSelectChat(participant, lastMessage?.order_id)}
                >
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={participant.avatar_url || ''} alt={participant.name} />
                    <AvatarFallback>{getInitials(participant.name)}</AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center space-x-2">
                        <h3 className="text-sm font-medium truncate">{participant.name}</h3>
                        <Badge className={getRoleColor(participant.role)}>
                          {getRoleEmoji(participant.role)} {participant.role}
                        </Badge>
                      </div>
                      {room.unreadCount > 0 && (
                        <Badge variant="destructive" className="text-xs">
                          {room.unreadCount}
                        </Badge>
                      )}
                    </div>

                    {lastMessage && (
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-gray-600 truncate">
                          {lastMessage.message.length > 50 
                            ? `${lastMessage.message.substring(0, 50)}...` 
                            : lastMessage.message
                          }
                        </p>
                        <p className="text-xs text-gray-500 ml-2">
                          {getRelativeTime(lastMessage.created_at)}
                        </p>
                      </div>
                    )}

                    {lastMessage?.order_id && (
                      <p className="text-xs text-blue-600 mt-1">
                        📦 Order related
                      </p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}



