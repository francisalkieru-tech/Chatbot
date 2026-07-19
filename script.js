const botReplyToHello = { sender: "them", text: "Hi, alam mo ba na hindi na 10:00pm ang Meta ngayon?" };

const replyAfterChip = { sender: "them", text: "12:51" };

const autoMessages = [
  "namimiss mo na?",
  "nakahiga ka ngayon",
  "at namimiss mo na :(("
];

const messagesContainer = document.getElementById("chat-messages");
const repliesContainer = document.getElementById("suggested-replies");
const headerStatus = document.getElementById("header-status");
const bgm = document.getElementById("bgm");
const chatInput = document.getElementById("chat-input");
const sendBtn = document.getElementById("send-btn");

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

let awaitingFirstMessage = true; 
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
  if (text === "") return; 

  addBubble("me", text);
  chatInput.value = "";

  if (awaitingFirstMessage) {
    awaitingFirstMessage = false;
    disableInput(); 
    await runBotIntro();
  } else {
    disableInput();
    await wait(600);
    await botSendWithTyping("diba masakit yung maiwan?");
    await wait(500);
    showSeen(); 
    enableInput();
  }
}

sendBtn.addEventListener("click", handleSend);

chatInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    handleSend();
  }
});


async function runBotIntro() {
  await wait(800);

  await botSendWithTyping(botReplyToHello.text);

  showReplyChip("ano na?", handleChipClick);
}


const timedMessages = [
  { time: 9,  text: "12:51",                 fired: false },
  { time: 11, text: "namimiss mo na?",        fired: false },
  { time: 15, text: "nakahiga ka ngayon",     fired: false },
  { time: 17, text: "at namimiss mo na? :((", fired: false }
];

let syncInterval = null;

function startAudioSync() {
  syncInterval = setInterval(() => {
    const currentTime = bgm.currentTime;

    for (const msg of timedMessages) {
      if (!msg.fired && currentTime >= msg.time) {
        msg.fired = true;
        botSendWithTyping(msg.text, 900);
      }
    }

    if (timedMessages.every(m => m.fired)) {
      clearInterval(syncInterval);
      enableInput();
    }
  }, 200);
}

async function handleChipClick() {
  addBubble("me", "ano na?");
  await wait(800);

  addTimestamp("12:51 AM");
  headerStatus.textContent = "12:51 AM";

  bgm.currentTime = 5; 
  bgm.play().then(() => {
    startAudioSync();
  }).catch(err => {
    console.log("Audio didn't play automatically, the user may need to click first.", err);
    startAudioSync();
  });
}
window.addEventListener("DOMContentLoaded", () => {
  chatInput.focus();
});