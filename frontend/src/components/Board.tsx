import { DragDropContext, DropResult, Droppable, Draggable } from '@hello-pangea/dnd'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { listAPI, cardAPI, labelAPI, boardAPI } from '@/lib/api.ts'
import { Board as BoardType } from '../types'
import Column from './Column'
import FilterBar from './FilterBar'
import CalendarView from './CalendarView'
import TableView from './TableView'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { useState, useMemo } from 'react'
import { Plus } from 'lucide-react'
import { useKeyboardShortcuts, getBoardShortcuts } from '../hooks/useKeyboardShortcuts'
import KeyboardShortcuts from './KeyboardShortcuts'

interface BoardProps {
  board: BoardType
}

export default function Board({ board }: BoardProps) {
  console.log('Board component render:', { board, boardId: board?.id })
  
  const [newListTitle, setNewListTitle] = useState('')
  const [isAddingList, setIsAddingList] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState({
    selectedLabels: [] as number[],
    selectedMembers: [] as number[],
    dateRange: 'all' as 'all' | 'today' | 'week' | 'month'
  })
  const [viewMode, setViewMode] = useState<'board' | 'calendar' | 'table'>('board')
  const [isDragging, setIsDragging] = useState(false)
  
  const queryClient = useQueryClient()

  // Keyboard shortcuts
  const shortcuts = getBoardShortcuts({
    onCreateCard: () => {
      // Find the first list and create a card
      if (filteredLists && filteredLists.length > 0) {
        // This would need to be implemented based on your card creation logic
        console.log('Create card shortcut triggered')
      }
    },
    onCreateList: () => setIsAddingList(true),
    onSearch: () => {
      // Focus search input
      const searchInput = document.querySelector('input[placeholder*="Search"]') as HTMLInputElement
      searchInput?.focus()
    },
    onQuickEdit: () => {
      console.log('Quick edit shortcut triggered')
    },
    onEscape: () => {
      setIsAddingList(false)
      setNewListTitle('')
    }
  })

  useKeyboardShortcuts({ shortcuts })

  const { data: lists, isLoading, error: listsError } = useQuery({
    queryKey: ['lists', board.id],
    queryFn: () => {
      console.log('📋 Fetching lists for board:', board.id)
      return listAPI.getLists(board.id).then(res => {
        console.log('📋 Lists response:', res.data)
        const lists = res.data.results || []
        console.log('📋 Processed lists:', lists.length, 'lists found')
        return lists
      })
    },
  })

  const { data: labels } = useQuery({
    queryKey: ['labels', board.id],
    queryFn: () => labelAPI.getLabels(board.id).then(res => res.data.results || []),
  })

  const { data: members } = useQuery({
    queryKey: ['board-members', board.id],
    queryFn: () => boardAPI.getMembers(board.id).then(res => res.data.results || []),
  })

  console.log('Board query state:', { 
    lists, 
    isLoading, 
    listsError, 
    hasLists: !!lists,
    listsCount: lists?.length || 0,
    listsWithCards: lists?.map(l => ({ id: l.id, title: l.title, cardsCount: l.cards?.length || 0 })) || []
  })

  const createListMutation = useMutation({
    mutationFn: (data: { title: string }) => listAPI.createList(board.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lists', board.id] })
      setNewListTitle('')
      setIsAddingList(false)
    },
  })

  const moveCardMutation = useMutation({
    mutationFn: (data: { card_id: number; list_id: number; position: number }) => {
      console.log('🔄 Moving card via API:', data)
      return cardAPI.moveCard(data)
    },
    onSuccess: (response) => {
      console.log('✅ Card moved successfully:', response.data)
      // Don't invalidate/refetch - let the optimistic update handle it
    },
    onError: (error) => {
      console.error('❌ Error moving card:', error)
      console.error('❌ Error details:', error.response?.data)
    },
  })

  const moveListMutation = useMutation({
    mutationFn: async ({ listId, newPosition, allLists }: { 
      listId: number; 
      newPosition: number; 
      allLists: any[] 
    }) => {
      console.log('🔄 Moving list via API:', { listId, newPosition, totalLists: allLists.length })
      
      // Reorder the lists array
      const reorderedLists = Array.from(allLists)
      const sourceIndex = reorderedLists.findIndex(list => list.id === listId)
      
      if (sourceIndex === -1) {
        throw new Error('List not found')
      }
      
      const [movedList] = reorderedLists.splice(sourceIndex, 1)
      reorderedLists.splice(newPosition, 0, movedList)
      
      console.log('📋 Reordered lists:', reorderedLists.map((l, i) => ({ id: l.id, position: i + 1 })))
      
      // Create list orders array for bulk update
      const listOrders = reorderedLists.map((list, index) => ({
        id: list.id,
        position: index + 1
      }))
      
      // Use the new bulk reorder endpoint
      return listAPI.reorderLists(board.id, listOrders)
    },
    onMutate: async ({ listId, newPosition, allLists }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['lists', board.id] })
      
      // Snapshot the previous value
      const previousLists = queryClient.getQueryData(['lists', board.id])
      
      // Optimistically update the cache
      const reorderedLists = Array.from(allLists)
      const sourceIndex = reorderedLists.findIndex(list => list.id === listId)
      
      if (sourceIndex !== -1) {
        const [movedList] = reorderedLists.splice(sourceIndex, 1)
        reorderedLists.splice(newPosition, 0, movedList)
        
        // Update the cache with the new order
        queryClient.setQueryData(['lists', board.id], reorderedLists)
      }
      
      setIsDragging(true)
      
      // Return a context object with the snapshotted value
      return { previousLists }
    },
    onError: (err, variables, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousLists) {
        queryClient.setQueryData(['lists', board.id], context.previousLists)
      }
      console.error('❌ Error moving list:', err)
      setIsDragging(false)
    },
    onSuccess: (response) => {
      console.log('✅ All lists moved successfully')
      setIsDragging(false)
      // Don't invalidate - we already updated optimistically
    },
  })

  const handleDragStart = (start: any) => {
    console.log('🎯 Drag start:', start)
    // Prevenir o comportamento padrão do drag preview
    if (start.draggableId) {
      const element = document.querySelector(`[data-rbd-draggable-id="${start.draggableId}"]`)
      if (element) {
        element.style.transform = 'none'
      }
    }
  }

  const handleDragOver = (event: any) => {
    // Prevenir comportamento padrão para permitir drop
    event.preventDefault()
  }

  const handleDragEnd = (result: DropResult) => {
    const { destination, source, draggableId, type } = result

    console.log('🎯 Drag end:', { destination, source, draggableId, type })

    // Prevenir comportamento padrão
    result.event?.preventDefault()

    if (!destination) {
      console.log('❌ No destination, cancelling drag')
      return
    }

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      console.log('❌ Same position, cancelling drag')
      return
    }

    if (type === 'card') {
      const cardId = parseInt(draggableId)
      const sourceListId = parseInt(source.droppableId)
      const destListId = parseInt(destination.droppableId)

      console.log('🚀 Moving card:', { cardId, sourceListId, destListId })

      // Calculate new position based on destination index
      let newPosition = destination.index + 1

      // If moving to a different list, we need to get the cards in the destination list
      if (sourceListId !== destListId) {
        const destList = lists?.find(list => list.id === destListId)
        if (destList && destList.cards) {
          // Position based on the cards in the destination list
          newPosition = destination.index + 1
          console.log('📋 Moving to different list, destination has', destList.cards.length, 'cards')
        }
      }

      console.log('📍 New position:', newPosition)

      moveCardMutation.mutate({
        card_id: cardId,
        list_id: destListId,
        position: newPosition,
      })
    } else if (type === 'list') {
      // Handle list reordering
      const listId = parseInt(draggableId)
      const newPosition = destination.index

      console.log('🚀 Moving list:', { listId, newPosition, sourceIndex: source.index, destIndex: destination.index })

      // Get all lists and use the mutation
      const allLists = filteredLists || []
      
      moveListMutation.mutate({
        listId,
        newPosition,
        allLists
      })
    }
  }

  const handleCreateList = (e: React.FormEvent) => {
    e.preventDefault()
    if (newListTitle.trim()) {
      createListMutation.mutate({ title: newListTitle.trim() })
    }
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
  }

  const handleFilterChange = (newFilters: any) => {
    setFilters(newFilters)
  }


  // Filter lists based on search and filters
  const filteredLists = useMemo(() => {
    if (!lists) return []
    
    return lists.map(list => {
      if (!list.cards) return list
      
      let filteredCards = list.cards
      
      // Search filter
      if (searchQuery) {
        filteredCards = filteredCards.filter(card => 
          card.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          card.description?.toLowerCase().includes(searchQuery.toLowerCase())
        )
      }
      
      // Label filter
      if (filters.selectedLabels.length > 0) {
        filteredCards = filteredCards.filter(card =>
          card.labels?.some((label: any) => filters.selectedLabels.includes(label.id))
        )
      }
      
      // Member filter
      if (filters.selectedMembers.length > 0) {
        filteredCards = filteredCards.filter(card =>
          filters.selectedMembers.includes(card.created_by?.id)
        )
      }
      
      // Date filter
      if (filters.dateRange !== 'all') {
        const now = new Date()
        const cardDate = new Date(card.created_at)
        
        switch (filters.dateRange) {
          case 'today':
            filteredCards = filteredCards.filter(card => {
              const cardDate = new Date(card.created_at)
              return cardDate.toDateString() === now.toDateString()
            })
            break
          case 'week':
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
            filteredCards = filteredCards.filter(card => {
              const cardDate = new Date(card.created_at)
              return cardDate >= weekAgo
            })
            break
          case 'month':
            const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
            filteredCards = filteredCards.filter(card => {
              const cardDate = new Date(card.created_at)
              return cardDate >= monthAgo
            })
            break
        }
      }
      
      return { ...list, cards: filteredCards }
    })
  }, [lists, searchQuery, filters])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading lists...</p>
        </div>
      </div>
    )
  }

  if (listsError) {
    console.error('Lists error:', listsError)
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-600">Error loading lists: {listsError.message}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:dark-layered-bg">
      <FilterBar
        onSearch={handleSearch}
        onFilterChange={handleFilterChange}
        availableLabels={labels}
        availableMembers={members?.map(m => ({ id: m.user.id, name: m.user.first_name || m.user.username }))}
      />
      
      {/* View Mode Toggle */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
          <button
            onClick={() => setViewMode('board')}
            className={`px-3 py-1 text-sm rounded-md transition-colors ${
              viewMode === 'board'
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            Board
          </button>
          <button
            onClick={() => setViewMode('calendar')}
            className={`px-3 py-1 text-sm rounded-md transition-colors ${
              viewMode === 'calendar'
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            Calendar
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`px-3 py-1 text-sm rounded-md transition-colors ${
              viewMode === 'table'
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            Table
          </button>
        </div>
        
        <KeyboardShortcuts shortcuts={shortcuts} />
      </div>
      {/* Render different views based on viewMode */}
      {viewMode === 'board' && (
        <div className="relative">
          {isDragging && (
            <div className="absolute top-2 right-2 bg-blue-500 text-white px-3 py-1 rounded text-sm z-50">
              Salvando...
            </div>
          )}
          <DragDropContext onDragStart={handleDragStart} onDragOver={handleDragOver} onDragEnd={handleDragEnd} isDragDisabled={isDragging}>
          <Droppable droppableId="lists" direction="horizontal" type="list">
            {(provided) => (
          <div 
            ref={provided.innerRef}
            {...provided.droppableProps}
            className="flex gap-6 overflow-x-auto overflow-y-hidden flex-1 pb-4 px-4" 
          >
                {filteredLists?.map((list, index) => (
                  <Draggable key={list.id} draggableId={list.id.toString()} index={index} type="list">
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className={`flex-shrink-0 ${snapshot.isDragging ? 'rotate-2' : ''}`}
                      >
                        <Column list={list} dragHandleProps={provided.dragHandleProps} />
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
                
                <div className="flex-shrink-0 w-72">
              {isAddingList ? (
                <div className="bg-white dark:dark-card rounded-lg p-4 shadow-sm border border-gray-200 dark:dark-border-subtle">
                  <form onSubmit={handleCreateList}>
                    <Input
                      value={newListTitle}
                      onChange={(e) => setNewListTitle(e.target.value)}
                      placeholder="Enter list title..."
                      className="mb-3"
                      autoFocus
                    />
                    <div className="flex gap-2">
                      <Button
                        type="submit"
                        size="sm"
                        disabled={createListMutation.isPending}
                        aria-label={createListMutation.isPending ? 'Adding list...' : 'Add new list'}
                      >
                        {createListMutation.isPending ? 'Adding...' : 'Add List'}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setIsAddingList(false)
                          setNewListTitle('')
                        }}
                        aria-label="Cancel adding list"
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                </div>
              ) : (
                <Button
                  variant="outline"
                  className="w-full h-12 border-dashed border-2 border-gray-300 dark:dark-border-subtle hover:border-gray-500 dark:hover:border-gray-400 text-gray-600 dark:dark-text-secondary hover:text-gray-800 dark:hover:dark-text-primary hover:bg-gray-100 dark:hover:bg-opacity-10 transition-all duration-200"
                  onClick={() => setIsAddingList(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add a list
                </Button>
              )}
                </div>
              </div>
            )}
          </Droppable>
        </DragDropContext>
        </div>
      )}

      {viewMode === 'calendar' && (
        <div className="flex-1 p-4">
          <CalendarView boardId={board.id} />
        </div>
      )}

      {viewMode === 'table' && (
        <div className="flex-1 p-4">
          <TableView boardId={board.id} />
        </div>
      )}
    </div>
  )
}
