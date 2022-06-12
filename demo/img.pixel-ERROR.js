/**
 * img.pixel
 * https://ptsjs.org/demo/edit/?name=img.pixel
 */

const path = require("path");
const canvasSketch = require("canvas-sketch");
const createInputEvents = require("simple-input-events");
const {
  CanvasForm,
  Pt,
  Bound,
  Util,
  Img,
  Particle,
  World,
  Group,
  Num,
} = require("pts");

const sketch = ({ canvas, context: ctx, pixelRatio, width, height }) => {
  const form = new CanvasForm(ctx);
  const size = new Pt(width, height);
  const center = size.$divide(2);
  const innerBound = new Bound(new Pt(), new Pt(size));

  const png =
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAAAoCAYAAAAIeF9DAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAVVSURBVHgB7ZrXVTM5FIDlPfsOVEAqAKiA0AChAUIDhAYIDQANEBogNEAqgNAAoQKgAWb1ac/VXguNPWOP99eDvnPmjBmP0s2SaRljCpNJheIvk0mKrJDEyApJjKyQxMgKSYyskMTICkmMrJDEyApJjL/NABkeHnYXvL+/m/8bPf7X15e7NGNjY/5zL/OT9k2vrRjUdXZ2Vgh28pXa3N7eFqenp8Xc3Jx/tru7655zTU9P+2dvb28d+52fn/fjn5yctH3XarVcf/Dz89M2XpVrfHzcjf/6+lqsrq42JbOf2h5iF9FmWcLd3Z3Z3t72FglDQ0P+c9gmZlVra2vGCsZ95m4X7T5zl+f0v7W1Zfb29vx8rOB9f1aZfiw9F97hXY1Vrrtb5ZjDw0PvQZ+fn2ZlZcWUQV8XFxe+f9peX1//8sBeqaVFrCIG1mYFWlSlW9/a6rSnLS4uumdHR0dtY3ebXx2welPiFZeXl6VtqkYB06SHCFgkXoFVN8Hm5mZbTD4/P4++NzIy4u54yOzsrLPyl5cX/z2WKp5Jf+JZMl/N0tKSt/Krq6s2D9HQB+9aI2nzOvpjDC682BqDscbj5h6OVZW+FLK+vt6mECbBM4EFiEAIM9/f39G+WJCEIDg+Pv41VgjCk7Gen5/9c8YRCC0yPu9/fHz86gMB47CMqYVIOxTOXfoQUNjBwYGxXuoUQfiS8Ic8uMQAMBDmVzXxN1plsbiygXmuFYISeEYbYru2vE6xGCHhAQiANtzFQjstmvdEaN0gp+AReG0MvJS8wVUGc0IxzHdhYcFUpWeFyIAaG1+jCR8ICZr9/X3nFToJa/hudHTUC1woC5FaoQIhhHEEm3+8UrDe+/t7/51WJh5DO95nbAyEMCR/d4J1ypzpB2XUKYv7UgjC7AcsDEuMQbjrtnhAWOJpAhZ+c3Pz613dX9g3lowANzY2XH+EJapGjAJlyDhTU1OmDNrv7Oy4d1kXnlx3j9JoyNL5Q4PFiHtjlVg/E+1UEBB3RWgS64F2WC/fi5BihHE/RJKx5t/i7z/wInKSzkuShxibHKJzH+h3eymDW6bmb+qEARaCQLAgqe2ZPIkxFjqwMpk470kVwoSfnp68YMVbUCx/a4FL5cPfsj8pXZT1ELvZc5/pQ4qEspBlN5nujkImJib8mIxjy1lTJofJyUk/Ttk79FeDomcPYaFhaYcXdAszUrUgdEpErJ24i7Vpwr7FS+ife1ObsNQY6FlWFVBKFfBICUNYedU6H+WJB2hi5WwnMBwuPCZmdHgDCRzvLPOqKvSV1MP4Sd0vAmCzJsJm4VIAUJcTZ+taOP3pYxVRCMk/tomMKUznDcJSmH8IWf14Hv2hkH7oSyExy5M9BUJDIeHCyQV1Kw8grMm+gFwgxkCoYyysV6obiClJV254HMYRIu3DMp0qjPXGcmTTNHaWZYIzJpuw3TNOUgVOck2Xk2HOxMLvrSAKq0z/jvUyd3ZU9nc/yOkvZ1dlcHbFibGAXOQEWnh8fKx9ltXzD1SEBNxTLsIVEI7EA3S52i+6WgIKCDaigj4++RNY+ZuHh4e2/NLLnGqHLC3sMpaXl90GilCC0JpSCuGJsCX9SQkrFR/PxTBi0FaHtE4FBcKUg0yQkwVNmC9oI+U8OS+sHKtQWyGdFqwnxsUmKvwNotdTUGCh8ruGVrLki1gpLiA8vRGNnf7GkKOXKu+SH6vIpxMDLXtZBIpBeNxJlGXH6jrZh8ffGvqZmZlx1ooX0ia03DKqjiGg4Kp9N0XtnXpmoOT/fk+NrJDEyApJjKyQxMgKSYyskMTICkmMrJDEyApJjH8Ac2F2JEYYE4QAAAAASUVORK5CYII=";
  const colors = ["#00ff11", "#ff1133", "#1100ff", "#00ff11"];
  const mobile = Util.isMobile(); // since image filter functions not consistent in mobile browsers
  let img = new Img(true, pixelRatio);
  let offset = new Pt(0, 0);
  let etch = true;
  let world;
  let lastTime = 0;

  // mouse events
  const event = createInputEvents(canvas);
  const mouse = new Pt();
  event.on("down", ({ position, event }) => {
    etch = !etch;
  });
  event.on("up", ({ position, event }) => {});
  event.on("move", ({ position, event, dragging, uv }) => {
    mouse.to(uv).multiply(size);
  });

  // A laser pointer that extends the Particle class
  class Laser extends Particle {
    direction = Num.randomRange(Math.PI * 2);
    ang = Num.randomRange(Math.PI / 20, Math.PI / 10);
    threshold = Num.randomRange(0.02, 0.3);
    steps = [];
    hue = Math.floor(Math.random() / 0.3);

    bend() {
      this.steps.push(this.clone());
      if (this.steps.length > 5) this.steps.shift();

      this.direction += Math.random() * this.ang;
      if (Math.random() < this.threshold) {
        this.hit(Math.cos(this.direction), Math.sin(this.direction));
      }
    }
  }

  function pixelValue(p) {
    return img.pixel(p.$subtract(offset), false)[0];
  }

  // create particles
  world = new World(
    Bound.fromGroup(new Group(new Pt(-50, -50), size.$add(50))),
    0.96,
    0
  );
  for (let i = 0; i < 70; i++) {
    world.add(new Laser(Num.randomPt(size)).size(Num.randomRange(1, 3)));
  }

  // load image and resize it to match canvas
  img.load(png).then((s) => {
    s.resize(new Pt(size.x / 100, size.x / 100), true);
    offset = size.$subtract(img.canvasSize).divide(2);
  });

  // initial background paint
  form.fillOnly("#111").rect([[0, 0], size]);

  return {
    render({ context: ctx, time, frame, fps }) {
      time *= 1000;

      if (!etch) {
        // if not etching, make "fog"
        if (mobile) {
          form.fillOnly("#00000011").rect(size.toGroup());
        } else if (time - lastTime > 100) {
          ctx.filter = "blur(2px) brightness(99%)";
          lastTime = time;
          form.image(innerBound, canvas);
          ctx.filter = "none";
        }
      }

      // form.composite("lighter"); // REVIEW: error
      // ctx.globalCompositeOperation = "lighter";

      if (img.loaded) {
        world.drawParticles((p) => {
          p.bend();
          const gray = pixelValue(p);
          const hue = colors[p.hue];
          if (gray > 155) {
            // If a white-ish pixel in the image
            form.strokeOnly(hue + "33", etch ? 1 : 2).line(p.steps);
            form.fillOnly(hue + "33").point(p, (255 - gray) / 40, "circle");
          } else {
            form.strokeOnly(hue + "22", etch ? 0.5 : 1).line(p.steps);
          }
        });
        form.stroke(false);
        world.update(frame / fps);
      }
    },
    resize({ width, height }) {
      size.to(width, height);
      center.to(size.$divide(2));
      innerBound.bottomRight = size;

      console.log(width, height);
      console.log(size.toGroup());
      // TOFIX:
      // 1. this always returns size of pixelRatio=1. strange.
      // 2. why is there stroke? (when refreshing page)
      form.stroke(false).fill("#000000").rect(size.toGroup());
    },
  };
};

const settings = {
  // dimensions: [600, 600],
  // pixelRatio: 1,
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
