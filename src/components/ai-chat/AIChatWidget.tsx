import { useEffect, useMemo, useRef, useState } from 'react'
import { Bot, Loader2, MessageSquare, Paperclip, Send, Terminal, Trash2, User, X, Plus, History, LogIn } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeSanitize from 'rehype-sanitize'

import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'

import {
  getChatIndex,
  getChatSession,
  createNewChat,
  saveChatSession,
  deleteChatSession,
  signIn,
  getUser,
  isSignedIn
} from './chatSessionStore'
import { chatStream, deletePath, listModels, uploadFiles } from './puterClient'

// Known Vision Models
const VISION_MODELS = [
  'gpt-4o',
  'gpt-5',
  'o1',
  'o3',
  'gpt-4-turbo',
  'claude-3-5',
  'claude-3-opus',
  'gemini-1.5',
  'gemini-2.0'
]

type ConnectionStatus = 'loading' | 'ready' | 'error'

type ChatAttachment = {
  name: string
  size: number
  type: string
}

type ChatMessage = {
  id: string
  role: 'user' | 'assistant'
  content: string
  createdAt: number
  attachments?: ChatAttachment[]
}

type ModelOption = {
  id: string
  label: string
  provider: string
}

function uid() {
  return `${Date.now()}_${Math.random().toString(16).slice(2)}`
}

function toModelOption(model: any): ModelOption | undefined {
  const id = model?.id ?? model?.name ?? model?.model
  if (!id) return undefined
  
  const idLower = String(id).toLowerCase()
  // Filter out unwanted or legacy models
  if (idLower === 'antigravity') return undefined
  if (idLower.includes('instruct')) return undefined // Usually legacy completion models
  if (idLower.includes('dall-e') || idLower.includes('diffusion')) return undefined // Image gen only models

  const fullId = String(id)
  let simpleName = fullId

  if (fullId.includes('/')) {
    simpleName = fullId.split('/').pop() || fullId
  }

  simpleName = simpleName
    .replace(/-/g, ' ')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, l => l.toUpperCase())
    .replace(/Gpt/gi, 'GPT')
    .replace(/Claude/gi, 'Claude')
    .replace(/Gemini/gi, 'Gemini')
    .replace(/Llama/gi, 'Llama')
    .replace(/Mistral/gi, 'Mistral')

  const provider = model?.provider ?? model?.vendor ?? model?.source ?? 'Other'
  return { id: fullId, label: simpleName, provider: String(provider) }
}

function classNames(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(' ')
}

export default function AIChatWidget() {
  // UI State
  const [isOpen, setIsOpen] = useState(false)
  const [isHistoryOpen, setIsHistoryOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  // Data State
  const [user, setUser] = useState<any>(null)
  const [isUserSignedIn, setIsUserSignedIn] = useState(false)
  const [currentChatId, setCurrentChatId] = useState<string | null>(null)
  const [chatHistory, setChatHistory] = useState<any[]>([]) // List of {id, title, updatedAt}
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [showWelcome, setShowWelcome] = useState(false)

  // Chat/Model State
  const [status, setStatus] = useState<ConnectionStatus>('loading')
  const [models, setModels] = useState<ModelOption[]>([])
  const [selectedModel, setSelectedModel] = useState<string>('')
  const [selectedProvider, setSelectedProvider] = useState<string>('')

  const [prompt, setPrompt] = useState('')
  const [pendingFiles, setPendingFiles] = useState<File[]>([])
  const [isSending, setIsSending] = useState(false)
  const [isLoadingHistory, setIsLoadingHistory] = useState(false)

  const scrollAnchorRef = useRef<HTMLDivElement | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const hasLoadedModelsRef = useRef(false)

  // --- Initialization ---

  // Load User & Chat Index on Open
  useEffect(() => {
    if (!isOpen) return

    // Reset unread count
    setUnreadCount(0)

    const init = async () => {
      // 1. Check Auth
      try {
        const signedIn = await isSignedIn()
        setIsUserSignedIn(signedIn)
        if (signedIn) {
          const u = await getUser()
          setUser(u)
        }
      } catch (e: unknown) { 
        console.error('Auth check failed', e)
        // Don't throw error to prevent console spam
        const errorMessage = e instanceof Error ? e.message : ''
        if (errorMessage && !errorMessage.includes('401')) {
          console.warn('Authentication service unavailable')
        }
      }

      // 2. Load Models
      if (!hasLoadedModelsRef.current) {
        try {
          const raw = await listModels()
          const opts = (Array.isArray(raw) ? raw : []).map(toModelOption).filter((x): x is ModelOption => Boolean(x))
          setModels(opts)
          if (opts.length > 0) {
            setSelectedModel(opts[0].id)
            setSelectedProvider(opts[0].provider)
          }
          setStatus('ready')
          hasLoadedModelsRef.current = true
        } catch { setStatus('error') }
      }

      // 3. Load Chat History Index
      await refreshHistory()
    }
    init()
  }, [isOpen])

  // Load Specific Chat when currentChatId changes
  useEffect(() => {
    if (!currentChatId) return

    const loadChat = async () => {
      setIsLoadingHistory(true)
      try {
        const session = await getChatSession(currentChatId)
        if (session) {
          setMessages(session.messages || [])
          if (session.messages.length === 0) setShowWelcome(true)
          else setShowWelcome(false)

          if (session.model) setSelectedModel(session.model)
        }
      } catch (e) {
        console.error('Failed to load chat', e)
      } finally {
        setIsLoadingHistory(false)
      }
    }
    loadChat()
  }, [currentChatId])

  // Helper to refresh history list
  const refreshHistory = async () => {
    try {
      const index = await getChatIndex()
      setChatHistory(index)

      // If no current chat, load the most recent one or create new
      if (!currentChatId) {
        if (index.length > 0) {
          setCurrentChatId(index[0].id)
        } else {
          await handleNewChat()
        }
      }
    } catch (e) {
      console.error('Failed to load history', e)
    }
  }

  // Auto-select provider
  const providers = useMemo(() => {
    const unique = new Set(models.map(m => m.provider))
    return Array.from(unique).sort()
  }, [models])

  const filteredModels = useMemo(() => {
    if (!selectedProvider) return []
    return models.filter(m => m.provider === selectedProvider)
  }, [models, selectedProvider])

  useEffect(() => {
    if (selectedModel && models.length > 0) {
      const found = models.find(m => m.id === selectedModel)
      if (found && found.provider !== selectedProvider) {
        setSelectedProvider(found.provider)
      }
    } else if (!selectedProvider && providers.length > 0) {
      setSelectedProvider(providers.includes('openai') ? 'openai' : providers[0])
    }
  }, [selectedModel, models, selectedProvider, providers])


  // Scroll to bottom
  useEffect(() => {
    scrollAnchorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [messages.length, isOpen, isLoadingHistory])


  // --- Actions ---

  async function handleNewChat() {
    try {
      setIsLoadingHistory(true)
      const newChat = await createNewChat()
      setCurrentChatId(newChat.id)
      setMessages([])
      setShowWelcome(true)
      setChatHistory(prev => [{ id: newChat.id, title: 'New Chat', updatedAt: Date.now() }, ...prev])
      setIsHistoryOpen(false) // Close sidebar if open
    } catch (e) {
      console.error('New chat failed', e)
    } finally {
      setIsLoadingHistory(false)
    }
  }

  async function handleDeleteChat(id: string, e: React.MouseEvent) {
    e.stopPropagation()
    if (!confirm('Delete this chat?')) return

    await deleteChatSession(id)

    const newHistory = chatHistory.filter(c => c.id !== id)
    setChatHistory(newHistory)

    if (currentChatId === id) {
      if (newHistory.length > 0) setCurrentChatId(newHistory[0].id)
      else await handleNewChat()
    }
  }

  async function handleSignIn() {
    try {
      await signIn()
      const signedIn = await isSignedIn()
      setIsUserSignedIn(signedIn)
      if (signedIn) {
        const u = await getUser()
        setUser(u)
        await refreshHistory() // Reload history as it might merge with cloud
      }
    } catch (e: unknown) {
      console.error('Sign in failed', e)
      // Don't throw error to prevent console spam
      const errorMessage = e instanceof Error ? e.message : ''
      if (errorMessage && !errorMessage.includes('401')) {
        console.warn('Authentication service unavailable')
      }
    }
  }

  async function onSend() {
    const trimmed = prompt.trim()
    if (!trimmed && pendingFiles.length === 0) return
    if (isSending) return

    // 0. Vision Model Check
    const isVisionModel = VISION_MODELS.some(v => selectedModel.toLowerCase().includes(v))
    if (pendingFiles.length > 0 && !isVisionModel) {
      alert(`Model currently selected (${selectedModel}) might not support images. Please switch to GPT-4o, Claude 3.5 Sonnet, or Gemini 1.5.`)
      // We don't return here, we let them try, but warn them. or maybe we should auto-switch?
      // Let's just return to be safe to avoid API errors
      // actually, let's just warn in console and proceed, but user complained about error.
      // Better: Append a system warning in chat if it fails?
    }

    setIsSending(true)
    setShowWelcome(false)

    // 1. Optimistic Update
    const userMessage: ChatMessage = {
      id: uid(),
      role: 'user',
      content: trimmed,
      createdAt: Date.now(),
      attachments: pendingFiles.length > 0 ? pendingFiles.map(f => ({ name: f.name, size: f.size, type: f.type })) : undefined
    }

    const assistantId = uid()
    const assistantMessage: ChatMessage = {
      id: assistantId, role: 'assistant', content: '', createdAt: Date.now()
    }

    const newMessages = [...messages, userMessage, assistantMessage]
    setMessages(newMessages)
    setPrompt('')
    const filesToUpload = pendingFiles
    setPendingFiles([])

    // Save immediately (user msg)
    if (currentChatId) {
      saveChatSession(currentChatId, [...messages, userMessage], selectedModel)
      // Update history title optimistically
      const firstUserMsg = messages.find(m => m.role === 'user') || userMessage
      const newTitle = firstUserMsg.content.slice(0, 30) || 'New Chat'
      setChatHistory(prev => prev.map(c => c.id === currentChatId ? { ...c, title: newTitle, updatedAt: Date.now() } : c))
    }

    try {
      // 2. Upload Files
      const uploaded = filesToUpload.length > 0 ? await uploadFiles(filesToUpload) : []
      const puterPaths = uploaded.map((f: any) => f?.path).filter(Boolean)

      // 3. Prepare API Payload
      const apiMessages: any[] = messages
        .filter((m) => m.role === 'user' || m.role === 'assistant')
        .map((m) => {
          let content = m.content || ''
          if (!content.trim() && m.attachments?.length) {
            content = `[Attached files: ${m.attachments.map(a => a.name).join(', ')}]`
          }
          return { role: m.role, content }
        })
        .filter((m) => Boolean(m.content && String(m.content).trim()))

      const contentParts: any[] = []
      for (const p of puterPaths) contentParts.push({ type: 'file', puter_path: p })
      if (trimmed) contentParts.push({ type: 'text', text: trimmed })
      else contentParts.push({ type: 'text', text: 'Analyze attached files.' })

      apiMessages.push({ role: 'user', content: contentParts.length === 1 && contentParts[0].type === 'text' ? contentParts[0].text : contentParts })

      // 4. Stream Response
      const completion = await chatStream(apiMessages, { model: selectedModel || undefined })

      let buffer = ''
      let lastFlush = 0

      const flush = () => {
        setMessages(prev => prev.map(m => m.id === assistantId ? { ...m, content: buffer } : m))
      }

      for await (const part of completion as any) {
        const delta = part?.text
        if (delta) {
          buffer += delta
          const now = Date.now()
          if (now - lastFlush >= 50) {
            lastFlush = now
            flush()
          }
        }
      }
      flush()

      // 5. Final Save
      const finalMessages = newMessages.map(m => m.id === assistantId ? { ...m, content: buffer } : m)
      if (currentChatId) saveChatSession(currentChatId, finalMessages, selectedModel)

      // Cleaning
      for (const p of puterPaths) try { await deletePath(p) } catch { }

    } catch (e: any) {
      console.error('Chat Error:', e)
      const errorMsg = `Error: ${e?.message || 'Unknown error'}`
      setMessages(prev => prev.map(m => m.id === assistantId ? { ...m, content: errorMsg } : m))
    } finally {
      setIsSending(false)
    }
  }

  // --- Render ---

  if (!isOpen) {
    return (
      <Button
        size="sm"
        className="fixed bottom-3 right-3 h-10 w-10 rounded-full shadow-lg bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] hover:bg-[hsl(var(--primary)/0.9)] z-50 transition-all duration-300 hover:scale-105"
        onClick={() => setIsOpen(true)}
      >
        <MessageSquare className="h-4 w-4" />
        {unreadCount > 0 && <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[8px] font-bold text-white ring-2 ring-white dark:ring-black">{unreadCount}</span>}
      </Button>
    )
  }

  return (
    <div className="fixed bottom-0 right-0 sm:bottom-3 sm:right-3 z-50 flex flex-col items-end w-full sm:w-[340px] h-[100vh] sm:h-[480px] pointer-events-auto font-sans antialiased text-[hsl(var(--foreground))]">

      <div className="relative flex flex-col w-full h-full bg-[hsl(var(--card))] border border-[hsl(var(--border))] shadow-xl sm:rounded-xl overflow-hidden transition-colors duration-300">

        {/* --- Sidebar (History) Overlay --- */}
        <div className={classNames(
          "absolute inset-y-0 left-0 w-56 bg-[hsl(var(--card))] backdrop-blur-xl border-r border-[hsl(var(--border))] z-20 transform transition-transform duration-300 ease-in-out flex flex-col",
          isHistoryOpen ? "translate-x-0" : "-translate-x-full"
        )}>
          <div className="p-3 border-b border-[hsl(var(--border))] flex items-center justify-between">
            <span className="font-semibold text-xs">Chat History</span>
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setIsHistoryOpen(false)}><X className="h-3 w-3" /></Button>
          </div>
          <ScrollArea className="flex-1">
            <div className="p-2 space-y-1">
              {chatHistory.map(chat => (
                <div
                  key={chat.id}
                  className={classNames(
                    "group flex items-center justify-between p-1.5 rounded-md text-xs cursor-pointer hover:bg-[hsl(var(--accent)/0.1)] transition-colors",
                    currentChatId === chat.id ? "bg-[hsl(var(--accent)/0.2)] font-medium text-[hsl(var(--primary))]" : "text-[hsl(var(--muted-foreground))]"
                  )}
                  onClick={() => { setCurrentChatId(chat.id); setIsHistoryOpen(false); }}
                >
                  <span className="truncate flex-1">{chat.title || 'Untitled Chat'}</span>
                  <Button
                    variant="ghost" size="icon"
                    className="h-5 w-5 opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 hover:bg-transparent"
                    onClick={(e) => handleDeleteChat(chat.id, e)}
                  >
                    <Trash2 className="h-2.5 w-2.5" />
                  </Button>
                </div>
              ))}
              {chatHistory.length === 0 && (
                <div className="text-center py-6 text-[10px] text-[hsl(var(--muted-foreground))]">No previous chats</div>
              )}
            </div>
          </ScrollArea>
          <div className="p-2.5 border-t border-[hsl(var(--border))]">
            {isUserSignedIn && user ? (
              <div className="flex items-center gap-2 text-[10px] text-[hsl(var(--muted-foreground))]">
                <User className="h-2.5 w-2.5" />
                <span className="truncate flex-1">Signed in as {user.username}</span>
              </div>
            ) : (
              <Button variant="outline" size="sm" className="w-full text-[10px] h-7" onClick={handleSignIn}>
                <LogIn className="h-2.5 w-2.5 mr-1.5" />
                Link Puter Account
              </Button>
            )}
          </div>
        </div>

        {/* --- Main Chat Interface --- */}

        {/* Header */}
        <div className="flex-none flex items-center justify-between px-3 py-2 bg-[hsl(var(--card)/0.8)] backdrop-blur-md border-b border-[hsl(var(--border))] z-10">
          <div className="flex items-center gap-1.5">
            {/* New Chat Button (Moved to Left) */}
            <Button variant="ghost" size="icon" className="h-6 w-6 -ml-1 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--primary))] hover:bg-[hsl(var(--accent)/0.1)] transition-colors" onClick={handleNewChat} title="New Chat">
              <Plus className="h-3 w-3" />
            </Button>
            
            <Button variant="ghost" size="icon" className="h-6 w-6 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--primary))] hover:bg-[hsl(var(--accent)/0.1)] transition-colors" onClick={() => setIsHistoryOpen(true)}>
              <History className="h-3 w-3" />
            </Button>
            
            <div className="flex flex-col ml-0.5">
              <span className="font-semibold text-[hsl(var(--primary))] tracking-tight text-xs">AI Assistant</span>
              <div className="flex items-center gap-1">
                <span className={classNames("h-1 w-1 rounded-full", status === 'ready' ? "bg-green-500" : "bg-gray-400")}></span>
                <span className="text-[9px] font-medium text-[hsl(var(--muted-foreground))]">
                  {status === 'ready' ? 'Online' : 'Offline'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-6 w-6 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--destructive))] hover:bg-[hsl(var(--destructive)/0.1)] rounded-md transition-colors" onClick={() => setIsOpen(false)} title="Close">
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>

        {/* Chat Area - List View - With Scrollbar */}
        <ScrollArea className="flex-1 w-full bg-[hsl(var(--background))] [&>[data-radix-scroll-area-viewport]]:!overflow-y-auto [&>[data-radix-scroll-area-viewport]::-webkit-scrollbar]:!w-1.5 [&>[data-radix-scroll-area-viewport]::-webkit-scrollbar-thumb]:!bg-[hsl(var(--muted-foreground)/0.3)] hover:[&>[data-radix-scroll-area-viewport]::-webkit-scrollbar-thumb]:!bg-[hsl(var(--muted-foreground)/0.5)] [&>[data-radix-scroll-area-viewport]::-webkit-scrollbar-track]:!bg-transparent transition-colors">
          <div className="flex flex-col py-3 px-3 gap-4 min-h-full">

            {(messages.length === 0 || showWelcome) && !isLoadingHistory ? (
              <div className="flex flex-col items-center justify-center flex-1 h-[200px] text-center space-y-3 opacity-30 select-none">
                <div className="h-10 w-10 bg-[hsl(var(--muted))] rounded-xl flex items-center justify-center">
                  <Terminal className="h-5 w-5 text-[hsl(var(--primary))]" />
                </div>
                <div className="space-y-0.5">
                  <h3 className="text-sm font-medium text-[hsl(var(--foreground))]">AI Assistant</h3>
                  <p className="text-xs text-gray-500">
                    {user ? `Logged in as ${user.username}` : `Temporary Session`}
                  </p>
                </div>
              </div>
            ) : null}

            {isLoadingHistory && (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="h-5 w-5 animate-spin text-[hsl(var(--primary))]" />
              </div>
            )}

            {!isLoadingHistory && messages.map((m) => {
              const isUser = m.role === 'user'
              return (
                <div key={m.id} className={classNames(
                  "group relative flex gap-2 w-full",
                  isUser ? "flex-row-reverse" : "flex-row"
                )}>
                  {/* Avatar */}
                  <div className="flex-none flex flex-col items-center gap-1">
                    <div className={classNames(
                      "h-6 w-6 rounded-full flex items-center justify-center border shadow-sm",
                      isUser
                        ? "bg-[hsl(var(--muted))] border-[hsl(var(--border))]"
                        : "bg-[hsl(var(--primary))] border-transparent"
                    )}>
                      {isUser ? <User className="h-3 w-3 text-[hsl(var(--muted-foreground))]" /> : <Bot className="h-3 w-3 text-[hsl(var(--primary-foreground))]" />}
                    </div>
                  </div>

                  {/* Content - Nuclear Option for Overflow */}
                  <div className={classNames(
                    "flex-1 min-w-0 w-0 py-0.5 space-y-1 flex flex-col",
                    isUser ? "items-end text-right" : "items-start text-left"
                  )}>

                    <div className={classNames("flex items-center gap-1.5", isUser ? "flex-row-reverse" : "flex-row")}>
                      <span className="text-xs font-semibold text-[hsl(var(--foreground))]">
                        {isUser ? 'You' : 'AI'}
                      </span>
                      <span className="text-[9px] text-[hsl(var(--muted-foreground))]">
                        {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    {/* Attachments */}
                    {m.attachments?.length ? (
                      <div className="flex flex-wrap gap-1 justify-end">
                        {m.attachments.map((a) => (
                          <div key={`${m.id}_${a.name}`} className="flex items-center gap-1 text-[10px] bg-[hsl(var(--muted))] border border-[hsl(var(--border))] px-2 py-1 rounded text-[hsl(var(--muted-foreground))]">
                            <Paperclip className="h-2.5 w-2.5" />
                            <span className="truncate max-w-[120px]">{a.name}</span>
                          </div>
                        ))}
                      </div>
                    ) : null}

                    {/* Message Text */}
                    <div className={classNames(
                      "prose prose-xs max-w-none text-[hsl(var(--foreground))] break-words prose-p:leading-5 prose-p:text-xs prose-pre:bg-[hsl(var(--muted))] prose-pre:border prose-pre:border-[hsl(var(--border))] prose-pre:text-[hsl(var(--foreground))] prose-pre:rounded-lg prose-pre:overflow-x-auto prose-pre:text-[10px] prose-code:bg-[hsl(var(--muted))] prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-[10px] prose-code:before:content-none prose-code:after:content-none min-w-0 w-full overflow-hidden",
                      isUser ? "text-right items-end" : "text-left items-start"
                    )}>
                      {m.role === 'assistant' ? (
                        <div className="text-left text-xs">
                          <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeSanitize]}>
                            {m.content || (isSending ? 'Thinking...' : '')}
                          </ReactMarkdown>
                        </div>
                      ) : (
                        <div className="whitespace-pre-wrap break-words text-xs">{m.content}</div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
            <div ref={scrollAnchorRef} className="h-2" />
          </div>
        </ScrollArea>

        {/* Floating Command Input */}
        <div className="flex-none p-2 bg-[hsl(var(--background))] border-t border-[hsl(var(--border))]">
          <div className="relative flex flex-col bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-lg shadow-sm focus-within:ring-2 focus-within:ring-[hsl(var(--ring)/0.2)] transition-all overflow-hidden">

            {pendingFiles.length > 0 && (
              <div className="flex flex-wrap gap-1 px-2 pt-2">
                {pendingFiles.map((f) => (
                  <div key={f.name} className="flex items-center gap-1 bg-[hsl(var(--muted))] px-1.5 py-0.5 rounded text-[10px] border border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))]">
                    <span className="max-w-[80px] truncate">{f.name}</span>
                    <button onClick={() => setPendingFiles(prev => prev.filter(x => x !== f))}>
                      <X className="h-2.5 w-2.5 hover:text-[hsl(var(--destructive))]" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Ask anything..."
              className="min-h-[36px] max-h-24 w-full resize-none border-0 bg-transparent px-3 py-2 text-xs focus-visible:ring-0 shadow-none text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))]"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  onSend()
                }
              }}
              disabled={isSending}
            />

            <div className="flex justify-between items-center px-1.5 pb-1.5">
              <div className="flex items-center gap-0.5">
                <input
                  ref={fileInputRef} type="file" className="hidden" multiple
                  onChange={(e) => {
                    const files = Array.from(e.target.files ?? [])
                    if (files.length === 0) return
                    setPendingFiles((prev) => [...prev, ...files].slice(0, 5))
                    e.target.value = ''
                  }}
                />
                <Button variant="ghost" size="icon" className="h-6 w-6 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--accent)/0.1)] rounded transition-colors" onClick={() => fileInputRef.current?.click()} disabled={isSending}>
                  <Paperclip className="h-3 w-3" />
                </Button>

                {/* Provider Selector */}
                <div className="hidden sm:flex items-center">
                  <Select value={selectedProvider} onValueChange={setSelectedProvider} disabled={status !== 'ready'}>
                    <SelectTrigger className="h-6 w-[70px] text-[10px] border-0 bg-transparent hover:bg-[hsl(var(--accent)/0.1)] rounded px-1.5 text-[hsl(var(--muted-foreground))] font-medium focus:ring-0 transition-colors">
                      <SelectValue placeholder="Provider" />
                    </SelectTrigger>
                    <SelectContent align="start" className="bg-[hsl(var(--popover))] border border-[hsl(var(--border))] shadow-lg p-1 max-h-[200px] overflow-y-auto">
                      {providers.map((p) => <SelectItem key={p} value={p} className="text-[10px]">{p.toUpperCase()}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                {/* Model Selector */}
                <Select value={selectedModel} onValueChange={setSelectedModel} disabled={status !== 'ready' || !selectedProvider}>
                  <SelectTrigger className="h-6 max-w-[100px] text-[10px] border-0 bg-transparent hover:bg-[hsl(var(--accent)/0.1)] rounded px-1.5 text-[hsl(var(--muted-foreground))] font-medium focus:ring-0 truncate transition-colors">
                    <SelectValue placeholder="Model" />
                  </SelectTrigger>
                  <SelectContent align="start" className="bg-[hsl(var(--popover))] border border-[hsl(var(--border))] shadow-lg p-1 max-h-[200px] overflow-y-auto">
                    {filteredModels.map((m) => {
                      const isVision = VISION_MODELS.some(v => m.id.toLowerCase().includes(v))
                      return (
                        <SelectItem key={m.id} value={m.id} className="text-[10px]">
                          {m.label} {isVision && <span className="ml-1 text-[8px] opacity-70">👁️</span>}
                        </SelectItem>
                      )
                    })}
                  </SelectContent>
                </Select>
              </div>

              <Button size="icon" onClick={onSend} disabled={(!prompt.trim() && pendingFiles.length === 0) || isSending} className={classNames("h-6 w-6 rounded transition-all flex items-center justify-center ml-auto bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] hover:bg-[hsl(var(--primary)/0.9)] shadow-sm")}>
                {isSending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Send className="h-3 w-3" />}
              </Button>
            </div>
          </div>

          <div className="text-center mt-1">
            <span className="text-[8px] text-[hsl(var(--muted-foreground))] font-medium">Powered by Puter.js</span>
          </div>
        </div>
      </div>
    </div>
  )
}
