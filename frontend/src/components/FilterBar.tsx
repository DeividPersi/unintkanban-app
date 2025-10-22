import React, { useState } from 'react'
import { Search, Filter, X, Tag, User, Calendar } from 'lucide-react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Badge } from './ui/badge'
import { Card, CardContent } from './ui/card'

interface FilterBarProps {
  onSearch: (query: string) => void
  onFilterChange: (filters: FilterState) => void
  availableLabels?: Array<{ id: number; name: string; color: string }>
  availableMembers?: Array<{ id: number; name: string }>
}

interface FilterState {
  searchQuery: string
  selectedLabels: number[]
  selectedMembers: number[]
  dateRange: 'all' | 'today' | 'week' | 'month'
}

export default function FilterBar({ 
  onSearch, 
  onFilterChange, 
  availableLabels = [], 
  availableMembers = [] 
}: FilterBarProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [filters, setFilters] = useState<FilterState>({
    searchQuery: '',
    selectedLabels: [],
    selectedMembers: [],
    dateRange: 'all'
  })

  const handleSearchChange = (query: string) => {
    setFilters(prev => ({ ...prev, searchQuery: query }))
    onSearch(query)
  }

  const handleLabelToggle = (labelId: number) => {
    const newLabels = filters.selectedLabels.includes(labelId)
      ? filters.selectedLabels.filter(id => id !== labelId)
      : [...filters.selectedLabels, labelId]
    
    const newFilters = { ...filters, selectedLabels: newLabels }
    setFilters(newFilters)
    onFilterChange(newFilters)
  }

  const handleMemberToggle = (memberId: number) => {
    const newMembers = filters.selectedMembers.includes(memberId)
      ? filters.selectedMembers.filter(id => id !== memberId)
      : [...filters.selectedMembers, memberId]
    
    const newFilters = { ...filters, selectedMembers: newMembers }
    setFilters(newFilters)
    onFilterChange(newFilters)
  }

  const handleDateRangeChange = (dateRange: FilterState['dateRange']) => {
    const newFilters = { ...filters, dateRange }
    setFilters(newFilters)
    onFilterChange(newFilters)
  }

  const clearFilters = () => {
    const clearedFilters = {
      searchQuery: '',
      selectedLabels: [],
      selectedMembers: [],
      dateRange: 'all' as const
    }
    setFilters(clearedFilters)
    onSearch('')
    onFilterChange(clearedFilters)
  }

  const hasActiveFilters = filters.selectedLabels.length > 0 || 
                          filters.selectedMembers.length > 0 || 
                          filters.dateRange !== 'all'

  return (
    <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
      <div className="flex items-center space-x-4">
        {/* Search Bar */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar cards, listas, descrições..."
            value={filters.searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Filter Toggle */}
        <Button
          variant={isExpanded ? "default" : "outline"}
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center space-x-2"
        >
          <Filter className="h-4 w-4" />
          <span>Filtros</span>
          {hasActiveFilters && (
            <Badge variant="secondary" className="ml-2">
              {filters.selectedLabels.length + filters.selectedMembers.length + (filters.dateRange !== 'all' ? 1 : 0)}
            </Badge>
          )}
        </Button>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <Button variant="ghost" onClick={clearFilters} className="text-gray-500">
            <X className="h-4 w-4 mr-2" />
            Limpar
          </Button>
        )}
      </div>

      {/* Expanded Filters */}
      {isExpanded && (
        <div className="mt-4 space-y-4">
          {/* Labels Filter */}
          {availableLabels.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                <Tag className="h-4 w-4 mr-2" />
                Etiquetas
              </h4>
              <div className="flex flex-wrap gap-2">
                {availableLabels.map((label) => (
                  <Button
                    key={label.id}
                    variant={filters.selectedLabels.includes(label.id) ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleLabelToggle(label.id)}
                    className="flex items-center space-x-2"
                  >
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: label.color }}
                    />
                    <span>{label.name}</span>
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Members Filter */}
          {availableMembers.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                <User className="h-4 w-4 mr-2" />
                Membros
              </h4>
              <div className="flex flex-wrap gap-2">
                {availableMembers.map((member) => (
                  <Button
                    key={member.id}
                    variant={filters.selectedMembers.includes(member.id) ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleMemberToggle(member.id)}
                  >
                    {member.name}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Date Range Filter */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
              <Calendar className="h-4 w-4 mr-2" />
              Período
            </h4>
            <div className="flex space-x-2">
              {[
                { value: 'all', label: 'Todos' },
                { value: 'today', label: 'Hoje' },
                { value: 'week', label: 'Esta Semana' },
                { value: 'month', label: 'Este Mês' }
              ].map((option) => (
                <Button
                  key={option.value}
                  variant={filters.dateRange === option.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleDateRangeChange(option.value as FilterState['dateRange'])}
                >
                  {option.label}
                </Button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
