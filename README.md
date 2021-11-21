# FFE

A work in progress engine to play Final Fantasy 6 loading all data from the ROM.

## Set up

You need the latest version of [Sphere](https://github.com/fatcerberus/sphere) installed on your PATH and a recent version of node.

Put `ff3u.sfc` in `assets/roms` before building. (MD5 = `544311e104805e926083acf29ec664da`)

```
npm install
npm run build
```

## Run

```
npm run start
```

## Controls

W/A/S/D to move, J to accept

## Status

Able to load and render many maps in a playable state. Enough event scripting is implemented to run a handful of cutscenes.

## Clips and shots

![layer3-anim](https://user-images.githubusercontent.com/1759837/142781725-ab64e590-583f-4e6e-854e-a3cb7b4ab55d.mp4)

Early implementation of color fx with wavy animation for BG3

![kohlingen](https://user-images.githubusercontent.com/1759837/142781871-4de0267c-8eb0-45d3-aa82-156219b2c9a9.mp4)

Walking around kohlingen and talking to NPCs

![castle](https://user-images.githubusercontent.com/1759837/142781840-094decfa-aa34-4eb0-bf0d-a9fb71291be4.mp4)

Walking through figaro castle and triggering an event

![palette](https://user-images.githubusercontent.com/1759837/142781928-940c88d0-357e-4619-a069-33645512476f.mp4)

Palette rotation effects

<img width="1072" alt="narshe debug" src="https://user-images.githubusercontent.com/1759837/142781961-1bbb530e-e9b1-4aed-9c7d-84933655c62e.png">

Debugging in narshe

<img width="1072" alt="intro debug" src="https://user-images.githubusercontent.com/1759837/142781978-f98695a6-ea41-4898-8c4c-1362c8cc6c36.png">

Debugging in the intro



