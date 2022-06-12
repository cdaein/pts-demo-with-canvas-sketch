/**
 * physics.particles
 * https://ptsjs.org/demo/edit/?name=physics.particles
 */

const path = require("path");
const canvasSketch = require("canvas-sketch");
const createInputEvents = require("simple-input-events");
const { CanvasForm, Pt, Bound, World, Create, Particle, Num } = require("pts");

const sketch = ({ canvas, context: ctx, width, height }) => {
  const form = new CanvasForm(ctx);
  const size = new Pt(width, height);
  const center = size.$divide(2);
  const innerBound = new Bound(new Pt(), new Pt(size));

  // mouse events
  const event = createInputEvents(canvas);
  const mouse = new Pt();
  event.on("move", ({ position, event, dragging, uv }) => {
    mouse.to(uv).multiply(size);
    world.particle(0).position = mouse;
  });

  // Create world and 100 random points
  const world = new World(innerBound, 1, 0);
  let pts = Create.distributeRandom(innerBound, 100);

  // Create particles and hit them with a random impulse
  for (let i = 0, len = pts.length; i < len; i++) {
    let p = new Particle(pts[i]).size(
      i === 0 ? 30 : 3 + (Math.random() * size.x) / 50
    );
    p.hit(Num.randomRange(-50, 50), Num.randomRange(-25, 25));
    world.add(p);
  }

  world.particle(0).lock = true; // lock it to move it by pointer later on

  let dTime = 0;
  let prevTime = 0;
  return {
    render({ playhead, frame, fps }) {
      form.fillOnly("#123").rect([[0, 0], size]);
      world.drawParticles((p, i) => {
        let color =
          i === 0
            ? "#fff"
            : ["#ff2d5d", "#42dc8e", "#2e43eb", "#ffe359"][i % 4];
        form.fillOnly(color).point(p, p.radius, "circle");
      });
      world.update(frame / fps); // deltaTime prop doesn't update while window being resized.
    },
    resize({ width, height, time, deltaTime }) {
      size.to(width, height);
      center.to(size.$divide(2));
      innerBound.bottomRight = size;

      if (world) world.bound = innerBound;
    },
  };
};

const settings = {
  // dimensions: [600, 600],
  // pixelRatio: 2,
  // exportPixelRatio: 2,
  // scaleToFitPadding: 0,
  // scaleToView: true,
  animate: true,
  fps: 60,
  // playbackRate: "throttle",
  // duration: 4,
  prefix: path.basename(__filename),
};

canvasSketch(sketch, settings);
