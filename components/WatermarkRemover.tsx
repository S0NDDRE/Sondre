import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Wand2,
  Download,
  RotateCcw,
  Sparkles,
  AlertCircle,
  CheckCircle,
  Loader,
} from 'lucide-react';
import FileUploader from './FileUploader';
import MediaPreview from './MediaPreview';
import AIAssistantChat from './AIAssistantChat';
import { useWatermarkStore } from '../store/watermarkStore';
import { WatermarkRemovalService } from '../services/watermark/removalService';

const WatermarkRemover: React.FC = () => {
  const {
    mediaFile,
    processedMediaUrl,
    selections,
    selectionMode,
    processingStatus,
    exportOptions,
    setProcessedMediaUrl,
    setSelectionMode,
    setProcessingStatus,
    clearSelections,
    reset,
  } = useWatermarkStore();

  const [autoDetecting, setAutoDetecting] = useState(false);

  const handleAutoDetect = async () => {
    if (!mediaFile || mediaFile.type !== 'image') {
      setProcessingStatus({
        error: 'Automatisk deteksjon fungerer kun for bilder for øyeblikket.',
      });
      return;
    }

    setAutoDetecting(true);
    setProcessingStatus({
      isProcessing: true,
      stage: 'detecting',
      progress: 0,
      error: undefined,
    });

    try {
      const detectedSelections = await WatermarkRemovalService.detectWatermarks(mediaFile.url);

      if (detectedSelections.length === 0) {
        setProcessingStatus({
          error: 'Ingen vannmerker ble funnet automatisk. Prøv manuell markering.',
          isProcessing: false,
          stage: 'idle',
        });
      } else {
        // Add detected selections
        detectedSelections.forEach((sel) => {
          useWatermarkStore.getState().addSelection(sel);
        });

        setProcessingStatus({
          isProcessing: false,
          stage: 'idle',
          progress: 100,
          error: undefined,
        });
      }
    } catch (error) {
      setProcessingStatus({
        error: 'Kunne ikke utføre automatisk deteksjon. Prøv manuell markering.',
        isProcessing: false,
        stage: 'idle',
      });
    } finally {
      setAutoDetecting(false);
    }
  };

  const handleRemoveWatermark = async () => {
    if (!mediaFile || selections.length === 0) {
      setProcessingStatus({
        error: 'Vennligst marker område(r) som skal fjernes.',
      });
      return;
    }

    if (mediaFile.type === 'video') {
      setProcessingStatus({
        error: 'Videobehandling kommer snart. For øyeblikket støttes kun bilder.',
      });
      return;
    }

    setProcessingStatus({
      isProcessing: true,
      stage: 'removing',
      progress: 0,
      error: undefined,
    });

    try {
      const processedUrl = await WatermarkRemovalService.removeWatermark(
        mediaFile.url,
        selections,
        (progress) => {
          setProcessingStatus({ progress });
        }
      );

      setProcessedMediaUrl(processedUrl);
      setProcessingStatus({
        isProcessing: false,
        stage: 'complete',
        progress: 100,
        error: undefined,
      });
    } catch (error) {
      console.error('Error removing watermark:', error);
      setProcessingStatus({
        error: 'Kunne ikke fjerne vannmerket. Vennligst prøv igjen.',
        isProcessing: false,
        stage: 'idle',
      });
    }
  };

  const handleDownload = () => {
    if (!processedMediaUrl) return;

    const link = document.createElement('a');
    link.href = processedMediaUrl;
    link.download = `vannmerk-fjernet-${Date.now()}.${exportOptions.format}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleReset = () => {
    if (confirm('Er du sikker på at du vil starte på nytt?')) {
      reset();
    }
  };

  const getStatusMessage = () => {
    if (processingStatus.error) {
      return {
        type: 'error',
        message: processingStatus.error,
      };
    }

    switch (processingStatus.stage) {
      case 'uploading':
        return { type: 'info', message: 'Laster opp fil...' };
      case 'detecting':
        return { type: 'info', message: 'Søker etter vannmerker...' };
      case 'removing':
        return {
          type: 'info',
          message: `Fjerner vannmerke... ${Math.round(processingStatus.progress)}%`,
        };
      case 'complete':
        return { type: 'success', message: 'Vannmerke fjernet!' };
      default:
        return null;
    }
  };

  const statusMessage = getStatusMessage();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Vannmerk Fjerner Pro
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  AI-drevet fjerning av vannmerker, logoer og uønskede objekter
                </p>
              </div>
            </div>

            {mediaFile && (
              <button
                onClick={handleReset}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Start på nytt</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Status Message */}
        {statusMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
              statusMessage.type === 'error'
                ? 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-800'
                : statusMessage.type === 'success'
                ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300 border border-green-200 dark:border-green-800'
                : 'bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
            }`}
          >
            {statusMessage.type === 'error' && <AlertCircle className="w-5 h-5" />}
            {statusMessage.type === 'success' && <CheckCircle className="w-5 h-5" />}
            {statusMessage.type === 'info' && <Loader className="w-5 h-5 animate-spin" />}
            <p className="font-medium">{statusMessage.message}</p>
          </motion.div>
        )}

        {/* File Uploader or Preview */}
        {!mediaFile ? (
          <FileUploader />
        ) : (
          <div className="space-y-6">
            {/* Action Buttons */}
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={handleAutoDetect}
                disabled={autoDetecting || processingStatus.isProcessing}
                className="flex items-center gap-2 px-6 py-3 rounded-lg bg-green-500 text-white font-medium hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              >
                {autoDetecting ? (
                  <Loader className="w-5 h-5 animate-spin" />
                ) : (
                  <Wand2 className="w-5 h-5" />
                )}
                <span>Automatisk Deteksjon</span>
              </button>

              <button
                onClick={handleRemoveWatermark}
                disabled={
                  selections.length === 0 ||
                  processingStatus.isProcessing ||
                  !!processedMediaUrl
                }
                className="flex items-center gap-2 px-6 py-3 rounded-lg bg-blue-500 text-white font-medium hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              >
                {processingStatus.isProcessing ? (
                  <Loader className="w-5 h-5 animate-spin" />
                ) : (
                  <Sparkles className="w-5 h-5" />
                )}
                <span>Fjern Vannmerke</span>
              </button>

              {processedMediaUrl && (
                <button
                  onClick={handleDownload}
                  className="flex items-center gap-2 px-6 py-3 rounded-lg bg-purple-500 text-white font-medium hover:bg-purple-600 shadow-lg"
                >
                  <Download className="w-5 h-5" />
                  <span>Last Ned</span>
                </button>
              )}
            </div>

            {/* Media Preview */}
            <MediaPreview />
          </div>
        )}

        {/* Features */}
        {!mediaFile && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mb-4">
                <Wand2 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Automatisk Deteksjon
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                AI finner automatisk vannmerker og logoer i bildene dine med høy nøyaktighet.
              </p>
            </div>

            <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center mb-4">
                <Sparkles className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Presise Resultater
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Avanserte inpainting-algoritmer sikrer rene resultater uten synlige spor.
              </p>
            </div>

            <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mb-4">
                <Download className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Rask Nedlasting
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Last ned rensede bilder i høy kvalitet på sekunder, klare for bruk.
              </p>
            </div>
          </motion.div>
        )}
      </main>

      {/* AI Assistant */}
      <AIAssistantChat />
    </div>
  );
};

export default WatermarkRemover;
