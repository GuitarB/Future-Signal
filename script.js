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
const bannerUpgradeBtn = document.getElementById("bannerUpgradeBtn");
const premiumBanner = document.getElementById("premiumBanner");
const premiumBannerEyebrow = document.getElementById("premiumBannerEyebrow");
const premiumBannerTitle = document.getElementById("premiumBannerTitle");
const modalUpgradeBtn = document.getElementById("modalUpgradeBtn");
const closeModalBtn = document.getElementById("closeModalBtn");
const limitModal = document.getElementById("limitModal");
const cardPreviewWrap = document.getElementById("cardPreviewWrap");
const signalCardCanvas = document.getElementById("signalCardCanvas");
const clearHistoryBtn = document.getElementById("clearHistoryBtn");
const chipRow = document.getElementById("chipRow");
const refreshChipsBtn = document.getElementById("refreshChipsBtn");
const resultCard = document.getElementById("resultCard");

const premiumEmailInput = document.getElementById("premiumEmailInput");
const checkPremiumBtn = document.getElementById("checkPremiumBtn");
const premiumCheckStatus = document.getElementById("premiumCheckStatus");

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
  { label: "Digital Brand", prompt: "What happens if I build a digital brand in the next 6 months?" },
  { label: "Reinvent Life", prompt: "What if I reinvent my life in the next 90 days?" },
  { label: "Launch Idea", prompt: "What happens if I turn one strong idea into a product this month?" },
  { label: "AI Shift", prompt: "What if AI transforms my industry faster than expected?" },
  { label: "Go All In", prompt: "What happens if I focus on one business for a full year?" },
  { label: "Launch Early", prompt: "What if I launch before I feel fully ready?" },
  { label: "Share Loop", prompt: "What happens if I build something people share naturally?" },
  { label: "Career Shift", prompt: "What if I switch careers this year?" },
  { label: "100 Days", prompt: "What happens if I become consistent for 100 days straight?" },
  { label: "New City", prompt: "What if I move to a new city and start over?" },
  { label: "Subscription", prompt: "What happens if I turn my expertise into a subscription?" },
  { label: "Own Niche", prompt: "What if I go all in on one niche?" },
  { label: "Audience First", prompt: "What happens if I build an audience before the product?" },
  { label: "Daily Content", prompt: "What if I start creating content every day?" },
  { label: "AI Workflow", prompt: "What happens if I use AI to redesign my workflow?" },
  { label: "Ship Now", prompt: "What if I stop overthinking and ship this week?" },
  { label: "Viral App", prompt: "What happens if I build an app people talk about?" },
  { label: "Premium Offer", prompt: "What if I create a premium offer around one skill?" },
  { label: "Personal Brand", prompt: "What happens if I commit to a personal brand for a year?" },
  { label: "Start Over", prompt: "What if I start over and design a better life?" }
];

let promptIndex = 0;
let isAnalyzing = false;
let clearTapCount = 0;
let clearTapTimer = null;
let thinkingInterval = null;

setInterval(() => {
  promptIndex = (promptIndex + 1) % prompts.length;
  rotatingPrompt.textContent = prompts[promptIndex];
}, 12000);

function escapeHtml(text) {
  return String(text)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function shuffle(array) {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function renderRandomChips() {
  const chosen = shuffle(chipPromptPool).slice(0, 4);

  chipRow.innerHTML = chosen
    .map(
      (item) => `
        <button class="chip" data-prompt="${escapeHtml(item.prompt)}">
          ${escapeHtml(item.label)}
        </button>
      `
    )
    .join("");

  chipRow.querySelectorAll(".chip").forEach((button) => {
    button.addEventListener("click", () => {
      questionInput.value = button.dataset.prompt;
      questionInput.focus();
    });
  });
}

refreshChipsBtn.addEventListener("click", () => {
  renderRandomChips();
  refreshChipsBtn.textContent = "Refreshed";
  setTimeout(() => {
    refreshChipsBtn.textContent = "Refresh Chips";
  }, 900);
});

/* ---------------------------
PREMIUM STATE
--------------------------- */

function isPremiumUser() {
  return localStorage.getItem("future_signal_premium") === "true";
}

function setPremiumUser(enabled = true) {
  localStorage.setItem("future_signal_premium", enabled ? "true" : "false");
}

function getPremiumEmail() {
  return localStorage.getItem("future_signal_premium_email") || "";
}

function setPremiumEmail(email) {
  if (email) {
    localStorage.setItem("future_signal_premium_email", email.trim().toLowerCase());
  } else {
    localStorage.removeItem("future_signal_premium_email");
  }
}

function updatePremiumBanner() {
  if (isPremiumUser()) {
    premiumBanner.classList.add("is-active");
    premiumBannerEyebrow.textContent = "⭐ FUTURE SIGNAL PLUS ACTIVE";
    premiumBannerTitle.textContent = getPremiumEmail()
      ? `Premium verified for ${getPremiumEmail()}`
      : "Unlimited signals unlocked on this device.";
    bannerUpgradeBtn.textContent = "Premium Active";
    bannerUpgradeBtn.disabled = true;
  } else {
    premiumBanner.classList.remove("is-active");
    premiumBannerEyebrow.textContent = "FUTURE SIGNAL PLUS";
    premiumBannerTitle.textContent = "Unlimited signals, deeper forecasts, premium access.";
    bannerUpgradeBtn.textContent = "Upgrade";
    bannerUpgradeBtn.disabled = false;
  }
}

function updatePremiumCheckStatus(message = "", tone = "") {
  premiumCheckStatus.textContent = message;
  premiumCheckStatus.classList.remove("is-success", "is-error", "is-loading");

  if (tone) {
    premiumCheckStatus.classList.add(tone);
  }
}

function applyPremiumVerifiedState(email) {
  setPremiumUser(true);
  setPremiumEmail(email);
  premiumEmailInput.value = email;
  updatePremiumBanner();
  updatePremiumCheckStatus(`Premium verified for ${email}`, "is-success");
  setIdleState();
}

function clearPremiumVerifiedState() {
  setPremiumUser(false);
  setPremiumEmail("");
  updatePremiumBanner();
  updatePremiumCheckStatus("No premium email verified on this device yet.");
  setIdleState();
}

async function checkPremiumAccess(email) {
  const response = await fetch("/api/check-premium", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ email })
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || "Premium verification failed.");
  }

  return data;
}

async function handlePremiumCheck() {
  const email = premiumEmailInput.value.trim().toLowerCase();

  if (!email) {
    updatePremiumCheckStatus("Enter the email used during checkout.", "is-error");
    premiumEmailInput.focus();
    return;
  }

  checkPremiumBtn.disabled = true;
  checkPremiumBtn.textContent = "Checking...";
  updatePremiumCheckStatus("Checking premium status...", "is-loading");

  try {
    const data = await checkPremiumAccess(email);

    if (data.premium) {
      applyPremiumVerifiedState(email);

      resultTitle.textContent = "Future Signal Plus Verified";
      forecastText.textContent =
        "Premium access is now verified from your Stripe subscription record. Future Signal Plus is unlocked on this device.";
      opportunityText.textContent =
        "You can now use unlimited signals and keep premium access synced to your verified checkout email.";
      riskText.textContent =
        "This device is now unlocked. Next we can add a smoother account-style sign-in flow if you want an even more polished member experience.";
      nextMoveText.textContent =
        "Run a premium signal now. You are fully unlocked.";
      applyStatusPill("PLUS");
      scanStatus.textContent = "Premium verified via Stripe subscription";
      signalFill.style.width = "100%";
    } else {
      setPremiumUser(false);
      updatePremiumBanner();
      updatePremiumCheckStatus("No active premium subscription was found for that email.", "is-error");
    }
  } catch (error) {
    updatePremiumCheckStatus(
      error instanceof Error ? error.message : "Premium verification failed.",
      "is-error"
    );
  } finally {
    checkPremiumBtn.disabled = false;
    checkPremiumBtn.textContent = "Check Premium";
  }
}

function hydratePremiumEmail() {
  const storedEmail = getPremiumEmail();
  if (storedEmail) {
    premiumEmailInput.value = storedEmail;
    updatePremiumCheckStatus(`Premium verified for ${storedEmail}`, "is-success");
  } else {
    updatePremiumCheckStatus("No premium email verified on this device yet.");
  }
}

function applyStatusPill(state) {
  statusPill.classList.toggle("is-plus", state === "PLUS");

  if (state === "PLUS") {
    statusPill.textContent = "PLUS";
  } else {
    statusPill.textContent = state;
  }
}

function handleCheckoutReturn() {
  const url = new URL(window.location.href);
  const checkoutState = url.searchParams.get("checkout");

  if (checkoutState === "success") {
    resultTitle.textContent = "Checkout Complete";
    forecastText.textContent =
      "Your Stripe checkout finished successfully. To permanently unlock premium on this device, verify the email used for checkout in the Premium Access panel.";
    opportunityText.textContent =
      "Once verified, premium will become device-independent and tied to your actual subscription record.";
    riskText.textContent =
      "Until verification runs, premium may not reflect the true subscription state on this device.";
    nextMoveText.textContent =
      "Enter your checkout email above and tap Check Premium.";
    applyStatusPill("READY");
    scanStatus.textContent = "Checkout complete • Verify premium email to unlock";
    signalFill.style.width = "74%";
  }

  if (checkoutState === "cancel") {
    scanStatus.textContent = isPremiumUser()
      ? "Future Signal Plus active • Unlimited signals"
      : `${remainingUsage()} free signals remaining today`;
  }

  if (checkoutState === "success" || checkoutState === "cancel") {
    url.searchParams.delete("checkout");
    window.history.replaceState({}, "", url.toString());
  }
}

/* ---------------------------
USAGE / LIMIT
--------------------------- */

function getTodayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

function getUsage() {
  const raw = localStorage.getItem("fs_usage");
  if (!raw) return { date: getTodayKey(), count: 0 };

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
  if (isPremiumUser()) return Infinity;
  return Math.max(0, DAILY_LIMIT - getUsage().count);
}

function isLimitReached() {
  if (isPremiumUser()) return false;
  return getUsage().count >= DAILY_LIMIT;
}

function hideUpgradeButton() {
  upgradeBtn.classList.add("hidden");
}

function showUpgradeButton() {
  if (!isPremiumUser()) {
    upgradeBtn.classList.remove("hidden");
  }
}

function hideLimitModal() {
  limitModal.classList.add("hidden");
}

function showLimitModal() {
  if (!isPremiumUser()) {
    limitModal.classList.remove("hidden");
  }
}

function disableActionButtons(disabled) {
  copyBtn.disabled = disabled;
  cardBtn.disabled = disabled;
  shareCardBtn.disabled = disabled;
  downloadCardBtn.style.pointerEvents = disabled ? "none" : "auto";
  downloadCardBtn.style.opacity = disabled ? "0.6" : "1";
}

function setIdleState() {
  resultTitle.textContent = "Awaiting transmission...";
  forecastText.textContent = "Enter a question to generate a speculative future readout.";
  opportunityText.textContent = "Hidden opportunity signals will appear here.";
  riskText.textContent = "Risk patterns will appear here.";
  nextMoveText.textContent = "Strategic next move will appear here.";
  applyStatusPill(isPremiumUser() ? "PLUS" : "IDLE");
  scanStatus.textContent = isPremiumUser()
    ? "Future Signal Plus active • Unlimited signals"
    : `${remainingUsage()} free signals remaining today`;
  signalFill.style.width = isPremiumUser() ? "100%" : "8%";
  cardPreviewWrap.classList.add("hidden");
  downloadCardBtn.removeAttribute("href");
  resultCard.classList.remove("thinking");
  hideUpgradeButton();
  hideLimitModal();
  disableActionButtons(false);
  updatePremiumBanner();
}

function enterThinkingState(question) {
  resultCard.classList.add("thinking");
  hideUpgradeButton();
  hideLimitModal();
  cardPreviewWrap.classList.add("hidden");
  downloadCardBtn.removeAttribute("href");
  disableActionButtons(true);

  resultTitle.textContent = "Signal Incoming...";
  forecastText.textContent = "Scanning possible paths, pressure points, and hidden leverage...";
  opportunityText.textContent = "Mapping upside vectors and identifying momentum shifts...";
  riskText.textContent = "Testing failure patterns, blind spots, and instability zones...";
  nextMoveText.textContent = "Constructing the strongest immediate move from this signal...";
  applyStatusPill("SCANNING");
  signalFill.style.width = "16%";

  const phases = [
    { text: "Scanning decision paths...", width: "22%" },
    { text: "Mapping opportunity zones...", width: "38%" },
    { text: "Detecting risk patterns...", width: "56%" },
    { text: "Modeling next moves...", width: "72%" },
    { text: `Reading signal: ${question.slice(0, 48)}${question.length > 48 ? "..." : ""}`, width: "84%" }
  ];

  let phaseIndex = 0;
  scanStatus.textContent = phases[0].text;
  signalFill.style.width = phases[0].width;

  if (thinkingInterval) clearInterval(thinkingInterval);

  thinkingInterval = setInterval(() => {
    phaseIndex = (phaseIndex + 1) % phases.length;
    scanStatus.textContent = phases[phaseIndex].text;
    signalFill.style.width = phases[phaseIndex].width;
  }, 900);
}

function exitThinkingState() {
  resultCard.classList.remove("thinking");
  if (thinkingInterval) {
    clearInterval(thinkingInterval);
    thinkingInterval = null;
  }
  disableActionButtons(false);
}

function showLimitMessage() {
  resultTitle.textContent = "Daily Signal Limit Reached";
  forecastText.textContent =
    "You have used all free signals for today. Future Signal Plus unlocks unlimited daily signals and uninterrupted access.";
  opportunityText.textContent =
    "Upgrade now to continue exploring scenarios, generating signal cards, and using Future Signal without waiting for tomorrow.";
  riskText.textContent =
    "Free usage resets tomorrow. This is the conversion point for power users.";
  nextMoveText.textContent =
    "Upgrade to Future Signal Plus to continue right now.";
  applyStatusPill("LIMIT");
  scanStatus.textContent = "Daily free usage reached.";
  signalFill.style.width = "100%";
  cardPreviewWrap.classList.add("hidden");
  downloadCardBtn.removeAttribute("href");
  showUpgradeButton();
  showLimitModal();
  exitThinkingState();
}

function showResetMessage() {
  resultTitle.textContent = "Testing Limit Reset";
  forecastText.textContent = "Daily test usage has been reset on this device.";
  opportunityText.textContent = "You can continue testing the free flow, history flow, and Stripe upgrade path.";
  riskText.textContent = "Remove this hidden reset shortcut before launch.";
  nextMoveText.textContent = "Run another signal to continue testing.";
  applyStatusPill(isPremiumUser() ? "PLUS" : "RESET");
  scanStatus.textContent = isPremiumUser()
    ? "Future Signal Plus active • Unlimited signals"
    : `${remainingUsage()} free signals remaining today`;
  signalFill.style.width = isPremiumUser() ? "100%" : "18%";
  cardPreviewWrap.classList.add("hidden");
  downloadCardBtn.removeAttribute("href");
  resultCard.classList.remove("thinking");
  hideUpgradeButton();
  hideLimitModal();
  disableActionButtons(false);
  updatePremiumBanner();
}

/* ---------------------------
HISTORY
--------------------------- */

function getHistory() {
  return JSON.parse(localStorage.getItem("futureSignalHistory") || "[]");
}

function storeHistory(item) {
  const existing = getHistory();
  existing.unshift(item);
  const trimmed = existing.slice(0, 12);
  localStorage.setItem("futureSignalHistory", JSON.stringify(trimmed));
  renderHistory();
}

function loadHistoryItem(index) {
  const items = getHistory();
  const item = items[index];
  if (!item) return;

  questionInput.value = item.question || "";
  resultTitle.textContent = item.title || "Signal Loaded";
  forecastText.textContent = item.forecast || "";
  opportunityText.textContent = item.opportunity || "";
  riskText.textContent = item.risk || "";
  nextMoveText.textContent = item.nextMove || "";
  applyStatusPill(isPremiumUser() ? "PLUS" : "ACTIVE");
  scanStatus.textContent = isPremiumUser()
    ? "Future Signal Plus active • Unlimited signals"
    : `Loaded from history • ${item.time || ""}`;
  signalFill.style.width = `${Math.max(18, Math.min(96, Number(item.strength) || 72))}%`;
  cardPreviewWrap.classList.add("hidden");
  downloadCardBtn.removeAttribute("href");
  hideUpgradeButton();
  hideLimitModal();
  exitThinkingState();

  resultCard.scrollIntoView({ behavior: "smooth", block: "start" });
}

function renderHistory() {
  const items = getHistory();

  if (!items.length) {
    historyList.innerHTML =
      `<div class="history-empty">No saved signals yet. Run an analysis to start building your timeline.</div>`;
    return;
  }

  historyList.innerHTML = items
    .map(
      (item, index) => `
        <button class="history-item" data-index="${index}">
          <div class="history-item-title">${escapeHtml(item.title)}</div>
          <p class="history-item-question">${escapeHtml(item.question)}</p>
          <div class="history-item-meta">
            Signal strength: ${item.strength}% · ${escapeHtml(item.time)}
          </div>
          <div class="history-item-open">Open Signal</div>
        </button>
      `
    )
    .join("");

  historyList.querySelectorAll(".history-item").forEach((button) => {
    button.addEventListener("click", () => {
      loadHistoryItem(Number(button.dataset.index));
    });
  });
}

/* ---------------------------
ANALYSIS
--------------------------- */

async function runAnalysis() {
  if (isLimitReached()) {
    showLimitMessage();
    return;
  }

  const question = questionInput.value.trim();
  if (!question || isAnalyzing) return;

  isAnalyzing = true;
  enterThinkingState(question);
  analyzeBtn.textContent = "Analyzing...";

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

    if (!isPremiumUser()) {
      incrementUsage();
    }

    resultTitle.textContent = data.title || "Signal Acquired";
    forecastText.textContent = data.forecast || "No forecast returned.";
    opportunityText.textContent = data.opportunity || "No opportunity returned.";
    riskText.textContent = data.risk || "No risk returned.";
    nextMoveText.textContent = data.nextMove || "No next move returned.";

    const strength = Math.max(18, Math.min(96, Number(data.strength) || 72));

    applyStatusPill(isPremiumUser() ? "PLUS" : "ACTIVE");
    scanStatus.textContent = isPremiumUser()
      ? "Future Signal Plus active • Unlimited signals"
      : `${remainingUsage()} free signals remaining today`;
    signalFill.style.width = `${strength}%`;

    storeHistory({
      title: resultTitle.textContent,
      question,
      forecast: forecastText.textContent,
      opportunity: opportunityText.textContent,
      risk: riskText.textContent,
      nextMove: nextMoveText.textContent,
      strength,
      time: new Date().toLocaleString()
    });

    renderRandomChips();

    if (!isPremiumUser() && isLimitReached()) {
      scanStatus.textContent = "0 free signals remaining today";
    }
  } catch {
    resultTitle.textContent = "Transmission Error";
    forecastText.textContent = "The signal engine could not complete this readout.";
    opportunityText.textContent = "Check connectivity and try again.";
    riskText.textContent = "Temporary system interruption.";
    nextMoveText.textContent = "Run the signal again in a moment.";
    applyStatusPill("ERROR");
    scanStatus.textContent = "Engine connection failed.";
    signalFill.style.width = "12%";
  } finally {
    exitThinkingState();
    analyzeBtn.textContent = "Analyze Signal";
    isAnalyzing = false;
    updatePremiumBanner();
  }
}

/* ---------------------------
CHECKOUT
--------------------------- */

async function startUpgradeCheckout() {
  try {
    upgradeBtn.textContent = "Redirecting...";
    upgradeBtn.disabled = true;
    modalUpgradeBtn.textContent = "Redirecting...";
    modalUpgradeBtn.disabled = true;
    bannerUpgradeBtn.textContent = "Redirecting...";
    bannerUpgradeBtn.disabled = true;

    const response = await fetch("/create-checkout-session", {
      method: "POST"
    });

    const data = await response.json();

    if (!response.ok || !data.url) {
      throw new Error(data.error || "Failed to create checkout session.");
    }

    window.location.href = data.url;
  } catch {
    upgradeBtn.textContent = "Checkout Failed";
    modalUpgradeBtn.textContent = "Checkout Failed";
    bannerUpgradeBtn.textContent = "Checkout Failed";

    setTimeout(() => {
      upgradeBtn.textContent = "Upgrade to Future Signal Plus";
      upgradeBtn.disabled = false;
      modalUpgradeBtn.textContent = "Upgrade to Future Signal Plus";
      modalUpgradeBtn.disabled = false;
      updatePremiumBanner();
    }, 1600);
  }
}

/* ---------------------------
RESET SHORTCUT
--------------------------- */

function handleClearTapReset() {
  clearTapCount += 1;

  if (clearTapTimer) clearTimeout(clearTapTimer);

  clearTapTimer = setTimeout(() => {
    clearTapCount = 0;
  }, 1200);

  if (clearTapCount >= 3) {
    clearTapCount = 0;
    resetUsage();
    questionInput.value = "";
    showResetMessage();
    return true;
  }

  return false;
}

/* ---------------------------
EVENTS
--------------------------- */

analyzeBtn.addEventListener("click", runAnalysis);

clearBtn.addEventListener("click", () => {
  if (handleClearTapReset()) return;
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

upgradeBtn.addEventListener("click", startUpgradeCheckout);
modalUpgradeBtn.addEventListener("click", startUpgradeCheckout);
bannerUpgradeBtn.addEventListener("click", () => {
  if (!isPremiumUser()) {
    startUpgradeCheckout();
  }
});

closeModalBtn.addEventListener("click", hideLimitModal);

limitModal.addEventListener("click", (event) => {
  if (event.target === limitModal) hideLimitModal();
});

checkPremiumBtn.addEventListener("click", handlePremiumCheck);

premiumEmailInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    event.preventDefault();
    handlePremiumCheck();
  }
});

/* ---------------------------
CARD RENDERING
--------------------------- */

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
      if (lines.length >= maxLines - 1) break;
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

  if (statusPill.textContent !== "ACTIVE" && statusPill.textContent !== "PLUS") {
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

  const activeLabel = isPremiumUser() ? "PLUS" : "ACTIVE";
  fillRoundRect(ctx, 930, 92, 170, 64, 32, isPremiumUser() ? "rgba(255,215,106,0.14)" : "rgba(48,242,163,0.14)");
  strokeRoundRect(ctx, 930, 92, 170, 64, 32, isPremiumUser() ? "rgba(255,215,106,0.34)" : "rgba(48,242,163,0.34)", 2);

  ctx.fillStyle = isPremiumUser() ? "#ffe7a1" : "#b8ffe0";
  ctx.font = "800 26px Inter, Arial, sans-serif";
  ctx.fillText(activeLabel, isPremiumUser() ? 989 : 978, 132);

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
  if (statusPill.textContent !== "ACTIVE" && statusPill.textContent !== "PLUS") {
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

    if (!blob) throw new Error("Card image could not be created.");

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

handleCheckoutReturn();
renderHistory();
renderRandomChips();
hydratePremiumEmail();
setIdleState();
updatePremiumBanner();