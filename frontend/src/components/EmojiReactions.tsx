import React, { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { commentAPI } from '../lib/api.ts'
import { Smile, ThumbsUp, Heart, Laugh, Eye, Frown, Angry, Sparkles, Flame, Hash } from 'lucide-react'

interface EmojiReactionsProps {
  commentId: number
  reactions: Array<{
    id: number
    emoji: string
    user: {
      id: number
      username: string
    }
    created_at: string
  }>
  currentUserId: number
}

const EMOJI_OPTIONS = [
  { emoji: '👍', icon: ThumbsUp, label: 'Curtir' },
  { emoji: '👎', icon: ThumbsUp, label: 'Não Curtir' },
  { emoji: '❤️', icon: Heart, label: 'Coração' },
  { emoji: '😂', icon: Laugh, label: 'Rindo' },
  { emoji: '😮', icon: Eye, label: 'Surpreso' },
  { emoji: '😢', icon: Frown, label: 'Triste' },
  { emoji: '😡', icon: Angry, label: 'Bravo' },
  { emoji: '🎉', icon: Sparkles, label: 'Festa' },
  { emoji: '🔥', icon: Flame, label: 'Fogo' },
  { emoji: '💯', icon: Hash, label: 'Cem' },
]

export default function EmojiReactions({ commentId, reactions, currentUserId }: EmojiReactionsProps) {
  const [showPicker, setShowPicker] = useState(false)
  const queryClient = useQueryClient()

  const addReactionMutation = useMutation({
    mutationFn: (emoji: string) => commentAPI.addReaction(commentId, emoji),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments'] })
      queryClient.invalidateQueries({ queryKey: ['cards'] })
    },
  })

  const removeReactionMutation = useMutation({
    mutationFn: (emoji: string) => commentAPI.removeReaction(commentId, emoji),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments'] })
      queryClient.invalidateQueries({ queryKey: ['cards'] })
    },
  })

  const handleReactionClick = (emoji: string) => {
    const existingReaction = reactions.find(
      r => r.emoji === emoji && r.user.id === currentUserId
    )

    if (existingReaction) {
      removeReactionMutation.mutate(emoji)
    } else {
      addReactionMutation.mutate(emoji)
    }
    setShowPicker(false)
  }

  const getReactionCount = (emoji: string) => {
    return reactions.filter(r => r.emoji === emoji).length
  }

  const hasUserReacted = (emoji: string) => {
    return reactions.some(r => r.emoji === emoji && r.user.id === currentUserId)
  }

  const groupedReactions = EMOJI_OPTIONS.reduce((acc, option) => {
    const count = getReactionCount(option.emoji)
    if (count > 0) {
      acc.push({ ...option, count, hasReacted: hasUserReacted(option.emoji) })
    }
    return acc
  }, [] as Array<typeof EMOJI_OPTIONS[0] & { count: number; hasReacted: boolean }>)

  return (
    <div className="relative">
      <div className="flex items-center gap-1">
        {groupedReactions.map((reaction) => {
          const IconComponent = reaction.icon
          return (
            <button
              key={reaction.emoji}
              onClick={() => handleReactionClick(reaction.emoji)}
              className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs transition-colors ${
                reaction.hasReacted
                  ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
              title={`${reaction.label} (${reaction.count})`}
            >
              <span className="text-sm">{reaction.emoji}</span>
              <span className="font-medium">{reaction.count}</span>
            </button>
          )
        })}
        
        <button
          onClick={() => setShowPicker(!showPicker)}
          className="flex items-center justify-center w-6 h-6 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          title="Adicionar reação"
        >
          <Smile className="h-3 w-3" />
        </button>
      </div>

      {showPicker && (
        <div className="absolute top-8 left-0 z-50 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-2">
          <div className="grid grid-cols-5 gap-1">
            {EMOJI_OPTIONS.map((option) => {
              const IconComponent = option.icon
              const hasReacted = hasUserReacted(option.emoji)
              return (
                <button
                  key={option.emoji}
                  onClick={() => handleReactionClick(option.emoji)}
                  className={`flex items-center justify-center w-8 h-8 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                    hasReacted ? 'bg-blue-100 dark:bg-blue-900' : ''
                  }`}
                  title={option.label}
                >
                  <span className="text-lg">{option.emoji}</span>
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
