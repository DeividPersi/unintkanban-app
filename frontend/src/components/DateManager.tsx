import React, { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { cardAPI } from '../lib/api.ts'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { X, Calendar, Clock } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface DateManagerProps {
  cardId: number
  isOpen: boolean
  onClose: () => void
  card: any
}

export function DateManager({ cardId, isOpen, onClose, card }: DateManagerProps) {
  const [startDate, setStartDate] = useState(
    card?.start_date ? format(parseISO(card.start_date), 'yyyy-MM-dd') : ''
  )
  const [dueDate, setDueDate] = useState(
    card?.due_date ? format(parseISO(card.due_date), 'yyyy-MM-dd') : ''
  )
  const [startTime, setStartTime] = useState(
    card?.start_date ? format(parseISO(card.start_date), 'HH:mm') : ''
  )
  const [dueTime, setDueTime] = useState(
    card?.due_date ? format(parseISO(card.due_date), 'HH:mm') : ''
  )

  const queryClient = useQueryClient()

  const updateCardMutation = useMutation({
    mutationFn: (data: any) => cardAPI.updateCard(cardId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['card', cardId] })
      queryClient.invalidateQueries({ queryKey: ['cards'] })
    },
  })

  const handleSave = () => {
    const updateData: any = {}
    
    if (startDate) {
      const startDateTime = startTime 
        ? `${startDate}T${startTime}:00` 
        : `${startDate}T00:00:00`
      updateData.start_date = startDateTime
    } else {
      updateData.start_date = null
    }

    if (dueDate) {
      const dueDateTime = dueTime 
        ? `${dueDate}T${dueTime}:00` 
        : `${dueDate}T23:59:59`
      updateData.due_date = dueDateTime
    } else {
      updateData.due_date = null
    }

    updateCardMutation.mutate(updateData)
    onClose()
  }

  const handleClear = () => {
    setStartDate('')
    setDueDate('')
    setStartTime('')
    setDueTime('')
    updateCardMutation.mutate({
      start_date: null,
      due_date: null
    })
    onClose()
  }

  const isOverdue = card?.due_date && new Date(card.due_date) < new Date()

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Gerenciar Datas
          </h2>
          <Button variant="ghost" size="sm" onClick={onClose} aria-label="Fechar gerenciador de datas">
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-4">
          {/* Data de Início */}
          <div>
            <Label htmlFor="start-date" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Data de Início
            </Label>
            <div className="flex space-x-2 mt-1">
              <Input
                id="start-date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="flex-1"
              />
              <Input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-32"
              />
            </div>
          </div>

          {/* Data de Vencimento */}
          <div>
            <Label htmlFor="due-date" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Data de Vencimento
            </Label>
            <div className="flex space-x-2 mt-1">
              <Input
                id="due-date"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className={`flex-1 ${isOverdue ? 'border-red-500' : ''}`}
              />
              <Input
                type="time"
                value={dueTime}
                onChange={(e) => setDueTime(e.target.value)}
                className="w-32"
              />
            </div>
            {isOverdue && (
              <p className="text-sm text-red-500 mt-1">
                ⚠️ Esta tarefa está atrasada
              </p>
            )}
          </div>

          {/* Datas Atuais */}
          {card?.start_date && (
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="flex items-center space-x-2 text-sm">
                <Clock className="h-4 w-4 text-blue-500" />
                <span className="text-blue-700 dark:text-blue-300">
                  Início: {format(parseISO(card.start_date), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                </span>
              </div>
            </div>
          )}

          {card?.due_date && (
            <div className={`p-3 rounded-lg ${isOverdue ? 'bg-red-50 dark:bg-red-900/20' : 'bg-green-50 dark:bg-green-900/20'}`}>
              <div className="flex items-center space-x-2 text-sm">
                <Calendar className={`h-4 w-4 ${isOverdue ? 'text-red-500' : 'text-green-500'}`} />
                <span className={isOverdue ? 'text-red-700 dark:text-red-300' : 'text-green-700 dark:text-green-300'}>
                  Vencimento: {format(parseISO(card.due_date), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-2 mt-6">
          <Button variant="outline" onClick={handleClear} disabled={updateCardMutation.isPending}>
            Limpar Datas
          </Button>
          <Button onClick={handleSave} disabled={updateCardMutation.isPending}>
            Salvar
          </Button>
        </div>
      </div>
    </div>
  )
}
