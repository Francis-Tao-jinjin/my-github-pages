---
title: 'VoxelEditor Mobile Adaption'
pic: '/images/ve-mobile/1.png'
keyword: 'React, WebGL, Voxel'
description: 'In order to make VoxelEditor work well on touch screen devices, I implement a virtual cursor to simulate real mouse operations.'
date: '2020-12-20'
---

<h1 class="text-3xl font-medium mb-2 mt-3">VoxelEditor Mobile Adaption</h1>

VoxelEditor has been out for a quite long time, but there was still one big feature I didn't finish. And that was made it work well on the touch device.

Although cell phones and tablets have become the most commonly used electronic devices in people's lives, there are countless applications developed on them. However, for many professional software, the experience on mobile devices is much different from that on computers.

The main reason may be the lack of a mouse and keyboard, fingertip operation is neither precise nor fast enough. For modeling software, this disadvantage is particularly obvious.

To solve this problem, I implemented a simple tool in voxelEditor to replace the mouse cursor on the mobile platform, so that when the user moves the finger on the screen, they can clearly know where the virtual cursor is on the screen.

<div class='m-5'></div>
<img src="/images/ve-mobile/2.png" alt="topbar" style="width:500px; margin:auto"/>
<div class='m-5'></div>

The white half-transparent circle is the button that the finger can hold and drag, the black dot on the top-left indicates the actual position of the virtual cursor and the yellow circle indicates whether the 'mouse' has been put down. Here is a demo show how all these work:

<div class='m-5'></div>
<img src="/images/ve-mobile/operation-demo.gif" alt="topbar" style="width:500px; margin:auto"/>
<div class='m-5'></div>

For thoes who prefer use left hand, you can even change the direction of the virtual cursor.

<div class='m-5'></div>
<img src="/images/ve-mobile/change-cursor-direction.gif" alt="topbar" style="width:500px; margin:auto"/>
<div class='m-5'></div>

The rest of the adaptation work is basically UI changes, including adapting the small screen, providing a shortcut toolbar and so on.

<div class='m-5'></div>
<img src="/images/ve-mobile/ui-adaption.gif" alt="topbar" style="width:500px; margin:auto"/>
<div class='m-5'></div>

