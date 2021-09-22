import React, { useRef, useLayoutEffect } from "react";
import post from "./post.png";
import ship from "./ship.png";
import * as pc from "playcanvas";

const Playcanvas = () => {
  const canvasRef = useRef(null);
  const appRef = useRef(null);

  useLayoutEffect(() => {
    const app = new pc.Application(canvasRef.current, {
      keyboard: new pc.Keyboard(window),
      mouse: new pc.Mouse(canvasRef.current),
      touch: pc.platform.touch ? new pc.TouchDevice(canvasRef.current) : null,
    });

    app.start();

    app.setCanvasFillMode(pc.FILLMODE_FILL_WINDOW);
    app.setCanvasResolution(pc.RESOLUTION_AUTO);

    window.addEventListener("resize", function () {
      app.resizeCanvas();
    });

    const camera = new pc.Entity("camera");
    camera.addComponent("camera", {
      clearColor: new pc.Color(0.1, 0.1, 0.1),
    });

    const light = new pc.Entity("light");
    light.addComponent("light");

    // Background image sprie

    app.assets.loadFromUrlAndFilename(
      post,
      "post.png",
      "texture",
      function (err, asset) {
        var texture = asset.resource;
        texture.addressU = pc.ADDRESS_CLAMP_TO_EDGE;
        texture.addressV = pc.ADDRESS_CLAMP_TO_EDGE;
        texture.minFilter = pc.FILTER_NEAREST;
        texture.magFilter = pc.FILTER_NEAREST;

        var atlas = new pc.TextureAtlas();
        atlas.frames = {
          0: {
            rect: new pc.Vec4(0, 0, 1920, 997),
            pivot: new pc.Vec2(0.5, 0.5),
          },
        };
        atlas.texture = texture;

        var sprite = new pc.Sprite(app.graphicsDevice, {
          atlas: atlas,
          frameKeys: "0",
          pixelsPerUnit: 100,
          renderMode: pc.SPRITE_RENDERMODE_SIMPLE,
        });

        var spriteAsset = new pc.Asset("sprite", "sprite", { url: "" });
        spriteAsset.resource = sprite;
        spriteAsset.loaded = true;
        app.assets.add(spriteAsset);

        var background = new pc.Entity();
        background.addComponent("sprite", {
          type: pc.SPRITETYPE_SIMPLE,
          spriteAsset: spriteAsset,
        });

        app.root.addChild(background);
        background.setPosition(0, 0, -1);
      }
    );

    // Ship image sprie

    app.assets.loadFromUrlAndFilename(
      ship,
      "ship.png",
      "texture",
      function (err, asset) {
        var texture = asset.resource;
        texture.addressU = pc.ADDRESS_CLAMP_TO_EDGE;
        texture.addressV = pc.ADDRESS_CLAMP_TO_EDGE;
        texture.minFilter = pc.FILTER_NEAREST;
        texture.magFilter = pc.FILTER_NEAREST;

        var atlas = new pc.TextureAtlas();
        atlas.frames = {
          0: {
            rect: new pc.Vec4(0, 0, 300, 455),
            pivot: new pc.Vec2(0.5, 0.5),
          },
        };
        atlas.texture = texture;

        var sprite = new pc.Sprite(app.graphicsDevice, {
          atlas: atlas,
          frameKeys: "0",
          pixelsPerUnit: 100,
          renderMode: pc.SPRITE_RENDERMODE_SIMPLE,
        });

        var spriteAsset = new pc.Asset("sprite", "sprite", { url: "" });
        spriteAsset.resource = sprite;
        spriteAsset.loaded = true;
        app.assets.add(spriteAsset);

        var ship = new pc.Entity();
        ship.addComponent("sprite", {
          type: pc.SPRITETYPE_SIMPLE,
          spriteAsset: spriteAsset,
        });

        app.root.addChild(ship);
        ship.setPosition(0, -2, 0);
        ship.setLocalScale(0.1, 0.1, 0);
        ship.addComponent("rigidbody", {
          type: pc.BODYTYPE_KINEMATIC,
          mass: 10,
        });

        if (app.keyboard.isPressed(pc.KEY_LEFT)) {
          console.log("edsfgsd");
        }

        app.on("update", (dt) => {
          camera.setPosition(0, 0, 10);

          let rb = ship.rigidbody;

          const moveHorizontal = function () {
            if (app.keyboard.isPressed(pc.KEY_LEFT)) {
              return 1;
            }
            if (app.keyboard.isPressed(pc.KEY_RIGHT)) {
              return -1;
            }
            return 0;
          };

          const moveVertical = function () {
            if (app.keyboard.isPressed(pc.KEY_DOWN)) {
              return -1;
            }
            if (app.keyboard.isPressed(pc.KEY_UP)) {
              return 1;
            }
            return 0;
          };

          const movement = new pc.Vec3(moveHorizontal, moveVertical, 0);
          rb.linearVelocity = movement.scale(10);
        });
      }
    );

    app.root.addChild(camera);
    app.root.addChild(light);
    camera.setPosition(0, 0, 3);
    light.setEulerAngles(45, 0, 0);

    appRef.current = app;
  }, []);

  return (
    <>
      <div style={{ overflow: "hidden", width: "100%", height: "100vh" }}>
        <canvas ref={canvasRef} />
      </div>
    </>
  );
};

export default Playcanvas;

// (scrollSpeed = 10), (tileSizeZ = 30);
// let startPosition = box.getPosition().clone();

// function repeat(t, length) {
//   if (t > 0) return t % length;

//   return length + (t % length);
// }

// const newPosition = repeat(time * scrollSpeed, tileSizeZ);
// box.setPosition(startPosition.clone().add(box.forward).scale(newPosition));
