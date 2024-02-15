export default class AudioTrack {
  private _element: HTMLAudioElement;
  private _source: MediaElementAudioSourceNode;
  private _gain: GainNode;

  constructor(context: AudioContext, element: HTMLAudioElement) {
    this._element = element;
    this._source = context.createMediaElementSource(element);
    this._gain = context.createGain();
    this._source.connect(this._gain);
  }

  hasElement = (element: HTMLAudioElement) => (
    this._element === element
  );

  connect = (destination: AudioDestinationNode) => {
    this._gain.connect(destination);
  }

  set volume(vol: number) {
    this._gain.gain.value = vol;
  }

  play = () => {
    this._element.play();
  }
}