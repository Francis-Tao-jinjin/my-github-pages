---
title: 'Audio Adjustment Tool'
pic: '/images/audio-adjust/1.png'
keyword: 'React, WebAudio API, Canvas'
description: 'This is a tool for uploading and simply processing audio in the box3 platform. The technology used is React and WebAudio API.'
date: '2020-08-10'
---

<div class='markdown'></div>

<h1 class="text-3xl font-medium mb-2 mt-3">Audio Adjustment Tool Of Box3 Game Editor</h1>

<div class='m-5'></div>
<img src="/images/audio-adjust/audio-upload.gif" alt="audio upload" style="width:400px; margin:auto"/>
<div class='m-5'></div>

This is a tool for uploading and simply processing audio in the box3 game editor. I have written a component specifically for this functionality, which in addition to React, will also involve the WebAudio API and canvas 2d.

<div class='m-5'></div>

The main functions of this component include: playing and pausing audio, cropping audio, and providing convenient UI controls and visual feedback for these functions.

<div class='m-5'></div>

For those who are not familiar with WebAudio API. All you need to know is the 'Audio' we talk about is actually a kind of data buffer that we call <code class='il'>AudioBuffer</code>. Whether it's playing or cropping or even adding sound effects, it's all about the buffer in the end.

<div class='m-5'></div>

To play an audioBuffer, we need to create an <code class='il'>AudioBufferSourceNode</code>, be noticed, an AudioBufferSourceNode can only be started and stop once. Otherwise, your javascript engine gonna throw an error.

<div class='m-5'></div>

Now we clear that we need to implement a class to handle all the operations to the audioBuffer and a React component to handle UI interaction.

<div class='m-5'></div>

We can call that  class 'AudioPlayer', it needs to support basic <code class='il'>play</code> and <code class='il'>stop</code>, besides, the user may want to start playback from any position of the audio, and the selected interval should support loop playback.

<div class='preCodeBlock'></div>

```TypeScript
class AudioPlayer {
    private _state = 'stopped';
    private _offset = 0;
    private _startTime = 0;
    private _finished = false;
    constructor(
        private audioBuffer:AudioBuffer,
        private audioContext:AudioContext) {
    }

    private _loopStart = 0;
    public set loopStart(value:number) {
        ...
    }

    private _loopEnd = Infinity;
    public set loopEnd(value:number) {
        ...
    }

    private _loop = false;
    public set loop(flag:boolean) {
        this._loop = flag;
    }

    private _source:AudioBufferSourceNode|null = null;

    private now() {
        return this.audioContext.currentTime;
    }

    public start(startTime?:number, offset?:number) {
        ...
    }

    public get state() {
        return this._state;
    }

    public get finished() {
        return this._finished;
    }

    public stop(time?:number) {
        ...
    }

    public seek(offset:number, time:number) {
        ...
    }
}
```

The start method receives two optional params, <code class='il'>startTime</code> refer to the global time of 'AudioContex', if you want to start at the time you call the method, just pass  <code class='il'>audioContext.currentTime</code> to it. <code class='il'>offset</code> refers to the duration of the audio. If an audio is 1.5s long and you want to start playback from the 0.5s, then the <code class='il'>offset</code> is 0.5 .

Here is how I implement the <code class='il'>start</code> and <code class='il'>stop</code>method:

<div class='preCodeBlock'></div>

```TypeScript
public start(startTime?:number, offset?:number) {
    if (startTime === undefined) {
        startTime = this.now();
    }
    if (offset === undefined) {
        if (this._loop) {
            offset = this._loopStart;
        } else {
            offset = 0;
        }
    }
    this._source = this.audioContext.createBufferSource();
    this._source.connect(this.audioContext.destination);
    this._source.buffer = this.audioBuffer;
    this._source.onended = () => {
        const now = this.now();
        if (!this._loop) {
            const passTime = (now - this._startTime + this._offset);
            if (passTime >= this.audioBuffer.duration) {
                this._finished = true;
            } else if (this.audioBuffer.duration - passTime >= 0 &&
                        this.audioBuffer.duration - passTime <= 1e-4) {
                this._finished = true;
            }
        }
    };
    this._source.loop = this._loop;
    this._source.loopStart = this._loopStart;
    this._source.loopEnd = Math.min(this._loopEnd, this.audioBuffer.duration);
    this._state = 'started';
    this._source.start(startTime, offset);
    this._offset = offset;
    this._startTime = startTime;
}

public stop(time?:number) {
    if (time === undefined) {
        time = this.now();
    }
    if (this._source) {
        this._source.stop(time);
        this._source.disconnect();
        this._state = 'stopped';
    }
}
```

As for the <code class='il'>seek</code>, you can simply call <code class='il'>stop</code> then call <code class='il'>start</code> in it.

<h2 class="text-xl font-medium mb-2 mt-3">Drawing the Waveform</h2>

Drawing the waveform of audiobuffer is fairly easy. You don't need to install another package to do it, all you need to do is some simple calculation. Many people like to install a bunch of extra modules to solve a small problem, but I prefer not to install them if I don't need to. This allows you to keep your code light weight, and you can learn a lot of new things in the process.

<div class='preCodeBlock'></div>

```TypeScript
function computeWaveForm(container:HTMLDivElement, buffer:AudioBuffer) {
    const peaks:number[] = [];
    const chann0 = (buffer.getChannelData(0) as ArrayBuffer);
    // const sampleSize = props.buffer.length / props.waveformWidth;
    const sampleSize = buffer.length / container.clientWidth;
    const sampleStep = ~~(sampleSize / 10) || 1;

    for (let i = 0; i < container.clientWidth; i++) {
    // for (let i = 0; i < props.waveformWidth; i++) {
        const start = ~~(i * sampleSize);
        const end = ~~(start + sampleSize);
        let topCount = 0;
        let bottomCount = 0;
        let bottom = 0;
        let top = 0;
        for (var j = start; j < end; j += sampleStep) {
            const value = chann0[j];
            if (value > 0) {
                bottom += value * value;
                bottomCount++;
            }
            if (value < 0) {
                top += value * value;
                topCount++;
            }
        }
        peaks[2 * i] = Math.sqrt(bottom / bottomCount) * 256;
        peaks[2 * i + 1] = -Math.sqrt(top / topCount) * 256;
    }
    return peaks;
}

function drawWaveForm(canvasEle:HTMLCanvasElement, container:HTMLDivElement, peaks:number[], waveformHeight:number) {
    if (canvasEle && container) {
        const cvsCtx = canvasEle.getContext('2d');
        if (cvsCtx) {
            let dirty = false;
            if (canvasEle.height !== waveformHeight) {
                dirty = true;
                canvasEle.style.height = waveformHeight + 'px';
                canvasEle.height = waveformHeight;
            }
            if (canvasEle.width !== container.clientWidth) {
                dirty = true;
                canvasEle.style.width = container.clientWidth + 'px';
                canvasEle.width = container.clientWidth;
            }
            if (dirty) {
                cvsCtx.translate(.5, waveformHeight / 2);
                cvsCtx.scale(.5, waveformHeight / 256);
                cvsCtx.lineWidth = 2;
            } else {
                cvsCtx.setTransform(1, 0, 0, 1, 0, 0);
                cvsCtx.translate(.5, waveformHeight / 2);
                cvsCtx.scale(.5, waveformHeight / 256);
            }

            cvsCtx.clearRect(0, 0, canvasEle.width, canvasEle.height);
            cvsCtx.strokeStyle = 'white';
            cvsCtx.fillStyle = 'white';
            const start = 0;
            const end = container.clientWidth;
            // const end = props.waveformWidth;
            for (let e = start; e < end; e += 1) {
                // const ptr = 2 * (e % props.waveformWidth);
                const ptr = 2 * (e % container.clientWidth);
                let xPos = 2 * (e - start);
                let top = peaks[ptr + 1];
                let bottom = peaks[ptr];
                if (top >= -.5 && bottom <= .5) {
                    const i = xPos;
                    for (; e < end; e += 1) {
                        // const a = 2 * (e % props.waveformWidth);
                        const a = 2 * (e % container.clientWidth);
                        if (peaks[a + 1] < -.5 || peaks[a] > .5) {
                            e -= 1;
                            break;
                        }
                        xPos = 2 * (e - start);
                    }
                    if (i === xPos) {
                        cvsCtx.moveTo(xPos, -.5);
                        cvsCtx.lineTo(xPos, .5);
                    } else {
                        cvsCtx.stroke();
                        cvsCtx.lineWidth = 1;
                        cvsCtx.beginPath();
                        cvsCtx.moveTo(i - .5, 0);
                        cvsCtx.lineTo(xPos + .5, 0);
                        cvsCtx.stroke();
                        cvsCtx.lineWidth = 2;
                        cvsCtx.beginPath();
                    }
                } else {
                    if (top > -0.5) {
                        top = -0.5;
                    }
                    if (bottom < 0.5) {
                        bottom = 0.5;
                    }
                    cvsCtx.moveTo(xPos, top);
                    cvsCtx.lineTo(xPos, bottom);
                }
            }
            cvsCtx.stroke();
        }
    }
}
```

Besides, there is also a mini music player in Box3 editor implemented in a similar way.

<div class='m-5'></div>
<img src="/images/audio-adjust/mini-player.gif" alt="mini audio player" style="width:320px; margin:auto"/>
<div class='m-5'></div>