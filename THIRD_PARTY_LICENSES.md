# Third-party licenses

Visual and 3D assets in the public portfolio are adapted from MIT-licensed open source. Personal names, photographs, copy, email addresses, social links, and projects from those authors are not included.

## Naresh Khatri — 3d-portfolio

- Source: https://github.com/Naresh-Khatri/3d-portfolio
- License: MIT
- Copyright (c) 2026 Naresh Khatri
- Used for: `public/assets/keyboard/keycaps.glb`, `public/assets/keyboard/bongo-frames.glb`, `public/assets/keycap-sounds/press.mp3`, `public/assets/keycap-sounds/release.mp3`, `public/fonts/helvetiker_regular.typeface.json` (the typeface `@chibi3d/runtime` loads for 3D labels), and the keyboard scene runtime under `src/components/portfolio/keyboard/`.
- The repo ships only those two key samples. Playback uses his gain of 0.4. A small per-key playback rate and a compressor were added so several keys at once do not clip.
- The bongo-cat frames stay in the scene graph so the original model contract still loads. They are not shown.

## Henry Heffernan — portfolio-website

- Source: https://github.com/henryjeff/portfolio-website
- License: MIT (`LICENSE.md` in that repository; Copyright 2024 Henry Heffernan)
- Used for: `public/models/study/*` (computer, decor, and environment models with baked lightmaps) and the interaction audio under `public/audio/desk/`.
- Audio copied from `static/audio/` in that MIT repo: `atmosphere/office.mp3` (re-encoded to mono 80 kbps), `startup/startup.mp3` (re-encoded to 96 kbps), `mouse/mouse_down.mp3`, `mouse/mouse_up.mp3`, `keyboard/key_1.mp3`–`key_6.mp3`, and `cc/type.mp3`. The short click and key files are the original bytes. Triggers follow `AudioSources.ts`: office loop and startup after the first gesture, mouse down/up and a random key sample while the desktop is focused, and the caption tick on each BIOS line.
- `static/audio/computer/idle.wav` and `static/audio/radio/*.mp3` are in the repo but are not loaded by `sources.ts`. They were not copied. There is no CRT sample in the running app, so the screen hum is a synthesized 60 Hz plus 120 Hz tone. Scanlines stay original CSS.
- Camera distances follow that project's loading, idle, desk, and monitor framing.

## portfolio-inner-site

https://github.com/henryjeff/portfolio-inner-site does not publish a license file. Its source, icons, audio, and personal assets were not copied. The ZoeOS 98 window chrome is an original recreation of the well-known Windows 95 bevel style.

## MIT notice

Permission is hereby granted, free of charge, to any person obtaining a copy of the MIT-licensed software above, to deal in the software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the software, and to permit persons to whom the software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
