<template>
  <div class="container mx-auto px-4 py-8">
    <div class="max-w-4xl mx-auto">
      <h1 class="text-3xl font-bold text-gray-800 mb-8 text-center">
        Prediction Test Results
      </h1>
      
      <!-- Audio Input Section -->
      <div class="bg-white rounded-lg shadow-lg p-4 sm:p-6 mb-6 sm:mb-8">
        <h2 class="text-lg sm:text-xl font-semibold text-gray-700 mb-4">Audio Input</h2>
        
        <!-- Recording Section -->
        <div class="mb-6">
          <h3 class="text-md font-medium text-gray-600 mb-3">Record Audio</h3>
          <div class="flex flex-col sm:flex-row items-center gap-4">
            <button
              v-if="!isRecording && !hasRecording"
              @click="startRecording"
              :disabled="isLoading"
              class="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clip-rule="evenodd" />
              </svg>
              Start Recording
            </button>
            
            <button
              v-if="isRecording"
              @click="stopRecording"
              class="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-gray-600 text-white rounded-md hover:bg-gray-700"
            >
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 012 0v6a1 1 0 11-2 0V7zM12 7a1 1 0 012 0v6a1 1 0 11-2 0V7z" clip-rule="evenodd" />
              </svg>
              Stop Recording ({{ formatTime(recordingTime) }})
            </button>
            
            <div v-if="hasRecording" class="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <button
                @click="uploadAndPredict"
                :disabled="isLoading"
                class="flex-1 sm:flex-none px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {{ isLoading ? 'Processing...' : 'Test Recording' }}
              </button>
              <button
                @click="clearRecording"
                :disabled="isLoading"
                class="flex-1 sm:flex-none px-6 py-3 bg-gray-500 text-white rounded-md hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Clear
              </button>
            </div>
          </div>
        </div>
        
        <!-- File Upload Section -->
        <div class="border-t pt-6">
          <h3 class="text-md font-medium text-gray-600 mb-3">Upload Audio File</h3>
          <div class="flex flex-col sm:flex-row items-center gap-4">
            <input
              ref="fileInput"
              type="file"
              accept=".wav,.mp3,.m4a"
              @change="handleFileUpload"
              class="w-full sm:flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              @click="uploadAndPredict"
              :disabled="!selectedFile || isLoading"
              class="w-full sm:w-auto px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ isLoading ? 'Processing...' : 'Test Upload' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="isLoading" class="text-center py-8">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p class="mt-2 text-gray-600">Processing audio...</p>
      </div>

      <!-- Error State -->
      <div v-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
        <h3 class="text-red-800 font-semibold">Error:</h3>
        <p class="text-red-700">{{ error }}</p>
      </div>

      <!-- Results Section -->
      <div v-if="results" class="space-y-6">
        <!-- Summary Stats -->
        <div class="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 sm:p-6">
          <h2 class="text-xl sm:text-2xl font-semibold text-gray-800 mb-4">Summary</h2>
          <div class="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div class="text-center">
              <div class="text-lg sm:text-2xl font-bold text-blue-600">{{ results.summary.confidence.toFixed(3)*100 }}%</div>
              <div class="text-xs sm:text-sm text-gray-600">Overall Confidence</div>
            </div>
            <div class="text-center">
              <div class="text-lg sm:text-2xl font-bold text-green-600">{{ results.summary.processing_time.toFixed(1) }}s</div>
              <div class="text-xs sm:text-sm text-gray-600">Processing Time</div>
            </div>
            <div class="text-center">
              <div class="text-lg sm:text-2xl font-bold text-purple-600">{{ results.summary.models_used.length }}</div>
              <div class="text-xs sm:text-sm text-gray-600">Models Used</div>
            </div>
            <div class="text-center">
              <div class="text-lg sm:text-2xl font-bold text-indigo-600">{{ results.summary.method }}</div>
              <div class="text-xs sm:text-sm text-gray-600">Method</div>
            </div>
          </div>
        </div>

        <!-- Final Result -->
        <div class="bg-white rounded-lg shadow-lg p-4 sm:p-6">
          <h2 class="text-xl sm:text-2xl font-semibold text-gray-800 mb-4">Final Transcription Result</h2>
          <div class="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 sm:p-6">
            <div class="text-base sm:text-lg text-gray-800 leading-relaxed font-mono break-words">
              {{ results.transcription.laoText }}
            </div>
            <div class="mt-4 pt-4 border-t flex flex-col sm:flex-row gap-2 sm:gap-4 sm:justify-between text-xs sm:text-sm text-gray-600">
              <span>Confidence: {{ (results.transcription.overallConfidence * 100).toFixed(1) }}%</span>
              <span class="break-all">ID: {{ results.transcription.transcriptionID }}</span>
              <span>Method: {{ results.transcription.ensembleMethod }}</span>
            </div>
          </div>
        </div>

        <!-- Individual Model Results -->
        <div class="space-y-4">
          <h2 class="text-xl sm:text-2xl font-semibold text-gray-800">Individual Model Predictions</h2>
          
          <div v-for="(modelResult, modelName) in results.transcription.individualResults" :key="modelName" class="bg-white rounded-lg shadow-lg overflow-hidden">
            <div class="bg-gradient-to-r from-gray-50 to-gray-100 px-4 sm:px-6 py-4 border-b">
              <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                <h3 class="text-lg sm:text-xl font-semibold text-gray-800 uppercase">{{ modelName }}</h3>
                <div class="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                  <span class="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs sm:text-sm font-medium w-fit">
                    {{ (modelResult.confidence * 100).toFixed(1) }}% confidence
                  </span>
                  <span class="text-xs sm:text-sm text-gray-600">
                    {{ modelResult.processing_time.toFixed(2) }}s
                  </span>
                  <span class="text-xs text-gray-500">
                    Weight: {{ results.transcription.modelWeights[modelName] || 'N/A' }}
                  </span>
                </div>
              </div>
            </div>
            
            <div class="p-4 sm:p-6 space-y-4">
              <!-- Cleaned Prediction -->
              <div>
                <h4 class="text-sm font-semibold text-gray-600 mb-2">Cleaned Prediction:</h4>
                <div class="bg-gray-50 rounded-lg p-3 sm:p-4">
                  <p class="text-sm sm:text-lg text-gray-800 leading-relaxed font-mono break-words">
                    {{ modelResult.cleaned_prediction }}
                  </p>
                </div>
              </div>
              
              <!-- Raw Prediction -->
              <div>
                <h4 class="text-sm font-semibold text-gray-600 mb-2">Raw Prediction:</h4>
                <div class="bg-yellow-50 rounded-lg p-3 sm:p-4">
                  <p class="text-xs sm:text-sm text-gray-700 leading-relaxed font-mono break-words">
                    {{ modelResult.raw_prediction }}
                  </p>
                </div>
              </div>
              
              <!-- Model Stats -->
              <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600 pt-2 border-t">
                <span class="break-all">Inference ID: {{ modelResult.inference_id }}</span>
                <span>Status: {{ modelResult.success ? 'Success' : 'Failed' }}</span>
                <span>Memory: {{ modelResult.memory_mode }}</span>
                <span>Model: {{ modelResult.model }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Metadata & Debug Info -->
        <div class="bg-white rounded-lg shadow-lg p-4 sm:p-6">
          <h2 class="text-xl sm:text-2xl font-semibold text-gray-800 mb-4">Metadata & Debug Info</h2>
          <div class="space-y-4">
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div>
                <h4 class="text-sm font-semibold text-gray-600 mb-2">Timestamps:</h4>
                <div class="bg-gray-50 rounded-lg p-3 sm:p-4 text-xs sm:text-sm">
                  <p class="break-all">Request: {{ results.timestamp }}</p>
                  <p class="break-all">Created: {{ results.transcription.createdTime }}</p>
                </div>
              </div>
              <div>
                <h4 class="text-sm font-semibold text-gray-600 mb-2">Service Info:</h4>
                <div class="bg-gray-50 rounded-lg p-3 sm:p-4 text-xs sm:text-sm">
                  <p>Service: {{ results.service }}</p>
                  <p>Success: {{ results.success ? 'Yes' : 'No' }}</p>
                </div>
              </div>
            </div>
            
            <!-- Model Weights -->
            <div>
              <h4 class="text-sm font-semibold text-gray-600 mb-2">Model Weights:</h4>
              <div class="bg-gray-50 rounded-lg p-3 sm:p-4">
                <div class="flex flex-wrap gap-2 sm:gap-4 text-xs sm:text-sm">
                  <span v-for="(weight, model) in results.transcription.modelWeights" :key="model" class="px-2 py-1 bg-blue-100 text-blue-800 rounded">
                    {{ model }}: {{ weight }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

// State
const selectedFile = ref(null)
const isLoading = ref(false)
const results = ref(null)
const error = ref(null)
const fileInput = ref(null)

// Recording state
const isRecording = ref(false)
const hasRecording = ref(false)
const recordingTime = ref(0)
const mediaRecorder = ref(null)
const audioBlob = ref(null)
const recordingTimer = ref(null)

// Methods
const handleFileUpload = (event) => {
  const file = event.target.files[0]
  if (file) {
    selectedFile.value = file
    error.value = null
    // Clear recording if file is selected
    clearRecording()
  }
}

const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

const startRecording = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    
    // Clear file selection if recording starts
    selectedFile.value = null
    if (fileInput.value) {
      fileInput.value.value = ''
    }
    
    isRecording.value = true
    hasRecording.value = false
    recordingTime.value = 0
    error.value = null
    
    // Create MediaRecorder
    const options = { mimeType: 'audio/webm;codecs=opus' }
    mediaRecorder.value = new MediaRecorder(stream, options)
    
    const audioChunks = []
    
    mediaRecorder.value.ondataavailable = (event) => {
      if (event.data.size > 0) {
        audioChunks.push(event.data)
      }
    }
    
    mediaRecorder.value.onstop = () => {
      const blob = new Blob(audioChunks, { type: 'audio/webm' })
      audioBlob.value = blob
      hasRecording.value = true
      
      // Stop the stream
      stream.getTracks().forEach(track => track.stop())
      
      // Clear timer
      if (recordingTimer.value) {
        clearInterval(recordingTimer.value)
        recordingTimer.value = null
      }
    }
    
    // Start recording
    mediaRecorder.value.start()
    
    // Start timer
    recordingTimer.value = setInterval(() => {
      recordingTime.value += 1
    }, 1000)
    
  } catch (err) {
    error.value = 'Failed to access microphone: ' + err.message
    isRecording.value = false
  }
}

const stopRecording = () => {
  if (mediaRecorder.value && mediaRecorder.value.state === 'recording') {
    mediaRecorder.value.stop()
    isRecording.value = false
  }
}

const clearRecording = () => {
  if (isRecording.value) {
    stopRecording()
  }
  
  if (recordingTimer.value) {
    clearInterval(recordingTimer.value)
    recordingTimer.value = null
  }
  
  hasRecording.value = false
  recordingTime.value = 0
  audioBlob.value = null
  isRecording.value = false
}

const uploadAndPredict = async () => {
  let fileToUpload = null
  
  // Determine what to upload
  if (selectedFile.value) {
    fileToUpload = selectedFile.value
  } else if (hasRecording.value && audioBlob.value) {
    // Convert blob to file for upload
    fileToUpload = new File([audioBlob.value], 'recording.webm', { type: 'audio/webm' })
  } else {
    error.value = 'Please select a file or record audio'
    return
  }

  isLoading.value = true
  error.value = null
  results.value = null
  let requestId = null

  try {
    const { transcriptionApi } = await import('~/services/api.js')
    
    // Step 1: Upload file
    const uploadResponse = await transcriptionApi.uploadFile(fileToUpload)
    requestId = uploadResponse.requestId
    
    // Step 2: Start transcription
    await transcriptionApi.startTranscription(requestId)
    
    // Step 3: Poll for results
    await pollForResults(requestId)
    
  } catch (err) {
    error.value = 'Failed to upload or process audio: ' + err.message
  } finally {
    isLoading.value = false
  }
}

const pollForResults = async (requestId) => {
  const { transcriptionApi } = await import('~/services/api.js')
  
  const checkStatus = async () => {
    try {
      const statusResponse = await transcriptionApi.checkStatus(requestId)
      
      if (statusResponse.status === 'completed') {
        // Get final results
        const resultResponse = await transcriptionApi.getResult(requestId)
        
        if (resultResponse.success) {
          results.value = resultResponse
        } else {
          error.value = 'Transcription failed: ' + (resultResponse.error || 'Unknown error')
        }
      } else if (statusResponse.status === 'processing') {
        // Continue polling every 2 seconds
        setTimeout(checkStatus, 2000)
      } else if (statusResponse.status === 'failed') {
        error.value = statusResponse.message || 'Transcription failed'
      }
    } catch (err) {
      error.value = 'Status check failed: ' + err.message
    }
  }
  
  // Start polling
  checkStatus()
}

// Page meta
useHead({
  title: 'Test Predictions - SiangLao'
})
</script>