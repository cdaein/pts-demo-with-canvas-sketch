/**
 * line.collinear
 * https://ptsjs.org/demo/edit/?name=line.collinear
 */

const path = require("path");
const canvasSketch = require("canvas-sketch");
const createInputEvents = require("simple-input-events");
const { CanvasForm, Pt, Bound, Group, Line, Const } = require("pts");

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

  const pairs = [];
  const r = size.minValue().value / 2;

  // create 200 lines
  for (let i = 0; i < 200; i++) {
    let ln = new Group(Pt.make(2, r, true), Pt.make(2, -r, true));
    ln.moveBy(center).rotate2D((i * Math.PI) / 200, center);
    pairs.push(ln);
  }

  return {
    render({ playhead, time }) {
      form.fillOnly("#123").rect([[0, 0], size]);

      for (let i = 0, len = pairs.length; i < len; i++) {
        // rotate each line by 0.1 degree and check collinearity with pointer
        let ln = pairs[i];
        ln.rotate2D(Const.one_degree / 10, center);
        let collinear = Line.collinear(ln[0], ln[1], mouse, 0.1);

        if (collinear) {
          form.stroke("#fff").line(ln);
        } else {
          // if not collinear, color the line based on whether the pointer is on left or right side
          let side = Line.sideOfPt2D(ln, mouse);
          form
            .stroke(side < 0 ? "rgba(255,255,0,.1)" : "rgba(0,255,255,.1)")
            .line(ln);
        }
        form.fillOnly("rgba(255,255,255,0.8").points(ln, 0.5);
      }

      form.fillOnly("#f03").point(mouse, 3, "circle");
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
