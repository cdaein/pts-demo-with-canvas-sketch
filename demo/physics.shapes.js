/**
 * physics.shapes
 * https://ptsjs.org/demo/edit/?name=physics.shapes
 */

const path = require("path");
const canvasSketch = require("canvas-sketch");
const createInputEvents = require("simple-input-events");
const {
  CanvasForm,
  Pt,
  Bound,
  World,
  Body,
  Polygon,
  Particle,
} = require("pts");

const sketch = ({ canvas, context: ctx, width, height }) => {
  const form = new CanvasForm(ctx);
  const size = new Pt(width, height);
  const center = size.$divide(2);
  const innerBound = new Bound(new Pt(), new Pt(size));

  // mouse events
  const event = createInputEvents(canvas);
  const mouse = new Pt();
  event.on("down", ({ position, event }) => {});
  event.on("up", ({ position, event }) => {});
  event.on("move", ({ position, event, dragging, uv }) => {
    mouse.to(uv).multiply(size);
    world.body("triangle")[0].position = mouse.clone();
  });

  const world = new World(innerBound, 0.99, new Pt(0, 500));

  let unit = (size.x + size.y) / 150;

  // Create bodies and particles
  let hexagon = Body.fromGroup(
    Polygon.fromCenter(center.add(100, -100), unit * 10, 6),
    0.5
  );
  let square = Body.fromGroup(
    Polygon.fromCenter(center.subtract(100, 50), unit * 8, 4),
    1
  );
  let triangle = Body.fromGroup(Polygon.fromCenter(center, unit * 6, 3));
  let p1 = new Particle(new Pt(center.x, 100)).size(unit * 4);
  let p2 = new Particle(new Pt(center.x, 100)).size(unit * 2);

  // add to world
  world.add(hexagon).add(square).add(triangle, "triangle");
  world.add(p1).add(p2);

  // hit them with impulse
  p1.hit(200, -20);
  p2.hit(100, -50);
  hexagon[0].hit(120, -40);
  square[0].hit(-300, -20);

  // lock triangle's first vertice so we can control it by pointer
  triangle[0].lock = true;

  return {
    render({ frame, fps }) {
      form.fillOnly("#30a").rect([[0, 0], size]);

      world.drawParticles((p, i) =>
        form.fillOnly("#09f").point(p, p.radius, "circle")
      );

      world.drawBodies((b, i) => {
        form.fillOnly(["#0c9", "#f03", "#fe6"][i % 3]).polygon(b);
        form.strokeOnly("rgba(0,0,0,0.1");
        b.linksToLines().forEach((l) => form.line(l)); // visualize the edge constraints
      });

      world.update(frame / fps);
    },
    resize({ width, height }) {
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
  exportPixelRatio: 2,
  // scaleToFitPadding: 0,
  // scaleToView: true,
  animate: true,
  // fps: 30,
  // playbackRate: "throttle",
  // duration: 4,
  prefix: path.basename(__filename),
};

canvasSketch(sketch, settings);
