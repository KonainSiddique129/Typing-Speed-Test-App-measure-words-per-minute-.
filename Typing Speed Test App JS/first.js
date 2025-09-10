// Typing Speed Test - first.js

// DOM elements
const referenceTextEl = document.getElementById("referenceText");
const typingArea = document.getElementById("typingArea");
const startBtn = document.getElementById("startBtn");
const restartBtn = document.getElementById("restartBtn");
const durationSelect = document.getElementById("durationSelect");

const timeDisplay = document.getElementById("timeDisplay");
const wpmDisplay = document.getElementById("wpmDisplay");
const accuracyDisplay = document.getElementById("accuracyDisplay");
const charsDisplay = document.getElementById("charsDisplay");

const resultsBox = document.getElementById("results");
const finalWPM = document.getElementById("finalWPM");
const finalAcc = document.getElementById("finalAcc");
const finalChars = document.getElementById("finalChars");
const bestWPMSpan = document.getElementById("bestWPM");

// Sample reference paragraphs (you can add more)
const samples = [
  "The quick brown fox jumps over the lazy dog.",
  "Practice typing every day to improve speed and accuracy. Focus on consistency rather than short bursts.",
  "Coding is like learning a language; the more you practice, the more fluent you become.",
  "Small daily improvements lead to significant gains over time."
];

// State
let timer = null;
let timeLeft = 60;
let testDuration = 60;
let started = false;
let startTime = null;
let typedChars = 0;
let correctChars = 0;

// Load best WPM from storage
let bestWPM = parseFloat(localStorage.getItem("bestWPM")) || 0;
bestWPMSpan.textContent = Math.round(bestWPM);

// Utility: pick random sample and display
function loadSample() {
  const idx = Math.floor(Math.random() * samples.length);
  referenceTextEl.textContent = samples[idx];
}
loadSample();

// Reset state and UI
function resetTest() {
  clearInterval(timer);
  started = false;
  startTime = null;
  typedChars = 0;
  correctChars = 0;
  testDuration = parseInt(durationSelect.value, 10);
  timeLeft = testDuration;
  typingArea.value = "";
  typingArea.disabled = true;
  timeDisplay.textContent = timeLeft;
  wpmDisplay.textContent = 0;
  accuracyDisplay.textContent = "0%";
  charsDisplay.textContent = 0;
  resultsBox.classList.add("hidden");
  loadSample();
}

// Start the test (enables textarea and timer)
function startTest() {
  resetTest();
  typingArea.disabled = false;
  typingArea.focus();
  // start on first keystroke to make it natural
  started = false; // not counting until first input
  startBtn.disabled = true;
}

// When user types: start timer at first key and update stats live
typingArea.addEventListener("input", (e) => {
  if (typingArea.disabled) return;

  // start timer on first real input
  if (!started) {
    started = true;
    startTime = Date.now();
    timeLeft = testDuration;
    timeDisplay.textContent = timeLeft;
    timer = setInterval(tick, 1000);
  }

  // update typed chars
  const typed = typingArea.value;
  typedChars = typed.length;

  // compute correct chars by comparing with reference text char-by-char
  const ref = referenceTextEl.textContent;
  correctChars = 0;
  for (let i = 0; i < typed.length; i++) {
    if (i < ref.length && typed[i] === ref[i]) correctChars++;
  }

  updateLiveDisplays();
});

// Timer tick (every second)
function tick() {
  timeLeft--;
  timeDisplay.textContent = timeLeft;
  if (timeLeft <= 0) {
    finishTest();
  }
  // update WPM/accuracy live as time passes
  updateLiveDisplays();
}

// Update live WPM, accuracy, chars
function updateLiveDisplays() {
  // minutes elapsed
  const elapsedMs = (Date.now() - (startTime || Date.now()));
  const elapsedMin = Math.max(( (testDuration - timeLeft) / 60 ), 0.000001); // avoid divide by zero

  // WPM uses correct characters: words = chars/5
  const words = correctChars / 5;
  const wpm = Math.round(words / elapsedMin);
  const accuracy = typedChars > 0 ? ((correctChars / typedChars) * 100) : 0;

  wpmDisplay.textContent = isFinite(wpm) ? wpm : 0;
  accuracyDisplay.textContent = `${Math.round(accuracy)}%`;
  charsDisplay.textContent = typedChars;
}

// Finish test and show results
function finishTest() {
  clearInterval(timer);
  typingArea.disabled = true;
  startBtn.disabled = false;

  // final calculations
  const totalSeconds = testDuration;
  const minutes = totalSeconds / 60;
  const finalWords = correctChars / 5;
  const finalWPMval = Math.round(finalWords / minutes);
  const finalAccuracyVal = typedChars > 0 ? Math.round((correctChars / typedChars) * 100) : 0;

  finalWPM.textContent = isFinite(finalWPMval) ? finalWPMval : 0;
  finalAcc.textContent = `${finalAccuracyVal}%`;
  finalChars.textContent = typedChars;

  // update best WPM
  if (finalWPMval > bestWPM) {
    bestWPM = finalWPMval;
    localStorage.setItem("bestWPM", bestWPM);
  }
  bestWPMSpan.textContent = Math.round(bestWPM);

  // show results box
  resultsBox.classList.remove("hidden");

  // update live displays to final values
  wpmDisplay.textContent = finalWPMval;
  accuracyDisplay.textContent = `${finalAccuracyVal}%`;
}

// Restart button
restartBtn.addEventListener("click", () => {
  startBtn.disabled = false;
  resetTest();
});

// Start button click
startBtn.addEventListener("click", () => {
  startTest();
});

// ensure initial state
resetTest();
