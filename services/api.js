// Simple API service for transcription
function getApiBase() {
  if (import.meta.server) {
    return process.env.NUXT_PUBLIC_BACKEND_URL || 'http://localhost:5005'
  }
  const config = useRuntimeConfig()
  return config.public.backendUrl
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