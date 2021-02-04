---
title: 'MusicEdior'
pic: '/images/music-editor/badguy.png'
keyword: 'React, WebAudio API'
description: 'An digital audio workstation in your browser. You can create music with it and download the work you have done.'
date: '2021-01-08'
---

<h1 class="text-3xl font-medium mb-2 mt-3">Introduction About MusicEditor</h1>

From the name, you know it is a tool that can let you create digital music in your browser, it is so cool!

MusicEditor is another project I developed at Codemao Company. Same as [VoxelEditor](https://github.com/Francis-Tao-jinjin/VoxelEditor), it is also going to be part of the [Box3](https://box3.codemao.cn) paltform. But since it is not fully integrated into the platform, you can directly open this [link](https://box3.codemao.cn/musicEditor) to access it.

It is bascilly a DAW(digital audio workstation) runing on the web, and the most of the functionality could just work without the internet connection.

<h2 class="text-xl font-medium mb-2 mt-3">Example project files of Box3 MusicEditor</h2>

you can access the MusicEditor at https://box3.codemao.cn/musicEditor

screen shot of 'Bad Guy'-Billie Eilish in the editor :

![badguy](/images/music-editor/badguy.png)

<h2 class="text-xl font-medium mb-2 mt-3">Hellow World</h2>

When you use this tool for the first time, you can click ‘Add Channel’ to add an instrument channel, so you can create music with the built-in virtual instrument.

![helloWorld](/images/music-editor/1.png)

<h2 class="text-xl font-medium mb-2 mt-3">Quick Start</h2>
You can change the instrument from the channel menu.


<div class='m-5'></div>
<img src='/images/music-editor/2.png' alt='instruments' style="width:600px; margin:auto"></img>
<div class='m-5'></div>

Except for the Sampler, all other instruments are generated using the WebAudio API, so there is no need to download the instrument's sound library over the Internet.

You can open the piano tool to play these instrument and record the piece when you play them.

<div class='m-5'></div>
<img src='/images/music-editor/3.png' alt='keyboard piano' style="width:600px; margin:auto"></img>
<div class='m-5'></div>
<img src='/images/music-editor/5.png' alt='record piano' style="width:600px; margin:auto"></img>
<div class='m-5'></div>

When you finish recording, a note region will be create at that channel, which record all the note you just play.

<div class='m-5'></div>
<img src='/images/music-editor/4.png' alt='piano recorded' style="width:600px; margin:auto"></img>
<div class='m-5'></div>

You can also create an empty note region by double click the empty track area of that channel.

<!-- ![noteRegion](/images/music-editor/6.png) -->
<div class='m-5'></div>
<img src='/images/music-editor/6.png' alt='musical note region' style="width:600px; margin:auto"></img>
<div class='m-5'></div>

Double click a note region will open the note clip editor panel. Which is the place allow you to edit the clip note by note.

<div class='m-5'></div>
<img src='/images/music-editor/7.png' alt='note Clip Editor' style="width:600px; margin:auto"></img>
<div class='m-5'></div>

Operations like select, move, delete, adjust the length of the note are all supported.

<!-- ![select note](/images/music-editor/8.png) -->
<div class='m-5'></div>
<img src='/images/music-editor/8.png' alt='note selection' style="width:600px; margin:auto"></img>
<div class='m-5'></div>

<h2 class="text-xl font-medium mb-2 mt-3">Clip(or a Region)  Editing</h2>

You can easily edit a clip with the three tools in the upper left.

'Cursor' tool allow you to loop the clip or change the total duration of the clip.

<div class='m-5'></div>
<img src='/images/music-editor/9.png' alt='cursor tool 1' style="width:600px; margin:auto"></img>
<div class='m-5'></div>

'scissors' tool let you cut the clip.

<div class='m-5'></div>
<img src='/images/music-editor/10.png' alt='cursor tool 2' style="width:600px; margin:auto"></img>
<div class='m-5'></div>

'strech' tool allow you to strech or squeeze the clip, If it is the audio clip that you are editing, then it will generate pich shift effect to the audio.

<div class='m-5'></div>
<img src='/images/music-editor/11.png' alt='scissors tool 1' style="width:600px; margin:auto"></img>
<div class='m-5'></div>

<h2 class="text-xl font-medium mb-2 mt-3">Play and Export it to Mp3 file !!</h2>

click the play button in the middle to listen the music you just create. Click download button to export the project to mp3 or wav file.

<div class='m-5'></div>

![download](/images/music-editor/12.png)

<div class='m-5'></div>

That is !!

There are more cool features, hope you can explore it yourself.