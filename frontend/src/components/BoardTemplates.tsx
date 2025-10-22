import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { boardAPI } from '../lib/api'
import { Button } from './ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from './ui/dialog'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { FileText, Plus, Star, User } from 'lucide-react'

interface BoardTemplatesProps {
  onTemplateSelect: (template: any) => void
}

export default function BoardTemplates({ onTemplateSelect }: BoardTemplatesProps) {
  const [isOpen, setIsOpen] = useState(false)
  const queryClient = useQueryClient()

  const { data: templates, isLoading } = useQuery({
    queryKey: ['board-templates'],
    queryFn: () => boardAPI.getTemplates().then(res => res.data.results || []),
    enabled: isOpen,
  })

  const createFromTemplateMutation = useMutation({
    mutationFn: (templateId: number) => boardAPI.createFromTemplate(templateId),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['boards'] })
      // Pass the board object with the correct structure
      onTemplateSelect({ id: response.data.board_id })
      setIsOpen(false)
    },
  })

  const handleTemplateSelect = (template: any) => {
    createFromTemplateMutation.mutate(template.id)
  }

  // Use only templates from backend
  const allTemplates = templates || []

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full">
          <FileText className="h-4 w-4 mr-2" />
          Usar Template
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Templates de Board
          </DialogTitle>
          <DialogDescription>
            Escolha um modelo para criar seu quadro rapidamente
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Templates */}
          {allTemplates.length > 0 ? (
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-500" />
                Templates Disponíveis
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {allTemplates.map((template) => (
                  <Card key={template.id} className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">{template.name}</CardTitle>
                      <CardDescription className="text-sm">
                        {template.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <User className="h-3 w-3" />
                          <span>{template.created_by?.username || 'Sistema'}</span>
                        </div>
                        
                        {template.board_data?.lists && (
                          <div className="space-y-1">
                            <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                              Listas incluídas:
                            </p>
                            <div className="flex flex-wrap gap-1">
                              {template.board_data.lists.map((list: any, index: number) => (
                                <Badge key={index} variant="secondary" className="text-xs">
                                  {list.title}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        <Button
                          size="sm"
                          className="w-full"
                          onClick={() => handleTemplateSelect(template)}
                          disabled={createFromTemplateMutation.isPending}
                        >
                          {createFromTemplateMutation.isPending ? 'Criando...' : 'Usar Template'}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Nenhum template disponível</p>
            </div>
          )}

          {isLoading && (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
