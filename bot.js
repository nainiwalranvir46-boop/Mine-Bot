const mineflayer = require('mineflayer');

const BOT_CONFIG = {
  host: ' Ranvir-uNWL.aternos.me',
  port: 29832,
  username: process.env.MC_USERNAME || 'RandomBot_' + Math.floor(Math.random() * 10000),
  version: false,
  auth: 'offline'
};

let bot = null;
let reconnectAttempts = 0;
let isReconnecting = false;
let movementTimer = null;
const MAX_RECONNECT_ATTEMPTS = 5;
const RECONNECT_DELAY = 30000;

function cleanupBot() {
  if (movementTimer) {
    clearTimeout(movementTimer);
    movementTimer = null;
  }
  if (bot) {
    bot.removeAllListeners();
    bot = null;
  }
}

function createBot() {
  cleanupBot();
  isReconnecting = false;
  
  console.log(`[INFO] Connecting to ${BOT_CONFIG.host}:${BOT_CONFIG.port}...`);
  console.log(`[INFO] Username: ${BOT_CONFIG.username}`);
  
  try {
    bot = mineflayer.createBot(BOT_CONFIG);
  } catch (err) {
    console.log(`[ERROR] Failed to create bot: ${err.message}`);
    scheduleReconnect();
    return;
  }
  
  bot.once('spawn', () => {
    console.log('[SUCCESS] Bot spawned in the world!');
    reconnectAttempts = 0;
    startRandomMovement();
  });
  
  bot.on('chat', (username, message) => {
    if (bot && username !== bot.username) {
      console.log(`[CHAT] <${username}> ${message}`);
    }
  });
  
  bot.on('whisper', (username, message) => {
    console.log(`[WHISPER] <${username}> ${message}`);
  });
  
  bot.on('kicked', (reason) => {
    let reasonText = reason;
    if (typeof reason === 'object') {
      reasonText = JSON.stringify(reason);
    }
    console.log(`[KICKED] Bot was kicked: ${reasonText}`);
    scheduleReconnect();
  });
  
  bot.on('error', (err) => {
    console.log(`[ERROR] ${err.message}`);
    scheduleReconnect();
  });
  
  bot.on('end', (reason) => {
    console.log(`[DISCONNECTED] Connection ended: ${reason}`);
    scheduleReconnect();
  });
}

function scheduleReconnect() {
  if (isReconnecting) return;
  isReconnecting = true;
  
  cleanupBot();
  
  if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
    console.log('[WARN] Max reconnect attempts reached. Waiting 2 minutes before resetting...');
    setTimeout(() => {
      reconnectAttempts = 0;
      isReconnecting = false;
      createBot();
    }, 120000);
    return;
  }
  
  reconnectAttempts++;
  console.log(`[INFO] Attempting to reconnect (${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS}) in ${RECONNECT_DELAY/1000} seconds...`);
  
  setTimeout(() => {
    isReconnecting = false;
    createBot();
  }, RECONNECT_DELAY);
}

function startRandomMovement() {
  const actions = ['forward', 'back', 'left', 'right', 'jump', 'look', 'sneak', 'idle'];
  
  function performRandomAction() {
    if (!bot || !bot.entity) {
      return;
    }
    
    const action = actions[Math.floor(Math.random() * actions.length)];
    const duration = Math.floor(Math.random() * 2000) + 500;
    
    try {
      bot.clearControlStates();
      
      switch (action) {
        case 'forward':
          console.log('[MOVE] Walking forward');
          bot.setControlState('forward', true);
          setTimeout(() => {
            if (bot && bot.entity) bot.setControlState('forward', false);
          }, duration);
          break;
          
        case 'back':
          console.log('[MOVE] Walking backward');
          bot.setControlState('back', true);
          setTimeout(() => {
            if (bot && bot.entity) bot.setControlState('back', false);
          }, duration);
          break;
          
        case 'left':
          console.log('[MOVE] Walking left');
          bot.setControlState('left', true);
          setTimeout(() => {
            if (bot && bot.entity) bot.setControlState('left', false);
          }, duration);
          break;
          
        case 'right':
          console.log('[MOVE] Walking right');
          bot.setControlState('right', true);
          setTimeout(() => {
            if (bot && bot.entity) bot.setControlState('right', false);
          }, duration);
          break;
          
        case 'jump':
          console.log('[MOVE] Jumping');
          bot.setControlState('jump', true);
          setTimeout(() => {
            if (bot && bot.entity) bot.setControlState('jump', false);
          }, 300);
          break;
          
        case 'look':
          const yaw = (Math.random() * Math.PI * 2) - Math.PI;
          const pitch = (Math.random() * Math.PI) - (Math.PI / 2);
          console.log('[MOVE] Looking around');
          bot.look(yaw, pitch, false);
          break;
          
        case 'sneak':
          console.log('[MOVE] Sneaking');
          bot.setControlState('sneak', true);
          bot.setControlState('forward', true);
          setTimeout(() => {
            if (bot && bot.entity) {
              bot.setControlState('sneak', false);
              bot.setControlState('forward', false);
            }
          }, duration);
          break;
          
        case 'idle':
          console.log('[MOVE] Staying idle briefly');
          break;
      }
    } catch (err) {
      console.log(`[MOVE ERROR] ${err.message}`);
    }
    
    const nextActionDelay = Math.floor(Math.random() * 5000) + 3000;
    movementTimer = setTimeout(performRandomAction, nextActionDelay);
  }
  
  console.log('[INFO] Starting random movement pattern...');
  performRandomAction();
}

console.log('='.repeat(50));
console.log('  MINECRAFT ANTI-AFK BOT');
console.log('='.repeat(50));
console.log(`  Server: ${BOT_CONFIG.host}:${BOT_CONFIG.port}`);
console.log(`  Mode: Offline/Cracked (no Microsoft login required)`);
console.log('='.repeat(50));

createBot();
