import React, { useState, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { X, Upload, Download, File, Image, FileText, Trash2, Edit2 } from 'lucide-react'
import { attachmentAPI } from '../lib/api.ts'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Card, CardContent } from './ui/card'
import { Badge } from './ui/badge'

interface AttachmentManagerProps {
  cardId: number
  isOpen: boolean
  onClose: () => void
}

const getFileIcon = (contentType: string) => {
  if (contentType.startsWith('image/')) return Image
  if (contentType.includes('pdf') || contentType.includes('document')) return FileText
  return File
}

const getFileTypeColor = (contentType: string) => {
  if (contentType.startsWith('image/')) return 'bg-green-100 text-green-800'
  if (contentType.includes('pdf')) return 'bg-red-100 text-red-800'
  if (contentType.includes('document')) return 'bg-blue-100 text-blue-800'
  if (contentType.includes('spreadsheet')) return 'bg-green-100 text-green-800'
  if (contentType.includes('presentation')) return 'bg-orange-100 text-orange-800'
  return 'bg-gray-100 text-gray-800'
}

export default function AttachmentManager({ cardId, isOpen, onClose }: AttachmentManagerProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [editingAttachment, setEditingAttachment] = useState<number | null>(null)
  const [editName, setEditName] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const queryClient = useQueryClient()

  const { data: attachments, isLoading } = useQuery({
    queryKey: ['attachments', cardId],
    queryFn: () => attachmentAPI.getAttachments(cardId).then(res => res.data.results || []),
    enabled: isOpen,
  })

  const uploadAttachmentMutation = useMutation({
    mutationFn: (formData: FormData) => attachmentAPI.createAttachment(cardId, formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attachments', cardId] })
      queryClient.invalidateQueries({ queryKey: ['card', cardId] })
      queryClient.invalidateQueries({ queryKey: ['cards'] })
      queryClient.invalidateQueries({ queryKey: ['lists'] })
      setIsUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    },
    onError: (error) => {
      console.error('Error uploading attachment:', error)
      setIsUploading(false)
    },
  })

  const updateAttachmentMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: { name: string } }) =>
      attachmentAPI.updateAttachment(cardId, id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attachments', cardId] })
      queryClient.invalidateQueries({ queryKey: ['card', cardId] })
      queryClient.invalidateQueries({ queryKey: ['cards'] })
      queryClient.invalidateQueries({ queryKey: ['lists'] })
      setEditingAttachment(null)
      setEditName('')
    },
  })

  const deleteAttachmentMutation = useMutation({
    mutationFn: (id: number) => attachmentAPI.deleteAttachment(cardId, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attachments', cardId] })
      queryClient.invalidateQueries({ queryKey: ['card', cardId] })
      queryClient.invalidateQueries({ queryKey: ['cards'] })
      queryClient.invalidateQueries({ queryKey: ['lists'] })
    },
  })

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    const file = files[0]
    const formData = new FormData()
    formData.append('file', file)

    setIsUploading(true)
    uploadAttachmentMutation.mutate(formData)
  }

  const handleEditAttachment = (attachment: any) => {
    setEditingAttachment(attachment.id)
    setEditName(attachment.name)
  }

  const handleUpdateAttachment = (e: React.FormEvent) => {
    e.preventDefault()
    if (editingAttachment && editName.trim()) {
      updateAttachmentMutation.mutate({
        id: editingAttachment,
        data: { name: editName.trim() }
      })
    }
  }

  const handleDeleteAttachment = (id: number, name: string) => {
    if (confirm(`Tem certeza que deseja excluir o anexo "${name}"?`)) {
      deleteAttachmentMutation.mutate(id)
    }
  }

  const handleDownload = (attachment: any) => {
    const link = document.createElement('a')
    link.href = attachment.file
    link.download = attachment.name
    link.target = '_blank'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-4xl max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
            <File className="h-5 w-5 mr-2" />
            Gerenciar Anexos
          </h2>
          <Button variant="ghost" size="sm" onClick={onClose} aria-label="Fechar gerenciador de anexos">
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {/* Upload Section */}
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    Adicionar Anexo
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Selecione um arquivo para anexar ao card
                  </p>
                </div>
                <div className="flex items-center space-x-4">
                  <input
                    ref={fileInputRef}
                    type="file"
                    onChange={handleFileUpload}
                    className="hidden"
                    accept="*/*"
                  />
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="flex items-center space-x-2"
                  >
                    <Upload className="h-4 w-4" />
                    <span>{isUploading ? 'Enviando...' : 'Selecionar Arquivo'}</span>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Attachments List */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Anexos ({attachments?.length || 0})
            </h3>
            {isLoading ? (
              <div className="text-center py-4">Carregando...</div>
            ) : (
              <div className="space-y-2">
                {attachments?.map((attachment: any) => {
                  const FileIcon = getFileIcon(attachment.content_type)
                  const isEditing = editingAttachment === attachment.id
                  
                  return (
                    <Card key={attachment.id} className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3 flex-1">
                          <FileIcon className="h-8 w-8 text-gray-500" />
                          <div className="flex-1 min-w-0">
                            {isEditing ? (
                              <form onSubmit={handleUpdateAttachment} className="flex items-center space-x-2">
                                <Input
                                  value={editName}
                                  onChange={(e) => setEditName(e.target.value)}
                                  className="flex-1"
                                  autoFocus
                                />
                                <Button type="submit" size="sm">
                                  Salvar
                                </Button>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setEditingAttachment(null)
                                    setEditName('')
                                  }}
                                >
                                  Cancelar
                                </Button>
                              </form>
                            ) : (
                              <div>
                                <h4 
                                  className="font-medium text-gray-900 dark:text-white truncate cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                                  onClick={() => handleDownload(attachment)}
                                  title="Clique para baixar"
                                >
                                  {attachment.name}
                                </h4>
                                <div className="flex items-center space-x-2 mt-1">
                                  <Badge 
                                    variant="secondary" 
                                    className={`text-xs ${getFileTypeColor(attachment.content_type)}`}
                                  >
                                    {attachment.content_type.split('/')[1]?.toUpperCase() || 'FILE'}
                                  </Badge>
                                  <span className="text-xs text-gray-500">
                                    {attachment.file_size_display}
                                  </span>
                                  <span className="text-xs text-gray-500">
                                    por {attachment.uploaded_by?.first_name || attachment.uploaded_by?.username}
                                  </span>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                        {!isEditing && (
                          <div className="flex items-center space-x-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDownload(attachment)}
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleEditAttachment(attachment)}
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDeleteAttachment(attachment.id, attachment.name)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </Card>
                  )
                })}
                {attachments?.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    Nenhum anexo adicionado ainda
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
