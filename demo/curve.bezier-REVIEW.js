/**
 * curve.bezier
 * https://ptsjs.org/demo/edit/?name=curve.bezier
 *
 * fillOnly still has stroke..
 */

const path = require("path");
const canvasSketch = require("canvas-sketch");
const createInputEvents = require("simple-input-events");
const { CanvasForm, Pt, Bound, Group, Curve, Geom } = require("pts");

const sketch = ({ canvas, context: ctx, width, height }) => {
  const form = new CanvasForm(ctx);
  const size = new Pt(width, height);
  const center = size.$divide(2);
  const innerBound = new Bound(new Pt(), new Pt(size));

  const chain = new Group();

  // mouse events
  const event = createInputEvents(canvas);
  const mouse = new Pt();
  event.on("move", ({ position, event, uv }) => {
    mouse.to(uv).multiply(size);

    let p = mouse.clone();

    if (chain.length < 1) {
      chain.push(p);
      return;
    }
    if (p.$subtract(chain.q1).magnitudeSq() > 900) {
      // the forth point
      if (chain.length === 4) {
        chain.push(p);
        chain.q3.to(Geom.interpolate(chain.q1, chain.q2, 2)); // third pt aligns with the fifth point
        // every third points afterwards
      } else if (chain.length > 4 && chain.length % 3 === 0) {
        chain.push(p);
        chain.push(Geom.interpolate(chain.q2, chain.q1, 2)); // add a new pt to align second-last pt
      } else {
        chain.push(p);
      }
    }
  });

  return {
    render({ playhead, time }) {
      // form.fillOnly("#123").rect([[0, 0], size]); // TOFIX: why is there stroke?

      ctx.fillStyle = "#123";
      ctx.fillRect(0, 0, size.x, size.y);

      // limit up to 50 points
      if (chain.length > 50 && chain.length % 3 === 0) chain.splice(0, 3);

      // rotate the control points slowly
      for (let i = 4, len = chain.length; i < len; i += 3) {
        chain[i].rotate2D(i % 7 === 0 ? 0.002 : -0.003, chain[i - 1]);

        // align the other control pt by extrapolating its corresponding position
        chain[i - 2].to(Geom.interpolate(chain[i], chain[i - 1], 2));
      }

      form.strokeOnly("#ff3", 10).line(Curve.bezier(chain)); // TOFIX: this affects bg rect if bg rect is form.fillOnly().rect().
      form.strokeOnly("rgba(255,255,255,.3)", 1).line(chain);
      form.fillOnly("#fff").points(chain, 1, "circle");
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
  pixelRatio: 2,
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
