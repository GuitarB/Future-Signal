const rotatingPrompt = document.getElementById("rotatingPrompt");
const questionInput = document.getElementById("questionInput");
const analyzeBtn = document.getElementById("analyzeBtn");
const clearBtn = document.getElementById("clearBtn");
const copyBtn = document.getElementById("copyBtn");
const cardBtn = document.getElementById("cardBtn");
const downloadCardBtn = document.getElementById("downloadCardBtn");
const cardPreviewWrap = document.getElementById("cardPreviewWrap");
const signalCardCanvas = document.getElementById("signalCardCanvas");
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
  opportunityText.textContent = "Hidden upside will appear here.";
  riskText.textContent = "Risk patterns will appear here.";
  nextMoveText.textContent = "Strategic next move will appear here.";
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
    historyList.innerHTML =
      `<div class="history-empty">No saved signals yet. Run an analysis.</div>`;
    return;
  }

  historyList.innerHTML = items
    .map(
      (item) => `
    <div class="history-item">
      <div class="history-item-title">${escapeHtml(item.title)}</div>
      <p class="history-item-question">${escapeHtml(item.question)}</p>
      <div class="history-item-meta">
        Signal strength: ${item.strength}% · ${escapeHtml(item.time)}
      </div>
    </div>
  `
    )
    .join("");
}

function escapeHtml(text) {
  return String(text)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

async function runAnalysis() {
  const question = questionInput.value.trim();

  if (!question || isAnalyzing) {
    return;
  }

  isAnalyzing = true;

  analyzeBtn.textContent = "Analyzing...";
  statusPill.textContent = "SCANNING";
  scanStatus.textContent = "Consulting the signal engine...";
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

    if (!response.ok) {
      throw new Error("AI request failed.");
    }

    resultTitle.textContent = data.title;
    forecastText.textContent = data.forecast;
    opportunityText.textContent = data.opportunity;
    riskText.textContent = data.risk;
    nextMoveText.textContent = data.nextMove;

    const strength = Math.max(18, Math.min(96, Number(data.strength) || 72));

    statusPill.textContent = "ACTIVE";
    scanStatus.textContent = "Transmission complete.";
    signalFill.style.width = `${strength}%`;

    storeHistory({
      title: data.title,
      question,
      strength,
      time: new Date().toLocaleString()
    });

  } catch (error) {
    statusPill.textContent = "ERROR";
    scanStatus.textContent = "Engine connection failed.";
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
  const text = `
Future Signal

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
});

clearHistoryBtn.addEventListener("click", () => {
  localStorage.removeItem("futureSignalHistory");
  renderHistory();
});

function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
  const words = text.split(" ");
  let line = "";

  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + " ";
    const metrics = ctx.measureText(testLine);

    if (metrics.width > maxWidth && n > 0) {
      ctx.fillText(line, x, y);
      line = words[n] + " ";
      y += lineHeight;
    } else {
      line = testLine;
    }
  }

  ctx.fillText(line, x, y);
  return y;
}

function generateSignalCard() {
  const title = resultTitle.textContent;
  const question = questionInput.value;
  const forecast = forecastText.textContent;
  const strength = parseInt(signalFill.style.width) || 70;

  if (statusPill.textContent !== "ACTIVE") {
    cardBtn.textContent = "Run Signal First";
    setTimeout(() => (cardBtn.textContent = "Generate Signal Card"), 1200);
    return;
  }

  const canvas = signalCardCanvas;
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = "#0b1026";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 70px Inter";
  wrapText(ctx, title, 80, 200, canvas.width - 160, 80);

  ctx.font = "36px Inter";
  ctx.fillStyle = "#aab4d6";
  wrapText(ctx, question, 80, 360, canvas.width - 160, 50);

  ctx.font = "42px Inter";
  ctx.fillStyle = "#ffffff";
  wrapText(ctx, forecast, 80, 600, canvas.width - 160, 60);

  ctx.fillStyle = "#7c5cff";
  ctx.fillRect(80, canvas.height - 200, (canvas.width - 160) * (strength / 100), 30);

  cardPreviewWrap.classList.remove("hidden");

  const dataUrl = canvas.toDataURL("image/png");
  downloadCardBtn.href = dataUrl;
  downloadCardBtn.classList.remove("hidden");
}

cardBtn.addEventListener("click", generateSignalCard);

renderHistory();
setIdleState();