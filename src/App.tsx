import { MouseEvent, TouchEvent, useRef, useState } from 'react';
import styles from 'styles/app.module.scss';

import urlImgFloorPlan from './assets/img/floorplan.png';
import urlImgShadowClub from './assets/img/shadow-club.png';
import urlImgShadowHome from './assets/img/shadow-home.png';
import urlImgShadowStreet from './assets/img/shadow-street.png';
import urlImgSoundMap from './assets/img/soundmap-blur-50.png';
import urlSoundClub from './assets/mp3/club.mp3';
import urlSoundHome from './assets/mp3/home.mp3';
import urlSoundStreet from './assets/mp3/street.mp3';

// import urlImageCursor from './assets/img/ear-32.png';
// interface Point {
//   x: number
//   y: number
// }

const App = () => {

  const soundMapCanvas = useRef<HTMLCanvasElement>(null);
  const soundmap = useRef<HTMLImageElement>(null);
  const floorplan = useRef<HTMLImageElement>(null);
  const soundStreet = useRef<HTMLAudioElement>(null);
  const soundHome = useRef<HTMLAudioElement>(null);
  const soundClub = useRef<HTMLAudioElement>(null);

  const [ isPlaying, setIsPlaying ] = useState(false);
  const [ hasSoundStarted, setHasSoundStarted ] = useState(false);
  const [ soundMapCtx, setSoundMapCtx ] = useState<CanvasRenderingContext2D | null>(null);
  const [ sampledColor, setSampledColor ] = useState<Uint8ClampedArray>(new Uint8ClampedArray(4).fill(0));
  const [ volume, setVolume ] = useState(0.5);
  // const [ mousePos, setMousePos ] = useState<Point>({ x: 0, y: 0 });

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
  }

  const start = () => {
    soundClub.current?.play();
    soundHome.current?.play();
    soundStreet.current?.play();
    setIsPlaying(true);
  }

  const onSoundPlaybackStarted = () => {
    setTimeout(() =>  setHasSoundStarted(true), 50);
  }

  const onMouseMove = (event: MouseEvent<HTMLImageElement>) => {
    if (isPlaying && floorplan.current && soundMapCtx) {
      const rect = floorplan.current!.getBoundingClientRect();
      const x = event.pageX - rect.left;
      const y = event.pageY - rect.top;

      // setMousePos({ x, y });

      sampleColor(
        x / rect.width,
        y / rect.height
      );
    }
  }

  const onTouchMove = (event: TouchEvent<HTMLImageElement>) => {
    event.stopPropagation();
    event.preventDefault();
    if (isPlaying && floorplan.current && soundMapCtx) {
      const rect = floorplan.current!.getBoundingClientRect();
      const x = event.touches[0].pageX - rect.left;
      const y = event.touches[0].pageY - rect.top;

      // setMousePos({ x, y });

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
        onPlay={onSoundPlaybackStarted}
      />

      <div className={styles.map}>
        <img
          ref={soundmap}
          className={styles.hidden}
          draggable={false}
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
          draggable={false}
          src={urlImgFloorPlan}
          onMouseMove={onMouseMove}
          onTouchStart={onTouchMove}
          onTouchMove={onTouchMove}
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
          <img
            src={urlImgShadowClub}
            draggable={false}
            style={{ filter: `opacity(${0.6 * (1.0 - sampledColor[0] / 255.0)})` }}
          />
          <img
            src={urlImgShadowStreet}
            draggable={false}
            style={{ filter: `opacity(${0.6 * (1.0 - sampledColor[1] / 255.0)})` }}
          />
          <img
            src={urlImgShadowHome}
            draggable={false}
            style={{ filter: `opacity(${0.6 * (1.0 - sampledColor[2] / 255.0)})` }}
          />
        </div>
        {/* <img
          src={urlImageCursor}
          className={`${styles.cursor} ${hasSoundStarted ? styles.animating : ''}`}
          style={{ left: `${mousePos.x - 16}px`, top: `${mousePos.y - 16}px` }}
        /> */}
      </div>

      { hasSoundStarted && (
        <div className={styles.beat} />
      )}

      <div className={styles.footer}>
        <span>VOLUME</span>
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
