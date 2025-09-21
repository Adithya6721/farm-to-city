'use client'

import { useState } from 'react'
import { useAuth } from '@/components/auth/auth-provider'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Bell, Menu, LogOut, Settings, User } from 'lucide-react'
import { getInitials } from '@/lib/utils'
import { NotificationDropdown } from './notification-dropdown'

export function Navbar() {
  const { user, signOut } = useAuth()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const handleSignOut = async () => {
    await signOut()
  }

  const getRoleIcon = (role: string) => {
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

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'farmer':
        return 'Farmer'
      case 'trader':
        return 'Trader'
      case 'shopkeeper':
        return 'Shopkeeper'
      default:
        return 'User'
    }
  }

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <span className="text-2xl font-bold text-green-600">🌾 Farm2City</span>
            </div>
            <div className="hidden md:ml-6 md:flex md:space-x-8">
              <a
                href="/dashboard"
                className="text-gray-900 hover:text-green-600 px-3 py-2 rounded-md text-sm font-medium"
              >
                Dashboard
              </a>
              {user?.role === 'farmer' && (
                <>
                  <a
                    href="/dashboard/products"
                    className="text-gray-500 hover:text-green-600 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    My Products
                  </a>
                  <a
                    href="/dashboard/orders"
                    className="text-gray-500 hover:text-green-600 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Orders
                  </a>
                </>
              )}
              {user?.role === 'trader' && (
                <>
                  <a
                    href="/dashboard/marketplace"
                    className="text-gray-500 hover:text-green-600 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Marketplace
                  </a>
                  <a
                    href="/dashboard/orders"
                    className="text-gray-500 hover:text-green-600 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    My Orders
                  </a>
                </>
              )}
              {user?.role === 'shopkeeper' && (
                <>
                  <a
                    href="/dashboard/marketplace"
                    className="text-gray-500 hover:text-green-600 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Marketplace
                  </a>
                  <a
                    href="/dashboard/inventory"
                    className="text-gray-500 hover:text-green-600 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Inventory
                  </a>
                  <a
                    href="/dashboard/orders"
                    className="text-gray-500 hover:text-green-600 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Orders
                  </a>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <NotificationDropdown />

            {/* User menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user?.avatar_url || ''} alt={user?.name || ''} />
                    <AvatarFallback>
                      {user?.name ? getInitials(user.name) : 'U'}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user?.name}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user?.email}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground flex items-center">
                      {getRoleIcon(user?.role || '')} {getRoleLabel(user?.role || '')}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                <Menu className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t">
            <a
              href="/dashboard"
              className="text-gray-900 hover:text-green-600 block px-3 py-2 rounded-md text-base font-medium"
            >
              Dashboard
            </a>
            {user?.role === 'farmer' && (
              <>
                <a
                  href="/dashboard/products"
                  className="text-gray-500 hover:text-green-600 block px-3 py-2 rounded-md text-base font-medium"
                >
                  My Products
                </a>
                <a
                  href="/dashboard/orders"
                  className="text-gray-500 hover:text-green-600 block px-3 py-2 rounded-md text-base font-medium"
                >
                  Orders
                </a>
              </>
            )}
            {user?.role === 'trader' && (
              <>
                <a
                  href="/dashboard/marketplace"
                  className="text-gray-500 hover:text-green-600 block px-3 py-2 rounded-md text-base font-medium"
                >
                  Marketplace
                </a>
                <a
                  href="/dashboard/orders"
                  className="text-gray-500 hover:text-green-600 block px-3 py-2 rounded-md text-base font-medium"
                >
                  My Orders
                </a>
              </>
            )}
            {user?.role === 'shopkeeper' && (
              <>
                <a
                  href="/dashboard/marketplace"
                  className="text-gray-500 hover:text-green-600 block px-3 py-2 rounded-md text-base font-medium"
                >
                  Marketplace
                </a>
                <a
                  href="/dashboard/inventory"
                  className="text-gray-500 hover:text-green-600 block px-3 py-2 rounded-md text-base font-medium"
                >
                  Inventory
                </a>
                <a
                  href="/dashboard/orders"
                  className="text-gray-500 hover:text-green-600 block px-3 py-2 rounded-md text-base font-medium"
                >
                  Orders
                </a>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}

