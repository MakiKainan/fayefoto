import React, { useState, useEffect } from 'react';
import { PhotoStripConfig } from '../../types/photobooth';
import { ExportUtils } from '../../canvas/exportUtils';
import { X, QrCode } from 'lucide-react';
import { StarBurst } from '../UI/PersonaArt';
import { PersonaText } from '../../persona/personaTextEngine';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  photos: string[];
  config: PhotoStripConfig;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  photos,
  config,
}) => {
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [exportSuccess, setExportSuccess] = useState<string | null>(null);

  // Trigger confetti and generate QR code on open
  useEffect(() => {
    if (isOpen) {
      ExportUtils.triggerConfetti();
      // Generate a local mock share URL with config data
      const shareData = `${window.location.origin}/preview?id=${Date.now()}`;
      ExportUtils.generateQRCode(shareData)
        .then((url) => setQrCodeUrl(url))
        .catch((err) => console.error('QR code generation failed:', err));
    } else {
      setExportSuccess(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleDownload = async (format: 'png' | 'jpeg') => {
    setIsExporting(true);
    try {
      await ExportUtils.downloadImage(photos, config, format, 3.0); // 3x ultra-high DPI
      setExportSuccess(`${format.toUpperCase()} saved`);
      ExportUtils.triggerConfetti();
    } catch (e) {
      console.error(e);
    } finally {
      setIsExporting(false);
    }
  };

  const handleDownloadPDF = async () => {
    setIsExporting(true);
    try {
      await ExportUtils.downloadPDF(photos, config);
      setExportSuccess('PDF saved');
      ExportUtils.triggerConfetti();
    } catch (e) {
      console.error(e);
    } finally {
      setIsExporting(false);
    }
  };

  const options: { label: string; detail: string; onClick: () => void }[] = [
    { label: 'PNG', detail: 'Lossless, 3x print size', onClick: () => handleDownload('png') },
    { label: 'JPEG', detail: 'Smaller, for socials', onClick: () => handleDownload('jpeg') },
    { label: 'PDF', detail: 'Ready to print', onClick: handleDownloadPDF },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-p5-black/85 animate-fadeIn">
      {/* Calling card */}
      <div
        className="relative w-full max-w-lg p-6 sm:p-8 p5-card-red overflow-hidden"
        style={{ transform: 'rotate(-1.5deg)' }}
      >
        <div className="absolute inset-0 p5-halftone opacity-20 pointer-events-none" />
        <StarBurst className="absolute -right-16 -top-16 w-48 h-48 pointer-events-none" rings={6} />

        <button
          onClick={onClose}
          title="Close"
          className="absolute top-4 right-4 z-10 w-10 h-10 flex items-center justify-center bg-p5-black text-p5-white border-[3px] border-p5-white hover:bg-p5-white hover:text-p5-black"
          style={{ transform: 'rotate(8deg)' }}
        >
          <X className="w-5 h-5" strokeWidth={3} />
        </button>

        <div className="relative mb-8 pr-14">
          <PersonaText text="Take your strip" size="lg" />
        </div>

        {exportSuccess && (
          <div className="relative mb-6 p5-heading text-base">{exportSuccess}</div>
        )}

        <div className="relative flex flex-col gap-3 mb-8">
          {options.map((opt, i) => (
            <button
              key={opt.label}
              onClick={opt.onClick}
              disabled={isExporting}
              className="group flex items-baseline justify-between gap-4 px-5 py-3 bg-p5-white text-p5-black border-[3px] border-p5-black shadow-[5px_5px_0_#0F0F0F] hover:bg-p5-black hover:text-p5-white hover:shadow-[5px_5px_0_#FDFDFD] transition-colors"
              style={{ transform: `skewX(-10deg) translateX(${i * 10}px)` }}
            >
              <span className="font-display text-3xl uppercase leading-none" style={{ transform: 'skewX(10deg)' }}>
                {opt.label}
              </span>
              <span className="text-xs font-semibold uppercase tracking-wide" style={{ transform: 'skewX(10deg)' }}>
                {opt.detail}
              </span>
            </button>
          ))}
        </div>

        <div className="relative flex items-center gap-4">
          <div className="w-24 h-24 shrink-0 bg-p5-white border-[3px] border-p5-black p-1" style={{ transform: 'rotate(-4deg)' }}>
            {qrCodeUrl ? (
              <img src={qrCodeUrl} alt="QR code" className="w-full h-full" />
            ) : (
              <QrCode className="w-full h-full text-p5-black" />
            )}
          </div>
          <span className="font-display uppercase text-2xl leading-tight text-p5-white" style={{ textShadow: '3px 3px 0 #0F0F0F' }}>
            Scan to phone
          </span>
        </div>

        {isExporting && (
          <div className="absolute inset-0 z-20 bg-p5-black flex flex-col items-center justify-center gap-5">
            <StarBurst className="w-24 h-24 animate-spin" rings={6} colors={['#E5191C', '#FDFDFD']} />
            <span className="p5-heading text-2xl">Rendering</span>
          </div>
        )}
      </div>
    </div>
  );
};
