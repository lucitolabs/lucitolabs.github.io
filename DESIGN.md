# Lucito Labs site design

## Overview
Direction "Kulak Studio": a dark studio page lit by the brand's purple glow, opened by the same "Kulak" splash the apps play. One screen on desktop (100dvh), one short scroll on phones. The studio speaks in big Sora type ("Small games with a beat."), the game speaks through motion: a phone playing orbit, run and hop in turn.

- Mode: Persuade (studio + one game, store and social links, contact)
- Signature: the splash, a yellow dot pulsing at 128 BPM after the headline, the mode ticker beside the phone
- Avoid: stock gradients, glassy card grids, emoji, fake metrics, any claim not in the store listing

## Direction contract
Locked 2026-11-23 (user picked draft A, with icons, socials top right with icons, trailer in a full-page dialog, official Google Play badge).

## Colors
| Token | Value | Use |
|---|---|---|
| `--bg` | #0a0d1a | page, splash, video letterbox (same as the game's boot color) |
| `--ink` | #e8e6f5 | text, primary button |
| `--muted` | #8b88a8 | secondary text |
| `--line` | rgba(232,230,245,.12) | borders |
| `--purple` | #6c5ce7 | logo tile, glow |
| `--lavender` | #a29bfe | "labs", headline accent, focus ring |
| `--yellow` | #ffd14c | Tempo Dash accent: beat dot, active mode |

## Type
- Sora (OFL), 400-700: everything; headline 700, letter-spacing -0.055em
- JetBrains Mono (OFL), 400: uppercase captions and labels, 12px, letter-spacing .08em

## Components
- Store: official "Get it on Google Play" badge, unmodified (padding cropped only), 56px tall; App Store shown as a text chip until the iOS release
- Buttons: pill, 48px min height; ghost variant with a 1px line border
- Icons: Simple Icons (CC0) for YouTube, TikTok, Instagram; play, mail and close are drawn inline (24 grid, 2px stroke)
- Trailer: `<dialog>` full page, youtube-nocookie iframe created on open and removed on close

## Devices
| Class | Layout |
|---|---|
| compact (<820) | header (logo + social icons), phone first, copy, game card, footer; page scrolls |
| medium (820-1199) | two columns, phone narrower |
| large (1200+) | two columns, 100dvh, phone 330px |

Pointer devices get hover lifts; touch gets the same states on `:active`. `prefers-reduced-motion` skips to the splash's held frame for 1 s, stops the reel and the beat dot.
