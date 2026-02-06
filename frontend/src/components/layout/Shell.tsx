import { cn } from "@/lib/utils"
import { Search, History, Archive, Trash2, Clock } from "lucide-react"

interface ShellProps {
    children: React.ReactNode
    recentSearches: string[]
    onClearRecent: () => void
    onSelectRecent: (query: string) => void
}

export function Shell({ children, recentSearches, onClearRecent, onSelectRecent }: ShellProps) {
    return (
        <div className="flex min-h-screen">
            {/* Sidebar */}
            <aside className="w-64 border-r bg-card/50 backdrop-blur-sm fixed h-full flex flex-col hidden md:flex z-50">
                <div className="p-6 border-b">
                    <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                        <Archive className="h-6 w-6 text-primary" />
                        <span>ZenuX</span>
                    </h1>
                    <p className="text-xs text-muted-foreground mt-1 font-mono">TICKET SEARCH SYSTEM</p>
                </div>

                <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
                    <div className="px-6 pt-6 pb-2">
                        <div className="flex items-center justify-between group">
                            <h2 className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                                <History className="h-3 w-3" />
                                Recent Searches
                            </h2>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onClearRecent();
                                }}
                                className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:text-destructive"
                                title="Clear registry"
                            >
                                <Trash2 className="h-3 w-3" />
                            </button>
                        </div>
                    </div>

                    <nav className="flex-1 px-4 pb-4 space-y-1 overflow-y-auto font-mono text-xs">
                        {recentSearches.length > 0 ? (
                            recentSearches.map((query, i) => (
                                <button
                                    key={i}
                                    onClick={() => onSelectRecent(query)}
                                    className="w-full flex items-center gap-2 px-3 py-2 text-muted-foreground hover:bg-muted hover:text-foreground rounded-md transition-colors text-left group"
                                >
                                    <Clock className="h-3 w-3 opacity-30 group-hover:opacity-100" />
                                    <span className="truncate">{query}</span>
                                </button>
                            ))
                        ) : (
                            <div className="px-3 py-4 text-muted-foreground/40 italic">
                                No recent entries...
                            </div>
                        )}
                    </nav>
                </div>

                <div className="p-4 border-t text-center">
                    <div className="text-[10px] text-muted-foreground font-mono uppercase tracking-widest border border-dashed border-border p-2 rounded opacity-50">
                        API KEY SET IN ENV
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 md:ml-64 bg-transparent relative">
                <div className="container mx-auto max-w-5xl p-8 md:p-12">
                    {children}
                </div>
            </main>
        </div>
    )
}
