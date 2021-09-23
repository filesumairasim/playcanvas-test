import React, { useRef, useLayoutEffect } from "react";
import * as pc from "playcanvas";
import asteroid_img from "./Asteroid-1.png";

const Asteroids = () => {
  const canvasRef = useRef(null);
  const appRef = useRef(null);

  useLayoutEffect(() => {
    let app = new pc.Application(canvasRef.current, {});
    app.start();

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
      }
    );

    appRef.current = app;
  }, []);

  return (
    <>
      <div>
        <canvas ref={canvasRef} />
      </div>
    </>
  );
};

export default Asteroids;
