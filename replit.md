# Minecraft Anti-AFK Bot

## Overview
A 24/7 Minecraft bot that connects to a Java Edition server and performs random movements to avoid being kicked for AFK.

## Project Structure
- `bot.js` - Main bot logic with random movement and auto-reconnect
- `package.json` - Project dependencies

## Configuration
The bot is pre-configured for:
- **Server:** Nainiwalranvir.aternos.me
- **Port:** 17633
- **Mode:** Offline/Cracked (no Microsoft account needed)

### Environment Variables (Optional)
- `MC_USERNAME` - Custom bot username (default: RandomBot_XXXX)

## Features
- Random movement patterns (walking, jumping, looking around, sneaking)
- Auto-reconnect on disconnect or kick
- Chat monitoring and logging
- Configurable reconnection attempts

## Running the Bot
The bot runs automatically via the "Minecraft Bot" workflow. It will:
1. Connect to the server
2. Perform random movements every 3-8 seconds
3. Auto-reconnect if disconnected

## Recent Changes
- Initial setup (December 2025)
