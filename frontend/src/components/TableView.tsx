import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { cardAPI } from '@/lib/api'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { MoreHorizontal, Calendar, User, MessageSquare, Paperclip } from 'lucide-react'

interface TableViewProps {
  boardId: number
}

interface CardData {
  id: number
  title: string
  description: string
  list: {
    id: number
    title: string
  }
  labels: Array<{
    id: number
    name: string
    color: string
  }>
  due_date?: string
  start_date?: string
  created_by: {
    id: number
    username: string
    first_name: string
  }
  comments: Array<{
    id: number
  }>
  checklists: Array<{
    id: number
    items: Array<{
      id: number
      completed: boolean
    }>
  }>
  attachments: Array<{
    id: number
  }>
  created_at: string
  updated_at: string
}

export default function TableView({ boardId }: TableViewProps) {
  const [sortField, setSortField] = useState<keyof CardData>('created_at')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')

  const { data: cards, isLoading } = useQuery({
    queryKey: ['cards-table', boardId],
    queryFn: async () => {
      const response = await cardAPI.getCardsByBoard(boardId)
      return response.data.results || []
    },
  })

  const handleSort = (field: keyof CardData) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const sortedCards = React.useMemo(() => {
    if (!cards) return []
    
    return [...cards].sort((a, b) => {
      let aValue = a[sortField]
      let bValue = b[sortField]

      if (sortField === 'created_at' || sortField === 'updated_at' || sortField === 'due_date' || sortField === 'start_date') {
        aValue = aValue ? new Date(aValue as string).getTime() : 0
        bValue = bValue ? new Date(bValue as string).getTime() : 0
      } else if (sortField === 'list') {
        aValue = (aValue as any).title
        bValue = (bValue as any).title
      } else if (sortField === 'created_by') {
        aValue = (aValue as any).username
        bValue = (bValue as any).username
      }

      if (sortDirection === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0
      }
    })
  }, [cards, sortField, sortDirection])

  const getChecklistProgress = (checklists: Array<{ items: Array<{ completed: boolean }> }>) => {
    const totalItems = checklists.reduce((total, checklist) => total + checklist.items.length, 0)
    const completedItems = checklists.reduce((total, checklist) => 
      total + checklist.items.filter(item => item.completed).length, 0
    )
    return totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0
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
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead 
                className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
                onClick={() => handleSort('title')}
              >
                <div className="flex items-center gap-2">
                  Título
                  {sortField === 'title' && (
                    <span className="text-xs">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                  )}
                </div>
              </TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
                onClick={() => handleSort('list')}
              >
                <div className="flex items-center gap-2">
                  Lista
                  {sortField === 'list' && (
                    <span className="text-xs">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                  )}
                </div>
              </TableHead>
              <TableHead>Etiquetas</TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
                onClick={() => handleSort('due_date')}
              >
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Data de Vencimento
                  {sortField === 'due_date' && (
                    <span className="text-xs">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                  )}
                </div>
              </TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
                onClick={() => handleSort('created_by')}
              >
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Responsável
                  {sortField === 'created_by' && (
                    <span className="text-xs">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                  )}
                </div>
              </TableHead>
              <TableHead>Progresso</TableHead>
              <TableHead>Atividade</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedCards.map((card: CardData) => (
              <TableRow key={card.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                <TableCell className="font-medium">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {card.title}
                    </p>
                    {card.description && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                        {card.description}
                      </p>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="text-xs">
                    {card.list.title}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    {card.labels.slice(0, 3).map((label) => (
                      <div
                        key={label.id}
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: label.color }}
                        title={label.name}
                      />
                    ))}
                    {card.labels.length > 3 && (
                      <span className="text-xs text-gray-500">+{card.labels.length - 3}</span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  {card.due_date ? (
                    <div className="text-sm">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span className={new Date(card.due_date) < new Date() ? 'text-red-600' : 'text-gray-600 dark:text-gray-300'}>
                          {format(new Date(card.due_date), 'dd/MM/yyyy', { locale: ptBR })}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <span className="text-gray-400 text-sm">Sem data de vencimento</span>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-gray-200 dark:bg-gray-600 rounded-full flex items-center justify-center">
                      <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
                        {card.created_by.first_name?.[0] || card.created_by.username[0].toUpperCase()}
                      </span>
                    </div>
                    <span className="text-sm text-gray-600 dark:text-gray-300">
                      {card.created_by.first_name || card.created_by.username}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  {card.checklists.length > 0 ? (
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${getChecklistProgress(card.checklists)}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-500">
                        {getChecklistProgress(card.checklists)}%
                      </span>
                    </div>
                  ) : (
                    <span className="text-gray-400 text-sm">Sem checklists</span>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    {card.comments.length > 0 && (
                      <div className="flex items-center gap-1">
                        <MessageSquare className="h-3 w-3" />
                        <span>{card.comments.length}</span>
                      </div>
                    )}
                    {card.attachments.length > 0 && (
                      <div className="flex items-center gap-1">
                        <Paperclip className="h-3 w-3" />
                        <span>{card.attachments.length}</span>
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
