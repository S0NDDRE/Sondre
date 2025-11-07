import React, { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ZoomIn, ZoomOut, Move, Square, Wand2, Trash2 } from 'lucide-react';
import { useWatermarkStore } from '../store/watermarkStore';
import { WatermarkSelection } from '../types/watermark';

const MediaPreview: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPoint, setStartPoint] = useState<{ x: number; y: number } | null>(null);
  const [scale, setScale] = useState(1);

  const {
    mediaFile,
    processedMediaUrl,
    selections,
    currentSelection,
    toolMode,
    selectionMode,
    addSelection,
    setCurrentSelection,
    setToolMode,
    removeSelection,
    clearSelections,
  } = useWatermarkStore();

  // Draw canvas
  useEffect(() => {
    if (!canvasRef.current || !mediaFile) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      // Set canvas size
      const maxWidth = containerRef.current?.clientWidth || 800;
      const maxHeight = 600;
      const imageAspect = img.width / img.height;
      let width = Math.min(maxWidth, img.width);
      let height = width / imageAspect;

      if (height > maxHeight) {
        height = maxHeight;
        width = height * imageAspect;
      }

      canvas.width = width;
      canvas.height = height;

      // Draw image
      ctx.clearRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0, width, height);

      // Draw selections
      selections.forEach((selection, index) => {
        ctx.strokeStyle = selection.type === 'auto' ? '#10b981' : '#3b82f6';
        ctx.lineWidth = 3;
        ctx.setLineDash([5, 5]);
        ctx.strokeRect(
          selection.x * width,
          selection.y * height,
          selection.width * width,
          selection.height * height
        );
        ctx.setLineDash([]);

        // Draw selection number
        ctx.fillStyle = selection.type === 'auto' ? '#10b981' : '#3b82f6';
        ctx.font = '16px sans-serif';
        ctx.fillText(
          `#${index + 1}`,
          selection.x * width + 5,
          selection.y * height + 20
        );
      });

      // Draw current selection
      if (currentSelection) {
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 3;
        ctx.setLineDash([5, 5]);
        ctx.strokeRect(
          currentSelection.x * width,
          currentSelection.y * height,
          currentSelection.width * width,
          currentSelection.height * height
        );
        ctx.setLineDash([]);
      }
    };

    img.src = processedMediaUrl || mediaFile.url;
  }, [mediaFile, processedMediaUrl, selections, currentSelection]);

  // Mouse handlers for manual selection
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (toolMode !== 'select' || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / canvas.width;
    const y = (e.clientY - rect.top) / canvas.height;

    setIsDrawing(true);
    setStartPoint({ x, y });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !startPoint || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / canvas.width;
    const y = (e.clientY - rect.top) / canvas.height;

    const selection: WatermarkSelection = {
      x: Math.min(startPoint.x, x),
      y: Math.min(startPoint.y, y),
      width: Math.abs(x - startPoint.x),
      height: Math.abs(y - startPoint.y),
      type: 'manual',
    };

    setCurrentSelection(selection);
  };

  const handleMouseUp = () => {
    if (!isDrawing || !currentSelection) return;

    setIsDrawing(false);
    setStartPoint(null);

    // Only add if selection is significant (> 10px)
    if (currentSelection.width > 0.01 && currentSelection.height > 0.01) {
      addSelection(currentSelection);
    }
    setCurrentSelection(null);
  };

  if (!mediaFile) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full max-w-6xl mx-auto"
    >
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setToolMode('select')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
              toolMode === 'select'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            <Square className="w-5 h-5" />
            <span>Velg Område</span>
          </button>

          <button
            onClick={() => setToolMode('pan')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
              toolMode === 'pan'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            <Move className="w-5 h-5" />
            <span>Panorér</span>
          </button>

          <div className="w-px h-8 bg-gray-300 dark:bg-gray-600 mx-2"></div>

          <button
            onClick={() => setScale(Math.min(scale + 0.25, 3))}
            className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
          >
            <ZoomIn className="w-5 h-5" />
          </button>

          <button
            onClick={() => setScale(Math.max(scale - 0.25, 0.5))}
            className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
          >
            <ZoomOut className="w-5 h-5" />
          </button>

          <span className="text-sm text-gray-600 dark:text-gray-400 ml-2">
            {Math.round(scale * 100)}%
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {selections.length} valg
          </span>

          {selections.length > 0 && (
            <button
              onClick={clearSelections}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50"
            >
              <Trash2 className="w-4 h-4" />
              <span>Fjern alle</span>
            </button>
          )}
        </div>
      </div>

      {/* Canvas */}
      <div
        ref={containerRef}
        className="bg-gray-100 dark:bg-gray-900 rounded-lg p-8 overflow-auto"
        style={{ maxHeight: '70vh' }}
      >
        <canvas
          ref={canvasRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          className="mx-auto shadow-lg rounded cursor-crosshair"
          style={{
            transform: `scale(${scale})`,
            transformOrigin: 'top left',
            transition: 'transform 0.2s',
          }}
        />
      </div>

      {/* Info */}
      <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <p className="text-sm text-blue-800 dark:text-blue-300">
          <strong>Tips:</strong> Klikk og dra for å markere området med vannmerket.
          Du kan legge til flere områder. Bruk zoom-knappene for bedre presisjon.
        </p>
      </div>
    </motion.div>
  );
};

export default MediaPreview;
