/**
 * canvsform.gradient
 * https://ptsjs.org/demo/edit/?name=canvasform.gradient
 */

const canvasSketch = require("canvas-sketch");
const createInputEvents = require("simple-input-events");
const { CanvasForm: CF, Pt, Bound, Create, Circle, Group } = require("pts");

// CanvasForm.ctx is undefined for existing ctx b/c there's no CanvasSpace
class CanvasForm extends CF {
  gradient(stops) {
    let vals = [];
    if (stops.length < 2) stops.push([0.99, "#000"], [1, "#000"]);

    for (let i = 0, len = stops.length; i < len; i++) {
      let t =
        typeof stops[i] === "string"
          ? i * (1 / (stops.length - 1))
          : stops[i][0];
      let v = typeof stops[i] === "string" ? stops[i] : stops[i][1];
      vals.push([t, v]);
    }

    return (area1, area2) => {
      area1 = area1.map((a) => a.abs());
      if (area2) area2.map((a) => a.abs());

      let grad = area2
        ? this._ctx.createRadialGradient(
            area1[0][0],
            area1[0][1],
            area1[1][0],
            area2[0][0],
            area2[0][1],
            area2[1][0]
          )
        : this._ctx.createLinearGradient(
            area1[0][0],
            area1[0][1],
            area1[1][0],
            area1[1][1]
          );

      for (let i = 0, len = vals.length; i < len; i++) {
        grad.addColorStop(vals[i][0], vals[i][1]);
      }

      return grad;
    };
  }
}

const sketch = ({ canvas, context: ctx, pixelRatio, width, height }) => {
  const form = new CanvasForm(ctx);

  // const form = new CanvasForm(ctx);
  const size = new Pt(width, height);
  const center = size.$divide(2);
  const innerBound = new Bound(new Pt(), new Pt(size));

  // mouse events
  const event = createInputEvents(canvas);
  let mouse = new Pt();
  event.on("down", ({ position, event }) => {});
  event.on("up", ({ position, event }) => {});
  event.on("move", ({ position, event, uv }) => {
    mouse.to(uv).multiply(size);
  });

  return {
    render({ width, height }) {
      ctx.fillStyle = "#123";
      ctx.fillRect(0, 0, width, height);

      if (!form.ready) return;

      let scale = center.$subtract(mouse).divide(center).abs();
      let bound = new Bound(new Pt(), size.$add(0, size.y * scale.y));
      let cells = Create.gridCells(bound, 21, 30);
      let offy = (bound.height - innerBound.height) / 2;
      let cy = 1 - Math.abs(center.y - mouse.y) / center.y;

      // Create complex radial gradient with stops
      const radial = form.gradient([
        [0.2, `rgb(${70 * cy}, 0, ${255 * cy})`],
        [0.6, `rgb(${205 * cy}, 0, ${30 * cy})`],
        [0.95, `rgb(${255 * cy}, ${220 * cy}, 0)`],
      ]);

      // Define the radial gradient areas and fill inta rectangular area.
      form
        .fill(
          radial(
            Circle.fromCenter(mouse, center.y / 2),
            Circle.fromCenter(mouse, size.y * 1.5)
          )
        )
        .rect(innerBound);

      // Fill every other grid cells with a simple linear gradient
      for (let i = 0, len = cells.length; i < len; i++) {
        let grad = form.gradient([
          "rgba(255,255,255,1)",
          "rgba(255,255,255,0)",
        ]);
        form
          .fillOnly(i % 2 === 0 ? grad(cells[i]) : "rgba(0,0,0,0)")
          .rect(cells[i].subtract(0, offy));
      }
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
  // exportPixelRatio: 2,
  // scaleToFitPadding: 0,
  // scaleToView: true,
  animate: true,
  // fps: 30,
  // playbackRate: "throttle",
  // duration: 4,
  // suffix: new Date().getTime(),
};

canvasSketch(sketch, settings);
