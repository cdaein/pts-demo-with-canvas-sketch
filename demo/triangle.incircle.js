/**
 * triangle.incircle
 * https://ptsjs.org/demo/edit/?name=triangle.incircle
 */

const path = require("path");
const canvasSketch = require("canvas-sketch");
const createInputEvents = require("simple-input-events");
const { CanvasForm, Pt, Bound, Rectangle, Num, Triangle } = require("pts");

const sketch = ({ canvas, context: ctx, width, height }) => {
  const form = new CanvasForm(ctx);
  const size = new Pt(width, height);
  const center = size.$divide(2);
  const innerBound = new Bound(new Pt(), new Pt(size));

  // mouse events
  const event = createInputEvents(canvas);
  const mouse = new Pt(center);
  event.on("down", ({ position, event }) => {});
  event.on("up", ({ position, event }) => {});
  event.on("move", ({ position, event, uv }) => {
    mouse.to(uv).multiply(size);
  });

  return {
    render({ playhead, time }) {
      time *= 1000;

      form.fillOnly("#fe3").rect([[0, 0], size]);

      // rectangle
      const rect = Rectangle.fromCenter(center, size.$divide(3));
      const poly = Rectangle.corners(rect);
      poly.shear2D((Num.cycle((time % 5000) / 5000) - 0.5) / 2, center);

      // triangle
      const tris = poly.segments(2, 1, true);
      tris.map((t) => t.push(mouse));

      // circle
      const circles = tris.map((t) => Triangle.incircle(t));
      const circums = tris.map((t) => Triangle.circumcircle(t));

      // drawing
      form.fillOnly("rgba(255,255,255,.2)", 1).circles(circums);
      form.fillOnly("#123").polygon(poly);
      form.fill("#f03").circles(circles);
      form.strokeOnly("#fff ", 3).polygons(tris);
      form.fill("#123").point(mouse, 5);
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
