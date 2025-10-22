import { Draggable } from '@hello-pangea/dnd'
import { useState, useEffect, useRef } from 'react'
import { Card as CardType } from '../types'
import { Button } from './ui/button'
import { Card, CardContent } from './ui/card'
import { MoreHorizontal, MessageSquare, Paperclip, Calendar, Clock, CheckSquare, Edit, Copy, Trash2 } from 'lucide-react'
import { format, parseISO, isAfter, isBefore } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import CardDetailModal from './CardDetailModal'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { cardAPI } from '../lib/api'

interface CardItemProps {
  card: CardType
  index: number
  key?: string | number
}

const COVER_COLORS = {
  blue: '#3B82F6',
  green: '#10B981',
  red: '#EF4444',
  orange: '#F59E0B',
  purple: '#8B5CF6',
  pink: '#EC4899',
  lime: '#84CC16',
  sky: '#0EA5E9',
  grey: '#6B7280',
}

const getCoverColor = (color: string) => {
  return COVER_COLORS[color as keyof typeof COVER_COLORS] || '#3B82F6'
}

export default function CardItem({ card, index }: CardItemProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const queryClient = useQueryClient()
  const menuRef = useRef<HTMLDivElement>(null)

  console.log('CardItem - card:', card)
  console.log('CardItem - card.id:', card.id, 'type:', typeof card.id)

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false)
      }
    }

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isMenuOpen])

  const duplicateCardMutation = useMutation({
    mutationFn: () => cardAPI.createCard(card.list.id, {
      title: `${card.title} (Cópia)`,
      description: card.description,
      position: card.position + 1,
      label_ids: card.labels?.map((l: any) => l.id) || []
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cards'] })
      queryClient.invalidateQueries({ queryKey: ['lists'] })
      setIsMenuOpen(false)
    },
  })

  const deleteCardMutation = useMutation({
    mutationFn: () => cardAPI.deleteCard(card.list.id, card.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cards'] })
      queryClient.invalidateQueries({ queryKey: ['lists'] })
      setIsMenuOpen(false)
    },
  })

  const handleDuplicate = () => {
    if (confirm('Deseja duplicar este card?')) {
      duplicateCardMutation.mutate()
    }
  }

  const handleDelete = () => {
    if (confirm('Tem certeza que deseja excluir este card? Esta ação não pode ser desfeita.')) {
      deleteCardMutation.mutate()
    }
  }

  return (
    <>
      <Draggable draggableId={card.id.toString()} index={index}>
        {(provided, snapshot) => (
          <Card
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            className={`cursor-pointer hover:shadow-md transition-all duration-200 bg-white dark:dark-card-hover border border-gray-200 dark:dark-border-subtle hover:border-gray-300 dark:hover:border-opacity-50 ${
              snapshot.isDragging ? 'shadow-xl rotate-2 scale-105' : ''
            }`}
          >
            {/* Card Cover */}
            {(card.cover_color || card.cover_image) && (
              <div className="h-16 w-full rounded-t-lg overflow-hidden">
                {card.cover_image ? (
                  <img
                    src={card.cover_image}
                    alt="Card cover"
                    className="w-full h-full object-cover"
                  />
                ) : card.cover_color ? (
                  <div
                    className="w-full h-full"
                    style={{
                      backgroundColor: getCoverColor(card.cover_color)
                    }}
                  />
                ) : null}
              </div>
            )}
            <CardContent 
              className="p-3"
              onClick={() => {
                console.log('Card clicked, opening modal')
                setIsModalOpen(true)
              }}
            >
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-medium text-sm text-gray-900 dark:dark-text-primary line-clamp-2">
                  {card.title}
                </h4>
                <div className="relative" ref={menuRef}>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-6 w-6 p-0"
                    aria-label="Mais opções"
                    onClick={(e) => {
                      e.stopPropagation()
                      setIsMenuOpen(!isMenuOpen)
                    }}
                  >
                    <MoreHorizontal className="h-3 w-3" />
                  </Button>
                  
                  {isMenuOpen && (
                    <div className="absolute right-0 top-6 z-50 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700">
                      <div className="py-1">
                        <button
                          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                          onClick={(e) => {
                            e.stopPropagation()
                            setIsModalOpen(true)
                            setIsMenuOpen(false)
                          }}
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Editar Cartão
                        </button>
                        <button
                          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDuplicate()
                          }}
                          disabled={duplicateCardMutation.isPending}
                        >
                          <Copy className="h-4 w-4 mr-2" />
                          {duplicateCardMutation.isPending ? 'Duplicando...' : 'Duplicar Cartão'}
                        </button>
                        <button
                          className="flex items-center w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDelete()
                          }}
                          disabled={deleteCardMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          {deleteCardMutation.isPending ? 'Excluindo...' : 'Excluir Cartão'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {card.description && (
                <p className="text-xs text-gray-600 dark:dark-text-secondary mb-2 line-clamp-2">
                  {card.description}
                </p>
              )}

              {/* Datas */}
              {(card.start_date || card.due_date) && (
                <div className="flex flex-col gap-1 mb-2">
                  {card.start_date && (
                    <div className="flex items-center space-x-1 text-xs text-gray-500 dark:dark-text-muted">
                      <Clock className="h-3 w-3" />
                      <span>
                        Início: {format(parseISO(card.start_date), 'dd/MM/yyyy', { locale: ptBR })}
                      </span>
                    </div>
                  )}
                  {card.due_date && (
                    <div className="flex items-center space-x-1 text-xs text-gray-500 dark:dark-text-muted">
                      <Calendar className="h-3 w-3" />
                      <span>
                        Vencimento: {format(parseISO(card.due_date), 'dd/MM/yyyy', { locale: ptBR })}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {card.labels && card.labels.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-2">
                  {card.labels.slice(0, 3).map((label) => (
                    <span
                      key={label.id}
                      className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-200 dark:bg-gray-700 text-gray-700 dark:dark-text-secondary"
                    >
                      {label.name}
                    </span>
                  ))}
                  {card.labels.length > 3 && (
                    <span className="text-xs text-gray-500 dark:dark-text-muted">
                      +{card.labels.length - 3} more
                    </span>
                  )}
                </div>
              )}

              <div className="flex items-center justify-between text-xs text-gray-500 dark:dark-text-muted">
                <div className="flex items-center gap-2">
                  {card.comments && card.comments.length > 0 && (
                    <div className="flex items-center gap-1">
                      <MessageSquare className="h-3 w-3" />
                      <span>{card.comments.length}</span>
                    </div>
                  )}
                  {card.attachments && card.attachments.length > 0 && (
                    <div className="flex items-center gap-1">
                      <Paperclip className="h-3 w-3" />
                      <span>{card.attachments.length}</span>
                    </div>
                  )}
                  {card.checklists && card.checklists.length > 0 && (
                    <div className="flex items-center gap-1">
                      <CheckSquare className="h-3 w-3" />
                      <span>
                        {card.checklists.reduce((total: number, checklist: any) => 
                          total + (checklist.items?.length || 0), 0
                        )} itens
                      </span>
                    </div>
                  )}
                </div>
                <span className="text-xs text-gray-500 dark:dark-text-muted">
                  {new Date(card.created_at).toLocaleDateString()}
                </span>
              </div>
            </CardContent>
          </Card>
        )}
      </Draggable>

      <CardDetailModal
        cardId={card.id}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  )
}
