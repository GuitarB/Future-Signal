const DAILY_LIMIT = 3;

const rotatingPrompt = document.getElementById("rotatingPrompt");
const questionInput = document.getElementById("questionInput");
const analyzeBtn = document.getElementById("analyzeBtn");
const clearBtn = document.getElementById("clearBtn");
const copyBtn = document.getElementById("copyBtn");
const cardBtn = document.getElementById("cardBtn");
const shareCardBtn = document.getElementById("shareCardBtn");
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
let clearTapCount = 0;
let clearTapTimer = null;

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

function getTodayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

function getUsage() {
  const raw = localStorage.getItem("fs_usage");

  if (!raw) {
    return { date: getTodayKey(), count: 0 };
  }

  try {
    const parsed = JSON.parse(raw);

    if (parsed.date !== getTodayKey()) {
      return { date: getTodayKey(), count: 0 };
    }

    return parsed;
  } catch {
    return { date: getTodayKey(), count: 0 };
  }
}

function saveUsage(data) {
  localStorage.setItem("fs_usage", JSON.stringify(data));
}

function resetUsage() {
  saveUsage({ date: getTodayKey(), count: 0 });
}

function incrementUsage() {
  const usage = getUsage();
  usage.count += 1;
  saveUsage(usage);
}

function remainingUsage() {
  const usage = getUsage();
  return Math.max(0, DAILY_LIMIT - usage.count);
}

function isLimitReached() {
  const usage = getUsage();
  return usage.count >= DAILY_LIMIT;
}

function setIdleState() {
  resultTitle.textContent = "Awaiting transmission...";
  forecastText.textContent = "Enter a question to generate a speculative future readout.";
  opportunityText.textContent = "Hidden upside will appear here.";
  riskText.textContent = "Risk patterns will appear here.";
  nextMoveText.textContent = "Strategic next move will appear here.";
  statusPill.textContent = "IDLE";
  scanStatus.textContent = `${remainingUsage()} free signals remaining today`;
  signalFill.style.width = "8%";
  cardPreviewWrap.classList.add("hidden");
  downloadCardBtn.removeAttribute("href");
}

function showLimitMessage() {
  resultTitle.textContent = "Daily Signal Limit Reached";
  forecastText.textContent =
    "You have used all free signals for today. Future Signal Plus will unlock unlimited signals and deeper forecasting.";
  opportunityText.textContent =
    "Your upgrade path is clear: keep the product open for discovery, then convert power users when they want more.";
  riskText.textContent =
    "Without limits, viral usage can burn API budget quickly. This gate protects the product while creating monetization pressure.";
  nextMoveText.textContent =
    "Wait for tomorrow’s reset or upgrade to Future Signal Plus when Stripe is live.";
  statusPill.textContent = "LIMIT";
  scanStatus.textContent = "Daily free usage reached.";
  signalFill.style.width = "100%";
  cardPreviewWrap.classList.add("hidden");
  downloadCardBtn.removeAttribute("href");
}

function showResetMessage() {
  resultTitle.textContent = "Testing Limit Reset";
  forecastText.textContent =
    "Daily test usage has been reset on this device.";
  opportunityText.textContent =
    "You can continue testing the free flow, share card flow, and upgrade wall.";
  riskText.textContent =
    "Remember to remove this hidden reset shortcut before launch.";
  nextMoveText.textContent =
    "Run another signal to continue testing.";
  statusPill.textContent = "RESET";
  scanStatus.textContent = `${remainingUsage()} free signals remaining today`;
  signalFill.style.width = "18%";
  cardPreviewWrap.classList.add("hidden");
  downloadCardBtn.removeAttribute("href");
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
  if (isLimitReached()) {
    showLimitMessage();
    return;
  }

  const question = questionInput.value.trim();

  if (!question || isAnalyzing) {
    return;
  }

  isAnalyzing = true;
  cardPreviewWrap.classList.add("hidden");
  downloadCardBtn.removeAttribute("href");

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

    incrementUsage();

    resultTitle.textContent = data.title || "Signal Acquired";
    forecastText.textContent = data.forecast || "No forecast returned.";
    opportunityText.textContent = data.opportunity || "No opportunity returned.";
    riskText.textContent = data.risk || "No risk returned.";
    nextMoveText.textContent = data.nextMove || "No next move returned.";

    const strength = Math.max(18, Math.min(96, Number(data.strength) || 72));

    statusPill.textContent = "ACTIVE";
    scanStatus.textContent = `${remainingUsage()} free signals remaining today`;
    signalFill.style.width = `${strength}%`;

    storeHistory({
      title: resultTitle.textContent,
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
  clearTapCount += 1;

  if (clearTapTimer) {
    clearTimeout(clearTapTimer);
  }

  clearTapTimer = setTimeout(() => {
    clearTapCount = 0;
  }, 1200);

  if (clearTapCount >= 3) {
    clearTapCount = 0;
    resetUsage();
    questionInput.value = "";
    showResetMessage();
    return;
  }

  questionInput.value = "";
  setIdleState();
});

copyBtn.addEventListener("click", async () => {
  const text = [
    "Future Signal",
    "",
    resultTitle.textContent,
    "",
    "Forecast:",
    forecastText.textContent,
    "",
    "Opportunity:",
    opportunityText.textContent,
    "",
    "Risk:",
    riskText.textContent,
    "",
    "Next Move:",
    nextMoveText.textContent
  ].join("\n");

  try {
    await navigator.clipboard.writeText(text);
    copyBtn.textContent = "Copied";
    setTimeout(() => {
      copyBtn.textContent = "Copy Result";
    }, 1200);
  } catch {
    copyBtn.textContent = "Copy Failed";
    setTimeout(() => {
      copyBtn.textContent = "Copy Result";
    }, 1200);
  }
});

clearHistoryBtn.addEventListener("click", () => {
  localStorage.removeItem("futureSignalHistory");
  renderHistory();
});

function roundRect(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

function fillRoundRect(ctx, x, y, width, height, radius, fillStyle) {
  ctx.save();
  roundRect(ctx, x, y, width, height, radius);
  ctx.fillStyle = fillStyle;
  ctx.fill();
  ctx.restore();
}

function strokeRoundRect(ctx, x, y, width, height, radius, strokeStyle, lineWidth = 2) {
  ctx.save();
  roundRect(ctx, x, y, width, height, radius);
  ctx.strokeStyle = strokeStyle;
  ctx.lineWidth = lineWidth;
  ctx.stroke();
  ctx.restore();
}

function drawWrappedText(ctx, text, x, y, maxWidth, lineHeight, maxLines = 100) {
  const words = String(text).split(" ");
  let line = "";
  const lines = [];

  for (let i = 0; i < words.length; i++) {
    const testLine = line + words[i] + " ";
    const width = ctx.measureText(testLine).width;

    if (width > maxWidth && i > 0) {
      lines.push(line.trim());
      line = words[i] + " ";
      if (lines.length >= maxLines - 1) {
        break;
      }
    } else {
      line = testLine;
    }
  }

  if (line.trim() && lines.length < maxLines) {
    lines.push(line.trim());
  }

  lines.forEach((lineText, index) => {
    ctx.fillText(lineText, x, y + index * lineHeight);
  });

  return y + lines.length * lineHeight;
}

function drawCardBackground(ctx, canvas) {
  const bgGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
  bgGradient.addColorStop(0, "#060c22");
  bgGradient.addColorStop(1, "#09142d");
  ctx.fillStyle = bgGradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const orb1 = ctx.createRadialGradient(220, 180, 20, 220, 180, 360);
  orb1.addColorStop(0, "rgba(124,92,255,0.32)");
  orb1.addColorStop(1, "rgba(124,92,255,0)");
  ctx.fillStyle = orb1;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const orb2 = ctx.createRadialGradient(980, 1100, 20, 980, 1100, 420);
  orb2.addColorStop(0, "rgba(34,211,238,0.20)");
  orb2.addColorStop(1, "rgba(34,211,238,0)");
  ctx.fillStyle = orb2;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.save();
  ctx.strokeStyle = "rgba(255,255,255,0.04)";
  ctx.lineWidth = 1;

  for (let x = 0; x <= canvas.width; x += 64) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
    ctx.stroke();
  }

  for (let y = 0; y <= canvas.height; y += 64) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
  }

  ctx.restore();
}

function generateSignalCard() {
  const title = resultTitle.textContent.trim();
  const question = questionInput.value.trim() || "Signal question unavailable";
  const forecast = forecastText.textContent.trim();
  const strength = Math.max(18, Math.min(96, parseInt(signalFill.style.width, 10) || 72));

  if (statusPill.textContent !== "ACTIVE") {
    cardBtn.textContent = "Run Signal First";
    setTimeout(() => {
      cardBtn.textContent = "Generate Signal Card";
    }, 1200);
    return;
  }

  const canvas = signalCardCanvas;
  const ctx = canvas.getContext("2d");
  const width = canvas.width;
  const height = canvas.height;

  ctx.clearRect(0, 0, width, height);
  drawCardBackground(ctx, canvas);

  fillRoundRect(ctx, 48, 48, width - 96, height - 96, 36, "rgba(255,255,255,0.06)");
  strokeRoundRect(ctx, 48, 48, width - 96, height - 96, 36, "rgba(255,255,255,0.10)", 2);

  fillRoundRect(ctx, 92, 92, 310, 64, 32, "rgba(124,92,255,0.15)");
  strokeRoundRect(ctx, 92, 92, 310, 64, 32, "rgba(124,92,255,0.42)", 2);

  ctx.fillStyle = "#d9d0ff";
  ctx.font = "700 28px Inter, Arial, sans-serif";
  ctx.fillText("FUTURE SIGNAL", 128, 132);

  fillRoundRect(ctx, 930, 92, 170, 64, 32, "rgba(48,242,163,0.14)");
  strokeRoundRect(ctx, 930, 92, 170, 64, 32, "rgba(48,242,163,0.34)", 2);

  ctx.fillStyle = "#b8ffe0";
  ctx.font = "800 26px Inter, Arial, sans-serif";
  ctx.fillText("ACTIVE", 978, 132);

  ctx.fillStyle = "#f1f5ff";
  ctx.font = "800 74px Inter, Arial, sans-serif";
  let y = drawWrappedText(ctx, title, 92, 255, width - 184, 84, 3);

  y += 24;
  ctx.fillStyle = "#9fb0d9";
  ctx.font = "700 22px Inter, Arial, sans-serif";
  ctx.fillText("QUESTION", 92, y);

  y += 36;
  ctx.fillStyle = "#d5ddf7";
  ctx.font = "500 30px Inter, Arial, sans-serif";
  y = drawWrappedText(ctx, question, 92, y, width - 184, 42, 3);

  y += 34;
  fillRoundRect(ctx, 92, y, width - 184, 560, 28, "rgba(8,16,42,0.72)");
  strokeRoundRect(ctx, 92, y, width - 184, 560, 28, "rgba(255,255,255,0.08)", 2);

  ctx.fillStyle = "#f0f4ff";
  ctx.font = "800 38px Inter, Arial, sans-serif";
  ctx.fillText("Primary Forecast", 132, y + 66);

  ctx.fillStyle = "#d6def8";
  ctx.font = "500 24px Inter, Arial, sans-serif";
  drawWrappedText(ctx, forecast, 132, y + 130, width - 264, 38, 9);

  const meterY = height - 190;

  ctx.fillStyle = "#99a8d7";
  ctx.font = "700 22px Inter, Arial, sans-serif";
  ctx.fillText("SIGNAL STRENGTH", 92, meterY);

  fillRoundRect(ctx, 92, meterY + 28, width - 184, 24, 12, "rgba(255,255,255,0.10)");

  const fillWidth = (width - 184) * (strength / 100);
  const meterGradient = ctx.createLinearGradient(92, 0, 92 + fillWidth, 0);
  meterGradient.addColorStop(0, "#7c5cff");
  meterGradient.addColorStop(0.5, "#22d3ee");
  meterGradient.addColorStop(1, "#30f2a3");
  fillRoundRect(ctx, 92, meterY + 28, fillWidth, 24, 12, meterGradient);

  ctx.fillStyle = "#edf3ff";
  ctx.font = "800 30px Inter, Arial, sans-serif";
  ctx.fillText(`${strength}%`, width - 182, meterY + 8);

  ctx.fillStyle = "#8fa1cf";
  ctx.font = "600 22px Inter, Arial, sans-serif";
  ctx.fillText("future-signal.pages.dev", 92, height - 102);

  cardPreviewWrap.classList.remove("hidden");
  downloadCardBtn.href = signalCardCanvas.toDataURL("image/png");

  cardBtn.textContent = "Card Ready";
  setTimeout(() => {
    cardBtn.textContent = "Generate Signal Card";
  }, 1200);

  cardPreviewWrap.scrollIntoView({ behavior: "smooth", block: "start" });
}

async function shareSignalCard() {
  if (statusPill.textContent !== "ACTIVE") {
    shareCardBtn.textContent = "Run Signal First";
    setTimeout(() => {
      shareCardBtn.textContent = "Share Card";
    }, 1200);
    return;
  }

  if (!downloadCardBtn.href) {
    generateSignalCard();
  }

  try {
    const blob = await new Promise((resolve) => {
      signalCardCanvas.toBlob(resolve, "image/png");
    });

    if (!blob) {
      throw new Error("Card image could not be created.");
    }

    const file = new File([blob], "future-signal-card.png", { type: "image/png" });

    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({
        title: resultTitle.textContent.trim(),
        text: `Future Signal: ${resultTitle.textContent.trim()}`,
        files: [file]
      });
      return;
    }

    shareCardBtn.textContent = "Use Download Below";
    setTimeout(() => {
      shareCardBtn.textContent = "Share Card";
    }, 1600);
  } catch {
    shareCardBtn.textContent = "Share Unavailable";
    setTimeout(() => {
      shareCardBtn.textContent = "Share Card";
    }, 1600);
  }
}

cardBtn.addEventListener("click", generateSignalCard);
shareCardBtn.addEventListener("click", shareSignalCard);

renderHistory();
setIdleState();