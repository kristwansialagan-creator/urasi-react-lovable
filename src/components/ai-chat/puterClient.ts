/* eslint-disable @typescript-eslint/no-explicit-any */
interface PuterWindow extends Window {
  puter?: {
    ai: {
      listModels: () => Promise<unknown[]>;
      chat: (messages: any[], options: { model?: string; stream?: boolean }) => Promise<AsyncIterable<{ text?: string }>>;
    };
    fs: {
      upload: (files: File[]) => Promise<UploadedFile | UploadedFile[]>;
      delete: (path: string) => Promise<void>;
    };
    auth: {
      signIn: () => Promise<void>;
      signOut: () => Promise<void>;
      getUser: () => Promise<PuterUser>;
      isSignedIn: () => boolean;
    };
    kv: {
      set: (key: string, value: unknown) => Promise<void>;
      get: (key: string) => Promise<unknown>;
      del: (key: string) => Promise<void>;
      list: () => Promise<string[]>;
    };
  };
}

interface UploadedFile {
  path: string;
  name: string;
}

interface PuterUser {
  username: string;
  email?: string;
}

const PUTER_SCRIPT_SRC = 'https://js.puter.com/v2/';

function getWindow(): PuterWindow | undefined {
  if (typeof window === 'undefined') return undefined;
  return window as PuterWindow;
}

export async function ensurePuterLoaded({ timeoutMs = 15000 } = {}): Promise<NonNullable<PuterWindow['puter']>> {
  const w = getWindow();
  if (!w) throw new Error('Puter.js hanya tersedia di browser');

  if (w.puter) return w.puter;

  const existing = w.document.querySelector(`script[src="${PUTER_SCRIPT_SRC}"]`) as HTMLScriptElement | null;
  if (existing && w.puter) return w.puter;

  await new Promise<void>((resolve, reject) => {
    const script = existing ?? w.document.createElement('script');
    script.src = PUTER_SCRIPT_SRC;
    script.async = true;

    const onLoad = () => resolve();
    const onError = () => reject(new Error('Gagal memuat Puter.js'));

    script.addEventListener('load', onLoad, { once: true });
    script.addEventListener('error', onError, { once: true });

    if (!existing) w.document.head.appendChild(script);

    if (timeoutMs > 0) {
      w.setTimeout(() => reject(new Error('Timeout memuat Puter.js')), timeoutMs);
    }
  });

  if (!w.puter) throw new Error('Puter.js tidak terinisialisasi');
  return w.puter;
}

export async function listModels(): Promise<unknown[]> {
  const puter = await ensurePuterLoaded();
  return await puter.ai.listModels();
}

export async function chatStream(messages: any[], { model }: { model?: string } = {}): Promise<AsyncIterable<{ text?: string }>> {
  const puter = await ensurePuterLoaded();
  return await puter.ai.chat(messages, { model, stream: true });
}

export async function uploadFiles(fileList: File[]): Promise<UploadedFile[]> {
  const puter = await ensurePuterLoaded();
  const uploaded = await puter.fs.upload(fileList);
  return Array.isArray(uploaded) ? uploaded : [uploaded];
}

export async function deletePath(path: string): Promise<void> {
  const puter = await ensurePuterLoaded();
  await puter.fs.delete(path);
}

// --- Auth ---
export async function signIn(): Promise<void> {
  const puter = await ensurePuterLoaded();
  return await puter.auth.signIn();
}

export async function signOut(): Promise<void> {
  const puter = await ensurePuterLoaded();
  return await puter.auth.signOut();
}

export async function getUser(): Promise<PuterUser> {
  const puter = await ensurePuterLoaded();
  return await puter.auth.getUser();
}

export async function isSignedIn(): Promise<boolean> {
  const puter = await ensurePuterLoaded();
  return puter.auth.isSignedIn();
}


// --- KV Store ---
export async function kvSet(key: string, value: unknown): Promise<void> {
  const puter = await ensurePuterLoaded();
  return await puter.kv.set(key, value);
}

export async function kvGet(key: string): Promise<unknown> {
  const puter = await ensurePuterLoaded();
  return await puter.kv.get(key);
}

export async function kvDel(key: string): Promise<void> {
  const puter = await ensurePuterLoaded();
  return await puter.kv.del(key);
}

export async function kvList(): Promise<string[]> {
  const puter = await ensurePuterLoaded();
  return await puter.kv.list();
}
