import { kvGet, kvSet, kvDel, signIn, getUser, isSignedIn } from './puterClient'

const CHAT_INDEX_KEY = 'urasi_chat_index_v1'
const CHAT_PREFIX = 'urasi_chat_'
const LOCAL_PREFIX = 'urasi_local_'

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: number;
  attachments?: Array<{ name: string; size: number; type: string }>;
}

interface ChatSession {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  messages: ChatMessage[];
  model: string;
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
 * Loads the list of all chat sessions (metadata only).
 * Uses localStorage for guests, Puter KV for signed-in users.
 */
export async function getChatIndex(): Promise<ChatIndexItem[]> {
  const signedIn = await checkSignedIn()
  
  if (signedIn) {
    try {
      const index = await kvGet(CHAT_INDEX_KEY)
      return Array.isArray(index) ? index as ChatIndexItem[] : []
    } catch {
      // Fallback to local if cloud fails
      return localGet(CHAT_INDEX_KEY) || []
    }
  }
  
  return localGet(CHAT_INDEX_KEY) || []
}

/**
 * Loads a specific chat session by ID.
 */
export async function getChatSession(chatId: string): Promise<ChatSession | null> {
  if (!chatId) return null
  
  const signedIn = await checkSignedIn()
  
  if (signedIn) {
    try {
      const data = await kvGet(CHAT_PREFIX + chatId)
      return (data as ChatSession) || null
    } catch {
      return localGet(CHAT_PREFIX + chatId)
    }
  }
  
  return localGet(CHAT_PREFIX + chatId)
}

/**
 * Creates a new chat session and adds it to the index.
 */
export async function createNewChat(): Promise<ChatSession> {
  const chatId = uid()
  const now = Date.now()

  const newChat: ChatSession = {
    id: chatId,
    title: 'New Chat',
    createdAt: now,
    updatedAt: now,
    messages: [],
    model: 'openai/gpt-4o-mini'
  }

  const signedIn = await checkSignedIn()
  const index = await getChatIndex()
  
  const indexEntry: ChatIndexItem = {
    id: chatId,
    title: 'New Chat',
    createdAt: now,
    updatedAt: now
  }
  const newIndex = [indexEntry, ...index]

  if (signedIn) {
    try {
      await kvSet(CHAT_PREFIX + chatId, newChat)
      await kvSet(CHAT_INDEX_KEY, newIndex)
    } catch {
      // Fallback to local
      localSet(CHAT_PREFIX + chatId, newChat)
      localSet(CHAT_INDEX_KEY, newIndex)
    }
  } else {
    localSet(CHAT_PREFIX + chatId, newChat)
    localSet(CHAT_INDEX_KEY, newIndex)
  }

  return newChat
}

/**
 * Saves messages to a specific chat session.
 */
export async function saveChatSession(
  chatId: string, 
  messages: ChatMessage[], 
  model?: string, 
  title?: string
): Promise<void> {
  if (!chatId) return

  const now = Date.now()
  const existing = (await getChatSession(chatId)) || {} as Partial<ChatSession>

  const updatedChat: ChatSession = {
    id: chatId,
    title: existing.title || 'New Chat',
    createdAt: existing.createdAt || now,
    updatedAt: now,
    messages,
    model: model || existing.model || 'openai/gpt-4o-mini'
  }

  // Update title if provided, or if it's the first user message
  if (title) {
    updatedChat.title = title
  } else if (existing.title === 'New Chat' && messages.length > 0) {
    const firstUserMsg = messages.find((m: ChatMessage) => m.role === 'user')
    if (firstUserMsg) {
      updatedChat.title = firstUserMsg.content.slice(0, 30) + (firstUserMsg.content.length > 30 ? '...' : '')
    }
  }

  const signedIn = await checkSignedIn()
  
  // Save chat
  if (signedIn) {
    try {
      await kvSet(CHAT_PREFIX + chatId, updatedChat)
    } catch {
      localSet(CHAT_PREFIX + chatId, updatedChat)
    }
  } else {
    localSet(CHAT_PREFIX + chatId, updatedChat)
  }

  // Update index metadata
  const index = await getChatIndex()
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
      await kvSet(CHAT_INDEX_KEY, newIndex)
    } catch {
      localSet(CHAT_INDEX_KEY, newIndex)
    }
  } else {
    localSet(CHAT_INDEX_KEY, newIndex)
  }
}

/**
 * Deletes a chat session.
 */
export async function deleteChatSession(chatId: string): Promise<void> {
  if (!chatId) return

  const signedIn = await checkSignedIn()
  
  if (signedIn) {
    try {
      await kvDel(CHAT_PREFIX + chatId)
    } catch {
      localDel(CHAT_PREFIX + chatId)
    }
  } else {
    localDel(CHAT_PREFIX + chatId)
  }

  const index = await getChatIndex()
  const newIndex = index.filter(i => i.id !== chatId)
  
  if (signedIn) {
    try {
      await kvSet(CHAT_INDEX_KEY, newIndex)
    } catch {
      localSet(CHAT_INDEX_KEY, newIndex)
    }
  } else {
    localSet(CHAT_INDEX_KEY, newIndex)
  }
}

/**
 * Auth wrappers
 */
export { signIn, getUser, isSignedIn }
