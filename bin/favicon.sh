#!/usr/bin/env bash

inkscape -w 16 -h 16 -o /tmp/16.png ./public/logo.svg
inkscape -w 32 -h 32 -o /tmp/32.png ./public/logo.svg
inkscape -w 48 -h 48 -o /tmp/48.png ./public/logo.svg

convert /tmp/16.png /tmp/32.png /tmp/48.png ./public/favicon.ico
