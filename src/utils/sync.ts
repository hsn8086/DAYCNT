import axios from 'axios'
import type { CountdownEvent, SyncConfig } from '../stores/types'

export async function uploadToWebDav(config: SyncConfig['webdav'], data: CountdownEvent[]) {
    if (!config) return
    const { url, username, password } = config
    const filename = 'events.json'
    const targetUrl = url.endsWith('/') ? `${url}${filename}` : `${url}/${filename}`

    const auth = password ? { username, password } : undefined

    await axios.put(targetUrl, JSON.stringify(data, null, 2), {
        auth,
        headers: { 'Content-Type': 'application/json' }
    })
}

export async function downloadFromWebDav(config: SyncConfig['webdav']): Promise<CountdownEvent[]> {
    if (!config) return []
    const { url, username, password } = config
    const filename = 'events.json'
    const targetUrl = url.endsWith('/') ? `${url}${filename}` : `${url}/${filename}`

    const auth = password ? { username, password } : undefined

    const response = await axios.get(targetUrl, { auth })
    return response.data
}

export async function uploadToGist(config: SyncConfig['gist'], data: CountdownEvent[]) {
    if (!config) return
    const { token, gistId } = config

    await axios.patch(`https://api.github.com/gists/${gistId}`, {
        files: {
            'events.json': {
                content: JSON.stringify(data, null, 2)
            }
        }
    }, {
        headers: {
            Authorization: `token ${token}`
        }
    })
}

export async function downloadFromGist(config: SyncConfig['gist']): Promise<CountdownEvent[]> {
    if (!config) return []
    const { token, gistId } = config

    const response = await axios.get(`https://api.github.com/gists/${gistId}`, {
        headers: token ? { Authorization: `token ${token}` } : {}
    })

    const content = response.data.files['events.json'].content
    return JSON.parse(content)
}

export async function downloadFromUrl(url: string): Promise<CountdownEvent[]> {
    const response = await axios.get(url)
    return response.data
}
