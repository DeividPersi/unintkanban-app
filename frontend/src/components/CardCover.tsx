import React, { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { cardAPI } from '@/lib/api'
import { Button } from './ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog'
import { Palette, Image, X } from 'lucide-react'

interface CardCoverProps {
  cardId: number
  coverColor?: string
  coverImage?: string
  isOpen: boolean
  onClose: () => void
}

const COVER_COLORS = [
  { value: 'blue', label: 'Blue', color: '#3B82F6' },
  { value: 'green', label: 'Green', color: '#10B981' },
  { value: 'red', label: 'Red', color: '#EF4444' },
  { value: 'orange', label: 'Orange', color: '#F59E0B' },
  { value: 'purple', label: 'Purple', color: '#8B5CF6' },
  { value: 'pink', label: 'Pink', color: '#EC4899' },
  { value: 'lime', label: 'Lime', color: '#84CC16' },
  { value: 'sky', label: 'Sky', color: '#0EA5E9' },
  { value: 'grey', label: 'Grey', color: '#6B7280' },
]

export default function CardCover({ cardId, coverColor, coverImage, isOpen, onClose }: CardCoverProps) {
  const [selectedColor, setSelectedColor] = useState(coverColor || '')
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const queryClient = useQueryClient()

  const updateCoverMutation = useMutation({
    mutationFn: (data: { cover_color?: string; cover_image?: File }) => 
      cardAPI.updateCard(cardId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cards'] })
      queryClient.invalidateQueries({ queryKey: ['lists'] })
      onClose()
    },
  })

  const removeCoverMutation = useMutation({
    mutationFn: () => cardAPI.updateCard(cardId, { cover_color: null, cover_image: null }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cards'] })
      queryClient.invalidateQueries({ queryKey: ['lists'] })
      onClose()
    },
  })

  const handleColorSelect = (color: string) => {
    setSelectedColor(color)
    setSelectedImage(null)
  }

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedImage(file)
      setSelectedColor('')
    }
  }

  const handleSave = () => {
    if (selectedColor) {
      updateCoverMutation.mutate({ cover_color: selectedColor })
    } else if (selectedImage) {
      updateCoverMutation.mutate({ cover_image: selectedImage })
    }
  }

  const handleRemove = () => {
    removeCoverMutation.mutate()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Capa do Cartão
          </DialogTitle>
          <DialogDescription>
            Escolha uma cor ou imagem para a capa do cartão
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Color Options */}
          <div>
            <h3 className="text-sm font-medium mb-3">Cores</h3>
            <div className="grid grid-cols-3 gap-2">
              {COVER_COLORS.map((color) => (
                <button
                  key={color.value}
                  onClick={() => handleColorSelect(color.value)}
                  className={`h-12 rounded-lg border-2 transition-all ${
                    selectedColor === color.value
                      ? 'border-blue-500 ring-2 ring-blue-200'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                  style={{ backgroundColor: color.color }}
                  title={color.label}
                />
              ))}
            </div>
          </div>

          {/* Image Upload */}
          <div>
            <h3 className="text-sm font-medium mb-3">Imagem</h3>
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
              <Image className="h-8 w-8 mx-auto text-gray-400 mb-2" />
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                Enviar uma imagem para a capa do cartão
              </p>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
                id="cover-image-upload"
              />
              <Button
                variant="outline"
                onClick={() => document.getElementById('cover-image-upload')?.click()}
                className="text-sm"
              >
                Escolher Imagem
              </Button>
              {selectedImage && (
                <p className="text-xs text-gray-500 mt-2">
                  Selecionado: {selectedImage.name}
                </p>
              )}
            </div>
          </div>

          {/* Current Cover Preview */}
          {(coverColor || coverImage) && (
            <div>
              <h3 className="text-sm font-medium mb-3">Current Cover</h3>
              <div className="h-20 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                {coverImage ? (
                  <img
                    src={coverImage}
                    alt="Card cover"
                    className="w-full h-full object-cover"
                  />
                ) : coverColor ? (
                  <div
                    className="w-full h-full"
                    style={{
                      backgroundColor: COVER_COLORS.find(c => c.value === coverColor)?.color
                    }}
                  />
                ) : null}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={handleRemove}
              disabled={!coverColor && !coverImage}
              className="text-red-600 hover:text-red-700"
            >
              <X className="h-4 w-4 mr-2" />
              Remover Capa
            </Button>
            
            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button
                onClick={handleSave}
                disabled={!selectedColor && !selectedImage}
              >
                Salvar Capa
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
