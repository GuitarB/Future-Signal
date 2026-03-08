const rotatingPrompt = document.getElementById("rotatingPrompt");
const questionInput = document.getElementById("questionInput");
const analyzeBtn = document.getElementById("analyzeBtn");
const clearBtn = document.getElementById("clearBtn");
const copyBtn = document.getElementById("copyBtn");
const clearHistoryBtn = document.getElementById("clearHistoryBtn");
const chipButtons = document.querySelectorAll(".chip");

const resultTitle = document.getElementById("resultTitle");
const forecastText = document.getElementById("forecastText");
const opportunityText = document.getElementById("opportunityText");
const riskText = document.getElementById("riskText");
const nextMoveText = document.getElementById("nextMoveText");
const statusPill = document.getElementById("statusPill");
const signalFill = document.getElementById("signalFill");
const scanStatus = document.getElementById("scanStatus");
const historyList = document.getElementById("historyList");

const prompts = [
  "What happens if I start a business this year?",
  "What if I completely reinvent my life in the next 90 days?",
  "What if I commit to one powerful habit for a year?",
  "What happens if I turn my idea into a real product?",
  "What if AI transforms my industry faster than expected?",
  "What kind of future am I creating right now?"
];

let promptIndex = 0;
let isAnalyzing = false;

setInterval(() => {
  promptIndex = (promptIndex + 1) % prompts.length;
  rotatingPrompt.textContent = prompts[promptIndex];
}, 3000);

chipButtons.forEach((button) => {
  button.addEventListener("click", () => {
    questionInput.value = button.dataset.prompt;
    questionInput.focus();
  });
});

function pickTitle(question) {
  const lowered = question.toLowerCase();

  if (lowered.includes("business") || lowered.includes("money") || lowered.includes("income")) {
    return "Economic Momentum Detected";
  }

  if (lowered.includes("life") || lowered.includes("future") || lowered.includes("reinvent")) {
    return "Identity Shift Signal";
  }

  if (lowered.includes("ai") || lowered.includes("technology") || lowered.includes("tech")) {
    return "High-Tech Disruption Window";
  }

  if (lowered.includes("move") || lowered.includes("city") || lowered.includes("country")) {
    return "Geographic Transition Forecast";
  }

  if (lowered.includes("brand") || lowered.includes("audience") || lowered.includes("content")) {
    return "Attention Wave Forming";
  }

  return "Emerging Future Pattern";
}

function buildForecast(question) {
  const starters = [
    "Your question points to a period of accelerated change.",
    "The signal suggests you are standing near a threshold moment.",
    "This scenario shows strong potential for reinvention and momentum.",
    "A meaningful shift becomes more likely if you act with consistency."
  ];

  const endings = [
    "Small disciplined moves could create a very visible outcome.",
    "The future here does not look passive; it looks shaped by deliberate action.",
    "This path appears strongest when curiosity is paired with execution.",
    "The biggest change may begin quietly before becoming obvious to everyone else."
  ];

  return `${randomItem(starters)} In this scenario, "${question.trim()}" behaves less like a random thought and more like a live opportunity field. ${randomItem(endings)}`;
}

function buildOpportunity(question) {
  const options = [
    "You may be closer than you think to a breakthrough that other people do not yet see.",
    "There is leverage in starting before you feel fully ready.",
    "Momentum could build through visibility, consistency, and a memorable public identity.",
    "A simple first version may unlock feedback, confidence, and faster iteration.",
    "Your edge may come from bold presentation rather than technical complexity alone."
  ];

  return `${randomItem(options)} The opportunity zone around "${question.trim()}" favors decisive movement, visible experimentation, and rapid learning.`;
}

function buildRisk(question) {
  const options = [
    "The main danger is hesitation disguised as preparation.",
    "Overthinking may drain energy from a strong instinct.",
    "Perfectionism could slow a concept that actually needs public testing.",
    "Trying to impress everyone at once may weaken the clarity of the idea.",
    "Waiting for certainty may cause the timing advantage to disappear."
  ];

  return `${randomItem(options)} For this signal, risk does not come only from failure. It also comes from delay, distraction, and diluted focus.`;
}

function buildNextMove(question) {
  const moves = [
    "Define the smallest version you can launch fast and make it real.",
    "Turn the idea into something visible within the next 24 hours.",
    "Write a clear one-sentence promise for the experience you want people to feel.",
    "Create a first public-facing prototype instead of staying in planning mode.",
    "Pick one measurable target and design your next move around it."
  ];

  return `${randomItem(moves)} For "${question.trim()}", the strongest next step is immediate execution with clean focus.`;
}

function randomItem(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function calculateSignalStrength(question) {
  const lengthScore = Math.min(question.trim().length * 1.5, 65);
  const bonusWords = ["future", "business", "money", "ai", "life", "change", "build", "move", "start", "brand", "product"];
  let bonus = 0;

  bonusWords.forEach((word) => {
    if (question.toLowerCase().includes(word)) {
      bonus += 4;
    }
  });

  return Math.min(96, Math.max(18, Math.floor(lengthScore + bonus)));
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function setIdleState() {
  resultTitle.textContent = "Awaiting transmission...";
  forecastText.textContent = "Enter a question to generate a speculative future readout.";
  opportunityText.textContent = "Hidden upside, leverage points, and momentum signals will appear here.";
  riskText.textContent = "Friction, instability, and caution signals will appear here.";
  nextMoveText.textContent = "Your most strategic immediate move will appear here.";
  statusPill.textContent = "IDLE";
  scanStatus.textContent = "System standing by.";
  signalFill.style.width = "8%";
}

function storeHistory(item) {
  const existing = JSON.parse(localStorage.getItem("futureSignalHistory") || "[]");
  existing.unshift(item);
  const trimmed = existing.slice(0, 6);
  localStorage.setItem("futureSignalHistory", JSON.stringify(trimmed));
  renderHistory();
}

function renderHistory() {
  const items = JSON.parse(localStorage.getItem("futureSignalHistory") || "[]");

  if (!items.length) {
    historyList.innerHTML = `<div class="history-empty">No saved signals yet. Run an analysis to start building your timeline.</div>`;
    return;
  }

  historyList.innerHTML = items.map((item) => `
    <div class="history-item">
      <div class="history-item-title">${escapeHtml(item.title)}</div>
      <p class="history-item-question">${escapeHtml(item.question)}</p>
      <div class="history-item-meta">Signal strength: ${item.strength}% · ${escapeHtml(item.time)}</div>
    </div>
  `).join("");
}

function escapeHtml(text) {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

async function runAnalysis() {
  const question = questionInput.value.trim();

  if (!question || isAnalyzing) {
    if (!question) {
      resultTitle.textContent = "No signal detected";
      forecastText.textContent = "Type a real question first so the interface has something to analyze.";
      opportunityText.textContent = "Questions with emotional energy, ambition, or uncertainty generate the strongest outputs.";
      riskText.textContent = "A blank input creates no meaningful signal.";
      nextMoveText.textContent = "Enter a bold question and run the analysis again.";
      statusPill.textContent = "EMPTY";
      scanStatus.textContent = "Signal channel is empty.";
      signalFill.style.width = "8%";
    }
    return;
  }

  isAnalyzing = true;
  analyzeBtn.textContent = "Analyzing...";
  statusPill.textContent = "SCANNING";
  scanStatus.textContent = "Collecting scenario fragments...";
  signalFill.style.width = "20%";

  await delay(500);
  scanStatus.textContent = "Mapping opportunity zones...";
  signalFill.style.width = "42%";

  await delay(650);
  scanStatus.textContent = "Detecting risk patterns...";
  signalFill.style.width = "68%";

  await delay(650);
  scanStatus.textContent = "Finalizing future readout...";
  signalFill.style.width = "84%";

  await delay(500);

  const strength = calculateSignalStrength(question);
  const title = pickTitle(question);
  const forecast = buildForecast(question);
  const opportunity = buildOpportunity(question);
  const risk = buildRisk(question);
  const nextMove = buildNextMove(question);

  resultTitle.textContent = title;
  forecastText.textContent = forecast;
  opportunityText.textContent = opportunity;
  riskText.textContent = risk;
  nextMoveText.textContent = nextMove;
  statusPill.textContent = "ACTIVE";
  scanStatus.textContent = "Transmission complete.";
  signalFill.style.width = `${strength}%`;

  const historyItem = {
    title,
    question,
    strength,
    time: new Date().toLocaleString()
  };

  storeHistory(historyItem);

  analyzeBtn.textContent = "Analyze Signal";
  isAnalyzing = false;
}

analyzeBtn.addEventListener("click", runAnalysis);

clearBtn.addEventListener("click", () => {
  questionInput.value = "";
  setIdleState();
});

copyBtn.addEventListener("click", async () => {
  const text = [
    `Future Signal`,
    `Title: ${resultTitle.textContent}`,
    `Status: ${statusPill.textContent}`,
    ``,
    `Primary Forecast: ${forecastText.textContent}`,
    ``,
    `Opportunity Zone: ${opportunityText.textContent}`,
    ``,
    `Risk Pattern: ${riskText.textContent}`,
    ``,
    `Next Move: ${nextMoveText.textContent}`
  ].join("\n");

  try {
    await navigator.clipboard.writeText(text);
    copyBtn.textContent = "Copied";
    setTimeout(() => {
      copyBtn.textContent = "Copy Result";
    }, 1400);
  } catch (error) {
    copyBtn.textContent = "Copy Failed";
    setTimeout(() => {
      copyBtn.textContent = "Copy Result";
    }, 1400);
  }
});

clearHistoryBtn.addEventListener("click", () => {
  localStorage.removeItem("futureSignalHistory");
  renderHistory();
});

renderHistory();
setIdleState();