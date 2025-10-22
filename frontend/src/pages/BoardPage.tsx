import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { boardAPI } from '@/lib/api'
import { useAuth } from '../hooks/useAuth'
import Board from '../components/Board'
import { Button } from '../components/ui/button'
import { ArrowLeft, LogOut } from 'lucide-react'
import ThemeToggle from '../components/ThemeToggle'

export default function BoardPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { logout } = useAuth()

  console.log('BoardPage render:', { id, idType: typeof id })

  const { data: board, isLoading, error } = useQuery({
    queryKey: ['board', id],
    queryFn: () => {
      console.log('Fetching board:', id)
      const boardId = Number(id)
      if (isNaN(boardId)) {
        throw new Error('Invalid board ID')
      }
      return boardAPI.getBoard(boardId).then(res => {
        console.log('Board response:', res.data)
        return res.data
      })
    },
    enabled: !!id && !isNaN(Number(id)),
  })

  console.log('BoardPage state:', { board, isLoading, error, hasBoard: !!board })

  const handleLogout = () => {
    console.log('Logout clicked from BoardPage')
    logout()
    // Use window.location.href for immediate redirect
    window.location.href = '/login'
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando quadro...</p>
        </div>
      </div>
    )
  }

  if (error || !board) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Quadro não encontrado</h2>
          <p className="text-gray-600 mb-4">O quadro que você está procurando não existe ou você não tem acesso a ele.</p>
          <Button onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar ao Dashboard
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen bg-gray-50 dark:dark-layered-bg flex flex-col overflow-hidden">
      <header className="bg-white dark:dark-surface shadow-sm border-b flex-shrink-0">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Button
                variant="ghost"
                onClick={() => navigate('/dashboard')}
                className="mr-4"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
                    <h1 className="text-xl font-semibold text-gray-900 dark:text-white">{board.title}</h1>
            </div>
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <Button variant="outline" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Sair
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 p-4 overflow-hidden">
        <Board board={board} />
      </main>
    </div>
  )
}
