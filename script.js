const DAILY_LIMIT = 3;

const rotatingPrompt = document.getElementById("rotatingPrompt");
const questionInput = document.getElementById("questionInput");
const analyzeBtn = document.getElementById("analyzeBtn");
const clearBtn = document.getElementById("clearBtn");
const copyBtn = document.getElementById("copyBtn");
const cardBtn = document.getElementById("cardBtn");
const shareCardBtn = document.getElementById("shareCardBtn");
const downloadCardBtn = document.getElementById("downloadCardBtn");
const upgradeBtn = document.getElementById("upgradeBtn");
const modalUpgradeBtn = document.getElementById("modalUpgradeBtn");
const closeModalBtn = document.getElementById("closeModalBtn");
const limitModal = document.getElementById("limitModal");
const cardPreviewWrap = document.getElementById("cardPreviewWrap");
const signalCardCanvas = document.getElementById("signalCardCanvas");
const clearHistoryBtn = document.getElementById("clearHistoryBtn");
const chipRow = document.getElementById("chipRow");
const refreshChipsBtn = document.getElementById("refreshChipsBtn");

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

const chipPromptPool = [
  "What happens if I build a digital brand in the next 6 months?",
  "What if I reinvent my life in the next 90 days?",
  "What happens if I turn one strong idea into a product this month?",
  "What if AI transforms my industry faster than expected?",
  "What happens if I focus on one business for a full year?",
  "What if I launch before I feel fully ready?",
  "What happens if I build something people share naturally?",
  "What if I switch careers this year?",
  "What happens if I become consistent for 100 days straight?",
  "What if I move to a new city and start over?",
  "What happens if I turn my expertise into a subscription?",
  "What if I go all in on one niche?",
  "What happens if I build an audience before the product?",
  "What if I start creating content every day?",
  "What happens if I use AI to redesign my workflow?",
  "What if I stop overthinking and ship this week?"
];

let promptIndex = 0;
let isAnalyzing = false;

/* ---------------------------
PROMPT ROTATION (SLOWER)
--------------------------- */

setInterval(() => {
  promptIndex = (promptIndex + 1) % prompts.length;
  rotatingPrompt.textContent = prompts[promptIndex];
}, 12000);

/* ---------------------------
CHIP GENERATION
--------------------------- */

function shuffle(array) {
  return [...array].sort(() => Math.random() - 0.5);
}

function shortChipLabel(prompt) {
  if (prompt.length < 24) return prompt;
  return prompt.slice(0, 22) + "…";
}

function renderRandomChips() {
  const chosen = shuffle(chipPromptPool).slice(0, 4);

  chipRow.innerHTML = chosen
    .map(
      (p) =>
        `<button class="chip" data-prompt="${p}">${shortChipLabel(p)}</button>`
    )
    .join("");

  document.querySelectorAll(".chip").forEach((chip) => {
    chip.onclick = () => {
      questionInput.value = chip.dataset.prompt;
      questionInput.focus();
    };
  });
}

refreshChipsBtn.onclick = renderRandomChips;

/* ---------------------------
LIMIT SYSTEM
--------------------------- */

function getTodayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

function getUsage() {
  const raw = localStorage.getItem("fs_usage");

  if (!raw) {
    return { date: getTodayKey(), count: 0 };
  }

  const data = JSON.parse(raw);

  if (data.date !== getTodayKey()) {
    return { date: getTodayKey(), count: 0 };
  }

  return data;
}

function saveUsage(data) {
  localStorage.setItem("fs_usage", JSON.stringify(data));
}

function incrementUsage() {
  const usage = getUsage();
  usage.count += 1;
  saveUsage(usage);
}

function remainingUsage() {
  return Math.max(0, DAILY_LIMIT - getUsage().count);
}

function isLimitReached() {
  return getUsage().count >= DAILY_LIMIT;
}

/* ---------------------------
UI STATES
--------------------------- */

function setIdleState() {
  resultTitle.textContent = "Awaiting transmission...";
  forecastText.textContent =
    "Enter a question to generate a speculative future readout.";
  opportunityText.textContent =
    "Hidden opportunity signals will appear here.";
  riskText.textContent = "Risk patterns will appear here.";
  nextMoveText.textContent = "Strategic next move will appear here.";
  statusPill.textContent = "IDLE";
  scanStatus.textContent = `${remainingUsage()} free signals remaining today`;
  signalFill.style.width = "8%";
  cardPreviewWrap.classList.add("hidden");
}

function showLimitMessage() {
  resultTitle.textContent = "Daily Signal Limit Reached";
  forecastText.textContent =
    "You have used all free signals for today. Future Signal Plus unlocks unlimited signals.";
  opportunityText.textContent =
    "Upgrade to continue generating signals and sharing signal cards.";
  riskText.textContent =
    "Free signals reset tomorrow.";
  nextMoveText.textContent =
    "Upgrade now to continue immediately.";

  statusPill.textContent = "LIMIT";
  signalFill.style.width = "100%";

  limitModal.classList.remove("hidden");
}

/* ---------------------------
AI ANALYSIS
--------------------------- */

async function runAnalysis() {
  if (isLimitReached()) {
    showLimitMessage();
    return;
  }

  const question = questionInput.value.trim();

  if (!question || isAnalyzing) return;

  isAnalyzing = true;

  analyzeBtn.textContent = "Analyzing...";
  statusPill.textContent = "SCANNING";
  scanStatus.textContent = "Consulting signal engine...";
  signalFill.style.width = "30%";

  try {
    const response = await fetch("/api/analyze", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ question })
    });

    const data = await response.json();

    incrementUsage();

    resultTitle.textContent = data.title;
    forecastText.textContent = data.forecast;
    opportunityText.textContent = data.opportunity;
    riskText.textContent = data.risk;
    nextMoveText.textContent = data.nextMove;

    const strength = Math.max(
      18,
      Math.min(96, Number(data.strength) || 72)
    );

    signalFill.style.width = strength + "%";
    statusPill.textContent = "ACTIVE";

    scanStatus.textContent =
      `${remainingUsage()} free signals remaining today`;

    renderRandomChips();

  } catch {
    statusPill.textContent = "ERROR";
    scanStatus.textContent = "Engine connection failed.";
  }

  analyzeBtn.textContent = "Analyze Signal";
  isAnalyzing = false;
}

analyzeBtn.onclick = runAnalysis;

/* ---------------------------
COPY
--------------------------- */

copyBtn.onclick = async () => {
  const text = `
${resultTitle.textContent}

Forecast:
${forecastText.textContent}

Opportunity:
${opportunityText.textContent}

Risk:
${riskText.textContent}

Next Move:
${nextMoveText.textContent}
`;

  await navigator.clipboard.writeText(text);

  copyBtn.textContent = "Copied";

  setTimeout(() => {
    copyBtn.textContent = "Copy Result";
  }, 1200);
};

/* ---------------------------
CLEAR
--------------------------- */

clearBtn.onclick = () => {
  questionInput.value = "";
  setIdleState();
};

/* ---------------------------
MODAL
--------------------------- */

closeModalBtn.onclick = () => {
  limitModal.classList.add("hidden");
};

upgradeBtn.onclick = startCheckout;
modalUpgradeBtn.onclick = startCheckout;

/* ---------------------------
STRIPE CHECKOUT
--------------------------- */

async function startCheckout() {
  try {
    const response = await fetch("/create-checkout-session", {
      method: "POST"
    });

    const data = await response.json();

    window.location.href = data.url;
  } catch {
    alert("Checkout failed.");
  }
}

/* ---------------------------
INIT
--------------------------- */

renderRandomChips();
setIdleState();