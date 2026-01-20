const PUTER_SCRIPT_SRC = 'https://js.puter.com/v2/';

function getWindow() {
  if (typeof window === 'undefined') return undefined;
  return window;
}

export async function ensurePuterLoaded({ timeoutMs = 15000 } = {}) {
  const w = getWindow();
  if (!w) throw new Error('Puter.js hanya tersedia di browser');

  if (w.puter) return w.puter;

  const existing = w.document.querySelector(`script[src="${PUTER_SCRIPT_SRC}"]`);
  if (existing && w.puter) return w.puter;

  await new Promise((resolve, reject) => {
    const script = existing ?? w.document.createElement('script');
    script.src = PUTER_SCRIPT_SRC;
    script.async = true;

    const onLoad = () => resolve(undefined);
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

export async function listModels() {
  const puter = await ensurePuterLoaded();
  return await puter.ai.listModels();
}

export async function chatStream(messages, { model } = {}) {
  const puter = await ensurePuterLoaded();
  return await puter.ai.chat(messages, { model, stream: true });
}

export async function uploadFiles(fileList) {
  const puter = await ensurePuterLoaded();
  const uploaded = await puter.fs.upload(fileList);
  return Array.isArray(uploaded) ? uploaded : [uploaded];
}

export async function deletePath(path) {
  const puter = await ensurePuterLoaded();
  await puter.fs.delete(path);
}

// --- Auth ---
export async function signIn() {
  const puter = await ensurePuterLoaded();
  return await puter.auth.signIn();
}

export async function signOut() {
  const puter = await ensurePuterLoaded();
  return await puter.auth.signOut();
}

export async function getUser() {
  const puter = await ensurePuterLoaded();
  return await puter.auth.getUser();
}

export async function isSignedIn() {
  const puter = await ensurePuterLoaded();
  return puter.auth.isSignedIn();
}


// --- KV Store ---
export async function kvSet(key, value) {
  const puter = await ensurePuterLoaded();
  return await puter.kv.set(key, value);
}

export async function kvGet(key) {
  const puter = await ensurePuterLoaded();
  return await puter.kv.get(key);
}

export async function kvDel(key) {
  const puter = await ensurePuterLoaded();
  return await puter.kv.del(key);
}

export async function kvList() {
  const puter = await ensurePuterLoaded();
  return await puter.kv.list();
}

