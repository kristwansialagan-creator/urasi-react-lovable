import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bot, Globe, Loader2, MessageSquare, Package, Paperclip, Send, Terminal, Trash2, User, X, Plus, History, LogIn, LogOut, ExternalLink, Copy } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeSanitize from 'rehype-sanitize'

import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

import {
  getChatIndex,
  getChatSession,
  createNewChat,
  saveChatSession,
  deleteChatSession,
  signIn,
  getUser,
  isSignedIn,
  type ChatMode
} from './chatSessionStore'
import { chatStream, deletePath, listModels, uploadFiles, signOut } from './puterClient'
import { firecrawlApi, isValidUrl } from '@/lib/api/firecrawl'
import { useProductExtraction, type ExtractedProductData } from '@/contexts/ProductExtractionContext'

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
  role: 'user' | 'assistant' | 'scraper' | 'product'
  content: string
  createdAt: number
  attachments?: ChatAttachment[]
  metadata?: {
    url?: string
    title?: string
    sourceUrl?: string
    extractedProduct?: ExtractedProductData
    fieldsExtracted?: number
    totalFields?: number
  }
}

type ModelOption = {
  id: string
  label: string
  provider: string
}

type ChatIndexItem = {
  id: string
  title: string
  createdAt: number
  updatedAt: number
}

// Per-mode state type
type PerModeState = {
  currentChatId: string | null
  messages: ChatMessage[]
  chatHistory: ChatIndexItem[]
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
  const navigate = useNavigate()
  const { setExtractedData } = useProductExtraction()

  // UI State
  const [isOpen, setIsOpen] = useState(false)
  const [isHistoryOpen, setIsHistoryOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const [chatMode, setChatMode] = useState<ChatMode>('ai')

  // Data State - Per Mode
  const [modeStates, setModeStates] = useState<Record<ChatMode, PerModeState>>({
    ai: { currentChatId: null, messages: [], chatHistory: [] },
    scraper: { currentChatId: null, messages: [], chatHistory: [] },
    product: { currentChatId: null, messages: [], chatHistory: [] }
  })

  // Auth State
  const [user, setUser] = useState<any>(null)
  const [isUserSignedIn, setIsUserSignedIn] = useState(false)
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
  const loadedModesRef = useRef<Set<ChatMode>>(new Set())

  // Current mode's state (derived)
  const currentState = modeStates[chatMode]
  const { currentChatId, messages, chatHistory } = currentState

  // Helper to update mode state
  const updateModeState = (mode: ChatMode, updates: Partial<PerModeState>) => {
    setModeStates(prev => ({
      ...prev,
      [mode]: { ...prev[mode], ...updates }
    }))
  }

  // --- Initialization ---

  // Load User & Models on Open
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
    }
    init()
  }, [isOpen])

  // Load history for current mode when mode changes or widget opens
  useEffect(() => {
    if (!isOpen) return
    
    // Only load once per mode per session
    if (loadedModesRef.current.has(chatMode)) return
    
    const loadModeHistory = async () => {
      setIsLoadingHistory(true)
      try {
        const index = await getChatIndex(chatMode)
        
        if (index.length > 0) {
          // Load the most recent chat
          const session = await getChatSession(index[0].id, chatMode)
          updateModeState(chatMode, {
            chatHistory: index,
            currentChatId: index[0].id,
            messages: session?.messages || []
          })
          setShowWelcome(session?.messages.length === 0)
        } else {
          // Create new chat for this mode
          const newChat = await createNewChat(chatMode)
          updateModeState(chatMode, {
            chatHistory: [{ id: newChat.id, title: newChat.title, createdAt: newChat.createdAt, updatedAt: newChat.updatedAt }],
            currentChatId: newChat.id,
            messages: []
          })
          setShowWelcome(true)
        }
        
        loadedModesRef.current.add(chatMode)
      } catch (e) {
        console.error('Failed to load mode history', e)
      } finally {
        setIsLoadingHistory(false)
      }
    }
    
    loadModeHistory()
  }, [isOpen, chatMode])

  // Load Specific Chat when currentChatId changes
  useEffect(() => {
    if (!currentChatId || !isOpen) return
    
    // Skip if we just loaded this mode's history
    if (loadedModesRef.current.has(chatMode) && messages.length > 0) return

    const loadChat = async () => {
      setIsLoadingHistory(true)
      try {
        const session = await getChatSession(currentChatId, chatMode)
        if (session) {
          updateModeState(chatMode, { messages: session.messages || [] })
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

  // Helper to refresh history list for current mode
  const refreshHistory = async () => {
    try {
      const index = await getChatIndex(chatMode)
      updateModeState(chatMode, { chatHistory: index })
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
      const newChat = await createNewChat(chatMode)
      updateModeState(chatMode, {
        currentChatId: newChat.id,
        messages: [],
        chatHistory: [{ id: newChat.id, title: newChat.title, createdAt: newChat.createdAt, updatedAt: newChat.updatedAt }, ...chatHistory]
      })
      setShowWelcome(true)
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

    await deleteChatSession(id, chatMode)

    const newHistory = chatHistory.filter(c => c.id !== id)
    updateModeState(chatMode, { chatHistory: newHistory })

    if (currentChatId === id) {
      if (newHistory.length > 0) {
        const session = await getChatSession(newHistory[0].id, chatMode)
        updateModeState(chatMode, {
          currentChatId: newHistory[0].id,
          messages: session?.messages || []
        })
      } else {
        await handleNewChat()
      }
    }
  }

  async function handleSelectChat(id: string) {
    if (id === currentChatId) {
      setIsHistoryOpen(false)
      return
    }
    
    setIsLoadingHistory(true)
    try {
      const session = await getChatSession(id, chatMode)
      updateModeState(chatMode, {
        currentChatId: id,
        messages: session?.messages || []
      })
      setShowWelcome(session?.messages.length === 0)
    } catch (e) {
      console.error('Failed to load chat', e)
    } finally {
      setIsLoadingHistory(false)
      setIsHistoryOpen(false)
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
        // Reload history for current mode
        loadedModesRef.current.delete(chatMode)
        await refreshHistory()
      }
    } catch (e: unknown) {
      console.error('Sign in failed', e)
      const errorMessage = e instanceof Error ? e.message : ''
      if (errorMessage && !errorMessage.includes('401')) {
        console.warn('Authentication service unavailable')
      }
    }
  }

  // Handle Scraper Mode
  async function handleScraperSend() {
    const trimmed = prompt.trim()
    if (!trimmed) return
    if (isSending) return

    setIsSending(true)
    setShowWelcome(false)

    // Determine if it's a URL or search query
    const isUrl = isValidUrl(trimmed)

    // Create user message
    const userMessage: ChatMessage = {
      id: uid(),
      role: 'user',
      content: trimmed,
      createdAt: Date.now(),
    }

    const scraperMessageId = uid()
    const scraperMessage: ChatMessage = {
      id: scraperMessageId,
      role: 'scraper',
      content: isUrl ? 'Scraping webpage...' : 'Searching the web...',
      createdAt: Date.now(),
      metadata: isUrl ? { url: trimmed } : undefined
    }

    const newMessages = [...messages, userMessage, scraperMessage]
    updateModeState(chatMode, { messages: newMessages })
    setPrompt('')

    try {
      let resultContent = ''
      let metadata: ChatMessage['metadata'] = {}

      if (isUrl) {
        // Scrape single URL
        const response = await firecrawlApi.scrape(trimmed)
        
        if (response.success && response.data) {
          const { markdown, metadata: pageMetadata } = response.data
          resultContent = markdown || 'No content extracted from the page.'
          metadata = {
            url: trimmed,
            title: pageMetadata?.title || trimmed,
            sourceUrl: pageMetadata?.sourceURL || trimmed
          }
        } else {
          resultContent = `**Error:** ${response.error || 'Failed to scrape the page.'}`
        }
      } else {
        // Web search
        const response = await firecrawlApi.search(trimmed)
        
        if (response.success && response.data) {
          const results = response.data
          
          if (Array.isArray(results) && results.length > 0) {
            resultContent = results.map((r: any, i: number) => {
              const title = r.title || r.metadata?.title || 'Untitled'
              const url = r.url || r.metadata?.sourceURL || ''
              const description = r.description || r.markdown?.slice(0, 200) || ''
              return `### ${i + 1}. ${title}\n${url ? `🔗 ${url}\n` : ''}\n${description}${description.length >= 200 ? '...' : ''}`
            }).join('\n\n---\n\n')
          } else {
            resultContent = 'No search results found.'
          }
        } else {
          resultContent = `**Error:** ${response.error || 'Failed to search.'}`
        }
      }

      // Update scraper message with result
      const finalMessages = newMessages.map(m => 
        m.id === scraperMessageId 
          ? { ...m, content: resultContent, metadata } 
          : m
      )
      updateModeState(chatMode, { messages: finalMessages })

      // Save session
      if (currentChatId) {
        await saveChatSession(currentChatId, finalMessages, chatMode)
        // Update history title
        const firstUserMsg = finalMessages.find(m => m.role === 'user')
        if (firstUserMsg) {
          const newTitle = firstUserMsg.content.slice(0, 30) || 'New Scrape'
          updateModeState(chatMode, {
            chatHistory: chatHistory.map(c => c.id === currentChatId ? { ...c, title: newTitle, updatedAt: Date.now() } : c)
          })
        }
      }

    } catch (error: any) {
      console.error('Scraper error:', error)
      const errorMessages = newMessages.map(m => 
        m.id === scraperMessageId 
          ? { ...m, content: `**Error:** ${error?.message || 'An unexpected error occurred.'}` } 
          : m
      )
      updateModeState(chatMode, { messages: errorMessages })
    } finally {
      setIsSending(false)
    }
  }

  // Handle Product Lookup Mode
  async function handleProductLookupSend() {
    const trimmed = prompt.trim()
    if (!trimmed) return
    if (isSending) return

    // Must be a URL for product lookup
    if (!isValidUrl(trimmed)) {
      updateModeState(chatMode, {
        messages: [...messages, {
          id: uid(),
          role: 'product' as const,
          content: '**Error:** Please enter a valid product URL (e.g., https://tokopedia.com/product/...)',
          createdAt: Date.now()
        }]
      })
      return
    }

    setIsSending(true)
    setShowWelcome(false)

    // Create user message
    const userMessage: ChatMessage = {
      id: uid(),
      role: 'user',
      content: trimmed,
      createdAt: Date.now(),
    }

    const productMessageId = uid()
    const productMessage: ChatMessage = {
      id: productMessageId,
      role: 'product',
      content: '🔍 Extracting product data...',
      createdAt: Date.now(),
      metadata: { url: trimmed }
    }

    const newMessages = [...messages, userMessage, productMessage]
    updateModeState(chatMode, { messages: newMessages })
    setPrompt('')

    try {
      const response = await firecrawlApi.extractProduct(trimmed)
      
      if (response.success && response.data) {
        const { extracted, metadata: extractionMeta } = response.data
        
        // Build result content as markdown table
        let resultContent = '## 📦 Product Data Extracted\n\n'
        resultContent += `| Field | Value |\n|-------|-------|\n`
        
        const fieldLabels: Record<string, string> = {
          name: 'Product Name',
          sku: 'SKU',
          barcode: 'Barcode',
          description: 'Description',
          selling_price: 'Selling Price',
          purchase_price: 'Purchase Price',
          wholesale_price: 'Wholesale Price',
          stock_quantity: 'Stock Quantity',
          category: 'Category',
          brand: 'Brand',
          weight: 'Weight',
          dimensions: 'Dimensions',
          image_url: 'Image URL'
        }
        
        Object.entries(fieldLabels).forEach(([key, label]) => {
          const value = extracted[key as keyof typeof extracted]
          const displayValue = value !== null && value !== undefined && value !== '' 
            ? String(value).slice(0, 50) + (String(value).length > 50 ? '...' : '')
            : '—'
          resultContent += `| ${label} | ${displayValue} |\n`
        })
        
        resultContent += `\n---\n**${extractionMeta.fieldsExtracted} of ${extractionMeta.totalFields} fields extracted**`
        resultContent += `\n\n*Source: [${new URL(trimmed).hostname}](${trimmed})*`
        
        // Update message with result
        const finalMessages = newMessages.map(m => 
          m.id === productMessageId 
            ? { 
                ...m, 
                content: resultContent, 
                metadata: { 
                  ...m.metadata,
                  extractedProduct: extracted,
                  fieldsExtracted: extractionMeta.fieldsExtracted,
                  totalFields: extractionMeta.totalFields,
                  sourceUrl: trimmed
                } 
              } 
            : m
        )
        updateModeState(chatMode, { messages: finalMessages })

        // Save session
        if (currentChatId) {
          await saveChatSession(currentChatId, finalMessages, chatMode)
          // Update history title
          const productName = extracted.name || new URL(trimmed).hostname
          const newTitle = productName.slice(0, 30) || 'New Product'
          updateModeState(chatMode, {
            chatHistory: chatHistory.map(c => c.id === currentChatId ? { ...c, title: newTitle, updatedAt: Date.now() } : c)
          })
        }
        
      } else {
        const errorMessages = newMessages.map(m => 
          m.id === productMessageId 
            ? { ...m, content: `**Error:** ${response.error || 'Failed to extract product data.'}` } 
            : m
        )
        updateModeState(chatMode, { messages: errorMessages })
      }
    } catch (error: any) {
      console.error('Product lookup error:', error)
      const errorMessages = newMessages.map(m => 
        m.id === productMessageId 
          ? { ...m, content: `**Error:** ${error?.message || 'An unexpected error occurred.'}` } 
          : m
      )
      updateModeState(chatMode, { messages: errorMessages })
    } finally {
      setIsSending(false)
    }
  }

  // Handle "Use This Data" button click
  function handleUseProductData(extracted: ExtractedProductData) {
    setExtractedData(extracted, {
      sourceUrl: '',
      extractedAt: new Date().toISOString(),
      fieldsExtracted: Object.keys(extracted).filter(k => extracted[k as keyof ExtractedProductData]).length,
      totalFields: 14,
      filledFields: Object.keys(extracted).filter(k => extracted[k as keyof ExtractedProductData])
    })
    navigate('/products/create')
    setIsOpen(false)
  }

  // Handle AI Chat Mode (Original)
  async function onSend() {
    // Route to scraper if in scraper mode
    if (chatMode === 'scraper') {
      return handleScraperSend()
    }
    
    // Route to product lookup if in product mode
    if (chatMode === 'product') {
      return handleProductLookupSend()
    }

    const trimmed = prompt.trim()
    if (!trimmed && pendingFiles.length === 0) return
    if (isSending) return

    // 0. Vision Model Check
    const isVisionModel = VISION_MODELS.some(v => selectedModel.toLowerCase().includes(v))
    if (pendingFiles.length > 0 && !isVisionModel) {
      alert(`Model currently selected (${selectedModel}) might not support images. Please switch to GPT-4o, Claude 3.5 Sonnet, or Gemini 1.5.`)
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
    updateModeState(chatMode, { messages: newMessages })
    setPrompt('')
    const filesToUpload = pendingFiles
    setPendingFiles([])

    // Save immediately (user msg)
    if (currentChatId) {
      saveChatSession(currentChatId, [...messages, userMessage], chatMode, selectedModel)
      // Update history title optimistically
      const firstUserMsg = messages.find(m => m.role === 'user') || userMessage
      const newTitle = firstUserMsg.content.slice(0, 30) || 'New Chat'
      updateModeState(chatMode, {
        chatHistory: chatHistory.map(c => c.id === currentChatId ? { ...c, title: newTitle, updatedAt: Date.now() } : c)
      })
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
        setModeStates(prev => ({
          ...prev,
          [chatMode]: {
            ...prev[chatMode],
            messages: prev[chatMode].messages.map(m => m.id === assistantId ? { ...m, content: buffer } : m)
          }
        }))
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
      updateModeState(chatMode, { messages: finalMessages })
      if (currentChatId) saveChatSession(currentChatId, finalMessages, chatMode, selectedModel)

      // Cleaning
      for (const p of puterPaths) try { await deletePath(p) } catch { }

    } catch (e: any) {
      console.error('Chat Error:', e)
      const errorMsg = `Error: ${e?.message || 'Unknown error'}`
      const errorMessages = newMessages.map(m => m.id === assistantId ? { ...m, content: errorMsg } : m)
      updateModeState(chatMode, { messages: errorMessages })
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
            <span className="font-semibold text-xs">
              {chatMode === 'ai' ? 'Chat History' : chatMode === 'product' ? 'Product History' : 'Scrape History'}
            </span>
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
                  onClick={() => handleSelectChat(chat.id)}
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
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-2 text-[10px] text-[hsl(var(--muted-foreground))]">
                  <User className="h-2.5 w-2.5" />
                  <span className="truncate flex-1">{user.username}</span>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="w-full text-[10px] h-6 text-red-500 hover:text-red-600 hover:bg-red-500/10" 
                  onClick={async () => {
                    try {
                      await signOut()
                      setIsUserSignedIn(false)
                      setUser(null)
                    } catch (e) {
                      console.error('Sign out failed', e)
                    }
                  }}
                >
                  <LogOut className="h-2.5 w-2.5 mr-1.5" />
                  Sign Out
                </Button>
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
              <span className="font-semibold text-[hsl(var(--primary))] tracking-tight text-xs">
                {chatMode === 'ai' ? 'AI Assistant' : chatMode === 'product' ? 'Product Lookup' : 'Web Scraper'}
              </span>
              <div className="flex items-center gap-1">
                <span className={classNames("h-1 w-1 rounded-full", status === 'ready' ? "bg-green-500" : "bg-gray-400")}></span>
                <span className="text-[9px] font-medium text-[hsl(var(--muted-foreground))]">
                  {chatMode === 'ai' ? (status === 'ready' ? 'Online' : 'Offline') : 'Firecrawl'}
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

        {/* Mode Toggle */}
        <div className="flex-none px-3 py-1.5 bg-[hsl(var(--background))] border-b border-[hsl(var(--border))]">
          <Tabs value={chatMode} onValueChange={(v) => setChatMode(v as ChatMode)} className="w-full">
            <TabsList className="w-full h-7 bg-[hsl(var(--muted))]">
              <TabsTrigger value="ai" className="flex-1 h-5 text-[10px] data-[state=active]:bg-[hsl(var(--card))]">
                <Bot className="h-3 w-3 mr-1" />
                AI
              </TabsTrigger>
              <TabsTrigger value="product" className="flex-1 h-5 text-[10px] data-[state=active]:bg-[hsl(var(--card))]">
                <Package className="h-3 w-3 mr-1" />
                Product
              </TabsTrigger>
              <TabsTrigger value="scraper" className="flex-1 h-5 text-[10px] data-[state=active]:bg-[hsl(var(--card))]">
                <Globe className="h-3 w-3 mr-1" />
                Scraper
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Chat Area - List View - With Scrollbar */}
        <ScrollArea className="flex-1 w-full bg-[hsl(var(--background))] [&>[data-radix-scroll-area-viewport]]:!overflow-y-auto [&>[data-radix-scroll-area-viewport]::-webkit-scrollbar]:!w-1.5 [&>[data-radix-scroll-area-viewport]::-webkit-scrollbar-thumb]:!bg-[hsl(var(--muted-foreground)/0.3)] hover:[&>[data-radix-scroll-area-viewport]::-webkit-scrollbar-thumb]:!bg-[hsl(var(--muted-foreground)/0.5)] [&>[data-radix-scroll-area-viewport]::-webkit-scrollbar-track]:!bg-transparent transition-colors">
          <div className="flex flex-col py-3 px-3 gap-4 min-h-full">

            {(messages.length === 0 || showWelcome) && !isLoadingHistory ? (
              <div className="flex flex-col items-center justify-center flex-1 h-[200px] text-center space-y-3 opacity-30 select-none">
                <div className="h-10 w-10 bg-[hsl(var(--muted))] rounded-xl flex items-center justify-center">
                  {chatMode === 'ai' ? (
                    <Terminal className="h-5 w-5 text-[hsl(var(--primary))]" />
                  ) : chatMode === 'product' ? (
                    <Package className="h-5 w-5 text-[hsl(var(--primary))]" />
                  ) : (
                    <Globe className="h-5 w-5 text-[hsl(var(--primary))]" />
                  )}
                </div>
                <div className="space-y-0.5">
                  <h3 className="text-sm font-medium text-[hsl(var(--foreground))]">
                    {chatMode === 'ai' ? 'AI Assistant' : chatMode === 'product' ? 'Product Lookup' : 'Web Scraper'}
                  </h3>
                  <p className="text-xs text-gray-500">
                    {chatMode === 'ai' 
                      ? (user ? `Logged in as ${user.username}` : `Temporary Session`)
                      : chatMode === 'product'
                        ? 'Paste product URL to extract data'
                        : 'Enter URL to scrape or text to search'
                    }
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
              const isScraper = m.role === 'scraper'
              const isProduct = m.role === 'product'
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
                        : isScraper
                          ? "bg-blue-500 border-transparent"
                          : isProduct
                            ? "bg-green-500 border-transparent"
                            : "bg-[hsl(var(--primary))] border-transparent"
                    )}>
                      {isUser ? (
                        <User className="h-3 w-3 text-[hsl(var(--muted-foreground))]" />
                      ) : isScraper ? (
                        <Globe className="h-3 w-3 text-white" />
                      ) : isProduct ? (
                        <Package className="h-3 w-3 text-white" />
                      ) : (
                        <Bot className="h-3 w-3 text-[hsl(var(--primary-foreground))]" />
                      )}
                    </div>
                  </div>

                  {/* Content - Nuclear Option for Overflow */}
                  <div className={classNames(
                    "flex-1 min-w-0 w-0 py-0.5 space-y-1 flex flex-col",
                    isUser ? "items-end text-right" : "items-start text-left"
                  )}>

                    <div className={classNames("flex items-center gap-1.5", isUser ? "flex-row-reverse" : "flex-row")}>
                      <span className="text-xs font-semibold text-[hsl(var(--foreground))]">
                        {isUser ? 'You' : isScraper ? 'Scraper' : isProduct ? 'Product' : 'AI'}
                      </span>
                      <span className="text-[9px] text-[hsl(var(--muted-foreground))]">
                        {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      {(isScraper || isProduct) && m.metadata?.sourceUrl && (
                        <a 
                          href={m.metadata.sourceUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-[9px] text-blue-500 hover:underline flex items-center gap-0.5"
                        >
                          <ExternalLink className="h-2 w-2" />
                          Source
                        </a>
                      )}
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
                      {(m.role === 'assistant' || m.role === 'scraper' || m.role === 'product') ? (
                        <div className="text-left text-xs">
                          <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeSanitize]}>
                            {m.content || (isSending ? 'Thinking...' : '')}
                          </ReactMarkdown>
                          
                          {/* Use This Data Button for Product Lookup */}
                          {isProduct && m.metadata?.extractedProduct && (
                            <div className="mt-2 flex gap-2">
                              <Button
                                size="sm"
                                variant="default"
                                className="h-6 text-[10px] bg-green-600 hover:bg-green-700"
                                onClick={() => handleUseProductData(m.metadata!.extractedProduct!)}
                              >
                                <Copy className="h-3 w-3 mr-1" />
                                Use in Add Product
                              </Button>
                            </div>
                          )}
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

            {chatMode === 'ai' && pendingFiles.length > 0 && (
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
              placeholder={chatMode === 'ai' ? "Ask anything..." : chatMode === 'product' ? "Paste product URL..." : "Enter URL or search query..."}
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
                {chatMode === 'ai' && (
                  <>
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
                  </>
                )}

                {(chatMode === 'scraper' || chatMode === 'product') && (
                  <div className="flex items-center gap-1 text-[10px] text-[hsl(var(--muted-foreground))] px-1">
                    {chatMode === 'product' ? <Package className="h-3 w-3" /> : <Globe className="h-3 w-3" />}
                    <span>Firecrawl</span>
                  </div>
                )}
              </div>

              <Button size="icon" onClick={onSend} disabled={!prompt.trim() || isSending} className={classNames("h-6 w-6 rounded transition-all flex items-center justify-center ml-auto bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] hover:bg-[hsl(var(--primary)/0.9)] shadow-sm")}>
                {isSending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Send className="h-3 w-3" />}
              </Button>
            </div>
          </div>

          <div className="text-center mt-1">
            <span className="text-[8px] text-[hsl(var(--muted-foreground))] font-medium">
              {chatMode === 'ai' ? 'Powered by Puter.js' : 'Powered by Firecrawl'}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
