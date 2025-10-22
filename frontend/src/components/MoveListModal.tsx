import React, { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog'
import { Button } from './ui/button'
import { ArrowLeft, X } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { boardAPI, listAPI } from '@/lib/api'

interface MoveListModalProps {
  isOpen: boolean
  onClose: () => void
  list: {
    id: number
    title: string
    board: number
    position: number
  }
}

export function MoveListModal({ isOpen, onClose, list }: MoveListModalProps) {
  const [selectedBoard, setSelectedBoard] = useState<number>(list.board)
  const [selectedPosition, setSelectedPosition] = useState<number>(list.position)
  const [isBoardDropdownOpen, setIsBoardDropdownOpen] = useState(false)
  const [isPositionDropdownOpen, setIsPositionDropdownOpen] = useState(false)
  
  const queryClient = useQueryClient()

  // Fetch all boards
  const { data: boards } = useQuery({
    queryKey: ['boards'],
    queryFn: () => boardAPI.getBoards().then(res => res.data.results || []),
    enabled: isOpen,
  })

  // Fetch lists for selected board
  const { data: lists } = useQuery({
    queryKey: ['lists', selectedBoard],
    queryFn: () => listAPI.getLists(selectedBoard).then(res => res.data.results || []),
    enabled: isOpen,
  })

  const moveListMutation = useMutation({
    mutationFn: async ({ boardId, position }: { boardId: number; position: number }) => {
      if (boardId === list.board) {
        // Simple approach: just update the position of the current list
        // The backend should handle position conflicts
        return listAPI.updateList(boardId, list.id, { position })
      } else {
        // For now, we can't move lists between boards
        throw new Error('Mover listas entre boards não é suportado ainda')
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lists'] })
      queryClient.invalidateQueries({ queryKey: ['boards'] })
      onClose()
    },
    onError: (error) => {
      alert(error.message)
    },
  })

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedBoard(list.board)
      setSelectedPosition(list.position)
    }
  }, [isOpen, list.board, list.position])

  const handleMove = () => {
    moveListMutation.mutate({
      boardId: selectedBoard,
      position: selectedPosition,
    })
  }

  const getPositionOptions = () => {
    if (selectedBoard === list.board) {
      // Same board - show all positions except current
      const allLists = lists || []
      const otherLists = allLists.filter(l => l.id !== list.id)
      return otherLists.map((l, index) => ({
        value: index + 1,
        label: `${index + 1}${index + 1 === list.position ? ' (atual)' : ''}`,
        isCurrent: index + 1 === list.position
      }))
    } else {
      // Different board - show positions 1 to lists.length + 1
      const targetLists = lists || []
      const options = []
      for (let i = 1; i <= targetLists.length + 1; i++) {
        options.push({
          value: i,
          label: `${i}`,
          isCurrent: false
        })
      }
      return options
    }
  }

  const positionOptions = getPositionOptions()

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
              Mover Lista
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

        <div className="space-y-6 py-4">
          {/* Board Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-white">Quadro</label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsBoardDropdownOpen(!isBoardDropdownOpen)}
                className="w-full px-3 py-2 text-left bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {boards?.find(b => b.id === selectedBoard)?.title || 'Selecionar quadro'}
                <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </span>
              </button>
              
              {isBoardDropdownOpen && (
                <div className="absolute z-10 w-full mt-1 bg-gray-700 border border-gray-600 rounded-md shadow-lg">
                  <div className="py-1">
                    {boards?.map((board) => (
                      <button
                        key={board.id}
                        onClick={() => {
                          setSelectedBoard(board.id)
                          setIsBoardDropdownOpen(false)
                          setSelectedPosition(1) // Reset position when changing board
                        }}
                        className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-600 ${
                          board.id === selectedBoard ? 'bg-blue-600 text-white' : 'text-gray-300'
                        }`}
                      >
                        {board.title}{board.id === list.board ? ' (atual)' : ''}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Position Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-white">Posição</label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsPositionDropdownOpen(!isPositionDropdownOpen)}
                className="w-full px-3 py-2 text-left bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {selectedPosition}
                <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </span>
              </button>
              
              {isPositionDropdownOpen && (
                <div className="absolute z-10 w-full mt-1 bg-gray-700 border border-gray-600 rounded-md shadow-lg">
                  <div className="py-1">
                    {positionOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => {
                          setSelectedPosition(option.value)
                          setIsPositionDropdownOpen(false)
                        }}
                        className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-600 ${
                          option.isCurrent ? 'bg-blue-600 text-white' : 'text-gray-300'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <Button
            onClick={handleMove}
            disabled={moveListMutation.isPending}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {moveListMutation.isPending ? 'Movendo...' : 'Mover'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
