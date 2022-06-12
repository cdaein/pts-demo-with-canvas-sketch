/**
 * create.noisePts
 * https://ptsjs.org/demo/edit/?name=create.noisePts
 */

const path = require("path");
const canvasSketch = require("canvas-sketch");
const createInputEvents = require("simple-input-events");
const { CanvasForm, Pt, Bound, Create } = require("pts");

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
  event.on("move", ({ position, event, uv }) => {
    mouse.to(uv).multiply(size);
  });

  // Create a line and a grid, and convert them to `Noise` points
  let ln = Create.distributeLinear(
    [new Pt(0, center.y), new Pt(width, center.y)],
    30
  );
  let gd = Create.gridPts(innerBound, 20, 20);
  const noiseLine = Create.noisePts(ln, 0.1, 0.1);
  const noiseGrid = Create.noisePts(gd, 0.05, 0.1, 20, 20);

  return {
    render({ playhead, time }) {
      form.fillOnly("#f1f5f9").rect([[0, 0], size]);

      // Use pointer position to change speed
      let speed = mouse.$subtract(center).divide(center).abs();

      // Generate noise in a grid
      noiseGrid.map((p) => {
        p.step(0.01 * speed.x, 0.01 * (1 - speed.y));
        form.fillOnly("#123").point(p, Math.abs((p.noise2D() * size.x) / 18));
      });

      // Generate noise in a line
      let nps = noiseLine.map((p) => {
        p.step(0.01 * (1 - speed.x), 0.05 * speed.y);
        return p.$add(0, p.noise2D() * center.y);
      });

      // Draw wave
      nps = nps.concat([size, new Pt(0, size.y)]);
      form.fillOnly("rgba(0,140,255,.65)").polygon(nps);
      form.fill("#fff").points(nps, 2, "circle");
    },
    resize({ width, height }) {
      size.to(width, height);
      center.to(size.$divide(2));
      innerBound.bottomRight = size;
    },
  };
};

const settings = {
  dimensions: [600, 600],
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
