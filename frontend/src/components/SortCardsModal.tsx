import React, { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog'
import { Button } from './ui/button'
import { ArrowLeft, X } from 'lucide-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { cardAPI } from '../lib/api'

interface SortCardsModalProps {
  isOpen: boolean
  onClose: () => void
  listId: number
  cards: any[]
}

export function SortCardsModal({ isOpen, onClose, listId, cards }: SortCardsModalProps) {
  const [selectedSort, setSelectedSort] = useState<string>('')
  const queryClient = useQueryClient()

  const sortCardsMutation = useMutation({
    mutationFn: async (sortBy: string) => {
      if (!cards || cards.length === 0) return
      
      let sortedCards = [...cards]
      
      switch (sortBy) {
        case 'created_desc':
          sortedCards.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
          break
        case 'created_asc':
          sortedCards.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
          break
        case 'title_asc':
          sortedCards.sort((a, b) => a.title.localeCompare(b.title))
          break
        default:
          return
      }
      
      // Update positions
      const updatePromises = sortedCards.map((card, index) => 
        cardAPI.updateCard(card.id, { position: index })
      )
      
      await Promise.all(updatePromises)
      return { success: true }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cards', listId] })
      queryClient.invalidateQueries({ queryKey: ['cards'] })
      onClose()
    },
    onError: (error) => {
      alert('Erro ao ordenar cards: ' + error.message)
    },
  })

  const handleSort = () => {
    if (selectedSort) {
      sortCardsMutation.mutate(selectedSort)
    }
  }

  const sortOptions = [
    { value: 'created_desc', label: 'Data de criação (mais recente primeiro)' },
    { value: 'created_asc', label: 'Data de criação (mais antigo primeiro)' },
    { value: 'title_asc', label: 'Nome do cartão (em ordem alfabética)' },
  ]

  if (!isOpen) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-gray-800 border-gray-700">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between text-white">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-gray-400 hover:text-white p-1"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              Ordenar lista
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-gray-400 hover:text-white p-1"
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="py-4">
          <div className="space-y-1">
            {sortOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setSelectedSort(option.value)}
                className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                  selectedSort === option.value
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:bg-gray-700'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex justify-end">
          <Button
            onClick={handleSort}
            disabled={!selectedSort || sortCardsMutation.isPending}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {sortCardsMutation.isPending ? 'Ordenando...' : 'Ordenar'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
