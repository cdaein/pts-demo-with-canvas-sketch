/**
 * color.LABtoRGB
 * https://ptsjs.org/demo/edit/?name=color.LABtoRGB
 */

const path = require("path");
const canvasSketch = require("canvas-sketch");
const createInputEvents = require("simple-input-events");
const { CanvasForm, Pt, Bound, Color, Create, Num } = require("pts");

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
    mouse.set(uv);
    mouse.multiply(size);
  });

  let grid = [];

  // Lab max value range (100, 127, 127)
  let cu = Color.lab(Color.maxValues("lab"));

  function init() {
    let ratio = size.x / size.y;
    grid = Create.gridCells(innerBound, 20 * ratio, 20);
  }

  init();

  return {
    render({ playhead, time }) {
      time *= 1000;

      form.fillOnly("#96bfed").rect([[0, 0], size]);

      // get LAB color string, given a point position
      let color = (p) => {
        let p1 = p.$divide(size);
        let p2 = mouse.$divide(size);
        let c1 = cu.$multiply(Pt.make(4, 1).to(p2.x, p1.x - 0.5, p1.y - 0.5));
        return Color.LABtoRGB(c1).toString("rgb");
      };

      for (let i = 0, len = grid.length; i < len; i++) {
        grid[i][1].ceil(); // fix gap
        let c = grid[i].interpolate(Num.cycle(((time + i * 60) % 1000) / 1000));
        form.fillOnly(color(c)).rect(grid[i]);
      }
    },
    resize({ width, height }) {
      size.set([width, height]);
      center.set(size.$divide(2));
      innerBound.bottomRight = size;

      init();
    },
  };
};

const settings = {
  dimensions: [600, 600],
  // pixelRatio: 2,
  exportPixelRatio: 2,
  // scaleToFitPadding: 0,
  scaleToView: true,
  animate: true,
  // fps: 30,
  // playbackRate: "throttle",
  // duration: 4,
  prefix: path.basename(__filename),
};

canvasSketch(sketch, settings);
