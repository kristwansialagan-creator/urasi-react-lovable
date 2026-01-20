import { kvGet, kvSet, kvDel, signIn, getUser, isSignedIn } from './puterClient'

export type ChatMode = 'ai' | 'scraper' | 'product'

// Mode-specific storage keys
const CHAT_INDEX_KEYS: Record<ChatMode, string> = {
  ai: 'urasi_chat_index_ai_v1',
  scraper: 'urasi_chat_index_scraper_v1',
  product: 'urasi_chat_index_product_v1'
}

const CHAT_PREFIXES: Record<ChatMode, string> = {
  ai: 'urasi_chat_ai_',
  scraper: 'urasi_chat_scraper_',
  product: 'urasi_chat_product_'
}

const LOCAL_PREFIX = 'urasi_local_'

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'scraper' | 'product';
  content: string;
  createdAt: number;
  attachments?: Array<{ name: string; size: number; type: string }>;
  metadata?: {
    url?: string;
    title?: string;
    sourceUrl?: string;
    extractedProduct?: Record<string, any>;
    fieldsExtracted?: number;
    totalFields?: number;
  };
}

interface ChatSession {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  messages: ChatMessage[];
  model: string;
  mode: ChatMode;
}

interface ChatIndexItem {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
}

// Generate a random ID
function uid(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

// ============ LocalStorage Fallback Functions ============
function localGet(key: string): any {
  try {
    const item = localStorage.getItem(LOCAL_PREFIX + key)
    return item ? JSON.parse(item) : null
  } catch {
    return null
  }
}

function localSet(key: string, value: any): void {
  try {
    localStorage.setItem(LOCAL_PREFIX + key, JSON.stringify(value))
  } catch (e) {
    console.warn('localStorage save failed', e)
  }
}

function localDel(key: string): void {
  try {
    localStorage.removeItem(LOCAL_PREFIX + key)
  } catch {
    // ignore
  }
}

// Check if user is signed in (with error handling)
async function checkSignedIn(): Promise<boolean> {
  try {
    return await isSignedIn()
  } catch {
    return false
  }
}

/**
 * Loads the list of all chat sessions for a specific mode (metadata only).
 * Uses localStorage for guests, Puter KV for signed-in users.
 */
export async function getChatIndex(mode: ChatMode): Promise<ChatIndexItem[]> {
  const signedIn = await checkSignedIn()
  const indexKey = CHAT_INDEX_KEYS[mode]
  
  if (signedIn) {
    try {
      const index = await kvGet(indexKey)
      return Array.isArray(index) ? index as ChatIndexItem[] : []
    } catch {
      // Fallback to local if cloud fails
      return localGet(indexKey) || []
    }
  }
  
  return localGet(indexKey) || []
}

/**
 * Loads a specific chat session by ID for a specific mode.
 */
export async function getChatSession(chatId: string, mode: ChatMode): Promise<ChatSession | null> {
  if (!chatId) return null
  
  const signedIn = await checkSignedIn()
  const prefix = CHAT_PREFIXES[mode]
  
  if (signedIn) {
    try {
      const data = await kvGet(prefix + chatId)
      return (data as ChatSession) || null
    } catch {
      return localGet(prefix + chatId)
    }
  }
  
  return localGet(prefix + chatId)
}

/**
 * Creates a new chat session for a specific mode and adds it to the index.
 */
export async function createNewChat(mode: ChatMode): Promise<ChatSession> {
  const chatId = uid()
  const now = Date.now()

  const modeLabels: Record<ChatMode, string> = {
    ai: 'New Chat',
    scraper: 'New Scrape',
    product: 'New Product'
  }

  const newChat: ChatSession = {
    id: chatId,
    title: modeLabels[mode],
    createdAt: now,
    updatedAt: now,
    messages: [],
    model: 'openai/gpt-4o-mini',
    mode
  }

  const signedIn = await checkSignedIn()
  const index = await getChatIndex(mode)
  const indexKey = CHAT_INDEX_KEYS[mode]
  const prefix = CHAT_PREFIXES[mode]
  
  const indexEntry: ChatIndexItem = {
    id: chatId,
    title: modeLabels[mode],
    createdAt: now,
    updatedAt: now
  }
  const newIndex = [indexEntry, ...index]

  if (signedIn) {
    try {
      await kvSet(prefix + chatId, newChat)
      await kvSet(indexKey, newIndex)
    } catch {
      // Fallback to local
      localSet(prefix + chatId, newChat)
      localSet(indexKey, newIndex)
    }
  } else {
    localSet(prefix + chatId, newChat)
    localSet(indexKey, newIndex)
  }

  return newChat
}

/**
 * Saves messages to a specific chat session for a specific mode.
 */
export async function saveChatSession(
  chatId: string, 
  messages: ChatMessage[], 
  mode: ChatMode,
  model?: string, 
  title?: string
): Promise<void> {
  if (!chatId) return

  const now = Date.now()
  const existing = (await getChatSession(chatId, mode)) || {} as Partial<ChatSession>

  const modeLabels: Record<ChatMode, string> = {
    ai: 'New Chat',
    scraper: 'New Scrape',
    product: 'New Product'
  }

  const updatedChat: ChatSession = {
    id: chatId,
    title: existing.title || modeLabels[mode],
    createdAt: existing.createdAt || now,
    updatedAt: now,
    messages,
    model: model || existing.model || 'openai/gpt-4o-mini',
    mode
  }

  // Update title if provided, or if it's the first user message
  if (title) {
    updatedChat.title = title
  } else if (existing.title === modeLabels[mode] && messages.length > 0) {
    const firstUserMsg = messages.find((m: ChatMessage) => m.role === 'user')
    if (firstUserMsg) {
      updatedChat.title = firstUserMsg.content.slice(0, 30) + (firstUserMsg.content.length > 30 ? '...' : '')
    }
  }

  const signedIn = await checkSignedIn()
  const indexKey = CHAT_INDEX_KEYS[mode]
  const prefix = CHAT_PREFIXES[mode]
  
  // Save chat
  if (signedIn) {
    try {
      await kvSet(prefix + chatId, updatedChat)
    } catch {
      localSet(prefix + chatId, updatedChat)
    }
  } else {
    localSet(prefix + chatId, updatedChat)
  }

  // Update index metadata
  const index = await getChatIndex(mode)
  let newIndex = index.map(item => {
    if (item.id === chatId) {
      return { ...item, title: updatedChat.title, updatedAt: now }
    }
    return item
  })

  // If not in index, add it
  if (!newIndex.find(i => i.id === chatId)) {
    newIndex.unshift({
      id: chatId,
      title: updatedChat.title,
      createdAt: existing.createdAt || now,
      updatedAt: now
    })
  } else {
    // Move to top
    const idx = newIndex.findIndex(i => i.id === chatId)
    if (idx > 0) {
      const [item] = newIndex.splice(idx, 1)
      newIndex.unshift(item)
    }
  }

  if (signedIn) {
    try {
      await kvSet(indexKey, newIndex)
    } catch {
      localSet(indexKey, newIndex)
    }
  } else {
    localSet(indexKey, newIndex)
  }
}

/**
 * Deletes a chat session for a specific mode.
 */
export async function deleteChatSession(chatId: string, mode: ChatMode): Promise<void> {
  if (!chatId) return

  const signedIn = await checkSignedIn()
  const indexKey = CHAT_INDEX_KEYS[mode]
  const prefix = CHAT_PREFIXES[mode]
  
  if (signedIn) {
    try {
      await kvDel(prefix + chatId)
    } catch {
      localDel(prefix + chatId)
    }
  } else {
    localDel(prefix + chatId)
  }

  const index = await getChatIndex(mode)
  const newIndex = index.filter(i => i.id !== chatId)
  
  if (signedIn) {
    try {
      await kvSet(indexKey, newIndex)
    } catch {
      localSet(indexKey, newIndex)
    }
  } else {
    localSet(indexKey, newIndex)
  }
}

/**
 * Auth wrappers
 */
export { signIn, getUser, isSignedIn }
