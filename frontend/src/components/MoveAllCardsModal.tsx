import React, { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog'
import { Button } from './ui/button'
import { ArrowLeft, X } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { listAPI, cardAPI } from '@/lib/api.ts'

interface MoveAllCardsModalProps {
  isOpen: boolean
  onClose: () => void
  sourceList: {
    id: number
    title: string
    board: number
  }
  cards: any[]
}

export function MoveAllCardsModal({ isOpen, onClose, sourceList, cards }: MoveAllCardsModalProps) {
  const [selectedListId, setSelectedListId] = useState<number | null>(null)
  const queryClient = useQueryClient()

  // Fetch all lists in the same board
  const { data: lists } = useQuery({
    queryKey: ['lists', sourceList.board],
    queryFn: () => listAPI.getLists(sourceList.board).then(res => res.data.results || []),
    enabled: isOpen,
  })

  const moveAllCardsMutation = useMutation({
    mutationFn: async (targetListId: number) => {
      if (!cards || cards.length === 0) return
      
      // Move all cards to the target list
      const movePromises = cards.map((card, index) => 
        cardAPI.moveCard({
          card_id: card.id,
          list_id: targetListId,
          position: index + 1 // API expects 1-based positions
        })
      )
      
      await Promise.all(movePromises)
      return { success: true }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cards'] })
      queryClient.invalidateQueries({ queryKey: ['lists'] })
      onClose()
    },
    onError: (error) => {
      alert('Erro ao mover cards: ' + error.message)
    },
  })

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedListId(null)
    }
  }, [isOpen])

  const handleMove = () => {
    if (selectedListId) {
      moveAllCardsMutation.mutate(selectedListId)
    }
  }

  const availableLists = lists?.filter(list => list.id !== sourceList.id) || []

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
              Mover Todos os Cartões na Lista
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
          <div className="space-y-2">
            <p className="text-sm text-gray-300 mb-4">
              Mover {cards.length} cartão(cartões) de "{sourceList.title}" para:
            </p>
            
            <div className="space-y-1">
              {availableLists.map((list) => (
                <button
                  key={list.id}
                  onClick={() => setSelectedListId(list.id)}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                    selectedListId === list.id
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  {list.title}
                </button>
              ))}
              
              {availableLists.length === 0 && (
                <p className="text-gray-400 text-sm text-center py-4">
                  Não há outras listas disponíveis neste board
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <Button
            onClick={handleMove}
            disabled={!selectedListId || moveAllCardsMutation.isPending}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {moveAllCardsMutation.isPending ? 'Movendo...' : 'Mover'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
