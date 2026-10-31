# VisionBooth — Gesture-Controlled AI Photobooth

A modern, high-performance, interactive web photobooth that uses **MediaPipe Hands** biometric landmark tracking for contactless gesture control and **HTML5 Canvas** for multi-layer commemorative photo strip generation.

---

## 🌟 Key Architecture & Highlights

### 1. Computer Vision & Gesture Recognition Engine
- **MediaPipe Vision Tasks (`@mediapipe/tasks-vision`)**: Leverages WebAssembly and GPU acceleration to track 21 3D hand landmarks in real time.
- **Scale-Invariant Biometric Classifier (`src/vision/gestureClassifier.ts`)**: Evaluates finger extension angles and euclidean distances normalized by palm scale ($d(\text{wrist}, \text{MCP}_{\text{middle}})$), making recognition invariant to distance and hand size.
- **Strict Finite State Machine (`src/vision/gestureStateMachine.ts`)**:
  - `IDLE` ➔ `HOLDING` (continuous hold for **500ms**) ➔ `TRIGGERED` (fires exactly once) ➔ `COOLDOWN` (**2000ms** refractory lockout to prevent accidental double-triggers) ➔ `IDLE`.
- **Neon Skeletal Overlay (`src/vision/neonSkeletalRenderer.ts`)**: Renders custom dual-pass glowing neon skeleton over joints and bones with dynamic color shifts based on the held gesture.
- **Circular Progress Meter (`src/components/Camera/GestureRingMeter.tsx`)**: Live SVG progress ring indicating hold countdown.

### 2. Gesture Command Mapping
| Gesture | Biometrics | Action |
|---|---|---|
| ✌️ **Victory / Peace** | Index + Middle extended, Ring + Pinky curled tight | Starts 3-second automated countdown |
| 👍 **Thumbs Up** | Thumb extended upwards, 4 fingers curled into fist | Cycles strip layout (1x4, 2x2, 2x1) |
| 🖐️ **Open Palm** | All 5 fingers extended and spread | Cycles live color filters / grades |
| ✊ **Closed Fist** | All fingers curled tight against palm | Resets session or retakes photos |

### 3. Canvas Rendering & Photo Strip Engine
- **Multi-Layout Support**:
  - `vertical-1x4`: Classic Korean 4-cut vertical strip ($600 \times 1900$ base).
  - `grid-2x2`: Modern 4-shot square pop-art grid ($1200 \times 1400$ base).
  - `classic-2x1`: 2-shot postcard strip ($800 \times 1200$ base).
- **Multi-Layer Composition**: Background gradients, filter adjustments, rounded photo borders, retro 35mm film negative sprockets, draggable/clickable stickers, title caption, date stamp, and brand watermarks.
- **High-Resolution Export**: Multiplies canvas scale ($2\times$ or $3\times$) for 300 DPI print quality.
- **Printable PDF Export**: Generated using `jspdf` formatted for standard photo paper.
- **QR Code Sharing**: Immediate on-screen QR code generation via `qrcode`.
- **Confetti Celebration**: Integrated `canvas-confetti` fireworks upon capture completion.

---

## 📂 Project Structure

```
gesture-photobooth/
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js
├── postcss.config.js
├── index.html
├── src/
│   ├── main.tsx                      # App entry point
│   ├── App.tsx                       # Master view coordinator & fallback flow
│   ├── index.css                     # Tailwind & custom neon styling
│   ├── types/
│   │   ├── gesture.ts                # Types for landmarks, gestures & state machine
│   │   └── photobooth.ts             # Types for layouts, themes, stickers & config
│   ├── vision/
│   │   ├── handLandmarkerManager.ts  # MediaPipe Vision Task singleton & inference loop
│   │   ├── gestureClassifier.ts      # 3D geometric heuristics for 4 gestures
│   │   ├── gestureStateMachine.ts    # 500ms hold debounce + 2000ms cooldown logic
│   │   └── neonSkeletalRenderer.ts   # Dual-pass glowing neon canvas skeleton
│   ├── canvas/
│   │   ├── filterEngine.ts           # CSS and pixel-level color grading filters
│   │   ├── photoStripRenderer.ts     # Multi-layer canvas photo strip renderer
│   │   └── exportUtils.ts            # High-DPI PNG/JPEG, jsPDF, and QR code utilities
│   ├── hooks/
│   │   ├── useCamera.ts              # Webcam stream, resolution switch & frame grabber
│   │   ├── useHandTracking.ts        # RAF tracking loop, FPS monitoring & state binding
│   │   ├── usePhotoboothFlow.ts      # Multi-shot sequence, countdown & strip customization
│   │   └── useAudioFeedback.ts       # Synthesized Web Audio API sound effects
│   └── components/
│       ├── Camera/
│       │   ├── CameraView.tsx        # Video feed with overlay canvas
│       │   ├── CameraControls.tsx    # Resolution, mirror, audio & click fallbacks
│       │   └── GestureRingMeter.tsx  # Circular hold progress ring
│       ├── Capture/
│       │   └── CaptureCountdown.tsx  # Animated 3-2-1 countdown & shutter flash
│       ├── StripBuilder/
│       │   ├── StripCustomizer.tsx   # Sidebar customization controls
│       │   ├── StripPreview.tsx      # Real-time reactive strip canvas preview
│       │   ├── LayoutSelector.tsx    # 1x4, 2x2, 2x1 layout picker
│       │   ├── ThemeSelector.tsx     # Color palette & gradient presets
│       │   └── StickerPicker.tsx     # Sticker placement & removal
│       ├── Export/
│       │   └── ExportModal.tsx       # PNG, JPEG, PDF & QR code modal
│       └── UI/
│           ├── GestureHUD.tsx        # On-screen gesture cheat-sheet & FPS telemetry
│           ├── FilterBar.tsx         # Live filter selector
│           └── PermissionFallback.tsx# Camera permission error instructions & demo mode
└── README.md
```

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
# or
pnpm install
```

### 2. Run Development Server
```bash
npm run dev
```
Navigate to `http://localhost:3000` in Google Chrome, Edge, or any modern WebRTC-compatible browser.

### 3. Build for Production
```bash
npm run build
```
Generates production-optimized assets in the `dist/` directory ready for deployment on Vercel, Netlify, or any static host.
