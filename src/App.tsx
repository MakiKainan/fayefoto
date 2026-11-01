import { useEffect, useState } from 'react';
import { useCamera } from './hooks/useCamera';
import { useHandTracking } from './hooks/useHandTracking';
import { useAudioFeedback } from './hooks/useAudioFeedback';
import { usePhotoboothFlow } from './hooks/usePhotoboothFlow';

import { CameraView } from './components/Camera/CameraView';
import { CameraControls } from './components/Camera/CameraControls';
import { CaptureCountdown } from './components/Capture/CaptureCountdown';
import { StripPreview } from './components/StripBuilder/StripPreview';
import { StripCustomizer } from './components/StripBuilder/StripCustomizer';
import { ExportModal } from './components/Export/ExportModal';
import { GestureHUD } from './components/UI/GestureHUD';
import { PermissionFallback } from './components/UI/PermissionFallback';

import { PersonaBackdrop, PERSONA_ASSETS } from './components/UI/PersonaArt';
import { PageTransition, TRANSITION_COVER_MS } from './components/UI/PageTransition';
import { PersonaText } from './persona/personaTextEngine';
import { FilterBar } from './components/UI/FilterBar';
import { GestureType } from './types/gesture';

const SHOOT_GESTURES: GestureType[] = ['FIST'];

export default function App() {
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [gestureEnabled, setGestureEnabled] = useState<boolean>(true);
  const [isExportModalOpen, setIsExportModalOpen] = useState<boolean>(false);

  // Audio Synthesizer Hook
  const { playCountdownBeep, playShutterSound, playGestureChime } = useAudioFeedback(soundEnabled);

  // Camera Management Hook
  const {
    videoRef,
    isLoading: isCameraLoading,
    error: cameraError,
    permissionGranted,
    currentResolution,
    isMirrored,
    switchResolution,
    toggleMirror,
    captureFrame,
    retry: retryCamera,
  } = useCamera({ resolution: '720p', mirrored: true });

  // Photo Booth Sequence & Customization State Flow
  const {
    step,
    setStep,
    photos,
    totalShots,
    countdownValue,
    currentShotNumber,
    isFlashActive,
    activeFilter,
    setActiveFilter,
    activeLayout,
    setActiveLayout,
    activeTheme,
    setActiveTheme,
    caption,
    setCaption,
    dateText,
    setDateText,
    stickers,
    borderStyle,
    setBorderStyle,
    stripConfig,
    startCaptureSequence,
    handleGestureAction,
    resetSession,
    loadPhotos,
    addSticker,
    removeSticker,
  } = usePhotoboothFlow({
    onCaptureFrame: captureFrame,
    playCountdownBeep,
    playShutterSound,
    playGestureChime,
  });

  const isShooting = step === 'COUNTDOWN' || step === 'PROCESSING';

  // Hand Tracking & Gesture State Machine Hook
  const {
    overlayCanvasRef,
    isModelLoading,
    activeGesture,
    gestureState,
    holdProgress,
    cooldownRemaining,
    handDetected,
  } = useHandTracking({
    videoRef,
    enabled: gestureEnabled && (step === 'READY' || isShooting),
    // During the shoot, only a fist (stop) is listened for
    allowedGestures: isShooting ? SHOOT_GESTURES : undefined,
    mirrored: isMirrored,
    onGestureTrigger: handleGestureAction,
    holdThresholdMs: 500,
    cooldownDurationMs: 2000,
  });

  // Demo photos for users without a webcam: flat vector placeholder frames
  const loadDemoPhotos = () => {
    const palettes: [string, string][] = [
      ['#E5191C', '#0F0F0F'],
      ['#0F0F0F', '#E5191C'],
      ['#FDFDFD', '#0F0F0F'],
      ['#0F0F0F', '#FDFDFD'],
    ];
    const mockPhotos = palettes.map(([bg, fg], idx) => {
      const c = document.createElement('canvas');
      c.width = 1280;
      c.height = 720;
      const ctx = c.getContext('2d')!;
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, 1280, 720);
      ctx.fillStyle = fg;
      ctx.beginPath();
      ctx.moveTo(0, 720);
      ctx.lineTo(1280, 380 + idx * 60);
      ctx.lineTo(1280, 720);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = fg;
      ctx.font = '160px Anton, Impact, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`0${idx + 1}`, 640, 300);
      return c.toDataURL('image/jpeg', 0.92);
    });

    loadPhotos(mockPhotos);
  };

  // Page swaps happen behind the slash wipe, once the screen is covered
  const page: 'camera' | 'customize' = step === 'CUSTOMIZE' ? 'customize' : 'camera';
  const [shownPage, setShownPage] = useState(page);
  const [transitionKey, setTransitionKey] = useState(0);

  useEffect(() => {
    if (page === shownPage) return;
    setTransitionKey((k) => k + 1);
    const t = setTimeout(() => setShownPage(page), TRANSITION_COVER_MS);
    return () => clearTimeout(t);
  }, [page, shownPage]);

  const isCustomizing = shownPage === 'customize';

  return (
    <div className="min-h-screen text-p5-white flex flex-col relative overflow-x-clip">
      <PersonaBackdrop variant={shownPage} />
      <PageTransition playKey={transitionKey} />

      <header className="relative z-40 px-4 sm:px-8 pt-5 pb-2 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div
            className="w-12 h-12 shrink-0 bg-p5-white border-[3px] border-p5-black shadow-[4px_4px_0_#E5191C] overflow-hidden"
            style={{ transform: 'rotate(-6deg)' }}
          >
            <img src={PERSONA_ASSETS.jokerIcon} alt="" className="w-full h-full object-cover scale-110" />
          </div>
          <PersonaText text="FAYEFOTO" size="2xl" />
        </div>

        {isCustomizing && (
          <button onClick={() => setStep('READY')} className="p5-btn">
            <span>Back to Camera</span>
          </button>
        )}
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pb-12 pt-6 flex flex-col items-center justify-center">
        {cameraError && !permissionGranted && !isCustomizing && (
          <PermissionFallback error={cameraError} onRetry={retryCamera} onUseDemoPhotos={loadDemoPhotos} />
        )}

        {/* Camera & capture stage */}
        {(!cameraError || permissionGranted) && !isCustomizing && (
          <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
            {/* Left: gesture command menu */}
            <aside className="lg:col-span-4 flex flex-col gap-8 order-2 lg:order-1 lg:pt-6">
              {gestureEnabled && <GestureHUD activeGesture={activeGesture} handDetected={handDetected} />}
            </aside>

            {/* Right: camera */}
            <div className="lg:col-span-8 flex flex-col gap-6 order-1 lg:order-2">
              <FilterBar activeFilter={activeFilter} onSelectFilter={setActiveFilter} />
              <div className="relative w-full">
                <CameraView
                  videoRef={videoRef}
                  overlayCanvasRef={overlayCanvasRef}
                  isMirrored={isMirrored}
                  activeFilter={activeFilter}
                  isLoading={isCameraLoading}
                  isModelLoading={isModelLoading}
                  activeGesture={activeGesture}
                  gestureState={gestureState}
                  holdProgress={holdProgress}
                  cooldownRemaining={cooldownRemaining}
                />
                <CaptureCountdown
                  countdownValue={countdownValue}
                  currentShotNumber={currentShotNumber}
                  totalShots={totalShots}
                  isFlashActive={isFlashActive}
                />
              </div>

              <CameraControls
                resolution={currentResolution}
                onResolutionChange={switchResolution}
                isMirrored={isMirrored}
                onToggleMirror={toggleMirror}
                soundEnabled={soundEnabled}
                onToggleSound={() => setSoundEnabled((prev) => !prev)}
                gestureEnabled={gestureEnabled}
                onToggleGesture={() => setGestureEnabled((prev) => !prev)}
                onManualCapture={step === 'READY' ? startCaptureSequence : undefined}
                canCapture={step === 'READY'}
              />
            </div>
          </div>
        )}

        {/* Strip customization */}
        {isCustomizing && (
          <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            <div className="lg:col-span-5 lg:sticky lg:top-6">
              <StripPreview photos={photos} config={stripConfig} />
            </div>
            <div className="lg:col-span-7 w-full">
              <StripCustomizer
                layout={activeLayout}
                onSelectLayout={setActiveLayout}
                theme={activeTheme}
                onSelectTheme={setActiveTheme}
                filter={activeFilter}
                onSelectFilter={setActiveFilter}
                borderStyle={borderStyle}
                onSelectBorderStyle={setBorderStyle}
                caption={caption}
                onChangeCaption={setCaption}
                dateText={dateText}
                onChangeDateText={setDateText}
                stickers={stickers}
                onAddSticker={addSticker}
                onRemoveSticker={removeSticker}
                onRetake={resetSession}
                onOpenExport={() => setIsExportModalOpen(true)}
              />
            </div>
          </div>
        )}
      </main>

      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        photos={photos}
        config={stripConfig}
      />
    </div>
  );
}
