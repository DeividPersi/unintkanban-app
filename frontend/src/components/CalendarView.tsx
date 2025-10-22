import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { cardAPI } from '../lib/api.ts'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react'
import { Button } from './ui/button'
import { Card, CardContent } from './ui/card'

interface CalendarViewProps {
  boardId: number
}

interface CardWithDate {
  id: number
  title: string
  due_date?: string
  start_date?: string
  list: {
    id: number
    title: string
  }
  labels: Array<{
    id: number
    name: string
    color: string
  }>
}

export default function CalendarView({ boardId }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date())

  const { data: cards, isLoading } = useQuery({
    queryKey: ['cards-calendar', boardId],
    queryFn: async () => {
      // This would need to be implemented in the backend
      // For now, we'll fetch all cards and filter by date
      const response = await cardAPI.getCardsByBoard(boardId)
      return response.data.results || []
    },
  })

  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd })

  const getCardsForDate = (date: Date) => {
    if (!cards) return []
    
    return cards.filter((card: CardWithDate) => {
      if (card.due_date) {
        const dueDate = new Date(card.due_date)
        return isSameDay(dueDate, date)
      }
      if (card.start_date) {
        const startDate = new Date(card.start_date)
        return isSameDay(startDate, date)
      }
      return false
    })
  }

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => 
      direction === 'prev' ? subMonths(prev, 1) : addMonths(prev, 1)
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Calendar Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <CalendarIcon className="h-5 w-5" />
          {format(currentDate, 'MMMM yyyy', { locale: ptBR })}
        </h2>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigateMonth('prev')}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigateMonth('next')}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        {/* Days of week header */}
        <div className="grid grid-cols-7 bg-gray-50 dark:bg-gray-700">
          {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((day) => (
            <div key={day} className="p-3 text-center text-sm font-medium text-gray-600 dark:text-gray-300">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar days */}
        <div className="grid grid-cols-7">
          {monthDays.map((day, dayIdx) => {
            const dayCards = getCardsForDate(day)
            const isCurrentMonth = isSameMonth(day, currentDate)
            const isToday = isSameDay(day, new Date())

            return (
              <div
                key={day.toISOString()}
                className={`min-h-[120px] p-2 border-r border-b border-gray-200 dark:border-gray-700 ${
                  !isCurrentMonth ? 'bg-gray-50 dark:bg-gray-900 text-gray-400' : ''
                } ${isToday ? 'bg-blue-50 dark:bg-blue-900' : ''}`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-sm font-medium ${
                    isToday ? 'text-blue-600 dark:text-blue-400' : ''
                  }`}>
                    {format(day, 'd')}
                  </span>
                  {dayCards.length > 0 && (
                    <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 px-1.5 py-0.5 rounded-full">
                      {dayCards.length}
                    </span>
                  )}
                </div>

                <div className="space-y-1">
                  {dayCards.slice(0, 3).map((card) => (
                    <Card
                      key={card.id}
                      className={`p-2 cursor-pointer hover:shadow-sm transition-shadow ${
                        card.due_date ? 'border-red-200 dark:border-red-800' : 'border-blue-200 dark:border-blue-800'
                      }`}
                    >
                      <CardContent className="p-0">
                        <div className="flex items-start gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-gray-900 dark:text-white truncate">
                              {card.title}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {card.list.title}
                            </p>
                          </div>
                          {card.labels.length > 0 && (
                            <div className="flex gap-1">
                              {card.labels.slice(0, 2).map((label) => (
                                <div
                                  key={label.id}
                                  className="w-2 h-2 rounded-full"
                                  style={{ backgroundColor: label.color }}
                                  title={label.name}
                                />
                              ))}
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  {dayCards.length > 3 && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                      +{dayCards.length - 3} more
                    </p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
