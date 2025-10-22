import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { boardAPI } from '../lib/api.ts'
import { useAuth } from '../hooks/useAuth'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Textarea } from '../components/ui/textarea'
import { Label } from '../components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog'
import { Plus, LogOut, Kanban } from 'lucide-react'
import ThemeToggle from '../components/ThemeToggle'
import NotificationCenter from '../components/NotificationCenter'
import BoardTemplates from '../components/BoardTemplates'
import { useNotifications } from '../contexts/NotificationContext'

export default function Dashboard() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [newBoardTitle, setNewBoardTitle] = useState('')
  const [newBoardDescription, setNewBoardDescription] = useState('')
  
  const { logout } = useAuth()
  const { notifications, markAsRead, markAllAsRead, removeNotification } = useNotifications()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { data: boards, isLoading, error } = useQuery({
    queryKey: ['boards'],
    queryFn: () => {
      console.log('Fetching boards...')
      return boardAPI.getBoards().then(res => {
        console.log('Boards response:', res.data)
        // Return the results array directly, not the whole response
        return res.data.results || []
      })
    },
    staleTime: 0, // Always refetch
    cacheTime: 0, // Don't cache
  })

  const createBoardMutation = useMutation({
    mutationFn: (data: { title: string; description: string }) =>
      boardAPI.createBoard(data),
    onSuccess: (response) => {
      console.log('Board created successfully:', response.data)
      // Force refetch of boards
      queryClient.invalidateQueries({ queryKey: ['boards'] })
      queryClient.refetchQueries({ queryKey: ['boards'] })
      setIsCreateDialogOpen(false)
      setNewBoardTitle('')
      setNewBoardDescription('')
      // Navigate to the new board
      if (response.data && response.data.id) {
        console.log('Navigating to board:', response.data.id)
        navigate(`/board/${response.data.id}`)
      }
    },
  })

  const handleCreateBoard = (e: React.FormEvent) => {
    e.preventDefault()
    if (newBoardTitle.trim()) {
      createBoardMutation.mutate({
        title: newBoardTitle.trim(),
        description: newBoardDescription.trim(),
      })
    }
  }

  const handleTemplateSelect = (board: any) => {
    console.log('Template selected, navigating to board:', board.id)
    navigate(`/board/${board.id}`)
  }

  const handleLogout = () => {
    console.log('Logout clicked')
    logout()
    // Use window.location.href for immediate redirect
    window.location.href = '/login'
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading boards...</p>
        </div>
      </div>
    )
  }

  if (error) {
    console.error('Error loading boards:', error)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Erro ao carregar quadros</h2>
          <p className="text-gray-600 mb-4">Houve um erro ao carregar seus quadros. Tente novamente.</p>
          <p className="text-sm text-gray-500 mb-4">Erro: {error.message}</p>
          <Button onClick={() => window.location.reload()}>Tentar Novamente</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Kanban className="h-8 w-8 text-blue-600 mr-2" />
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Uniint - Kanban</h1>
            </div>
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <NotificationCenter
                notifications={notifications}
                onMarkAsRead={markAsRead}
                onMarkAllAsRead={markAllAsRead}
                onRemove={removeNotification}
              />
              <Button variant="outline" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Sair
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Seus Quadros</h2>
            <div className="flex gap-3">
                <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                      <Plus className="h-4 w-4 mr-2" />
                      Criar Quadro
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                <DialogHeader>
                  <DialogTitle>Criar Novo Quadro</DialogTitle>
                  <DialogDescription>
                    Crie um novo quadro para organizar suas tarefas e projetos.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCreateBoard}>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Título do Quadro</Label>
                      <Input
                        id="title"
                        value={newBoardTitle}
                        onChange={(e) => setNewBoardTitle(e.target.value)}
                        placeholder="Digite o título do quadro"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description">Descrição (Opcional)</Label>
                      <Textarea
                        id="description"
                        value={newBoardDescription}
                        onChange={(e) => setNewBoardDescription(e.target.value)}
                        placeholder="Digite a descrição do quadro"
                        rows={3}
                      />
                    </div>
                  </div>
                  <DialogFooter className="mt-6">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsCreateDialogOpen(false)}
                    >
                      Cancelar
                    </Button>
                    <Button
                      type="submit"
                      disabled={createBoardMutation.isPending}
                    >
                      {createBoardMutation.isPending ? 'Criando...' : 'Criar Quadro'}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
              <BoardTemplates onTemplateSelect={handleTemplateSelect} />
            </div>
          </div>

          {(() => {
            console.log('Rendering boards:', { boards, count: boards?.length || 0, isArray: Array.isArray(boards) })
            return boards && Array.isArray(boards) && boards.length > 0
          })() ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {boards.map((board) => (
                <Card
                  key={board.id}
                  className="cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => navigate(`/board/${board.id}`)}
                >
                  <CardHeader>
                    <CardTitle className="text-lg">{board.title}</CardTitle>
                    {board.description && (
                      <CardDescription>{board.description}</CardDescription>
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span>{board.lists?.length || 0} listas</span>
                      <span>{board.members?.length || 0} membros</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Kanban className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum quadro ainda</h3>
              <p className="text-gray-500 mb-4">Crie seu primeiro quadro para começar</p>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Criar Quadro
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
