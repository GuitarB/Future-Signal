const rotatingPrompt = document.getElementById("rotatingPrompt");
const questionInput = document.getElementById("questionInput");
const analyzeBtn = document.getElementById("analyzeBtn");

const resultTitle = document.getElementById("resultTitle");
const forecastText = document.getElementById("forecastText");
const opportunityText = document.getElementById("opportunityText");
const riskText = document.getElementById("riskText");
const nextMoveText = document.getElementById("nextMoveText");
const statusPill = document.getElementById("statusPill");
const signalFill = document.getElementById("signalFill");

const prompts = [
  "What happens if I start a business this year?",
  "What if I completely reinvent my life in the next 90 days?",
  "What if I commit to one powerful habit for a year?",
  "What happens if I turn my idea into a real product?",
  "What if AI transforms my industry faster than expected?",
  "What kind of future am I creating right now?"
];

let promptIndex = 0;

setInterval(() => {
  promptIndex = (promptIndex + 1) % prompts.length;
  rotatingPrompt.textContent = prompts[promptIndex];
}, 3000);

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
  const bonusWords = ["future", "business", "money", "ai", "life", "change", "build", "move", "start"];
  let bonus = 0;

  bonusWords.forEach((word) => {
    if (question.toLowerCase().includes(word)) {
      bonus += 4;
    }
  });

  return Math.min(96, Math.max(18, Math.floor(lengthScore + bonus)));
}

analyzeBtn.addEventListener("click", () => {
  const question = questionInput.value.trim();

  if (!question) {
    resultTitle.textContent = "No signal detected";
    forecastText.textContent = "Type a real question first so the interface has something to analyze.";
    opportunityText.textContent = "Questions with emotional energy, ambition, or uncertainty generate the strongest outputs.";
    riskText.textContent = "A blank input creates no meaningful signal.";
    nextMoveText.textContent = "Enter a bold question and run the analysis again.";
    statusPill.textContent = "EMPTY";
    signalFill.style.width = "8%";
    return;
  }

  const strength = calculateSignalStrength(question);

  statusPill.textContent = "ACTIVE";
  resultTitle.textContent = pickTitle(question);
  forecastText.textContent = buildForecast(question);
  opportunityText.textContent = buildOpportunity(question);
  riskText.textContent = buildRisk(question);
  nextMoveText.textContent = buildNextMove(question);
  signalFill.style.width = `${strength}%`;
});