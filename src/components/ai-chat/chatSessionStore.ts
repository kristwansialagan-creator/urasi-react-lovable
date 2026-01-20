import { kvGet, kvSet, kvDel, signIn, getUser, isSignedIn } from './puterClient'

const CHAT_INDEX_KEY = 'urasi_chat_index_v1'
const CHAT_PREFIX = 'urasi_chat_'

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

/**
 * Loads the list of all chat sessions (metadata only).
 */
export async function getChatIndex(): Promise<ChatIndexItem[]> {
  const index = await kvGet(CHAT_INDEX_KEY)
  return Array.isArray(index) ? index as ChatIndexItem[] : []
}

/**
 * Loads a specific chat session by ID.
 */
export async function getChatSession(chatId: string): Promise<ChatSession | null> {
  if (!chatId) return null
  const data = await kvGet(CHAT_PREFIX + chatId)
  return (data as ChatSession) || null
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
    messages: [], // Empty start
    model: 'openai/gpt-4o-mini' // Default
  }

  // Save specific chat
  await kvSet(CHAT_PREFIX + chatId, newChat)

  // Update index
  const index = await getChatIndex()
  const inputEntry: ChatIndexItem = {
    id: chatId,
    title: 'New Chat',
    createdAt: now,
    updatedAt: now
  }

  // Prepend to index (newest first)
  await kvSet(CHAT_INDEX_KEY, [inputEntry, ...index])

  return newChat
}

/**
 * Saves messages to a specific chat session.
 * Also updates the 'updatedAt' field in the index.
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

  await kvSet(CHAT_PREFIX + chatId, updatedChat)

  // Update index metadata
  const index = await getChatIndex()
  const newIndex = index.map(item => {
    if (item.id === chatId) {
      return { ...item, title: updatedChat.title, updatedAt: now }
    }
    return item
  })

  // If not in index for some reason, add it
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

  await kvSet(CHAT_INDEX_KEY, newIndex)
}

/**
 * Deletes a chat session.
 */
export async function deleteChatSession(chatId: string): Promise<void> {
  if (!chatId) return

  await kvDel(CHAT_PREFIX + chatId)

  const index = await getChatIndex()
  const newIndex = index.filter(i => i.id !== chatId)
  await kvSet(CHAT_INDEX_KEY, newIndex)
}

/**
 * Auth wrappers
 */
export { signIn, getUser, isSignedIn }
