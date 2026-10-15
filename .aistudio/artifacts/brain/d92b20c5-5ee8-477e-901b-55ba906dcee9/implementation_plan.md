# Voice Navigation & Command Control via Web Speech API

Implement hands-free voice command support powered by the standard browser Web Speech API (`webkitSpeechRecognition` / `SpeechRecognition` and `window.speechSynthesis`) to navigate sidebar modules and trigger essential operational shortcuts.

---

## User Review & Critical Decisions

> [!IMPORTANT]
> The following user preferences were confirmed during the planning phase:
> - **Activation Method**: Dedicated microphone activation buttons placed in both the Sidebar and the Topbar, with real-time listening state indicators (pulsing ring, audio wave animation).
> - **Confirmation Feedback**: Clean visual toast notification displaying the transcribed speech and recognized command, paired with optional spoken voice confirmation using browser speech synthesis.
> - **Command Scope**: All 8 sidebar tabs (Dashboard, Rooms, Customers, New Booking, Billing & Checkout, Auxiliary Services, Reports, and AI Suite) plus operational quick actions (Toggle Dark Mode, Open New Reservation modal, and Sign Out).

---

## 1. Overview & Core Concept

- **What It Does**: Hotel staff and managers can use natural spoken English commands (e.g., *"go to dashboard"*, *"open rooms"*, *"view customers"*, *"show billing"*, *"switch to dark mode"*, *"create reservation"*) to effortlessly navigate the application without having to click or leave their current workflow.
- **Target Audience / Persona**: Hotel front-desk clerks, general managers, and night auditors multitasking between guest interactions, phone calls, and terminal operations.
- **Key Value**: Drastically speeds up tab switching and operational workflows by allowing hands-free navigation while entering guest data or attending to guests at the front desk.

---

## 2. User Experience & Visual Design

### Key User Flows

1. **Triggering Voice Command Mode**:
   - The user clicks the microphone button located either in the Topbar header (next to the AI Suite and Dark Mode toggles) or at the bottom of the Sidebar navigation.
   - The microphone transitions from idle slate to an active emerald/purple pulsing state with an animated audio waveform badge.
   - An on-screen listening banner/overlay indicates: *"Listening... Speak a command (e.g. 'Go to Dashboard', 'Open Rooms', 'Toggle Dark Mode')"*.

2. **Spoken Command Processing**:
   - As the user speaks, real-time interim speech transcripts appear in the toast banner.
   - Upon pause/final transcript recognition, the voice controller analyzes the phrase against command intents with fuzzy alias matching.

3. **Execution & Feedback**:
   - If recognized, the app instantly switches to the designated tab or toggles the target action (e.g., switches to Dark Mode or opens New Reservation).
   - An audible chime / spoken response confirms: *"Opening Room Inventory"* or *"Switched to Dark Mode"*.
   - A crisp toast shows the recognized transcript: *"Voice Command: 'open room management' → Rooms View"*.
   - If unrecognized, a helpful feedback toast displays: *"Command not recognized: '...' — Try saying 'go to billing' or 'toggle theme'"*.

### Visual Identity & Theme Alignment

- **Aesthetic Direction**: Retains the Grand Horizon luxury resort aesthetic with refined dark-slate surfaces, glassmorphic accents, and sharp typography.
- **Listening State Styling**:
  - Idle state: Subtle button with `fa-microphone` icon and tooltip *"Start Voice Navigation"*.
  - Active listening: Glowing border with breathing ring (`animate-ping` / `animate-pulse`), emerald/cyan audio bars, and active indicator dot.
- **Voice Guide Modal / Helper Drawer**:
  - Clicking a small help icon or saying *"what can I say"* opens a cheat-sheet modal listing all recognized phrases grouped by category.

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: Native Web Speech API vs. External Cloud STT**
  - *Chosen Approach*: Native browser `SpeechRecognition` / `webkitSpeechRecognition` coupled with `window.speechSynthesis`.
  - *Why*: Zero network latency, instant recognition, zero API billing cost, works offline, and requires no external keys or backend audio streaming infrastructure.
  - *Alternatives Considered*: Cloud STT (Whisper or Gemini Live Audio). While already configured in the separate AI Concierge tab for complex conversational queries, using cloud audio streaming for simple tab navigation would introduce perceptible network delay and unnecessary token consumption.

- **Decision 2: Resilient Natural Language Intent Matcher**
  - *Chosen Approach*: Regex and token-based intent matching with broad synonyms and conversational filler filtering (e.g., ignoring *"please"*, *"can you"*, *"navigate to"*, *"switch to"*, *"open"*, *"show"*).
  - *Why*: Accommodates diverse user phrasing naturally (e.g., *"take me to bookings"*, *"open reservations"*, *"let me see the guest list"*, *"go to rooms"*).

- **Decision 3: Voice Feedback Toggle**
  - *Chosen Approach*: Visual toast notifications are always displayed, with an option in the voice banner to mute/unmute spoken voice responses.
  - *Why*: Avoids disruptive audio in quiet lobby environments while offering audible confirmation when the user is looking away.

---

## 4. Technical Architecture & Data Strategy

### System Component Architecture

```
┌────────────────────────────────────────────────────────┐
│                      App Container                     │
│  - Active Tab State ('dashboard' | 'rooms' | ...)      │
│  - Dark Mode State                                     │
│  - New Booking Modal State                             │
└───────────────▲────────────────────────▲───────────────┘
                │                        │
       State Dispatches          Voice Event Callbacks
                │                        │
┌───────────────┴────────────────────────┴───────────────┐
│               useVoiceNavigation Hook                  │
│  - SpeechRecognition Lifecycle (start / stop / error)  │
│  - Web Speech API feature detection                    │
│  - Natural Language Intent Parser                      │
│  - SpeechSynthesis Audio Feedback Engine               │
│  - Live Transcript & Recognized Command State          │
└───────────────▲────────────────────────▲───────────────┘
                │                        │
        Microphone Toggle        Microphone Toggle
                │                        │
┌───────────────┴──────────┐   ┌─────────┴───────────────┐
│       Sidebar.tsx        │   │       Topbar.tsx        │
│  - Sidebar Mic Button    │   │  - Header Mic Button    │
│  - Voice Status Pill     │   │  - Voice Activity Ring  │
└──────────────────────────┘   └─────────────────────────┘
```

### Voice Command Routing Matrix

| Intent Category | Spoken Phrase Samples | Action Performed | Spoken Feedback |
| :--- | :--- | :--- | :--- |
| **Dashboard** | *"go to dashboard"*, *"show overview"*, *"main screen"* | `onSelectTab('dashboard')` | *"Navigating to Dashboard"* |
| **Rooms** | *"open rooms"*, *"room management"*, *"inventory"*, *"show suites"* | `onSelectTab('rooms')` | *"Opening Room Inventory"* |
| **Customers** | *"view customers"*, *"guest directory"*, *"open client list"* | `onSelectTab('customers')` | *"Opening Guest Directory"* |
| **New Booking** | *"new reservation"*, *"create booking"*, *"book a room"* | `onSelectTab('booking')` / open modal | *"Opening Reservation Desk"* |
| **Billing** | *"checkout and billing"*, *"open invoices"*, *"settle bill"* | `onSelectTab('billing')` | *"Opening Checkout and Billing"* |
| **Services** | *"auxiliary services"*, *"room service catalog"*, *"amenities"* | `onSelectTab('services')` | *"Opening Auxiliary Services"* |
| **Reports** | *"view reports"*, *"analytics"*, *"daily revenue report"* | `onSelectTab('reports')` | *"Opening Reports and Analytics"* |
| **AI Concierge** | *"open ai concierge"*, *"launch ai assistant"*, *"gemini"* | `onSelectTab('ai-concierge')` | *"Opening AI Concierge Suite"* |
| **Dark Mode** | *"toggle dark mode"*, *"light mode"*, *"switch theme"* | `onToggleDarkMode()` | *"Theme switched"* |
| **Sign Out** | *"sign out"*, *"log out"* | `onLogout()` | *"Signing out"* |

### Verification & Fallbacks
- Verify browser support for `window.SpeechRecognition` and `window.webkitSpeechRecognition`.
- If permission is denied or microphone is unavailable, display a user-friendly instruction banner explaining how to enable microphone permissions in browser settings.
