import React, { useRef, useLayoutEffect } from "react";
import post from "./post.png";
import ship from "./ship.png";
import asteroid_img from "./Asteroid-1.png";
import * as pc from "playcanvas";
import "./css/style.css";
import Animation from "./Animation";

const Game = () => {
  const canvasRef = useRef(null);
  const appRef = useRef(null);

  useLayoutEffect(() => {
    const keyboard = new pc.Keyboard(window);
    const app = new pc.Application(canvasRef.current, {
      keyboard: keyboard,
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

    // Ship image sprite

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
          type: pc.BODYTYPE_DYNAMIC,
          mass: 10,
        });

        let xMin = -8,
          xMax = 8,
          yMin = -3.5,
          yMax = 3.5;

        let rb = ship.rigidbody;

        app.on("update", (dt) => {
          camera.setPosition(0, 0, 10);

          const moveHorizontal = (function () {
            if (app.keyboard.isPressed(pc.KEY_LEFT)) {
              return 1;
            }
            if (app.keyboard.isPressed(pc.KEY_RIGHT)) {
              return -1;
            }
            return 0;
          })();

          const moveVertical = (function () {
            if (app.keyboard.isPressed(pc.KEY_DOWN)) {
              return -1;
            }
            if (app.keyboard.isPressed(pc.KEY_UP)) {
              return 1;
            }
            return 0;
          })();

          const movement = new pc.Vec3(-moveHorizontal, moveVertical, 0).scale(
            0.05
          );

          const position = new pc.Vec3().copy(ship.getPosition());

          position.x = pc.math.clamp(position.x, xMin, xMax);
          position.y = pc.math.clamp(position.y, yMin, yMax);

          rb.teleport(position);
          ship.translate(movement);
        });
      }
    );

    app.root.addChild(camera);
    app.root.addChild(light);
    camera.setPosition(0, 0, 10);

    var GameController = pc.createScript("gameController");

    GameController.attributes.add("spawnValues", {
      type: "vec3",
      default: new pc.Vec3(6, 0, 16),
    });

    GameController.attributes.add("hazardCount", {
      type: "number",
      default: 10,
    });

    GameController.attributes.add("spawnWait", {
      type: "number",
      default: 0.5,
      placeholder: "s",
    });

    GameController.attributes.add("waveWait", {
      type: "number",
      default: 4,
      placeholder: "s",
    });

    GameController.attributes.add("startWait", {
      type: "number",
      default: 1,
      placeholder: "s",
    });

    GameController.prototype.initialize = function () {
      const self = this;
      const waitForSeconds = (seconds) =>
        new Promise((resolve) => setTimeout(resolve, seconds * 1000));

      const spawnWaves = async () => {
        await waitForSeconds(self.startWait);

        while (true) {
          for (let i = 0; i < this.hazardCount; i++) {
            const hazards = this.app.root.findByTag("hazard");
            const newHazard =
              hazards[Math.floor(pc.math.random(0, hazards.length))].clone();
            const spawnPosition = new pc.Vec3(
              pc.math.random(-this.spawnValues.x, this.spawnValues.x),
              this.spawnValues.y,
              this.spawnValues.z
            );
            newHazard.rigidbody.teleport(spawnPosition);
            newHazard.enabled = true;

            await waitForSeconds(self.spawnWait);
          }
          await waitForSeconds(self.waveWait);
        }
      };

      spawnWaves();
    };

    // Asteroid images

    app.assets.loadFromUrlAndFilename(
      asteroid_img,
      "Asteroid-1.png",
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
            rect: new pc.Vec4(0, 0, 400, 400),
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

        var asteroids = new pc.Entity();
        asteroids.addComponent("sprite", {
          type: pc.SPRITETYPE_SIMPLE,
          spriteAsset: spriteAsset,
        });

        app.root.addChild(asteroids);
        asteroids.setLocalScale(0.2, 0.2, 0);
        asteroids.tags.add("hazards");
        asteroids.addComponent("rigidbody", {
          type: pc.BODYTYPE_DYNAMIC,
          mass: 5,
        });

        asteroids.addComponent("collision");

        asteroids.addComponent("script");
        asteroids.script.create(GameController);
      }
    );

    appRef.current = app;
  }, []);

  return (
    <div style={{ width: "100%", height: "100vh" }}>
      <canvas ref={canvasRef} />
      <Animation />
    </div>
  );
};

export default Game;
