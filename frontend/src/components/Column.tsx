import { Droppable } from '@hello-pangea/dnd'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { cardAPI, listAPI } from '../lib/api.ts'
import { List as ListType } from '../types'
import CardItem from './CardItem'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { useState, useRef, useEffect } from 'react'
import { Plus, MoreHorizontal, Edit, Copy, Move, Archive, SortAsc, Users, Settings, X, Bell, ChevronUp, ChevronDown } from 'lucide-react'
import { MoveListModal } from './MoveListModal'
import { MoveAllCardsModal } from './MoveAllCardsModal'
import { SortCardsModal } from './SortCardsModal'

interface ColumnProps {
  list: ListType
  key?: string | number
  dragHandleProps?: any
}

export default function Column({ list, dragHandleProps }: ColumnProps) {
  const [newCardTitle, setNewCardTitle] = useState('')
  const [isAddingCard, setIsAddingCard] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isFollowing, setIsFollowing] = useState(false)
  const [isAutomationExpanded, setIsAutomationExpanded] = useState(false)
  const [isMovingList, setIsMovingList] = useState(false)
  const [isMovingCards, setIsMovingCards] = useState(false)
  const [isSorting, setIsSorting] = useState(false)
  const [isMoveListModalOpen, setIsMoveListModalOpen] = useState(false)
  const [isMoveAllCardsModalOpen, setIsMoveAllCardsModalOpen] = useState(false)
  const [isSortCardsModalOpen, setIsSortCardsModalOpen] = useState(false)
  const queryClient = useQueryClient()
  const menuRef = useRef<HTMLDivElement>(null)
  const columnRef = useRef<HTMLDivElement>(null)

  // Load follow state from localStorage
  useEffect(() => {
    const followKey = `follow_list_${list.id}`
    const isFollowingStored = localStorage.getItem(followKey) === 'true'
    setIsFollowing(isFollowingStored)
  }, [list.id])

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const { data: cards } = useQuery({
    queryKey: ['cards', list.id],
    queryFn: () => cardAPI.getCards(list.id).then(res => res.data.results || []),
  })

  const createCardMutation = useMutation({
    mutationFn: (title: string) => {
      console.log('🔍 Creating card for list:', list)
      console.log('🔍 List ID:', list.id, 'Type:', typeof list.id)
      return cardAPI.createCard(list.id, {
        title,
        description: '',
        label_ids: []
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cards', list.id] })
      setNewCardTitle('')
      setIsAddingCard(false)
    },
  })

  const handleCreateCard = (e: React.FormEvent) => {
    e.preventDefault()
    if (newCardTitle.trim()) {
      createCardMutation.mutate(newCardTitle.trim())
    }
  }

  const handleCopyList = () => {
    // TODO: Implement copy list functionality
    console.log('Copy list:', list.id)
    setIsMenuOpen(false)
  }

  const handleMoveList = () => {
    setIsMoveListModalOpen(true)
    setIsMenuOpen(false)
  }

  const handleMoveAllCards = () => {
    setIsMoveAllCardsModalOpen(true)
    setIsMenuOpen(false)
  }

  const handleSortList = () => {
    setIsSortCardsModalOpen(true)
    setIsMenuOpen(false)
  }

  const handleFollow = () => {
    const newFollowState = !isFollowing
    setIsFollowing(newFollowState)
    setIsMenuOpen(false)
    
    // Persist follow state in localStorage
    const followKey = `follow_list_${list.id}`
    if (newFollowState) {
      localStorage.setItem(followKey, 'true')
    } else {
      localStorage.removeItem(followKey)
    }
  }

  const archiveListMutation = useMutation({
    mutationFn: () => listAPI.archiveList(list.board, list.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lists', list.board] })
      setIsMenuOpen(false)
    },
  })

  const archiveAllCardsMutation = useMutation({
    mutationFn: () => cardAPI.archiveAllCardsInList(list.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lists', list.board] })
      queryClient.invalidateQueries({ queryKey: ['cards', list.id] })
      setIsMenuOpen(false)
    },
  })

  const handleArchiveList = () => {
    if (window.confirm('Tem certeza que deseja arquivar esta lista?')) {
      archiveListMutation.mutate()
    }
  }

  const handleArchiveAllCards = () => {
    if (window.confirm('Tem certeza que deseja arquivar todos os cartões desta lista?')) {
      archiveAllCardsMutation.mutate()
    }
  }

  const handleAutomationRule = (rule: string) => {
    // TODO: Implement automation rule functionality
    console.log('Automation rule:', rule)
    setIsMenuOpen(false)
  }

  const handleCreateRule = () => {
    // TODO: Implement create rule functionality
    console.log('Create rule')
    setIsMenuOpen(false)
  }

  const sortedCards = cards?.sort((a, b) => a.position - b.position) || []

  return (
    <div className="flex-shrink-0 w-72" ref={columnRef}>
      <div className="bg-white dark:dark-card-hover rounded-lg p-4 shadow-md border border-gray-200 dark:dark-border-subtle hover:shadow-lg transition-shadow">
        <div className="flex items-center justify-between mb-4" {...dragHandleProps}>
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-gray-900 dark:dark-text-primary">{list.title}</h3>
            {isFollowing && (
              <Bell className="h-4 w-4 text-gray-400" title="Seguindo esta lista" />
            )}
          </div>
          <div className="relative" ref={menuRef}>
            <Button 
              variant="ghost" 
              size="sm"
              className="h-8 w-8 p-0"
              onClick={(e) => {
                e.stopPropagation()
                setIsMenuOpen(!isMenuOpen)
              }}
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
            
            {isMenuOpen && (
              <div className="absolute left-0 top-8 z-50 w-72 bg-white dark:dark-surface rounded-md shadow-lg border border-gray-200 dark:dark-border-subtle" style={{ minWidth: '280px', maxHeight: '80vh', overflowY: 'auto' }}>
                <div className="py-2">
                  {/* Header */}
                  <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 dark:dark-border-subtle">
                    <h4 className="text-sm font-medium text-gray-900 dark:dark-text-primary">Ações da Lista</h4>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setIsMenuOpen(false)
                      }}
                      className="text-gray-400 hover:text-gray-600 dark:hover:text-white"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  
                  {/* Ações Principais */}
                  <div className="py-1">
                    <button
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:dark-text-primary hover:bg-gray-100 dark:hover:bg-opacity-10"
                      onClick={(e) => {
                        e.stopPropagation()
                        setIsAddingCard(true)
                        setIsMenuOpen(false)
                      }}
                    >
                      <Plus className="h-4 w-4 mr-3" />
                      Adicionar cartão
                    </button>
                    <button
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:dark-text-primary hover:bg-gray-100 dark:hover:bg-opacity-10"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleCopyList()
                      }}
                    >
                      <Copy className="h-4 w-4 mr-3" />
                      Copiar lista
                    </button>
                    <button
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:dark-text-primary hover:bg-gray-100 dark:hover:bg-opacity-10"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleMoveList()
                      }}
                    >
                      <Move className="h-4 w-4 mr-3" />
                      Mover lista
                    </button>
                    <button
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:dark-text-primary hover:bg-gray-100 dark:hover:bg-opacity-10"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleMoveAllCards()
                      }}
                    >
                      <Users className="h-4 w-4 mr-3" />
                      Mover todos os cartões nesta lista
                    </button>
                    <button
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:dark-text-primary hover:bg-gray-100 dark:hover:bg-opacity-10"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleSortList()
                      }}
                    >
                      <SortAsc className="h-4 w-4 mr-3" />
                      Ordenar por...
                    </button>
                  </div>

                  <div className="border-t border-gray-200 dark:dark-border-subtle"></div>

                  {/* Ações de Seguir */}
                  <div className="py-1">
                    <button
                      className={`flex items-center w-full px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-opacity-10 ${
                        isFollowing ? 'bg-gray-600 text-white' : 'text-gray-700 dark:dark-text-primary'
                      }`}
                      onClick={(e) => {
                        e.stopPropagation()
                        handleFollow()
                      }}
                    >
                      <Bell className="h-4 w-4 mr-3" />
                        {isFollowing ? (
                          <>
                            <span className="flex-1">Seguindo</span>
                            <span className="text-gray-300">✓</span>
                          </>
                        ) : (
                          'Seguir'
                        )}
                    </button>
                  </div>

                  <div className="border-t border-gray-200 dark:dark-border-subtle"></div>

                  {/* Automação */}
                  <div className="py-1">
                    <button
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:dark-text-primary hover:bg-gray-100 dark:hover:bg-opacity-10"
                      onClick={(e) => {
                        e.stopPropagation()
                        setIsAutomationExpanded(!isAutomationExpanded)
                      }}
                    >
                      <Settings className="h-4 w-4 mr-3" />
                      Automação
                      {isAutomationExpanded ? (
                        <ChevronUp className="h-4 w-4 ml-auto" />
                      ) : (
                        <ChevronDown className="h-4 w-4 ml-auto" />
                      )}
                    </button>
                    
                    {isAutomationExpanded && (
                      <div className="pl-7">
                        <button
                          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:dark-text-secondary hover:bg-gray-100 dark:hover:bg-opacity-10 text-left"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleAutomationRule('Quando um cartão for adicionado à lista')
                          }}
                        >
                          Quando um cartão for adicionado à lista...
                        </button>
                        <button
                          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:dark-text-secondary hover:bg-gray-100 dark:hover:bg-opacity-10 text-left"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleAutomationRule('Todo dia, ordenar a lista')
                          }}
                        >
                          Todo dia, ordenar a lista por...
                        </button>
                        <button
                          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:dark-text-secondary hover:bg-gray-100 dark:hover:bg-opacity-10 text-left"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleAutomationRule('Toda segunda-feira, ordenar a lista')
                          }}
                        >
                          Toda segunda-feira, ordenar a lista por...
                        </button>
                        <button
                          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:dark-text-secondary hover:bg-gray-100 dark:hover:bg-opacity-10 text-left"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleCreateRule()
                          }}
                        >
                          Criar uma regra
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="border-t border-gray-200 dark:dark-border-subtle"></div>

                  {/* Ações de Arquivar */}
                  <div className="py-1">
                    <button
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:dark-text-primary hover:bg-gray-100 dark:hover:bg-opacity-10 disabled:opacity-50"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleArchiveList()
                      }}
                      disabled={archiveListMutation.isPending}
                    >
                      <Archive className="h-4 w-4 mr-3" />
                      {archiveListMutation.isPending ? 'Arquivando...' : 'Arquivar Esta Lista'}
                    </button>
                    <button
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:dark-text-primary hover:bg-gray-100 dark:hover:bg-opacity-10 disabled:opacity-50"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleArchiveAllCards()
                      }}
                      disabled={archiveAllCardsMutation.isPending}
                    >
                      <Archive className="h-4 w-4 mr-3" />
                      {archiveAllCardsMutation.isPending ? 'Arquivando...' : 'Arquivar todos os cartões nesta lista'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <Droppable droppableId={list.id.toString()} type="card">
          {(provided, snapshot) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className={`min-h-[100px] transition-colors ${
                snapshot.isDraggingOver ? 'bg-blue-50 dark:bg-blue-900/20' : ''
              }`}
            >
              {sortedCards.map((card, index) => (
                <CardItem key={card.id} card={card} index={index} />
              ))}
              {provided.placeholder}

              {isAddingCard ? (
                <div className="mt-2">
                  <form onSubmit={handleCreateCard}>
                    <Input
                      value={newCardTitle}
                      onChange={(e) => setNewCardTitle(e.target.value)}
                      placeholder="Digite um título para este cartão..."
                      className="mb-2"
                      autoFocus
                    />
                    <div className="flex gap-2">
                      <Button
                        type="submit"
                        size="sm"
                        disabled={createCardMutation.isPending}
                        aria-label={createCardMutation.isPending ? 'Adicionando cartão...' : 'Adicionar novo cartão'}
                      >
                        {createCardMutation.isPending ? 'Adicionando...' : 'Adicionar Cartão'}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setIsAddingCard(false)
                          setNewCardTitle('')
                        }}
                        aria-label="Cancelar adição de cartão"
                      >
                        Cancelar
                      </Button>
                    </div>
                  </form>
                </div>
              ) : (
                <Button
                  variant="ghost"
                  className="w-full justify-start text-gray-600 dark:dark-text-secondary hover:text-gray-800 dark:hover:dark-text-primary hover:bg-gray-100 dark:hover:bg-opacity-10 transition-all duration-200"
                  onClick={() => setIsAddingCard(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar um cartão
                </Button>
              )}
            </div>
          )}
        </Droppable>
      </div>

      {/* Modals */}
      <MoveListModal
        isOpen={isMoveListModalOpen}
        onClose={() => setIsMoveListModalOpen(false)}
        list={list}
      />

      <MoveAllCardsModal
        isOpen={isMoveAllCardsModalOpen}
        onClose={() => setIsMoveAllCardsModalOpen(false)}
        sourceList={list}
        cards={cards || []}
      />

      <SortCardsModal
        isOpen={isSortCardsModalOpen}
        onClose={() => setIsSortCardsModalOpen(false)}
        listId={list.id}
        cards={cards || []}
      />
    </div>
  )
}