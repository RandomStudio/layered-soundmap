import { MouseEvent, useRef, useState } from 'react';
import styles from 'styles/app.module.scss';

import urlImgFloorPlan from './assets/img/floorplan.png';
import urlImgSoundMap from './assets/img/soundmap-blur-50.png';
import urlSoundClub from './assets/mp3/club.mp3';
import urlSoundHome from './assets/mp3/home.mp3';
import urlSoundStreet from './assets/mp3/street.mp3';

const App = () => {

  const soundMapCanvas = useRef<HTMLCanvasElement>(null);
  const soundmap = useRef<HTMLImageElement>(null);
  const floorplan = useRef<HTMLImageElement>(null);
  const shadowCanvasStreet = useRef<HTMLCanvasElement>(null);
  const shadowCanvasHome = useRef<HTMLCanvasElement>(null);
  const shadowCanvasClub = useRef<HTMLCanvasElement>(null);
  const soundStreet = useRef<HTMLAudioElement>(null);
  const soundHome = useRef<HTMLAudioElement>(null);
  const soundClub = useRef<HTMLAudioElement>(null);

  const [ isPlaying, setIsPlaying ] = useState(false);
  const [ soundMapCtx, setSoundMapCtx ] = useState<CanvasRenderingContext2D | null>(null);
  const [ sampledColor, setSampledColor ] = useState<Uint8ClampedArray>(new Uint8ClampedArray(4).fill(0));
  const [ volume, setVolume ] = useState(0.5);

  const drawSoundMap = () => {
    if (!soundMapCanvas.current || !soundmap.current) {
      console.error('Could not draw sound map; element does not exist.');
      return;
    }
    soundMapCanvas.current!.width = soundmap.current!.naturalWidth;
    soundMapCanvas.current!.height = soundmap.current!.naturalHeight;
    const ctx = soundMapCanvas.current!.getContext('2d', { willReadFrequently: true });
    if (ctx) {
      ctx.drawImage(soundmap.current!, 0, 0, soundmap.current!.naturalWidth, soundmap.current!.naturalHeight);
    } else {
      console.error('Could not draw sound map; failed to create canvas context.');
      return;
    }
    setSoundMapCtx(ctx);

    drawShadowCanvases(ctx);
  }

  const drawShadowCanvases = (soundMapCtx: CanvasRenderingContext2D) => {
    if (!soundMapCtx || !soundMapCanvas.current || !shadowCanvasStreet.current || !shadowCanvasClub.current || !shadowCanvasHome.current) {
      console.error(`Can't apply highlights; elements are missing.`);
      console.log(
        soundMapCtx,
        soundMapCanvas.current,
        shadowCanvasStreet.current,
        shadowCanvasClub.current,
        shadowCanvasHome.current
      );
      return;
    }

    // resize shadow canvases to match sound map
    shadowCanvasClub.current!.width = soundMapCanvas.current!.width;
    shadowCanvasClub.current!.height = soundMapCanvas.current!.height;
    shadowCanvasStreet.current!.width = soundMapCanvas.current!.width;
    shadowCanvasStreet.current!.height = soundMapCanvas.current!.height;
    shadowCanvasHome.current!.width = soundMapCanvas.current!.width;
    shadowCanvasHome.current!.height = soundMapCanvas.current!.height;

    // get shadow map contexts
    const ctxClub = shadowCanvasClub.current!.getContext('2d');
    const ctxStreet = shadowCanvasStreet.current!.getContext('2d');
    const ctxHome = shadowCanvasHome.current!.getContext('2d');
    if (!ctxClub || !ctxStreet || !ctxHome) {
      console.error(`Can't apply highlights; couldn't create rendering contexts.`);
      return;
    }

    // get sound map pixels
    const { width, height } = soundMapCanvas.current!;
    const imageData = soundMapCtx.getImageData(0, 0, width, height);
    
    // create image datas to populate for shadow maps
    const imageDataClub = ctxClub!.createImageData(imageData);
    const imageDataStreet = ctxStreet!.createImageData(imageData);
    const imageDataHome = ctxHome!.createImageData(imageData);

    // set shadow map transparencies based on sound map color values
    for (let i = 0; i < imageData.data.length; i += 4) {
      // imageDataClub.data[i] = 0;
      // imageDataClub.data[i + 1] = 0;
      // imageDataClub.data[i + 2] = 0;
      imageDataClub.data[i + 3] = imageData.data[i]; // alpha based on red channel

      // imageDataStreet.data[i] = 0;
      // imageDataStreet.data[i + 1] = 0;
      // imageDataStreet.data[i + 2] = 0;
      imageDataStreet.data[i + 3] = imageData.data[i + 1]; // alpha based on green channel

      // imageDataHome.data[i] = 0;
      // imageDataHome.data[i + 1] = 0;
      // imageDataHome.data[i + 2] = 0;
      imageDataHome.data[i + 3] = imageData.data[i + 2]; // alpha based on blue channel
    }

    ctxClub.putImageData(imageDataClub, 0, 0);
    ctxStreet.putImageData(imageDataStreet, 0, 0);
    ctxHome.putImageData(imageDataHome, 0, 0);
  }

  const start = () => {
    soundClub.current?.play();
    soundHome.current?.play();
    soundStreet.current?.play();
    setIsPlaying(true);
  }

  const onMouseMove = (event: MouseEvent<HTMLImageElement>) => {
    if (isPlaying && floorplan.current && soundMapCtx) {
      const rect = floorplan.current!.getBoundingClientRect();
      const x = event.pageX - rect.left;
      const y = event.pageY - rect.top;

      sampleColor(
        x / rect.width,
        y / rect.height
      );
    }
  }

  const sampleColor = (x: number, y: number) => {
    if (soundMapCtx) {
      setSampledColor(
        soundMapCtx.getImageData(
          Math.round(soundMapCtx.canvas.width * x),
          Math.round(soundMapCtx.canvas.height * y),
          1,
          1
        ).data
      );
      updateVolumes();
    }
  }

  const updateVolumes = () => {
    const [ r, g, b ] = sampledColor;
    if (soundClub.current) {
      soundClub.current!.volume = volume * r / 255.0;
    }
    if (soundStreet.current) {
      soundStreet.current!.volume = volume * g / 255.0;
    }
    if (soundHome.current) {
      soundHome.current!.volume = volume * b / 255.0;
    }
  }

  return (
    <div className={styles.app}>

      <audio
        ref={soundStreet}
        src={urlSoundStreet}
        loop
        preload="auto"
      />
      <audio
        ref={soundHome}
        src={urlSoundHome}
        loop
        preload="auto"
      />
      <audio
        ref={soundClub}
        src={urlSoundClub}
        loop
        preload="auto"
      />

      <div className={styles.map}>
        <img
          ref={soundmap}
          className={styles.hidden}
          src={urlImgSoundMap}
          onLoad={drawSoundMap}
        />
        <canvas
          ref={soundMapCanvas}
          className={styles.hidden}
        />
        <img
          ref={floorplan}
          className={styles.floorplan}
          src={urlImgFloorPlan}
          onMouseMove={onMouseMove}
        />
        <div
          className={styles.shadows}
          style={{
            left: floorplan.current?.getBoundingClientRect()?.left,
            top: floorplan.current?.getBoundingClientRect()?.top,
            width: floorplan.current?.getBoundingClientRect()?.width,
            height: floorplan.current?.getBoundingClientRect()?.height,
          }}
        >
          <canvas
            ref={shadowCanvasClub}
            style={{ filter: `opacity(${0.3 * (1.0 - sampledColor[0] / 255.0)})` }}
          />
          <canvas
            ref={shadowCanvasStreet}
            style={{ filter: `opacity(${0.3 * (1.0 - sampledColor[1] / 255.0)})` }}
          />
          <canvas
            ref={shadowCanvasHome}
            style={{ filter: `opacity(${0.3 * (1.0 - sampledColor[2] / 255.0)})` }}
          />
        </div>
      </div>

      <div className={styles.footer}>
        <span>Volume</span>
        <input
          type="range"
          min="0"
          max="100"
          value={volume * 100.0}
          onChange={e => {
            setVolume(Number(e.target.value) / 100.0);
            updateVolumes();
          }}
        />
      </div>

      { !isPlaying && (
        <div className={styles.modal} onClick={start}>
          <p>Click to start</p>
        </div>
      )}
    </div>
  )
}

export default App
