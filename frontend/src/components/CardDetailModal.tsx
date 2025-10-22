import React, { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { X, Calendar, Users, Tag, CheckSquare, MessageSquare, Plus, Paperclip, Palette } from 'lucide-react'
import { cardAPI, commentAPI, labelAPI, attachmentAPI } from '@/lib/api'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Textarea } from './ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import LabelManager from './LabelManager'
import MemberManager from './MemberManager'
import AttachmentManager from './AttachmentManager'
import { DateManager } from './DateManager'
import { ChecklistManager } from './ChecklistManager'
import EmojiReactions from './EmojiReactions'
import CardCover from './CardCover'

interface CardDetailModalProps {
  cardId: number
  isOpen: boolean
  onClose: () => void
}

export default function CardDetailModal({ cardId, isOpen, onClose }: CardDetailModalProps) {
  const [newComment, setNewComment] = useState('')
  const [isAddingComment, setIsAddingComment] = useState(false)
  const [isLabelManagerOpen, setIsLabelManagerOpen] = useState(false)
  const [isMemberManagerOpen, setIsMemberManagerOpen] = useState(false)
  const [isAttachmentManagerOpen, setIsAttachmentManagerOpen] = useState(false)
  const [isDateManagerOpen, setIsDateManagerOpen] = useState(false)
  const [isChecklistManagerOpen, setIsChecklistManagerOpen] = useState(false)
  const [isCardCoverOpen, setIsCardCoverOpen] = useState(false)
  const [isEditingDescription, setIsEditingDescription] = useState(false)
  const [description, setDescription] = useState('')
  
  const queryClient = useQueryClient()

  const { data: card, isLoading, error } = useQuery({
    queryKey: ['card', cardId],
    queryFn: () => {
      console.log('🔍 Fetching card:', cardId, 'type:', typeof cardId)
      console.log('🔍 CardId is number?', typeof cardId === 'number')
      console.log('🔍 CardId value:', cardId)
      return cardAPI.getCard(cardId).then(res => {
        console.log('✅ Card response:', res.data)
        return res.data
      })
    },
    enabled: isOpen && !!cardId,
  })

  console.log('CardDetailModal state:', { cardId, isOpen, card, isLoading, error })

  // Sync description with card data
  useEffect(() => {
    if (card?.description !== undefined) {
      setDescription(card.description || '')
    }
  }, [card?.description])

  const { data: comments } = useQuery({
    queryKey: ['comments', cardId],
    queryFn: () => commentAPI.getComments(cardId).then(res => res.data.results || []),
    enabled: isOpen && !!cardId,
  })

  const addCommentMutation = useMutation({
    mutationFn: (content: string) => commentAPI.createComment(cardId, { content }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', cardId] })
      setNewComment('')
      setIsAddingComment(false)
    },
  })

  const updateCardLabelsMutation = useMutation({
    mutationFn: (labelIds: number[]) =>
      cardAPI.updateCard(cardId, { label_ids: labelIds }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['card', cardId] })
      queryClient.invalidateQueries({ queryKey: ['cards'] })
    },
  })

  const updateCardDescriptionMutation = useMutation({
    mutationFn: (description: string) =>
      cardAPI.updateCard(cardId, { description }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['card', cardId] })
      queryClient.invalidateQueries({ queryKey: ['cards'] })
      queryClient.invalidateQueries({ queryKey: ['lists'] })
      setIsEditingDescription(false)
    },
  })

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault()
    if (newComment.trim()) {
      addCommentMutation.mutate(newComment.trim())
    }
  }

  const handleLabelSelect = (labelId: number) => {
    const currentLabels = card?.labels?.map((l: any) => l.id) || []
    const newLabels = [...currentLabels, labelId]
    updateCardLabelsMutation.mutate(newLabels)
  }

  const handleLabelDeselect = (labelId: number) => {
    const currentLabels = card?.labels?.map((l: any) => l.id) || []
    const newLabels = currentLabels.filter((id: number) => id !== labelId)
    updateCardLabelsMutation.mutate(newLabels)
  }

  const handleDownloadAttachment = (attachment: any) => {
    const link = document.createElement('a')
    link.href = attachment.file
    link.download = attachment.name
    link.target = '_blank'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleEditDescription = () => {
    setIsEditingDescription(true)
  }

  const handleSaveDescription = () => {
    updateCardDescriptionMutation.mutate(description)
  }

  const handleCancelEditDescription = () => {
    setDescription(card?.description || '')
    setIsEditingDescription(false)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-4xl h-5/6 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {card?.title || 'Carregando...'}
            </h2>
            <Badge variant="secondary" className="text-sm">
              {card?.list?.title || 'Lista'}
            </Badge>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} aria-label="Fechar modal">
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Side - Card Details */}
          <div className="flex-1 p-6 overflow-y-auto">
            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2 mb-6">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setIsLabelManagerOpen(true)}
              >
                <Tag className="h-4 w-4 mr-2" />
                Etiquetas
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setIsDateManagerOpen(true)}
              >
                <Calendar className="h-4 w-4 mr-2" />
                Datas
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setIsChecklistManagerOpen(true)}
              >
                <CheckSquare className="h-4 w-4 mr-2" />
                Checklist
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setIsMemberManagerOpen(true)}
              >
                <Users className="h-4 w-4 mr-2" />
                Membros
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setIsAttachmentManagerOpen(true)}
              >
                <Paperclip className="h-4 w-4 mr-2" />
                Anexos
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setIsCardCoverOpen(true)}
              >
                <Palette className="h-4 w-4 mr-2" />
                Capa
              </Button>
            </div>

            {/* Description */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Descrição
                </h3>
                {!isEditingDescription && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleEditDescription}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    Editar
                  </Button>
                )}
              </div>
              {isEditingDescription ? (
                <div className="space-y-2">
                  <Textarea
                    placeholder="Adicione uma descrição mais detalhada..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="min-h-[100px]"
                    autoFocus
                  />
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      onClick={handleSaveDescription}
                      disabled={updateCardDescriptionMutation.isPending}
                    >
                      Salvar
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleCancelEditDescription}
                    >
                      Cancelar
                    </Button>
                  </div>
                </div>
              ) : (
                <div
                  className="min-h-[100px] p-3 border border-gray-200 dark:border-gray-700 rounded-md bg-gray-50 dark:bg-gray-800 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  onClick={handleEditDescription}
                >
                  {card?.description ? (
                    <p className="text-gray-900 dark:text-white whitespace-pre-wrap">
                      {card.description}
                    </p>
                  ) : (
                    <p className="text-gray-500 dark:text-gray-400 italic">
                      Clique para adicionar uma descrição...
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Labels */}
            {card?.labels && card.labels.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Etiquetas
                </h3>
                <div className="flex flex-wrap gap-2">
                  {card.labels.map((label: any) => (
                    <Badge
                      key={label.id}
                      style={{ backgroundColor: label.color }}
                      className="text-white"
                    >
                      {label.name}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Attachments */}
            {card?.attachments && card.attachments.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Anexos ({card.attachments.length})
                </h3>
                <div className="space-y-2">
                  {card.attachments.slice(0, 3).map((attachment: any) => (
                    <div 
                      key={attachment.id} 
                      className="flex items-center space-x-3 p-2 bg-gray-50 dark:bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                      onClick={() => handleDownloadAttachment(attachment)}
                      title="Clique para baixar"
                    >
                      <Paperclip className="h-4 w-4 text-gray-500" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate hover:text-blue-600 dark:hover:text-blue-400">
                          {attachment.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {attachment.file_size_display}
                        </p>
                      </div>
                    </div>
                  ))}
                  {card.attachments.length > 3 && (
                    <p className="text-sm text-gray-500">
                      +{card.attachments.length - 3} anexos adicionais
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right Side - Comments */}
          <div className="w-80 border-l border-gray-200 dark:border-gray-700 p-6 overflow-y-auto">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Comentários e atividade
            </h3>

            {/* Add Comment Form */}
            <form onSubmit={handleAddComment} className="mb-4">
              <Textarea
                placeholder="Escrever um comentário..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="mb-2"
                rows={3}
              />
              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setNewComment('')
                    setIsAddingComment(false)
                  }}
                >
                  Cancelar
                </Button>
                <Button type="submit" size="sm" disabled={!newComment.trim()}>
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Comentar
                </Button>
              </div>
            </form>

            {/* Comments List */}
            <div className="space-y-4">
              {comments?.map((comment: any) => (
                <Card key={comment.id} className="p-3">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                      {comment.author?.first_name?.[0] || comment.author?.username?.[0] || 'U'}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="font-medium text-sm text-gray-900 dark:text-white">
                          {comment.author?.first_name || comment.author?.username || 'Usuário'}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(comment.created_at).toLocaleString('pt-BR')}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        {comment.content}
                      </p>
                      <div className="mt-2">
                        <EmojiReactions
                          commentId={comment.id}
                          reactions={comment.reactions || []}
                          currentUserId={1} // This should come from auth context
                        />
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Label Manager Modal */}
      <LabelManager
        boardId={card?.list?.board || 0}
        isOpen={isLabelManagerOpen}
        onClose={() => setIsLabelManagerOpen(false)}
        selectedLabels={card?.labels?.map((l: any) => l.id) || []}
        onLabelSelect={handleLabelSelect}
        onLabelDeselect={handleLabelDeselect}
      />

      {/* Member Manager Modal */}
      <MemberManager
        boardId={card?.list?.board || 0}
        isOpen={isMemberManagerOpen}
        onClose={() => setIsMemberManagerOpen(false)}
      />

      {/* Attachment Manager Modal */}
      <AttachmentManager
        cardId={cardId}
        isOpen={isAttachmentManagerOpen}
        onClose={() => setIsAttachmentManagerOpen(false)}
      />

      {/* Date Manager Modal */}
      <DateManager
        cardId={cardId}
        isOpen={isDateManagerOpen}
        onClose={() => setIsDateManagerOpen(false)}
        card={card}
      />

      {/* Checklist Manager Modal */}
      <ChecklistManager
        cardId={cardId}
        isOpen={isChecklistManagerOpen}
        onClose={() => setIsChecklistManagerOpen(false)}
      />

      {/* Card Cover Modal */}
      <CardCover
        cardId={cardId}
        coverColor={card?.cover_color}
        coverImage={card?.cover_image}
        isOpen={isCardCoverOpen}
        onClose={() => setIsCardCoverOpen(false)}
      />
    </div>
  )
}
