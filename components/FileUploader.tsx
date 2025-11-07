import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, File, Video } from 'lucide-react';
import { motion } from 'framer-motion';
import { useWatermarkStore } from '../store/watermarkStore';
import { MediaFile } from '../types/watermark';

const FileUploader: React.FC = () => {
  const { setMediaFile, setProcessingStatus } = useWatermarkStore();

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];
    const isVideo = file.type.startsWith('video/');
    const isImage = file.type.startsWith('image/');

    if (!isVideo && !isImage) {
      setProcessingStatus({
        error: 'Ugyldig filtype. Vennligst last opp et bilde eller en video.',
      });
      return;
    }

    // Check file size (max 100MB)
    const maxSize = 100 * 1024 * 1024;
    if (file.size > maxSize) {
      setProcessingStatus({
        error: 'Filen er for stor. Maksimal størrelse er 100MB.',
      });
      return;
    }

    setProcessingStatus({ isProcessing: true, stage: 'uploading', progress: 0 });

    const url = URL.createObjectURL(file);

    if (isImage) {
      const img = new Image();
      img.onload = () => {
        const mediaFile: MediaFile = {
          file,
          type: 'image',
          url,
          width: img.width,
          height: img.height,
        };
        setMediaFile(mediaFile);
        setProcessingStatus({ isProcessing: false, stage: 'idle', progress: 100 });
      };
      img.onerror = () => {
        setProcessingStatus({
          isProcessing: false,
          stage: 'idle',
          error: 'Kunne ikke laste inn bildet.',
        });
      };
      img.src = url;
    } else if (isVideo) {
      const video = document.createElement('video');
      video.onloadedmetadata = () => {
        const mediaFile: MediaFile = {
          file,
          type: 'video',
          url,
          width: video.videoWidth,
          height: video.videoHeight,
          duration: video.duration,
        };
        setMediaFile(mediaFile);
        setProcessingStatus({ isProcessing: false, stage: 'idle', progress: 100 });
      };
      video.onerror = () => {
        setProcessingStatus({
          isProcessing: false,
          stage: 'idle',
          error: 'Kunne ikke laste inn videoen.',
        });
      };
      video.src = url;
    }
  }, [setMediaFile, setProcessingStatus]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpg', '.jpeg', '.png', '.webp', '.bmp'],
      'video/*': ['.mp4', '.avi', '.mov', '.webm'],
    },
    maxFiles: 1,
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-4xl mx-auto"
    >
      <div
        {...getRootProps()}
        className={`border-4 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-300 ${
          isDragActive
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
            : 'border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500'
        }`}
      >
        <input {...getInputProps()} />
        <motion.div
          animate={isDragActive ? { scale: 1.1 } : { scale: 1 }}
          transition={{ duration: 0.2 }}
        >
          <Upload className="w-20 h-20 mx-auto mb-6 text-blue-500" />
        </motion.div>

        <h3 className="text-2xl font-bold mb-3 text-gray-800 dark:text-gray-200">
          {isDragActive ? 'Slipp filen her...' : 'Last opp bilde eller video'}
        </h3>

        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Dra og slipp filen her, eller klikk for å velge
        </p>

        <div className="flex items-center justify-center gap-8 mt-6">
          <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
            <File className="w-5 h-5" />
            <span className="text-sm">Bilder: JPG, PNG, WEBP</span>
          </div>
          <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
            <Video className="w-5 h-5" />
            <span className="text-sm">Videoer: MP4, AVI, MOV</span>
          </div>
        </div>

        <p className="text-xs text-gray-500 dark:text-gray-500 mt-4">
          Maksimal filstørrelse: 100MB
        </p>
      </div>
    </motion.div>
  );
};

export default FileUploader;
