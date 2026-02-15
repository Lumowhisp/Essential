# Essential
# Pause

A moment before action.

Pause is a minimal cycle-awareness app designed for calm, glanceable understanding.
No clutter. No noise. No unnecessary choices.

Built for the Nothing Essential Playground.

---

## What it does

Pause helps users quickly understand their menstrual cycle.

- Select the **last period start date**
- Set the **average cycle length**
- Instantly see:
  - **Next period date**
  - **Fertile window**
  - **Days left** (auto-updates at midnight)

Everything happens on-device.

---

## Design philosophy

- **Minimal**
  Only essential information is shown.

- **Glance-first**
  Feels like a widget, behaves like an app.

- **Calm & neutral**
  No alerts, no panic language, no overconfidence.

- **Nothing-style**
  Dot-matrix visuals, dark UI, quiet motion.

---

## Tech stack

- React Native
- Expo
- Single `App.tsx`
- No backend
- No external services

---

## Logic

- Cycle prediction based on user input
- Ovulation estimated as 14 days before next period
- Fertile window calculated as:
  - 5 days before ovulation
  - 1 day after ovulation
- Smart midnight timer updates day counts automatically if app remains open

---

## Privacy

- No login
- No analytics
- No tracking
- No cloud sync

Your data never leaves the device.

---

## Limitations

Pause is not a medical app.

- No background notifications
- No hormone tracking
- No medical diagnosis

It informs, not advises.

---

## Status

Production-ready for Essential Playground submission.

Future scope (optional):
- Native home-screen widget
- Local persistence
- Platform-specific optimizations

---

## Closing note

Pause exists to create space —
between information and action.

Nothing more.