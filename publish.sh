#!/bin/bash

rm -rf ../Francis-Tao-jinjin.github.io/*
cp -a ./out/. ../Francis-Tao-jinjin.github.io/
cd ../Francis-Tao-jinjin.github.io/
git add .
git commit -m 'update'
git push -u origin master
