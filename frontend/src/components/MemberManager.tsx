import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { X, Plus, Users, UserPlus, Trash2, Crown, Shield, User } from 'lucide-react'
import { boardAPI } from '../lib/api'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'

interface MemberManagerProps {
  boardId: number
  isOpen: boolean
  onClose: () => void
}

const ROLE_ICONS = {
  owner: Crown,
  admin: Shield,
  member: User,
}

const ROLE_LABELS = {
  owner: 'Proprietário',
  admin: 'Administrador',
  member: 'Membro',
}

const ROLE_COLORS = {
  owner: 'bg-yellow-100 text-yellow-800',
  admin: 'bg-blue-100 text-blue-800',
  member: 'bg-gray-100 text-gray-800',
}

export default function MemberManager({ boardId, isOpen, onClose }: MemberManagerProps) {
  const [isAddingMember, setIsAddingMember] = useState(false)
  const [newMemberUsername, setNewMemberUsername] = useState('')
  const [newMemberRole, setNewMemberRole] = useState('member')
  
  const queryClient = useQueryClient()

  const { data: members, isLoading } = useQuery({
    queryKey: ['board-members', boardId],
    queryFn: () => boardAPI.getMembers(boardId).then(res => res.data.results || []),
    enabled: isOpen,
  })

  const addMemberMutation = useMutation({
    mutationFn: (data: { username: string; role: string }) =>
      boardAPI.addMember(boardId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['board-members', boardId] })
      setNewMemberUsername('')
      setIsAddingMember(false)
    },
  })

  const removeMemberMutation = useMutation({
    mutationFn: (memberId: number) => boardAPI.removeMember(boardId, memberId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['board-members', boardId] })
    },
  })

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault()
    if (newMemberUsername.trim()) {
      addMemberMutation.mutate({
        username: newMemberUsername.trim(),
        role: newMemberRole,
      })
    }
  }

  const handleRemoveMember = (memberId: number, username: string) => {
    if (confirm(`Tem certeza que deseja remover ${username} do board?`)) {
      removeMemberMutation.mutate(memberId)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-2xl max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
            <Users className="h-5 w-5 mr-2" />
            Gerenciar Membros
          </h2>
          <Button variant="ghost" size="sm" onClick={onClose} aria-label="Fechar gerenciador de membros">
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {/* Add New Member */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">Adicionar Membro</CardTitle>
            </CardHeader>
            <CardContent>
              {!isAddingMember ? (
                <Button onClick={() => setIsAddingMember(true)} className="w-full">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Adicionar Membro
                </Button>
              ) : (
                <form onSubmit={handleAddMember} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Nome de Usuário
                    </label>
                    <Input
                      value={newMemberUsername}
                      onChange={(e) => setNewMemberUsername(e.target.value)}
                      placeholder="Digite o nome de usuário"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Função
                    </label>
                    <select
                      value={newMemberRole}
                      onChange={(e) => setNewMemberRole(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="member">Membro</option>
                      <option value="admin">Administrador</option>
                    </select>
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => {
                        setIsAddingMember(false)
                        setNewMemberUsername('')
                      }}
                    >
                      Cancelar
                    </Button>
                    <Button type="submit" disabled={!newMemberUsername.trim()}>
                      Adicionar
                    </Button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>

          {/* Existing Members */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Membros do Board
            </h3>
            {isLoading ? (
              <div className="text-center py-4">Carregando...</div>
            ) : (
              <div className="space-y-2">
                {members?.map((member: any) => {
                  const RoleIcon = ROLE_ICONS[member.role as keyof typeof ROLE_ICONS] || User
                  return (
                    <div
                      key={member.id}
                      className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                          {member.user?.first_name?.[0] || member.user?.username?.[0] || 'U'}
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-medium text-gray-900 dark:text-white">
                              {member.user?.first_name || member.user?.username || 'Usuário'}
                            </span>
                            <Badge 
                              variant="secondary" 
                              className={`text-xs ${ROLE_COLORS[member.role as keyof typeof ROLE_COLORS] || ROLE_COLORS.member}`}
                            >
                              <RoleIcon className="h-3 w-3 mr-1" />
                              {ROLE_LABELS[member.role as keyof typeof ROLE_LABELS] || 'Membro'}
                            </Badge>
                          </div>
                          <span className="text-sm text-gray-500">
                            {member.user?.email || 'Sem email'}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {member.role !== 'owner' && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleRemoveMember(member.id, member.user.username)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  )
                })}
                {members?.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    Nenhum membro adicionado ainda
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
