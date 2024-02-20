import { AudioTrackType } from '@/types';

export default class AudioTrack {
  private _type: AudioTrackType;
  private _element: HTMLAudioElement;
  private _source: MediaElementAudioSourceNode;
  private _gain: GainNode;

  constructor(type: AudioTrackType, context: AudioContext, element: HTMLAudioElement) {
    this._type = type;
    this._element = element;
    this._source = context.createMediaElementSource(element);
    this._gain = context.createGain();
    this._source.connect(this._gain);
  }

  get type(): AudioTrackType {
    return this._type;
  }

  hasElement = (element: HTMLAudioElement): boolean => (
    this._element === element
  );

  connect = (destination: AudioDestinationNode): void => {
    this._gain.connect(destination);
  }
  
  play = (): void => {
    this._element.play();
  }

  seek = (position: number): void => {
    this._element.fastSeek(position * this._element.duration);
  }

  set volume(vol: number) {
    this._gain.gain.value = vol;
  }

  get canPlayThrough(): boolean {
    return this._element.readyState === 4;
  }
}