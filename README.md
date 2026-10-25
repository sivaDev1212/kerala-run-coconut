# Kerala Run — Coconut Rush

A 3D endless runner set in the Kerala backwaters. Built with Vue 3 (`<script setup>`), Vite and Three.js. Run a three-lane wooden village bridge, collect coconuts (+10) and milk bottles (+20), and dodge crates. You have three hearts.

## Features
- Three-lane runner: smooth lane changes, jump with gravity, slide (crouch + fast-fall), rising speed
- Coconuts and milk bottles with float/spin animation, particles, SFX and score pop
- Crates with a 1.6 s invulnerability window after a hit, hit flash and camera shake
- Procedural Kerala scenery: backwater canals, wooden bridge, palms, tiled-roof houses, boats, bushes, sky, sun and clouds
- Pooled scenery segments, collectibles and obstacles (no per-frame allocation of meshes)
- Every model has a procedural fallback; the game runs with no GLB files
- Synthesised Web Audio sound with a mute toggle (no audio files)
- Start / HUD / Pause / Game Over screens, responsive, touch swipe controls
- Best score stored in `localStorage` (also the mute flag; nothing else)

## Prerequisites
Node.js 18+ and npm.

## Commands
```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # production build in dist/
npm run preview   # serve dist/
npm test          # unit tests (node:test, no extra dependencies)
```

## Controls
| Action | Keyboard | Touch |
|---|---|---|
| Move | A / D or ← → | swipe left / right |
| Jump | W, ↑ or Space | swipe up |
| Slide | S or ↓ | swipe down |
| Pause / resume | Esc | pause button |

## Rules
Each coconut is 10 points and each milk bottle is 20. A crate costs one heart; at zero hearts the run ends. Jump over crates; never are all three lanes blocked. Speed rises until a cap.

## Project structure
```
public/assets/            your GLB files go here (+ README.md, .gitkeep)
src/config/assets.js      asset manifest: path, scale, rotationY, offset, shadow
src/config/gameConfig.js  gameplay tuning
src/composables/useGameState.js  MENU / PLAYING / PAUSED / GAME_OVER, score, health, best
src/game/GameEngine.js    renderer, loop, input, lifecycle, collisions
src/game/AssetManager.js  GLB loading, cloning, fallback selection, disposal
src/game/procedural.js    fallback models
src/game/Player.js        lanes, jump, slide, AnimationMixer / procedural animation
src/game/SpawnManager.js  pooled collectibles and obstacles (rows are always passable)
src/game/EnvironmentManager.js  pooled scenery segments, water, sky
src/game/CollisionSystem.js     AABB overlap
src/game/ParticleSystem.js, AudioManager.js
src/components/           Vue UI (canvas, HUD, start, pause, game over)
tests/game.test.js        scoring, transitions, health, collision
```

## Using your own models (Vi3W)
Put GLB files in **`public/assets/`** with exactly these names:

| File | Used for |
|---|---|
| `character.glb` | player |
| `coconut.glb` | coconut pickup |
| `milk-bottle.glb` | milk pickup |
| `wooden-crate.glb` | obstacle |
| `coconut-tree.glb` | roadside palms |
| `kerala-house.glb` | village houses |
| `wooden-boat.glb` | backwater boats |

For each model: describe it to Vi3W (e.g. "stylized young Kerala runner, white shirt, cream mundu with gold border, dark sandals, low-poly, T-pose or running pose"), generate it, export as **GLB**, rename to the filename above and copy it into `public/assets/`. Vi3W's menus may differ; the only requirement is a `.glb` export. Reload the page; any file that fails to load is reported in the console (`[assets] ... using procedural fallback`) and replaced by the fallback.

### Scale, orientation, ground offset
Edit `src/config/assets.js`:
- `scale`: uniform scale. Target sizes: character about 2 units tall, coconut about 0.6, milk bottle about 1, crate about 1.4 × 1.1 × 1.2.
- `rotationY`: radians. The game faces **-Z**; most GLBs face +Z, so the character defaults to `Math.PI`. Flip it if your model runs backwards.
- `offset`: `[x, y, z]` added after automatic grounding. Models are re-centred and their lowest point is placed at y = 0, so `y` is only needed for floating or sunken models.
- `shadow`: cast/receive shadows.

Collision boxes are fixed in `SpawnManager.js` (`DEF`) and `gameConfig.js` (`playerBox`), so resizing a model's visuals does not change gameplay.

### Animation notes
If the character GLB has animation clips, the game plays the first clip whose name matches `run|sprint|jog`, else `walk`, else the first clip, through `AnimationMixer`. Without clips, the model bobs and squashes on slide. The leg/arm swing only applies to the fallback character (or a GLB with nodes named `legL`, `legR`, `armL`, `armR`). Skinned meshes are cloned with `SkeletonUtils`.

## Troubleshooting
- **Black screen / error banner**: WebGL is disabled. Enable hardware acceleration.
- **Model sideways or backwards**: adjust `rotationY`.
- **Model floating or huge**: adjust `scale`, then `offset`.
- **No sound**: audio starts after the first click or key press; check the mute button.
- **Console warnings about missing assets**: expected until you add GLB files.
- **Low frame rate on phones**: lower `shadowMap` size in `GameEngine.js` or reduce `segments` in `gameConfig.js`.

## Deploy to Netlify
`netlify.toml` is included. Either connect the repo (build command `npm run build`, publish directory `dist`) or run `npm run build` and drag the `dist/` folder into Netlify Drop. Commit your GLBs in `public/assets/` first.

## Rigged character with a real run animation (Mixamo)
1. If your model is a GLB, open it in Blender (File > Import > glTF) and export it as **FBX** (or OBJ). Mixamo does not accept GLB.
2. Upload it at mixamo.com (free Adobe login). Place the auto-rigger markers (chin, wrists, elbows, knees, groin) and confirm.
3. Pick a **Running** animation. Tick **In Place**, set Skin to **With Skin**, and download as FBX.
4. Import that FBX into Blender, export as **glTF Binary (.glb)** with *Animation* enabled, and save it as `public/assets/character.glb`.
5. Reload the game. It plays the clip named run / sprint / jog, else walk, else the first clip. `height` in `src/config/assets.js` auto-fits the size. Adjust `rotationY` if the character faces the wrong way.
