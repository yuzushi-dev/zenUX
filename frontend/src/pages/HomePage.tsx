import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Loader2, Search, X } from "lucide-react"
import { cn } from "@/lib/utils"

// Types
interface Ticket {
    id: number
    subject: string
    description?: string
    status: string
    created_at: string
    updated_at: string
    url: string
}

interface TicketDetail extends Ticket {
    tags: string[]
    priority?: string
    type?: string
}

interface HomePageProps {
    onSearch?: (query: string) => void
    externalQuery?: string
}

export default function HomePage({ onSearch, externalQuery }: HomePageProps) {
    const [query, setQuery] = useState("")
    const [searchContent, setSearchContent] = useState(false)
    const [loading, setLoading] = useState(false)
    const [results, setResults] = useState<Ticket[]>([])
    const [selectedTicket, setSelectedTicket] = useState<TicketDetail | null>(null)
    const [error, setError] = useState<string | null>(null)

    // Sync from external query (e.g. sidebar click)
    useEffect(() => {
        if (externalQuery) {
            setQuery(externalQuery)
            // Auto-trigger search when selected from sidebar
            handleSearchLogic(externalQuery)
        }
    }, [externalQuery])

    const handleSearchLogic = async (searchQuery: string) => {
        if (!searchQuery.trim()) return

        setLoading(true)
        setError(null)
        setResults([])
        onSearch?.(searchQuery)

        try {
            const params = new URLSearchParams({
                q: searchQuery,
                search_content: searchContent.toString(),
                sort_by: "created_at",
                sort_order: "desc"
            })

            const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/v1/search?${params.toString()}`)
            if (!res.ok) throw new Error("Failed to search tickets")

            const data = await res.json()
            setResults(data.results)
        } catch (err) {
            console.error(err)
            setError("An error occurred while searching. Please ensure backend is running.")
        } finally {
            setLoading(false)
        }
    }

    const handleSearch = async (e?: React.FormEvent) => {
        e?.preventDefault()
        handleSearchLogic(query)
    }

    const openTicket = async (ticket: Ticket) => {
        setSelectedTicket(null) // Clear previous
        // setDetailLoading(true)

        // Optimistic open if we don't need full details immediately, but let's fetch
        // Actually, we need to open the dialog first
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/v1/tickets/${ticket.id}`)
            if (!res.ok) throw new Error("Failed to load ticket details")
            const data = await res.json()
            setSelectedTicket(data)
        } catch (err) {
            console.error(err)
            // Fallback to basic info if detail fetch fails?
            // For now, just show error in console
        } finally {
            // setDetailLoading(false)
        }
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header Section */}
            <div className="md:flex md:items-center md:justify-between border-b border-dashed pb-6">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight font-serif text-foreground">Ticket Registry</h2>
                    <p className="text-muted-foreground mt-2 font-mono text-sm">
                        SEARCH ARCHIVE // ZENDESK_DB
                    </p>
                </div>
            </div>

            {error && (
                <div className="p-4 rounded-md bg-destructive/10 text-destructive border border-destructive/20 text-sm font-medium">
                    ⚠️ SYSTEM ERROR: {error}
                </div>
            )}

            {/* Search Area */}
            <div className="bg-card border shadow-sm rounded-lg p-1 relative overflow-hidden group">
                {/* Decorative top strip */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/80 to-primary/20 opacity-50" />

                <form onSubmit={handleSearch} className="p-6 space-y-4">
                    <div className="flex flex-col md:flex-row gap-3">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Enter keyword reference..."
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                className="pl-10 pr-10 h-12 font-mono bg-background/50 focus:bg-background transition-all border-muted-foreground/20 focus:border-primary shrink-0"
                            />
                            {query && (
                                <button
                                    type="button"
                                    onClick={() => setQuery("")}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            )}
                        </div>
                        <Button
                            type="submit"
                            disabled={loading}
                            className="h-12 px-8 font-serif tracking-wide shadow-md hover:shadow-lg transition-all shrink-0"
                        >
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            RETRIEVE RECORDS
                        </Button>
                    </div>

                    <div className="flex items-center space-x-2 pl-1">
                        <Switch
                            id="content-search"
                            checked={searchContent}
                            onCheckedChange={setSearchContent}
                        />
                        <Label htmlFor="content-search" className="text-[10px] text-muted-foreground font-mono uppercase tracking-widest cursor-pointer">
                            Deep Search (Include Ticket Content in the search)
                        </Label>
                    </div>
                </form>
            </div>

            {/* Results Section */}
            <div className="space-y-4">
                {results.length > 0 && (
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-serif font-semibold">Search Results</h3>
                        <Badge variant="outline" className="font-mono text-xs">{results.length} RECORDS FOUND</Badge>
                    </div>
                )}

                {results.length > 0 ? (
                    <div className="rounded-md border bg-card shadow-sm overflow-hidden">
                        <Table>
                            <TableHeader className="bg-muted/30">
                                <TableRow>
                                    <TableHead className="w-[100px] font-mono text-xs uppercase tracking-wider">ID</TableHead>
                                    <TableHead className="font-mono text-xs uppercase tracking-wider">Subject</TableHead>
                                    <TableHead className="w-[100px] font-mono text-xs uppercase tracking-wider text-center">Status</TableHead>
                                    <TableHead className="w-[150px] font-mono text-xs uppercase tracking-wider text-right">Date</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {results.map((ticket) => (
                                    <TableRow
                                        key={ticket.id}
                                        className="cursor-pointer hover:bg-muted/30 transition-colors group"
                                        onClick={() => openTicket(ticket)}
                                    >
                                        <TableCell className="font-mono font-medium text-primary">#{ticket.id}</TableCell>
                                        <TableCell className="font-medium group-hover:text-primary transition-colors">
                                            {ticket.subject}
                                        </TableCell>
                                        <TableCell className="text-center">
                                            {/* Custom 'Stamp' Badge */}
                                            <Badge variant="outline" className={cn(
                                                "uppercase text-[10px] font-bold tracking-widest border-2 px-2 py-0.5 rounded-sm",
                                                ticket.status === 'open' || ticket.status === 'new' ? "border-green-600/50 text-green-700 bg-green-50/50" :
                                                    ticket.status === 'solved' || ticket.status === 'closed' ? "border-stone-400/50 text-stone-500 bg-stone-50/50" :
                                                        "border-amber-500/50 text-amber-700 bg-amber-50/50"
                                            )}>
                                                {ticket.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right font-mono text-xs text-muted-foreground">
                                            {new Date(ticket.created_at).toLocaleDateString()}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                ) : (
                    !loading && results.length === 0 && query && (
                        <div className="text-center py-20 border-2 border-dashed rounded-lg bg-muted/10">
                            <div className="text-4xl mb-4 opacity-20 filter grayscale">📭</div>
                            <h3 className="text-lg font-medium text-foreground">No Records Found</h3>
                            <p className="text-sm text-muted-foreground font-mono mt-1">TRY ADJUSTING SEARCH PARAMETERS</p>
                        </div>
                    )
                )}

                {/* Initial Empty State */}
                {!query && results.length === 0 && (
                    <div className="text-center py-32 opacity-40 select-none">
                        <div className="text-6xl mb-6 font-serif italic text-muted-foreground">ZenuX</div>
                        <p className="font-mono text-xs uppercase tracking-[0.2em]">Ticket Search System</p>
                    </div>
                )}
            </div>

            {/* Detail Dialog */}
            <Dialog open={!!selectedTicket} onOpenChange={(val: boolean) => !val && setSelectedTicket(null)}>
                <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="font-serif text-xl flex items-center gap-2">
                            #{selectedTicket?.id} - {selectedTicket?.subject}
                        </DialogTitle>
                        <DialogDescription>
                            Created on {selectedTicket?.created_at && new Date(selectedTicket.created_at).toLocaleString()}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 mt-4">
                        <div className="flex gap-2">
                            <Badge>{selectedTicket?.status}</Badge>
                            {selectedTicket?.priority && <Badge variant="outline">{selectedTicket.priority}</Badge>}
                            {selectedTicket?.type && <Badge variant="outline">{selectedTicket.type}</Badge>}
                        </div>

                        <div className="prose prose-sm max-w-none bg-muted/30 p-4 rounded-md">
                            <h4 className="font-semibold mb-2">Description</h4>
                            <p className="whitespace-pre-wrap">{selectedTicket?.description}</p>
                        </div>

                        <div className="flex justify-end pt-4">
                            <Button variant="outline" asChild>
                                <a href={selectedTicket?.url} target="_blank" rel="noreferrer">Open in Zendesk</a>
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}
