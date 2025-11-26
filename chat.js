// DOM Elements
const startContainer = document.getElementById('startContainer')
const chatContainer = document.getElementById('chatContainer')
const inputContainer = document.getElementById('inputContainer')
const chatMessages = document.getElementById('chatMessages')
const userInput = document.getElementById('userInput')
const sendBtn = document.getElementById('sendBtn')
const startBtn = document.getElementById('startBtn')
const resetBtn = document.getElementById('resetBtn')
const loadingIndicator = document.getElementById('loadingIndicator')
const charCount = document.getElementById('charCount')
const recommendationsModal = document.getElementById('recommendationsModal')
const closeModal = document.getElementById('closeModal')
const exportBtn = document.getElementById('exportBtn')
const newSearchBtn = document.getElementById('newSearchBtn')
const recommendationsContent = document.getElementById('recommendationsContent')

// State
let conversationActive = false

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  setupEventListeners()
  autoResizeTextarea()
})

// Event Listeners
function setupEventListeners () {
  startBtn.addEventListener('click', startConversation)
  sendBtn.addEventListener('click', sendMessage)
  resetBtn.addEventListener('click', resetConversation)
  closeModal.addEventListener('click', closeRecommendationsModal)
  exportBtn.addEventListener('click', exportRecommendations)
  newSearchBtn.addEventListener('click', resetConversation)

  // Enter to send (Shift+Enter for new line)
  userInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  })

  // Character counter
  userInput.addEventListener('input', () => {
    charCount.textContent = userInput.value.length
    autoResizeTextarea()
  })

  // Close modal on outside click
  recommendationsModal.addEventListener('click', (e) => {
    if (e.target === recommendationsModal) {
      closeRecommendationsModal()
    }
  })
}

// Auto-resize textarea
function autoResizeTextarea () {
  userInput.style.height = 'auto'
  userInput.style.height = userInput.scrollHeight + 'px'
}

// Start conversation
async function startConversation () {
  try {
    showLoading(true)
    const response = await fetch('/start', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      throw new Error('Failed to start conversation')
    }

    const data = await response.json()

    // Hide start screen, show chat
    startContainer.style.display = 'none'
    chatContainer.style.display = 'flex'
    inputContainer.style.display = 'block'
    resetBtn.style.display = 'flex'

    // Display initial messages
    data.messages.forEach(msg => {
      addMessage(msg.content, msg.role)
    })

    conversationActive = true
    userInput.focus()
  } catch (error) {
    console.error('Error starting conversation:', error)
    alert('Failed to start conversation. Please try again.')
  } finally {
    showLoading(false)
  }
}

// Send message
async function sendMessage () {
  const message = userInput.value.trim()

  if (!message || !conversationActive) {
    return
  }

  // Disable input during processing
  setInputEnabled(false)

  // Add user message to chat
  addMessage(message, 'user')

  // Clear input
  userInput.value = ''
  charCount.textContent = '0'
  autoResizeTextarea()

  // Show loading
  showLoading(true)

  try {
    const response = await fetch('/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ message })
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Failed to send message')
    }

    const data = await response.json()

    // Process response messages
    for (const msg of data.messages) {
      if (msg.content === 'recommendations') {
        // Show recommendations modal
        displayRecommendations(msg.data)
        conversationActive = false
        setInputEnabled(false)
      } else {
        addMessage(msg.content, msg.role)
      }
    }
  } catch (error) {
    console.error('Error sending message:', error)
    addMessage('Sorry, there was an error processing your response. Please try again.', 'assistant')
  } finally {
    showLoading(false)
    if (conversationActive) {
      setInputEnabled(true)
      userInput.focus()
    }
  }
}

// Add message to chat
function addMessage (content, role) {
  const messageDiv = document.createElement('div')
  messageDiv.className = `message ${role}`

  const messageContent = document.createElement('div')
  messageContent.className = 'message-content'
  messageContent.textContent = content

  messageDiv.appendChild(messageContent)
  chatMessages.appendChild(messageDiv)

  // Scroll to bottom
  chatMessages.scrollTop = chatMessages.scrollHeight
}

// Display recommendations in modal
function displayRecommendations (recommendations) {
  recommendationsContent.innerHTML = ''

  if (!recommendations || recommendations.length === 0) {
    recommendationsContent.innerHTML = '<p>No recommendations available. Please try again.</p>'
    recommendationsModal.style.display = 'flex'
    return
  }

  recommendations.forEach((rec, index) => {
    const card = createRecommendationCard(rec, index)
    recommendationsContent.appendChild(card)
  })

  recommendationsModal.style.display = 'flex'
}

// Create recommendation card
function createRecommendationCard (rec, index) {
  const card = document.createElement('div')
  card.className = 'recommendation-card'

  const header = document.createElement('div')
  header.className = 'recommendation-header'

  const titleDiv = document.createElement('div')
  titleDiv.className = 'recommendation-title'

  const title = document.createElement('h3')
  title.textContent = `${index + 1}. ${rec.program}`
  titleDiv.appendChild(title)

  // Program metadata
  const meta = document.createElement('div')
  meta.className = 'program-meta'

  if (rec.program_type) {
    const typeBadge = document.createElement('span')
    typeBadge.className = 'meta-badge'
    typeBadge.textContent = rec.program_type
    meta.appendChild(typeBadge)
  }

  if (rec.duration) {
    const durationBadge = document.createElement('span')
    durationBadge.className = 'meta-badge'
    durationBadge.textContent = rec.duration
    meta.appendChild(durationBadge)
  }

  titleDiv.appendChild(meta)
  header.appendChild(titleDiv)

  // Match score
  const score = document.createElement('div')
  score.className = 'match-score'
  score.textContent = `${rec.match_score}%`
  header.appendChild(score)

  card.appendChild(header)

  // Reasoning
  const reasoning = document.createElement('p')
  reasoning.className = 'recommendation-reasoning'
  reasoning.textContent = rec.reasoning
  card.appendChild(reasoning)

  // Learn more link (placeholder)
  const link = document.createElement('a')
  link.href = '#'
  link.className = 'program-link'
  link.textContent = 'Learn more about this program →'
  link.addEventListener('click', (e) => {
    e.preventDefault()
    alert(`For more information about ${rec.program}, please visit the RRC Polytech website or contact an admissions advisor.`)
  })
  card.appendChild(link)

  return card
}

// Close recommendations modal
function closeRecommendationsModal () {
  recommendationsModal.style.display = 'none'
}

// Export recommendations
async function exportRecommendations () {
  try {
    const response = await fetch('/export')

    if (!response.ok) {
      throw new Error('Failed to export recommendations')
    }

    const data = await response.json()

    // Create downloadable JSON file
    const dataStr = JSON.stringify(data, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)

    const link = document.createElement('a')
    link.href = url
    link.download = `rrc-program-recommendations-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    alert('Recommendations exported successfully!')
  } catch (error) {
    console.error('Error exporting recommendations:', error)
    alert('Failed to export recommendations. Please try again.')
  }
}

// Reset conversation
async function resetConversation () {
  if (!confirm('Are you sure you want to start over? This will clear your current conversation.')) {
    return
  }

  try {
    const response = await fetch('/reset', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      throw new Error('Failed to reset conversation')
    }

    // Reset UI
    chatMessages.innerHTML = ''
    userInput.value = ''
    charCount.textContent = '0'
    conversationActive = false

    // Hide chat, show start screen
    chatContainer.style.display = 'none'
    inputContainer.style.display = 'none'
    startContainer.style.display = 'block'
    resetBtn.style.display = 'none'
    closeRecommendationsModal()
  } catch (error) {
    console.error('Error resetting conversation:', error)
    alert('Failed to reset conversation. Please refresh the page.')
  }
}

// Show/hide loading indicator
function showLoading (show) {
  loadingIndicator.style.display = show ? 'block' : 'none'
  if (show) {
    chatMessages.scrollTop = chatMessages.scrollHeight
  }
}

// Enable/disable input
function setInputEnabled (enabled) {
  userInput.disabled = !enabled
  sendBtn.disabled = !enabled

  if (enabled) {
    userInput.focus()
  }
}
