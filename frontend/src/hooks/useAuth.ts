import { useState, useEffect } from 'react'

export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const checkAuth = () => {
    const token = localStorage.getItem('access_token')
    const hasToken = !!token
    console.log('Auth check:', { hasToken, token: token ? 'exists' : 'null' })
    setIsAuthenticated(hasToken)
    setIsLoading(false)
    return hasToken
  }

  useEffect(() => {
    checkAuth()
  }, [])

  const login = (tokens: { access: string; refresh: string }) => {
    console.log('Login function called, saving tokens')
    localStorage.setItem('access_token', tokens.access)
    localStorage.setItem('refresh_token', tokens.refresh)
    
    console.log('Setting authenticated to true immediately')
    setIsAuthenticated(true)
    setIsLoading(false)
  }

  const logout = () => {
    console.log('Logout called')
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    setIsAuthenticated(false)
  }

  return {
    isAuthenticated,
    isLoading,
    login,
    logout,
    checkAuth,
  }
}
