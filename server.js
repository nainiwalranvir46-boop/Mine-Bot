const express = require('express');
const path = require('path');
const mineflayer = require('mineflayer');

const app = express();
const PORT = 5000;

const BOT_CONFIG = {
  host: ' Ranvir-uNWL.aternos.me',
  port: 29832,
  username: process.env.MC_USERNAME || 'RandomBot_' + Math.floor(Math.random() * 10000),
  version: false,
  auth: 'offline'
};

let bot = null;
let botStatus = {
  connected: false,
  serverOnline: false,
  username: BOT_CONFIG.username,
  serverAddress: `${BOT_CONFIG.host}:${BOT_CONFIG.port}`,
  lastAction: 'Starting...',
  logs: [],
  reconnectAttempts: 0
};

let isReconnecting = false;
let movementTimer = null;
const MAX_RECONNECT_ATTEMPTS = 5;
const RECONNECT_DELAY = 30000;

function addLog(message) {
  const timestamp = new Date().toLocaleTimeString();
  botStatus.logs.unshift({ time: timestamp, message });
  if (botStatus.logs.length > 50) {
    botStatus.logs.pop();
  }
  console.log(`[${timestamp}] ${message}`);
}

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
  botStatus.connected = false;
  botStatus.lastAction = 'Connecting...';
  
  addLog(`Connecting to ${BOT_CONFIG.host}:${BOT_CONFIG.port}...`);
  
  try {
    bot = mineflayer.createBot(BOT_CONFIG);
  } catch (err) {
    addLog(`Failed to create bot: ${err.message}`);
    botStatus.serverOnline = false;
    scheduleReconnect();
    return;
  }
  
  bot.once('spawn', () => {
    addLog('Bot spawned in the world!');
    botStatus.connected = true;
    botStatus.serverOnline = true;
    botStatus.reconnectAttempts = 0;
    botStatus.lastAction = 'Connected and moving';
    startRandomMovement();
  });
  
  bot.on('chat', (username, message) => {
    if (bot && username !== bot.username) {
      addLog(`Chat: <${username}> ${message}`);
    }
  });
  
  bot.on('kicked', (reason) => {
    let reasonText = reason;
    if (typeof reason === 'object') {
      reasonText = JSON.stringify(reason);
    }
    addLog(`Bot was kicked: ${reasonText}`);
    botStatus.connected = false;
    botStatus.lastAction = 'Kicked from server';
    scheduleReconnect();
  });
  
  bot.on('error', (err) => {
    addLog(`Error: ${err.message}`);
    botStatus.connected = false;
    botStatus.serverOnline = false;
    botStatus.lastAction = 'Connection error';
    scheduleReconnect();
  });
  
  bot.on('end', (reason) => {
    addLog(`Disconnected: ${reason}`);
    botStatus.connected = false;
    botStatus.lastAction = 'Disconnected';
    scheduleReconnect();
  });
}

function scheduleReconnect() {
  if (isReconnecting) return;
  isReconnecting = true;
  
  cleanupBot();
  
  if (botStatus.reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
    addLog('Max reconnect attempts reached. Waiting 2 minutes...');
    botStatus.lastAction = 'Waiting to retry (2 min)';
    setTimeout(() => {
      botStatus.reconnectAttempts = 0;
      isReconnecting = false;
      createBot();
    }, 120000);
    return;
  }
  
  botStatus.reconnectAttempts++;
  addLog(`Reconnecting (${botStatus.reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS}) in 30 seconds...`);
  botStatus.lastAction = `Reconnecting in 30s (${botStatus.reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS})`;
  
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
          botStatus.lastAction = 'Walking forward';
          bot.setControlState('forward', true);
          setTimeout(() => {
            if (bot && bot.entity) bot.setControlState('forward', false);
          }, duration);
          break;
          
        case 'back':
          botStatus.lastAction = 'Walking backward';
          bot.setControlState('back', true);
          setTimeout(() => {
            if (bot && bot.entity) bot.setControlState('back', false);
          }, duration);
          break;
          
        case 'left':
          botStatus.lastAction = 'Walking left';
          bot.setControlState('left', true);
          setTimeout(() => {
            if (bot && bot.entity) bot.setControlState('left', false);
          }, duration);
          break;
          
        case 'right':
          botStatus.lastAction = 'Walking right';
          bot.setControlState('right', true);
          setTimeout(() => {
            if (bot && bot.entity) bot.setControlState('right', false);
          }, duration);
          break;
          
        case 'jump':
          botStatus.lastAction = 'Jumping';
          bot.setControlState('jump', true);
          setTimeout(() => {
            if (bot && bot.entity) bot.setControlState('jump', false);
          }, 300);
          break;
          
        case 'look':
          const yaw = (Math.random() * Math.PI * 2) - Math.PI;
          const pitch = (Math.random() * Math.PI) - (Math.PI / 2);
          botStatus.lastAction = 'Looking around';
          bot.look(yaw, pitch, false);
          break;
          
        case 'sneak':
          botStatus.lastAction = 'Sneaking';
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
          botStatus.lastAction = 'Idle';
          break;
      }
    } catch (err) {
      addLog(`Movement error: ${err.message}`);
    }
    
    const nextActionDelay = Math.floor(Math.random() * 5000) + 3000;
    movementTimer = setTimeout(performRandomAction, nextActionDelay);
  }
  
  addLog('Starting random movement pattern...');
  performRandomAction();
}

app.use(express.static('public'));

app.get('/api/status', (req, res) => {
  res.json(botStatus);
});

app.get('/api/restart', (req, res) => {
  addLog('Manual restart requested');
  botStatus.reconnectAttempts = 0;
  isReconnecting = false;
  createBot();
  res.json({ success: true, message: 'Bot restarting...' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Dashboard running at http://0.0.0.0:${PORT}`);
  createBot();
});
