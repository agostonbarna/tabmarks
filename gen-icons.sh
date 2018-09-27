#/bin/bash

for s in 16 19 38 48 128; do
  inkscape \
  -w $s -h $s \
  --export-background "rgb(0,0,0)" --export-background-opacity 0 \
  --export-png src/icons/icon-$s.png res/icon.svg
  echo
done
