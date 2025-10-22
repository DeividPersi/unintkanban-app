import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { checklistAPI } from '@/lib/api.ts'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Checkbox } from './ui/checkbox'
import { X, Plus, Trash2, CheckSquare } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'

interface ChecklistManagerProps {
  cardId: number
  isOpen: boolean
  onClose: () => void
}

export function ChecklistManager({ cardId, isOpen, onClose }: ChecklistManagerProps) {
  const [newChecklistTitle, setNewChecklistTitle] = useState('')
  const [newItemTexts, setNewItemTexts] = useState<{[key: number]: string}>({})
  const [editingChecklist, setEditingChecklist] = useState<number | null>(null)
  const [editingItem, setEditingItem] = useState<number | null>(null)

  const queryClient = useQueryClient()

  const { data: checklists, isLoading } = useQuery({
    queryKey: ['checklists', cardId],
    queryFn: () => checklistAPI.getChecklists(cardId).then(res => res.data.results || []),
    enabled: isOpen,
  })

  const createChecklistMutation = useMutation({
    mutationFn: (data: { title: string }) => checklistAPI.createChecklist(cardId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['checklists', cardId] })
      queryClient.invalidateQueries({ queryKey: ['cards'] })
      queryClient.invalidateQueries({ queryKey: ['lists'] })
      setNewChecklistTitle('')
    },
  })

  const updateChecklistMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: { title: string } }) =>
      checklistAPI.updateChecklist(cardId, id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['checklists', cardId] })
      queryClient.invalidateQueries({ queryKey: ['cards'] })
      queryClient.invalidateQueries({ queryKey: ['lists'] })
      setEditingChecklist(null)
    },
  })

  const deleteChecklistMutation = useMutation({
    mutationFn: (id: number) => checklistAPI.deleteChecklist(cardId, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['checklists', cardId] })
      queryClient.invalidateQueries({ queryKey: ['cards'] })
      queryClient.invalidateQueries({ queryKey: ['lists'] })
    },
  })

  const createItemMutation = useMutation({
    mutationFn: ({ checklistId, data }: { checklistId: number; data: { text: string } }) =>
      checklistAPI.createItem(checklistId, data),
    onSuccess: (_, { checklistId }) => {
      queryClient.invalidateQueries({ queryKey: ['checklists', cardId] })
      queryClient.invalidateQueries({ queryKey: ['cards'] })
      queryClient.invalidateQueries({ queryKey: ['lists'] })
      setNewItemTexts(prev => ({ ...prev, [checklistId]: '' }))
    },
  })

  const updateItemMutation = useMutation({
    mutationFn: ({ checklistId, itemId, data }: { checklistId: number; itemId: number; data: { text?: string; completed?: boolean } }) =>
      checklistAPI.updateItem(checklistId, itemId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['checklists', cardId] })
      queryClient.invalidateQueries({ queryKey: ['cards'] })
      queryClient.invalidateQueries({ queryKey: ['lists'] })
      setEditingItem(null)
    },
  })

  const deleteItemMutation = useMutation({
    mutationFn: ({ checklistId, itemId }: { checklistId: number; itemId: number }) =>
      checklistAPI.deleteItem(checklistId, itemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['checklists', cardId] })
      queryClient.invalidateQueries({ queryKey: ['cards'] })
      queryClient.invalidateQueries({ queryKey: ['lists'] })
    },
  })

  const handleCreateChecklist = (e: React.FormEvent) => {
    e.preventDefault()
    if (newChecklistTitle.trim()) {
      createChecklistMutation.mutate({ title: newChecklistTitle.trim() })
    }
  }

  const handleUpdateChecklist = (id: number, title: string) => {
    if (title.trim()) {
      updateChecklistMutation.mutate({ id, data: { title: title.trim() } })
    }
  }

  const handleCreateItem = (checklistId: number) => {
    const text = newItemTexts[checklistId] || ''
    if (text.trim()) {
      createItemMutation.mutate({ checklistId, data: { text: text.trim() } })
    }
  }

  const handleUpdateItem = (checklistId: number, itemId: number, text: string) => {
    if (text.trim()) {
      updateItemMutation.mutate({ checklistId, itemId, data: { text: text.trim() } })
    }
  }

  const handleToggleItem = (checklistId: number, itemId: number, completed: boolean) => {
    updateItemMutation.mutate({ checklistId, itemId, data: { completed } })
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Gerenciar Checklists
          </h2>
          <Button variant="ghost" size="sm" onClick={onClose} aria-label="Fechar gerenciador de checklists">
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-4">
          {/* Criar Nova Checklist */}
          <form onSubmit={handleCreateChecklist} className="flex space-x-2">
            <Input
              placeholder="Título da checklist..."
              value={newChecklistTitle}
              onChange={(e) => setNewChecklistTitle(e.target.value)}
              className="flex-1"
            />
            <Button type="submit" disabled={!newChecklistTitle.trim() || createChecklistMutation.isPending}>
              <Plus className="h-4 w-4 mr-2" />
              Criar
            </Button>
          </form>

          {/* Lista de Checklists */}
          {isLoading ? (
            <div className="text-center py-4">Carregando...</div>
          ) : checklists?.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Nenhuma checklist criada ainda
            </div>
          ) : (
            checklists?.map((checklist: any) => (
              <Card key={checklist.id} className="p-4">
                <CardHeader className="p-0 pb-3">
                  <div className="flex items-center justify-between">
                    {editingChecklist === checklist.id ? (
                      <Input
                        defaultValue={checklist.title}
                        onBlur={(e) => {
                          handleUpdateChecklist(checklist.id, e.target.value)
                          setEditingChecklist(null)
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handleUpdateChecklist(checklist.id, e.currentTarget.value)
                            setEditingChecklist(null)
                          }
                          if (e.key === 'Escape') {
                            setEditingChecklist(null)
                          }
                        }}
                        autoFocus
                        className="text-lg font-medium"
                      />
                    ) : (
                      <CardTitle 
                        className="text-lg cursor-pointer"
                        onClick={() => setEditingChecklist(checklist.id)}
                      >
                        {checklist.title}
                      </CardTitle>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteChecklistMutation.mutate(checklist.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>

                <CardContent className="p-0">
                  {/* Itens da Checklist */}
                  <div className="space-y-2 mb-3">
                    {checklist.items?.map((item: any) => (
                      <div key={item.id} className="flex items-center space-x-2">
                        <Checkbox
                          checked={item.completed}
                          onCheckedChange={(checked) => 
                            handleToggleItem(checklist.id, item.id, checked as boolean)
                          }
                        />
                        {editingItem === item.id ? (
                          <Input
                            defaultValue={item.text}
                            onBlur={(e) => {
                              handleUpdateItem(checklist.id, item.id, e.target.value)
                              setEditingItem(null)
                            }}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                handleUpdateItem(checklist.id, item.id, e.currentTarget.value)
                                setEditingItem(null)
                              }
                              if (e.key === 'Escape') {
                                setEditingItem(null)
                              }
                            }}
                            autoFocus
                            className="flex-1"
                          />
                        ) : (
                          <span
                            className={`flex-1 cursor-pointer ${
                              item.completed ? 'line-through text-gray-500' : ''
                            }`}
                            onClick={() => setEditingItem(item.id)}
                          >
                            {item.text}
                          </span>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteItemMutation.mutate({ checklistId: checklist.id, itemId: item.id })}
                          className="text-red-500 hover:text-red-700 h-6 w-6 p-0"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>

                  {/* Adicionar Novo Item */}
                  <div className="flex space-x-2">
                    <Input
                      placeholder="Adicionar item..."
                      value={newItemTexts[checklist.id] || ''}
                      onChange={(e) => setNewItemTexts(prev => ({ ...prev, [checklist.id]: e.target.value }))}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleCreateItem(checklist.id)
                        }
                      }}
                      className="flex-1"
                    />
                    <Button
                      size="sm"
                      onClick={() => handleCreateItem(checklist.id)}
                      disabled={!(newItemTexts[checklist.id] || '').trim() || createItemMutation.isPending}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
