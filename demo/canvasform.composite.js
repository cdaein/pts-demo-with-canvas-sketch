/**
 * pts ERROR
 */

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
  let mouse = new Pt();
  event.on("down", ({ position, event }) => {});
  event.on("up", ({ position, event }) => getGradients());
  event.on("move", ({ position, event, uv }) => {
    mouse.set(uv);
    mouse.multiply(size);
  });

  let waves = [];
  let gradients = [];
  const nums = 20;

  function getColors() {
    let cs = [
      [0, 255, 50],
      [255, 255, 50],
      [255, 0, 50],
      [255, 50, 255],
      [50, 0, 255],
      [50, 255, 255],
    ];
    let a = [...cs[Math.floor(Math.random() * cs.length)], 0.7];
    let b = [...cs[Math.floor(Math.random() * cs.length)], 0.7];
    let c = b.slice();
    c[3] = 0;
    let stops = [0.1, 0.4, 1];
    return [a, b, c].map((p, i) => [
      stops[i],
      `rgba(${p[0]}, ${p[1]}, ${p[2]}, ${p[3]})`,
    ]);
  }

  function getGradients() {
    gradients = [];
    for (let i = 0; i < nums; i++) {
      gradients.push(form.gradient(getColors()));
    }
  }

  // Create two lines and convert to `Noise` points
  let ln1 = Create.distributeLinear(
    [new Pt(0, size.y * 0.3), new Pt(width, size.y * 0.3)],
    nums
  );
  let ln2 = Create.distributeLinear(
    [new Pt(0, size.y * 0.6), new Pt(width, size.y * 0.6)],
    nums
  );
  waves = [Create.noisePts(ln1, 0.1, 0.1), Create.noisePts(ln2, 0.1, 0.1)];

  getGradients();

  return {
    render({ playhead }) {
      ctx.fillStyle = "gray";
      ctx.fillRect(0, 0, size.x, size.y);

      // Use pointer position to change background and speed
      let speed = mouse.$subtract(center).divide(center).abs();

      let gr = speed.x * 100; // background gray
      form.fill(`rgb(${gr + 80},${gr + 80},${gr + 80})`).rect(innerBound);

      // Generate wave movements from Noise
      let nps = waves.map((nl) => {
        return nl.map((p) =>
          p.$add(
            0,
            p.step(0.01 * (1 - speed.x), 0.05 * speed.y).noise2D() * size.y
          )
        );
      });

      // Set canvas composite operation
      form.composite("overlay"); // TOFIX

      for (let k = 0, klen = nps.length; k < klen; k++) {
        for (let i = 0; i < nums; i++) {
          let c1 = Circle.fromCenter(nps[k][i], size.minValue().value * 0.2);
          let c2 = Circle.fromCenter(nps[k][i], size.minValue().value * 0.7);
          let grad = gradients[k === 0 ? i : nums - i - 1];
          form.fillOnly(grad(c1, c2)).circle(c2);
        }
      }
    },
    resize({ width, height }) {
      size.set([width, height]); // REVIEW: when setting Pt, param has to be an array, while creating doesn't.
      center.set(size.$divide(2));
      innerBound.bottomRight = size;
    },
  };
};

const settings = {
  // dimensions: [600, 600],
  // pixelRatio: 2,
  // exportPixelRatio: 2,
  // scaleToFitPadding: 0,
  // scaleToView: true,
  // animate: true,
  // fps: 30,
  // playbackRate: "throttle",
  // duration: 4,
  // suffix: new Date().getTime(),
};

canvasSketch(sketch, settings);
