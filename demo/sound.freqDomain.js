/**
 * sound.freqDomain
 * https://ptsjs.org/demo/edit/?name=sound.freqDomain
 */

const path = require("path");
const canvasSketch = require("canvas-sketch");
const createInputEvents = require("simple-input-events");
const {
  CanvasForm,
  Pt,
  Bound,
  Sound,
  Create,
  Num,
  Curve,
  Triangle,
  Geom,
  Group,
  Const,
} = require("pts");

const sketch = ({ canvas, context: ctx, width, height }) => {
  const form = new CanvasForm(ctx);
  const size = new Pt(width, height);
  const center = size.$divide(2);
  const innerBound = new Bound(new Pt(), new Pt(size));

  var sound;
  var bins = 256;
  var ctrls, radius;
  var colors = ["#f06", "#30f", "#fff", "#fe3", "#0c9"];
  var bufferLoaded = false;

  // Buffer and play - work across all browsers but no streaming and more code
  Sound.loadAsBuffer("/assets/beautiful-moments.mp3")
    .then((s) => {
      sound = s;
      bufferLoaded = true;
    })
    .catch((e) => console.error(e));

  // Need this because AudioBuffer can only play once
  function toggle() {
    if (sound.playing || !bufferLoaded) {
      sound.stop();
    } else {
      sound.createBuffer().analyze(bins); // recreate buffer again
      sound.start();
    }
  }

  // Draw play button
  function playButton() {
    if (!bufferLoaded) {
      form.fillOnly("#9ab").text([20, 30], "Loading...");
      return;
    }
    if (!sound || !sound.playing) {
      form.fillOnly("#f06").rect([
        [0, 0],
        [50, 50],
      ]);
      form
        .fillOnly("#fff")
        .polygon(
          Triangle.fromCenter([25, 25], 10).rotate2D(Const.half_pi, [25, 25])
        );
    } else {
      form.fillOnly("rgba(0,0,0,.2)").rect([
        [0, 0],
        [50, 50],
      ]);
      form.fillOnly("#fff").rect([
        [18, 18],
        [32, 32],
      ]);
    }
  }

  function getCtrlPoints(t) {
    let r = radius + radius * (Num.cycle((t % 3000) / 3000) * 0.2);
    let temp = ctrls.clone();

    for (let i = 0, len = temp.length; i < len; i++) {
      let d = ctrls[i].$subtract(mouse);

      if (d.magnitudeSq() < r * r) {
        // push out if inside threshold
        temp[i].to(mouse.$add(d.unit().$multiply(r)));
      } else if (!ctrls[i].equals(temp[i], 0.1)) {
        // pull in if outside threshold
        temp[i].to(Geom.interpolate(temp[i], ctrls[i], 0.02));
      }
    }

    // close the bspline curve with 3 extra points
    temp.push(temp.p1, temp.p2, temp.p3);
    return temp;
  }

  radius = size.minValue().value / 3;
  ctrls = Create.radialPts(center, radius, 10, -Const.pi - Const.quarter_pi);

  // mouse events
  const event = createInputEvents(canvas);
  const mouse = new Pt();
  event.on("down", ({ position, event }) => {});
  event.on("up", ({ position, event }) => {
    if (Geom.withinBound(mouse, [0, 0], [50, 50])) {
      toggle();
    }
  });
  event.on("move", ({ position, event, dragging, uv }) => {
    mouse.to(uv).multiply(size);
  });

  return {
    render({ playhead, time }) {
      form.fillOnly("#fe3").rect([[0, 0], size]);

      if (sound && sound.playable) {
        // get b-spline curve and draw face shape
        let anchors = getCtrlPoints(time);
        let curve = Curve.bspline(anchors, 4);
        let center = anchors.centroid();
        form.fillOnly("#30f").polygon(curve);

        // initiate spikes array, evenly distributed spikes aroundthe face
        let spikes = [];
        for (let i = 0; i < bins; i++) {
          spikes.push(curve.interpolate(i / bins));
        }

        // calculate spike shapes based on freqs
        let freqs = sound.freqDomainTo([bins, 1]);
        let tris = [];
        let tindex = 0;
        let f_acc = 0;

        let temp;
        for (let i = 0, len = freqs.length; i < len; i++) {
          let prev = spikes[i === 0 ? spikes.length - 1 : i - 1];
          let dp = spikes[i].$subtract(prev);
          f_acc += freqs[i].y;

          if (dp.magnitudeSq() < 2) continue;

          if (tindex === 0) {
            temp = [spikes[i]];
          } else if (tindex === 1) {
            let pp = Geom.perpendicular(dp);
            temp.push(
              spikes[i].$add(pp[1].$unit().multiply(freqs[i].y * radius))
            );
          } else if (tindex === 2) {
            temp.push(spikes[i]);
            tris.push(temp);
          }

          tindex = (i + 1) % 3;
        }

        // draw spikes
        let f_scale = f_acc / bins;
        for (let i = 0, len = tris.length; i < len; i++) {
          let c = colors[i % colors.length];
          form.fillOnly(c).polygon(tris[i]);
          form.fillOnly(c).point(tris[i][1], freqs[i].y * 10, "circle");
        }

        // draw "lips" based on time domain data
        let tdata = sound
          .timeDomainTo([radius, 10], [center.x - radius / 2, 0])
          .map(
            (t, i) =>
              new Group(
                [
                  t.x,
                  center.y - t.y * Num.cycle(i / bins) * (0.5 + 1.5 * f_scale),
                ],
                [
                  t.x,
                  center.y +
                    t.y * Num.cycle(i / bins) * (0.5 + 10 * f_scale) +
                    30,
                ]
              )
          );

        for (let i = 0, len = tdata.length; i < len; i++) {
          let t2 = [
            tdata[i].interpolate(0.25 + 0.2 * f_scale),
            tdata[i].interpolate(0.5 + 0.3 * f_scale),
          ];
          form.strokeOnly("#f06").line(tdata[i]);
          form.strokeOnly("#30f", 2).line(t2);
        }

        // draw eyes
        let eyeRight = center
          .clone()
          .toAngle(-Const.quarter_pi - 0.2, radius / 2, true);
        let eyeLeft = center
          .clone()
          .toAngle(-Const.quarter_pi - Const.half_pi + 0.2, radius / 2, true);
        form
          .fillOnly("#fff")
          .ellipse(
            eyeLeft,
            [8 + 10 * f_scale, 10 + 8 * f_scale],
            0 - 1 * f_scale
          );
        form
          .fillOnly("#fff")
          .ellipse(
            eyeRight,
            [8 + 10 * f_scale, 10 + 8 * f_scale],
            0 + 1 * f_scale
          );

        let eyeBallRight = eyeRight
          .clone()
          .toAngle(eyeRight.$subtract(mouse).angle(), -5, true);
        let eyeBallLeft = eyeLeft
          .clone()
          .toAngle(eyeLeft.$subtract(mouse).angle(), -5, true);
        form
          .fill("#123")
          .points([eyeBallLeft, eyeBallRight], 2 + 10 * f_scale, "circle");
      }
      playButton();
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
