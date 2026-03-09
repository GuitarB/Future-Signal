const DAILY_LIMIT = 3

function getTodayKey() {
  const d = new Date()
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
}

function getUsage() {
  const raw = localStorage.getItem("fs_usage")
  if (!raw) return { date: getTodayKey(), count: 0 }

  const parsed = JSON.parse(raw)

  if (parsed.date !== getTodayKey()) {
    return { date: getTodayKey(), count: 0 }
  }

  return parsed
}

function saveUsage(data) {
  localStorage.setItem("fs_usage", JSON.stringify(data))
}

function incrementUsage() {
  const usage = getUsage()
  usage.count++
  saveUsage(usage)
}

function remainingUsage() {
  const usage = getUsage()
  return DAILY_LIMIT - usage.count
}

function isLimitReached() {
  const usage = getUsage()
  return usage.count >= DAILY_LIMIT
}

function showLimitMessage() {

  resultTitle.textContent = "Daily Signal Limit Reached"

  forecastText.textContent =
    "You've used today's free signals. Future Signal Plus unlocks unlimited signals, deeper analysis, and premium forecasting."

  opportunityText.textContent =
    "Upgrade to continue exploring scenarios and generating shareable signal cards."

  riskText.textContent =
    "Free access resets tomorrow."

  nextMoveText.textContent =
    "Upgrade to Future Signal Plus to continue now."

  statusPill.textContent = "LIMIT"

  scanStatus.textContent =
    "Daily free usage reached."

  signalFill.style.width = "100%"
}

async function runAnalysis() {

  if (isLimitReached()) {
    showLimitMessage()
    return
  }

  const question = questionInput.value.trim()

  if (!question || isAnalyzing) {
    return
  }

  isAnalyzing = true

  analyzeBtn.textContent = "Analyzing..."

  statusPill.textContent = "SCANNING"

  scanStatus.textContent = "Consulting the signal engine..."

  signalFill.style.width = "30%"

  try {

    const response = await fetch("/api/analyze", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ question })
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error("AI request failed")
    }

    incrementUsage()

    resultTitle.textContent = data.title

    forecastText.textContent = data.forecast

    opportunityText.textContent = data.opportunity

    riskText.textContent = data.risk

    nextMoveText.textContent = data.nextMove

    const strength = Math.max(18, Math.min(96, Number(data.strength) || 72))

    statusPill.textContent = "ACTIVE"

    scanStatus.textContent =
      `${remainingUsage()} free signals remaining today`

    signalFill.style.width = `${strength}%`

  } catch (error) {

    statusPill.textContent = "ERROR"

    scanStatus.textContent =
      "Engine connection failed."

  } finally {

    analyzeBtn.textContent = "Analyze Signal"

    isAnalyzing = false

  }
}