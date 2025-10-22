import { useEffect } from 'react'

interface KeyboardShortcut {
  key: string
  ctrlKey?: boolean
  shiftKey?: boolean
  altKey?: boolean
  action: () => void
  description: string
}

interface UseKeyboardShortcutsProps {
  shortcuts: KeyboardShortcut[]
  enabled?: boolean
}

export function useKeyboardShortcuts({ shortcuts, enabled = true }: UseKeyboardShortcutsProps) {
  useEffect(() => {
    if (!enabled) return

    const handleKeyDown = (event: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs, textareas, or contenteditable elements
      const target = event.target as HTMLElement
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.contentEditable === 'true' ||
        target.isContentEditable
      ) {
        return
      }

      const matchingShortcut = shortcuts.find(shortcut => {
        return (
          shortcut.key.toLowerCase() === event.key.toLowerCase() &&
          !!shortcut.ctrlKey === event.ctrlKey &&
          !!shortcut.shiftKey === event.shiftKey &&
          !!shortcut.altKey === event.altKey
        )
      })

      if (matchingShortcut) {
        event.preventDefault()
        matchingShortcut.action()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [shortcuts, enabled])
}

// Common keyboard shortcuts for Trello-like app
export const BOARD_SHORTCUTS = {
  // Navigation
  ESCAPE: 'Escape',
  ENTER: 'Enter',
  
  // Actions
  NEW_CARD: 'n',
  NEW_LIST: 'l',
  SEARCH: 'f',
  QUICK_EDIT: 'e',
  
  // Modifiers
  CTRL: 'ctrl',
  SHIFT: 'shift',
  ALT: 'alt',
}

export const getBoardShortcuts = (actions: {
  onCreateCard: () => void
  onCreateList: () => void
  onSearch: () => void
  onQuickEdit: () => void
  onEscape: () => void
}): KeyboardShortcut[] => [
  {
    key: BOARD_SHORTCUTS.NEW_CARD,
    action: actions.onCreateCard,
    description: 'Create new card'
  },
  {
    key: BOARD_SHORTCUTS.NEW_LIST,
    action: actions.onCreateList,
    description: 'Create new list'
  },
  {
    key: BOARD_SHORTCUTS.SEARCH,
    action: actions.onSearch,
    description: 'Focus search'
  },
  {
    key: BOARD_SHORTCUTS.QUICK_EDIT,
    action: actions.onQuickEdit,
    description: 'Quick edit mode'
  },
  {
    key: BOARD_SHORTCUTS.ESCAPE,
    action: actions.onEscape,
    description: 'Cancel/Close'
  }
]

export const getCardShortcuts = (actions: {
  onSave: () => void
  onCancel: () => void
  onDelete: () => void
  onArchive: () => void
}): KeyboardShortcut[] => [
  {
    key: 's',
    ctrlKey: true,
    action: actions.onSave,
    description: 'Save card'
  },
  {
    key: BOARD_SHORTCUTS.ESCAPE,
    action: actions.onCancel,
    description: 'Cancel editing'
  },
  {
    key: 'd',
    ctrlKey: true,
    action: actions.onDelete,
    description: 'Delete card'
  },
  {
    key: 'a',
    ctrlKey: true,
    action: actions.onArchive,
    description: 'Archive card'
  }
]
