declare module 'gifshot' {
  interface GIFOptions {
    images?: string[] | HTMLImageElement[] | HTMLVideoElement[] | CanvasRenderingContext2D[];
    video?: string[];
    gifWidth?: number;
    gifHeight?: number;
    interval?: number;
    numFrames?: number;
    frameDuration?: number;
    fontWeight?: string;
    fontSize?: string;
    fontFamily?: string;
    fontColor?: string;
    textAlign?: string;
    textBaseline?: string;
    sampleInterval?: number;
    numWorkers?: number;
  }

  interface GIFResult {
    error: boolean;
    errorCode: string;
    errorMsg: string;
    image: string;
  }

  function createGIF(
    options: GIFOptions,
    callback: (obj: GIFResult) => void
  ): void;

  const gifshot: {
    createGIF: typeof createGIF;
  };

  export default gifshot;
}
