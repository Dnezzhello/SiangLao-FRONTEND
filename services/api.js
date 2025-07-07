// Simple API service for transcription
const getApiBase = () => {
  // Use environment variable if set
  if (process.env.NUXT_PUBLIC_API_BASE_URL) {
    return process.env.NUXT_PUBLIC_API_BASE_URL
  }
  
  // In browser, use current host with backend port
  if (typeof window !== 'undefined') {
    const protocol = window.location.protocol
    const hostname = window.location.hostname
    
    // For HTTPS frontend, try HTTPS backend first, fallback to HTTP for development
    if (protocol === 'https:') {
      // In production, backend should also be HTTPS
      // In development, we'll use HTTP backend (mixed content allowed in dev tools)
      const isDev = hostname === 'localhost' || hostname.startsWith('192.168.') || hostname.startsWith('10.') || hostname.startsWith('172.')
      if (isDev) {
        return `http://${hostname}:5005`
      } else {
        return `https://${hostname}:5005`
      }
    }
    
    return `${protocol}//${hostname}:5005`
  }
  
  // Fallback for SSR
  return 'http://localhost:5005'
}

const API_BASE = getApiBase()

export const transcriptionApi = {
  async uploadFile(file) {
    const formData = new FormData()
    formData.append('audio', file)
    
    const response = await $fetch(`${API_BASE}/api/upload`, {
      method: 'POST',
      body: formData
    })
    
    return response
  },

  async startTranscription(requestId) {
    return await $fetch(`${API_BASE}/api/transcribe/${requestId}`, {
      method: 'POST'
    })
  },

  async checkStatus(requestId) {
    return await $fetch(`${API_BASE}/api/status/${requestId}`)
  },

  async getResult(requestId) {
    return await $fetch(`${API_BASE}/api/result/${requestId}`)
  }
}