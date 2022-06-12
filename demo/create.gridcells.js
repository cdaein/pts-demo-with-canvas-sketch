/**
 * create.gridcells
 * https://ptsjs.org/demo/edit/?name=create.gridcells
 */

const path = require("path");
const canvasSketch = require("canvas-sketch");
const createInputEvents = require("simple-input-events");
const { CanvasForm, Pt, Bound, Create, Rectangle, Color } = require("pts");

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

  const pts = Create.gridCells(innerBound, 40, 20);
  let follower = center.clone(); // follows the pointer

  return {
    render({ playhead, time }) {
      form.fillOnly("#123").rect([[0, 0], size]);

      follower = follower.add(mouse.$subtract(follower).divide(20));

      form.stroke("#123");

      // calculate the size and color of each cell based on its distance to the pointer
      let rects = pts.map((p) => {
        let mag = follower.$subtract(Rectangle.center(p)).magnitude();
        let scale = Math.min(1, Math.abs(1 - (0.7 * mag) / center.y));
        // let scale = Math.min(1, Math.abs(1 - (0.7 * mag) / center.y));

        let r = Rectangle.fromCenter(
          Rectangle.center(p),
          Rectangle.size(p).multiply(scale)
        );
        form.fill(Color.HSLtoRGB(Color.hsl(scale * 270, 1, 0.5)).hex).rect(r);
      });

      form.fillOnly("#fff").point(mouse, 10, "circle");
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
