/**
 * pts
 */

const canvasSketch = require("canvas-sketch");
const { CanvasForm, Pt } = require("pts");

const sketch = ({ canvas, context: ctx }) => {
  const form = new CanvasForm(ctx);

  return ({ context, width, height }) => {
    context.fillStyle = "white";
    context.fillRect(0, 0, width, height);
  };
};

const settings = {
  dimensions: [600, 600],
  pixelRatio: 2,
  exportPixelRatio: 2,
  // scaleToFitPadding: 0,
  scaleToView: true,
  animate: true,
  // fps: 30,
  // playbackRate: "throttle",
  duration: 4,
  // suffix: new Date().getTime(),
};

canvasSketch(sketch, settings);
