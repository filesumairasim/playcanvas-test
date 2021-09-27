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

    const camera = new pc.Entity("Camera");
    camera.addComponent("camera", {
      clearColor: new pc.Color(0.1, 0.1, 0.1),
    });

    const light = new pc.Entity("Light");
    light.addComponent("light");

    // Background image sprite

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

        const atlas = new pc.TextureAtlas();
        atlas.frames = {
          0: {
            rect: new pc.Vec4(0, 0, 1920, 997),
            pivot: new pc.Vec2(0.5, 0.5),
          },
        };
        atlas.texture = texture;

        const sprite = new pc.Sprite(app.graphicsDevice, {
          atlas: atlas,
          frameKeys: "0",
          pixelsPerUnit: 100,
          renderMode: pc.SPRITE_RENDERMODE_SIMPLE,
        });

        const spriteAsset = new pc.Asset("sprite", "sprite", { url: "" });
        spriteAsset.resource = sprite;
        spriteAsset.loaded = true;
        app.assets.add(spriteAsset);

        const background = new pc.Entity("Background");
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
        const texture = asset.resource;
        texture.addressU = pc.ADDRESS_CLAMP_TO_EDGE;
        texture.addressV = pc.ADDRESS_CLAMP_TO_EDGE;
        texture.minFilter = pc.FILTER_NEAREST;
        texture.magFilter = pc.FILTER_NEAREST;

        const atlas = new pc.TextureAtlas();
        atlas.frames = {
          0: {
            rect: new pc.Vec4(0, 0, 300, 455),
            pivot: new pc.Vec2(0.5, 0.5),
          },
        };
        atlas.texture = texture;

        const sprite = new pc.Sprite(app.graphicsDevice, {
          atlas: atlas,
          frameKeys: "0",
          pixelsPerUnit: 100,
          renderMode: pc.SPRITE_RENDERMODE_SIMPLE,
        });

        const spriteAsset = new pc.Asset("sprite", "sprite", { url: "" });
        spriteAsset.resource = sprite;
        spriteAsset.loaded = true;
        app.assets.add(spriteAsset);

        const ship = new pc.Entity("Space_Ship");
        ship.addComponent("sprite", {
          type: pc.SPRITETYPE_SIMPLE,
          spriteAsset: spriteAsset,
        });

        app.root.addChild(ship);
        ship.setPosition(0, -1, 0);
        ship.setLocalScale(0.1, 0.1, 0);
        ship.addComponent("rigidbody", {
          type: pc.BODYTYPE_DYNAMIC,
          mass: 0,
        });

        ship.addComponent("collision");

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

          ship.collision.on("collisionstart", () => {
            console.log("collision");
          });
        });
      }
    );

    app.root.addChild(camera);
    app.root.addChild(light);
    camera.setPosition(0, 0, 10);

    const GameController = pc.createScript("gameController");

    GameController.attributes.add("spawnValues", {
      type: "vec3",
      default: new pc.Vec3(4, 5, 0),
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
        const texture = asset.resource;
        texture.addressU = pc.ADDRESS_CLAMP_TO_EDGE;
        texture.addressV = pc.ADDRESS_CLAMP_TO_EDGE;
        texture.minFilter = pc.FILTER_NEAREST;
        texture.magFilter = pc.FILTER_NEAREST;

        const atlas = new pc.TextureAtlas();
        atlas.frames = {
          0: {
            rect: new pc.Vec4(0, 0, 400, 400),
            pivot: new pc.Vec2(0.5, 0.5),
          },
        };
        atlas.texture = texture;

        const sprite = new pc.Sprite(app.graphicsDevice, {
          atlas: atlas,
          frameKeys: "0",
          pixelsPerUnit: 100,
          renderMode: pc.SPRITE_RENDERMODE_SIMPLE,
        });

        const spriteAsset = new pc.Asset("sprite", "sprite", { url: "" });
        spriteAsset.resource = sprite;
        spriteAsset.loaded = true;
        app.assets.add(spriteAsset);

        const asteroid = new pc.Entity("Asteroid");
        asteroid.addComponent("sprite", {
          type: pc.SPRITETYPE_SIMPLE,
          spriteAsset: spriteAsset,
        });

        app.root.addChild(asteroid);
        asteroid.setLocalScale(0.2, 0.2, 0);
        asteroid.tags.add("hazard");
        asteroid.addComponent("rigidbody", {
          type: pc.BODYTYPE_DYNAMIC,
          mass: 5,
        });

        asteroid.addComponent("collision");
        asteroid.setPosition(6, 5, 0);

        const asteroid_2 = asteroid.clone();
        app.root.addChild(asteroid_2);
        asteroid_2.tags.add("hazard");
        asteroid_2.setPosition(-6, 5, 0);

        const asteroid_3 = asteroid.clone();
        app.root.addChild(asteroid_3);
        asteroid_3.setPosition(0, 5, 0);
        asteroid_3.tags.add("hazard");

        asteroid.enabled = false;
        asteroid_2.enabled = false;
        asteroid_3.enabled = false;

        const Mover = pc.createScript("mover");

        Mover.attributes.add("speed", {
          type: "number",
          default: 1,
        });

        // initialize code called once per entity
        Mover.prototype.initialize = function (dt) {
          // Create a vec3 to hold the lerped position
          this.lerpedPosition = new pc.Vec3();
          // How fast the entity will reach the target
          this.speed = 0.3;
        };

        // update code called every frame
        Mover.prototype.update = function (dt) {
          this.targetPosition = new pc.Vec3(this.entity.getPosition().x, -6, 0);
          // Lerp the current position and the target position
          this.lerpedPosition.lerp(
            this.entity.getPosition(),
            this.targetPosition,
            this.speed * dt
          );

          // Update the entity's position to the lerped position
          this.entity.setPosition(this.lerpedPosition);
          //console.log(this.targetPosition);

          if (this.entity.getPosition.y >= -6) {
            this.entity.destroy();
          }
        };

        const asteroidArray = [asteroid, asteroid_2, asteroid_3];

        asteroidArray.forEach((asteroid) => {
          asteroid.addComponent("script");
          asteroid.script.create(Mover, {
            attributes: {
              speed: -5,
            },
          });
        });

        const gameController = new pc.Entity("GameController");
        gameController.addComponent("script");

        gameController.script.create(GameController, {
          attributes: {
            spawnValues: new pc.Vec3(pc.math.random(6, -6), 5, 0),
            hazardCount: pc.math.random(3, 7),
            spawnWait: 0.5,
            waveWait: 4,
            startWait: 2,
          },
        });

        //app.root.addChild(gameController);
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
