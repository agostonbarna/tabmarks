#/bin/bash

version=$(git grep -Poh --no-line-number '"version": *"\K[^"]+' src/manifest.json)
dst=dst/$version.zip

if [[ -f $dst ]]; then
  echo "$version.zip already exists!"
  exit 1
else
  git archive -v -o $dst HEAD:src
fi
