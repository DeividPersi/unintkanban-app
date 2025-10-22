import React, { useState, useEffect } from 'react'
import { Bell, X, Check, AlertCircle, Info, CheckCircle } from 'lucide-react'
import { Button } from './ui/button'
import { Card, CardContent } from './ui/card'
import { Badge } from './ui/badge'

interface Notification {
  id: string
  type: 'info' | 'success' | 'warning' | 'error'
  title: string
  message: string
  timestamp: Date
  read: boolean
  action?: {
    label: string
    onClick: () => void
  }
}

interface NotificationCenterProps {
  notifications: Notification[]
  onMarkAsRead: (id: string) => void
  onMarkAllAsRead: () => void
  onRemove: (id: string) => void
}

const NOTIFICATION_ICONS = {
  info: Info,
  success: CheckCircle,
  warning: AlertCircle,
  error: AlertCircle,
}

const NOTIFICATION_COLORS = {
  info: 'text-blue-600',
  success: 'text-green-600',
  warning: 'text-yellow-600',
  error: 'text-red-600',
}

export default function NotificationCenter({ 
  notifications, 
  onMarkAsRead, 
  onMarkAllAsRead, 
  onRemove 
}: NotificationCenterProps) {
  const [isOpen, setIsOpen] = useState(false)
  const unreadCount = notifications.filter(n => !n.read).length

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date()
    const diff = now.getTime() - timestamp.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return 'Agora'
    if (minutes < 60) return `${minutes}m atrás`
    if (hours < 24) return `${hours}h atrás`
    return `${days}d atrás`
  }

  return (
    <div className="relative">
      {/* Notification Bell */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="relative"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <Badge 
            variant="destructive" 
            className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </Badge>
        )}
      </Button>

      {/* Notification Dropdown */}
      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-20 max-h-96 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Notificações
              </h3>
              <div className="flex items-center space-x-2">
                {unreadCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onMarkAllAsRead}
                    className="text-xs"
                  >
                    <Check className="h-3 w-3 mr-1" />
                    Marcar todas como lidas
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Notifications List */}
            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                  Nenhuma notificação
                </div>
              ) : (
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {notifications.map((notification) => {
                    const Icon = NOTIFICATION_ICONS[notification.type]
                    return (
                      <Card 
                        key={notification.id} 
                        className={`border-0 rounded-none hover:bg-gray-50 dark:hover:bg-gray-700 ${
                          !notification.read ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                        }`}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start space-x-3">
                            <Icon className={`h-5 w-5 mt-0.5 ${NOTIFICATION_COLORS[notification.type]}`} />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <h4 className={`text-sm font-medium ${
                                  !notification.read ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'
                                }`}>
                                  {notification.title}
                                </h4>
                                <div className="flex items-center space-x-1">
                                  <span className="text-xs text-gray-500">
                                    {formatTimestamp(notification.timestamp)}
                                  </span>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => onRemove(notification.id)}
                                    className="h-6 w-6 p-0"
                                  >
                                    <X className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                {notification.message}
                              </p>
                              {notification.action && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={notification.action.onClick}
                                  className="mt-2"
                                >
                                  {notification.action.label}
                                </Button>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
