// ============================================
// DATA
// ============================================
// IMPORTANT: "me" = IKAW (user, yung nagta-type) -> lalabas sa KANAN
//            "them" = si KUPAL (bot) -> lalabas sa KALIWA
// (Baliktad ito sa dati - kaya natin ito inayos)

const botReplyToHello = { sender: "them", text: "Hi, alam mo ba na hindi na 10:00pm ang Meta ngayon?" };

const replyAfterChip = { sender: "them", text: "12:51" };

const autoMessages = [
  "namimiss mo na?",
  "nakahiga ka ngayon",
  "at namimiss mo na :(("
];

// ============================================
// ELEMENTS
// ============================================

const messagesContainer = document.getElementById("chat-messages");
const repliesContainer = document.getElementById("suggested-replies");
const headerStatus = document.getElementById("header-status");
const bgm = document.getElementById("bgm");
const chatInput = document.getElementById("chat-input");
const sendBtn = document.getElementById("send-btn");

// ============================================
// HELPER FUNCTIONS
// ============================================

function scrollToBottom() {
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function addBubble(sender, text) {
  const bubble = document.createElement("div");
  bubble.classList.add("bubble", sender);
  bubble.textContent = text;
  messagesContainer.appendChild(bubble);
  scrollToBottom();
}

function addTimestamp(label) {
  const ts = document.createElement("div");
  ts.classList.add("timestamp-label");
  ts.textContent = label;
  messagesContainer.appendChild(ts);
  scrollToBottom();
}

// BAGO: nagpapakita ng "Seen" text sa ilalim, katulad ng Messenger
function showSeen() {
  const seen = document.createElement("div");
  seen.classList.add("seen-label");
  seen.textContent = "Seen";
  messagesContainer.appendChild(seen);
  scrollToBottom();
}

function showTypingBubble() {
  const typingBubble = document.createElement("div");
  typingBubble.classList.add("bubble", "typing");
  typingBubble.innerHTML = `
    <div class="typing-dot"></div>
    <div class="typing-dot"></div>
    <div class="typing-dot"></div>
  `;
  messagesContainer.appendChild(typingBubble);
  scrollToBottom();
  return typingBubble;
}

function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// bot message + typing animation (side na "them" laging ito, si Kupal)
async function botSendWithTyping(text, typingDuration = 1200) {
  const typingBubble = showTypingBubble();
  await wait(typingDuration);
  typingBubble.remove();
  addBubble("them", text);
}

function showReplyChip(label, onClick) {
  repliesContainer.innerHTML = "";
  const chip = document.createElement("button");
  chip.classList.add("reply-chip");
  chip.textContent = label;
  chip.addEventListener("click", () => {
    repliesContainer.innerHTML = "";
    onClick();
  });
  repliesContainer.appendChild(chip);
}

// ============================================
// INPUT HANDLING - BAGO
// ============================================
// Dito nangyayari yung "totoong chatbot feel": naghihintay ng user input

let awaitingFirstMessage = true; // flag: totoo lang ito bago ma-send yung "hello"

function disableInput() {
  chatInput.disabled = true;
  sendBtn.disabled = true;
}

function enableInput() {
  chatInput.disabled = false;
  sendBtn.disabled = false;
  chatInput.focus();
}

async function handleSend() {
  const text = chatInput.value.trim();
  if (text === "") return; // huwag payagang mag-send ng blangko

  // ipakita yung message ng user sa KANAN (class "me")
  addBubble("me", text);
  chatInput.value = "";

  // kapag ito pa lang yung UNANG message, dito simula yung buong bot flow
  if (awaitingFirstMessage) {
    awaitingFirstMessage = false;
    disableInput(); // habang "kinakausap" ni Kupal, i-disable muna yung typing ng user
    await runBotIntro();
  } else {
    // kahit anong i-type ng user pagkatapos ng intro flow,
    // sasagot si Kupal ng parehong fixed message
    disableInput();
    await wait(600);
    await botSendWithTyping("diba masakit yung maiwan?");
    await wait(500);
    showSeen(); // ipapakita na "nabasa" na ang message
    enableInput();
  }
}

sendBtn.addEventListener("click", handleSend);

// para pwede ring mag-Enter sa keyboard sa halip na i-click yung button
chatInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    handleSend();
  }
});

// ============================================
// MAIN CONVERSATION FLOW
// ============================================

async function runBotIntro() {
  await wait(800);

  // si Kupal (bot) sasagot, may typing animation
  await botSendWithTyping(botReplyToHello.text);

  // ipapakita yung suggested reply chip na "ano na?"
  showReplyChip("ano na?", handleChipClick);
}

// ============================================
// AUDIO-SYNCED MESSAGES
// ============================================
// Bawat entry: sa ilang segundo ng KANTA (audio.currentTime) dapat lumabas.
// "fired" flag para hindi paulit-ulit lumabas yung parehong message.
// NOTE: +5 dagdag sa bawat time kasi nagsisimula na tayo sa 5 sec mark ng audio
// (dating 4,6,10,11 -> naging 9,11,15,16)
const timedMessages = [
  { time: 9,  text: "12:51",                 fired: false },
  { time: 11, text: "namimiss mo na?",        fired: false },
  { time: 15, text: "nakahiga ka ngayon",     fired: false },
  { time: 17, text: "at namimiss mo na? :((", fired: false }
];

let syncInterval = null;

// Chineck natin ang audio.currentTime paulit-ulit (every 200ms)
// Pag umabot na sa target time ang kanta, saka lang lumalabas yung message.
function startAudioSync() {
  syncInterval = setInterval(() => {
    const currentTime = bgm.currentTime;

    for (const msg of timedMessages) {
      if (!msg.fired && currentTime >= msg.time) {
        msg.fired = true;
        botSendWithTyping(msg.text, 900);
      }
    }

    // pag na-trigger na lahat, itigil na yung pag-check (para tumigil yung loop)
    if (timedMessages.every(m => m.fired)) {
      clearInterval(syncInterval);
      enableInput();
    }
  }, 200);
}

async function handleChipClick() {
  // ito yung click ng USER sa chip, kaya "me" side (kanan)
  addBubble("me", "ano na?");
  await wait(800);

  // ============================================
  // 12:51 PART: timestamp switch + tugtog
  // ============================================
  addTimestamp("12:51 AM");
  headerStatus.textContent = "12:51 AM";

  bgm.currentTime = 5; // lalaktawan yung unang 5 seconds, dito na direktang magsisimula
  bgm.play().then(() => {
    // simulan lang ang pag-sync KAPAG talagang tumugtog na ang audio
    startAudioSync();
  }).catch(err => {
    console.log("Hindi awtomatic natugtog ang audio, baka kailangan mag-click muna ang user.", err);
    // fallback: kung na-block ng browser ang autoplay, mag-sync pa rin base sa timer
    startAudioSync();
  });
}

// ============================================
// SIMULA: hintayin lang, walang awtomatikong message
// ============================================
window.addEventListener("DOMContentLoaded", () => {
  chatInput.focus();
});