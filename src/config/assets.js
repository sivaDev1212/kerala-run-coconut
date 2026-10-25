// Central asset manifest. Replace files in public/assets/ with your own GLBs (same filenames)
// and tune scale / rotationY / offset here. Models are auto-grounded (lowest point at y=0),
// `height` (optional) auto-scales a model to that many units tall, overriding `scale`.
// then `offset` [x,y,z] is added. Missing files fall back to procedural models.
const B = import.meta.env.BASE_URL;
export const ASSETS = {
  character: { path: `${B}assets/character.glb`, scale: 2.2, height: 2.2, /* auto-fit: works for rigged Mixamo exports of any unit scale */ rotationY: Math.PI, offset: [0, 0, 0], shadow: true },
  coconut:   { path: `${B}assets/coconut.glb`, scale: 0.7, rotationY: 0, offset: [0, 0, 0], shadow: true },
  milk:      { path: `${B}assets/milk-bottle.glb`, scale: 1, rotationY: 0, offset: [0, 0, 0], shadow: true },
  obstacle:  { path: `${B}assets/wooden-crate.glb`, scale: 1, rotationY: 0, offset: [0, 0, 0], shadow: true },
  tree:      { path: `${B}assets/coconut-tree.glb`, scale: 1, rotationY: 0, offset: [0, 0, 0], shadow: false },
  house:     { path: `${B}assets/kerala-house.glb`, scale: 1, rotationY: 0, offset: [0, 0, 0], shadow: false },
  boat:      { path: `${B}assets/wooden-boat.glb`, scale: 1, rotationY: 0, offset: [0, 0, 0], shadow: false }
};
