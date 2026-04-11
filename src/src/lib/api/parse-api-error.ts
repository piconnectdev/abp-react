export async function parseApiError(res: Response): Promise<Error> {
  let body = ''
  try { body = await res.text() } catch { body = res.statusText }
  try {
    const json = JSON.parse(body)
    const msg = json?.error?.message || json?.message || json?.title
    if (msg) return Object.assign(new Error(String(msg)), { status: res.status, rawBody: body })
  } catch { /* not JSON */ }
  return Object.assign(new Error(`${res.status} ${res.statusText}`), { status: res.status, rawBody: body })
}
