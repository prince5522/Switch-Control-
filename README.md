# ⚡ Smart Switch

**Smart Switch v1.7**

A modern web-based smart-device control platform designed to provide a simple interface for managing Wi-Fi-connected devices.

**Created by Newton Maina**  
**© 2026 Newton Maina. All rights reserved.**

---

## 📱 About Smart Switch

Smart Switch is a Progressive Web App (PWA) designed for controlling and managing compatible Wi-Fi-connected devices from a phone, tablet, or computer.

The system is designed to connect:

User → Smart Switch → Wi-Fi Network → ESP8266/ESP-01 → Relay → Electrical Device

---

## ✨ Features

### 👤 User Accounts

- Account creation
- Login
- Username
- Phone number
- Permanent online accounts
- User profiles
- Account activation/deactivation

### 🛡️ Administration

Administrators will be able to:

- Manage users
- Edit user information
- Invite users
- Manage device access
- Assign devices
- Transfer device ownership
- View ownership-transfer history

### 🔌 Device Management

Smart Switch is designed to support:

- ESP8266
- ESP-01
- Arduino + ESP-01
- Relay modules
- Compatible Wi-Fi devices

Each device can have:

- Device name
- IP address
- Owner
- Connection status
- Access permissions

### 🎙️ Voice & AI Assistant

The planned AI assistant will help users interact with Smart Switch using natural language and voice commands.

Example commands:

> Turn on the living room light.

> Turn off the bedroom switch.

> How do I connect my ESP8266?

---

## 📲 Progressive Web App

Smart Switch is designed to work as a PWA.

Planned functionality includes:

- Add to Home Screen
- Install as an app
- Service-worker caching
- Responsive mobile design
- Offline-friendly interface

---

## 🔐 Security

Security is an important part of Smart Switch.

The online version is designed to use authenticated accounts and server-side authorization for privileged operations.

Administrator operations such as device ownership transfer should be protected on the server and should not rely only on browser-side JavaScript.

Sensitive credentials such as server/service-role keys must never be placed inside publicly accessible frontend files.

---

## 🌐 System Architecture

```text
                SMART SWITCH
                     │
                     ▼
              ┌─────────────┐
              │   Frontend  │
              │ HTML/CSS/JS │
              └──────┬──────┘
                     │
                     ▼
              ┌─────────────┐
              │   Netlify   │
              │   Hosting   │
              └──────┬──────┘
                     │
                     ▼
              ┌─────────────┐
              │  Supabase   │
              │             │
              │ Accounts    │
              │ Profiles    │
              │ Devices     │
              │ Permissions │
              └──────┬──────┘
                     │
                     ▼
             ESP8266 / ESP-01
                     │
                     ▼
                   Relay
                     │
                     ▼
             Electrical Device
