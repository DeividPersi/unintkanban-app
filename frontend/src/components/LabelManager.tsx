import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { X, Plus, Tag, Edit2, Trash2 } from 'lucide-react'
import { labelAPI } from '@/lib/api.ts'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Badge } from './ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'

interface LabelManagerProps {
  boardId: number
  isOpen: boolean
  onClose: () => void
  selectedLabels?: number[]
  onLabelSelect?: (labelId: number) => void
  onLabelDeselect?: (labelId: number) => void
}

const PREDEFINED_COLORS = [
  '#3B82F6', // Blue
  '#EF4444', // Red
  '#10B981', // Green
  '#F59E0B', // Yellow
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#6B7280', // Gray
  '#F97316', // Orange
  '#06B6D4', // Cyan
  '#84CC16', // Lime
]

export default function LabelManager({ 
  boardId, 
  isOpen, 
  onClose, 
  selectedLabels = [], 
  onLabelSelect, 
  onLabelDeselect 
}: LabelManagerProps) {
  const [isCreating, setIsCreating] = useState(false)
  const [newLabelName, setNewLabelName] = useState('')
  const [newLabelColor, setNewLabelColor] = useState(PREDEFINED_COLORS[0])
  const [editingLabel, setEditingLabel] = useState<number | null>(null)
  const [editLabelName, setEditLabelName] = useState('')
  const [editLabelColor, setEditLabelColor] = useState('')

  const queryClient = useQueryClient()

  const { data: labels, isLoading } = useQuery({
    queryKey: ['labels', boardId],
    queryFn: () => labelAPI.getLabels(boardId).then(res => res.data.results || []),
    enabled: isOpen,
  })

  const createLabelMutation = useMutation({
    mutationFn: (data: { name: string; color: string }) => {
      console.log('🏷️ Creating label:', { boardId, data })
      return labelAPI.createLabel(boardId, data)
    },
    onSuccess: (response) => {
      console.log('✅ Label created successfully:', response.data)
      queryClient.invalidateQueries({ queryKey: ['labels', boardId] })
      setNewLabelName('')
      setIsCreating(false)
    },
    onError: (error) => {
      console.error('❌ Error creating label:', error)
      console.error('❌ Error details:', error.response?.data)
    },
  })

  const updateLabelMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: { name: string; color: string } }) =>
      labelAPI.updateLabel(boardId, id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['labels', boardId] })
      setEditingLabel(null)
      setEditLabelName('')
      setEditLabelColor('')
    },
  })

  const deleteLabelMutation = useMutation({
    mutationFn: (id: number) => labelAPI.deleteLabel(boardId, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['labels', boardId] })
    },
  })

  const handleCreateLabel = (e: React.FormEvent) => {
    e.preventDefault()
    if (newLabelName.trim()) {
      createLabelMutation.mutate({
        name: newLabelName.trim(),
        color: newLabelColor,
      })
    }
  }

  const handleEditLabel = (label: any) => {
    setEditingLabel(label.id)
    setEditLabelName(label.name)
    setEditLabelColor(label.color)
  }

  const handleUpdateLabel = (e: React.FormEvent) => {
    e.preventDefault()
    if (editingLabel && editLabelName.trim()) {
      updateLabelMutation.mutate({
        id: editingLabel,
        data: {
          name: editLabelName.trim(),
          color: editLabelColor,
        },
      })
    }
  }

  const handleDeleteLabel = (id: number) => {
    if (confirm('Tem certeza que deseja excluir esta etiqueta?')) {
      deleteLabelMutation.mutate(id)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-2xl max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
            <Tag className="h-5 w-5 mr-2" />
            Gerenciar Etiquetas
          </h2>
          <Button variant="ghost" size="sm" onClick={onClose} aria-label="Fechar gerenciador de etiquetas">
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {/* Create New Label */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">Criar Nova Etiqueta</CardTitle>
            </CardHeader>
            <CardContent>
              {!isCreating ? (
                <Button onClick={() => setIsCreating(true)} className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Etiqueta
                </Button>
              ) : (
                <form onSubmit={handleCreateLabel} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Nome da Etiqueta
                    </label>
                    <Input
                      value={newLabelName}
                      onChange={(e) => setNewLabelName(e.target.value)}
                      placeholder="Digite o nome da etiqueta"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Cor
                    </label>
                    <div className="grid grid-cols-5 gap-2">
                      {PREDEFINED_COLORS.map((color) => (
                        <button
                          key={color}
                          type="button"
                          className={`w-8 h-8 rounded-full border-2 ${
                            newLabelColor === color ? 'border-gray-900' : 'border-gray-300'
                          }`}
                          style={{ backgroundColor: color }}
                          onClick={() => setNewLabelColor(color)}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => {
                        setIsCreating(false)
                        setNewLabelName('')
                      }}
                    >
                      Cancelar
                    </Button>
                    <Button type="submit" disabled={!newLabelName.trim()}>
                      Criar Etiqueta
                    </Button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>

          {/* Existing Labels */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Etiquetas Existentes
            </h3>
            {isLoading ? (
              <div className="text-center py-4">Carregando...</div>
            ) : (
              <div className="space-y-2">
                {labels?.map((label: any) => (
                  <div
                    key={label.id}
                    className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: label.color }}
                      />
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {label.name}
                      </span>
                      {selectedLabels.includes(label.id) && (
                        <Badge variant="secondary" className="text-xs">
                          Selecionada
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      {onLabelSelect && !selectedLabels.includes(label.id) && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onLabelSelect(label.id)}
                        >
                          Selecionar
                        </Button>
                      )}
                      {onLabelDeselect && selectedLabels.includes(label.id) && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onLabelDeselect(label.id)}
                        >
                          Remover
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEditLabel(label)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteLabel(label.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                {labels?.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    Nenhuma etiqueta criada ainda
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
