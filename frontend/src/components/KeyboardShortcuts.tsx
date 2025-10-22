import React, { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog'
import { Button } from './ui/button'
import { Keyboard } from 'lucide-react'

interface KeyboardShortcut {
  key: string
  ctrlKey?: boolean
  shiftKey?: boolean
  altKey?: boolean
  description: string
}

interface KeyboardShortcutsProps {
  shortcuts: KeyboardShortcut[]
}

export default function KeyboardShortcuts({ shortcuts }: KeyboardShortcutsProps) {
  const [isOpen, setIsOpen] = useState(false)

  const formatKey = (shortcut: KeyboardShortcut) => {
    const parts = []
    
    if (shortcut.ctrlKey) parts.push('Ctrl')
    if (shortcut.altKey) parts.push('Alt')
    if (shortcut.shiftKey) parts.push('Shift')
    
    // Format the main key
    let mainKey = shortcut.key
    if (mainKey === ' ') mainKey = 'Space'
    if (mainKey === 'Escape') mainKey = 'Esc'
    if (mainKey === 'Enter') mainKey = 'Enter'
    
    parts.push(mainKey)
    
    return parts.join(' + ')
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
          <Keyboard className="h-4 w-4 mr-2" />
          Atalhos
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Keyboard className="h-5 w-5" />
            Atalhos de Teclado
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="grid gap-3">
            {shortcuts.map((shortcut, index) => (
              <div key={index} className="flex items-center justify-between py-2 px-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {shortcut.description}
                </span>
                <div className="flex items-center gap-1">
                  {formatKey(shortcut).split(' + ').map((key, keyIndex) => (
                    <React.Fragment key={keyIndex}>
                      <kbd className="px-2 py-1 text-xs font-mono bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded shadow-sm">
                        {key}
                      </kbd>
                      {keyIndex < formatKey(shortcut).split(' + ').length - 1 && (
                        <span className="text-gray-400 mx-1">+</span>
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            ))}
          </div>
          
          <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
            Pressione <kbd className="px-1 py-0.5 text-xs font-mono bg-gray-200 dark:bg-gray-700 rounded">?</kbd> para alternar esta ajuda
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
