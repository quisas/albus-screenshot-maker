#!/bin/bash

rm screenshots/*.png

./phantomjs --cookies-file=./cookies.txt make_albus_screenshots.js
