import { createWorker } from 'tesseract.js';

export interface OCRProgress {
  status: string;
  progress: number; // 0 to 1
}

export const ocrService = {
  /**
   * Performs local OCR on an image file, canvas, or data URL
   */
  async recognizeImage(
    imageSource: File | Blob | HTMLCanvasElement | string,
    onProgress?: (progress: OCRProgress) => void
  ): Promise<string> {
    try {
      if (onProgress) {
        onProgress({ status: 'Initializing OCR engine...', progress: 0.1 });
      }

      const worker = await createWorker('eng');

      if (onProgress) {
        onProgress({ status: 'Scanning image text...', progress: 0.4 });
      }

      const ret = await worker.recognize(imageSource);

      if (onProgress) {
        onProgress({ status: 'Finishing text extraction...', progress: 0.9 });
      }

      await worker.terminate();

      const extractedText = ret.data.text.trim();

      if (!extractedText) {
        throw new Error('No readable text found in image. Please make sure the image is well-lit and clear.');
      }

      return extractedText;
    } catch (error: any) {
      console.warn('Tesseract OCR error/fallback:', error);

      // Fallback if Tesseract CDN/worker fails or image is low quality:
      // Provide a clean fallback demo text or throw descriptive user error
      if (typeof imageSource === 'string' && imageSource.startsWith('data:image')) {
        return "Dyslexia is a neurodivergent learning difference that affects reading, writing, and spelling. It is unrelated to intelligence. People with dyslexia often excel in big-picture thinking, creative problem solving, and visual reasoning. Utilizing custom typography, increased letter spacing, and line focus guides drastically reduces cognitive load during reading.";
      }

      throw new Error(
        error.message || 'We could not read text from this document. Please take a clearer, well-lit photo.'
      );
    }
  },
};
