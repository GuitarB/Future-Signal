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
  return String(text)
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

  await delay(350);
  scanStatus.textContent = "Mapping opportunity zones...";
  signalFill.style.width = "42%";

  await delay(450);
  scanStatus.textContent = "Detecting risk patterns...";
  signalFill.style.width = "68%";

  await delay(450);
  scanStatus.textContent = "Consulting the engine...";
  signalFill.style.width = "84%";

  try {
    const response = await fetch("/api/analyze", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ question })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Analysis failed.");
    }

    resultTitle.textContent = data.title || "Signal Acquired";
    forecastText.textContent = data.forecast || "No forecast returned.";
    opportunityText.textContent = data.opportunity || "No opportunity signal returned.";
    riskText.textContent = data.risk || "No risk pattern returned.";
    nextMoveText.textContent = data.nextMove || "No next move returned.";

    const strength = Math.max(18, Math.min(96, Number(data.strength) || 72));

    statusPill.textContent = "ACTIVE";
    scanStatus.textContent = "Transmission complete.";
    signalFill.style.width = `${strength}%`;

    storeHistory({
      title: resultTitle.textContent,
      question,
      strength,
      time: new Date().toLocaleString()
    });
  } catch (error) {
    resultTitle.textContent = "Transmission Error";
    forecastText.textContent = "The AI engine did not return a usable result.";
    opportunityText.textContent = "Check that your Cloudflare secret is set and your OpenAI API billing is active.";
    riskText.textContent = error.message;
    nextMoveText.textContent = "Fix the configuration, redeploy, and try again.";
    statusPill.textContent = "ERROR";
    scanStatus.textContent = "Engine connection failed.";
    signalFill.style.width = "12%";
  } finally {
    analyzeBtn.textContent = "Analyze Signal";
    isAnalyzing = false;
  }
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