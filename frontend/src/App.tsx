import { useState, useEffect } from 'react'
import HomePage from '@/pages/HomePage'
import { Shell } from '@/components/layout/Shell'

function App() {
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const [activeQuery, setActiveQuery] = useState<string>("")

  useEffect(() => {
    const saved = localStorage.getItem('zenux_recent_searches')
    if (saved) setRecentSearches(JSON.parse(saved))
  }, [])

  const handleNewSearch = (query: string) => {
    if (!query.trim()) return
    const updated = [query, ...recentSearches.filter(q => q !== query)].slice(0, 10)
    setRecentSearches(updated)
    localStorage.setItem('zenux_recent_searches', JSON.stringify(updated))
  }

  const handleClearRecent = () => {
    setRecentSearches([])
    localStorage.removeItem('zenux_recent_searches')
  }

  const handleSelectRecent = (query: string) => {
    setActiveQuery(query)
  }

  return (
    <Shell
      recentSearches={recentSearches}
      onClearRecent={handleClearRecent}
      onSelectRecent={handleSelectRecent}
    >
      <HomePage
        onSearch={handleNewSearch}
        externalQuery={activeQuery}
      />
    </Shell>
  )
}

export default App
