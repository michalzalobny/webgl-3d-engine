interface Constructor {
  texturesToLoad: string[];
  gl: WebGL2RenderingContext | null;
}

interface TextureObject {
  texture: WebGLTexture;
  textureIndex: number;
  width: number;
  height: number;
}

export class TexturesManager {
  private gl: WebGL2RenderingContext | null = null;

  loadedTextures: Map<string, TextureObject> = new Map();

  isReady = false;

  constructor(props: Constructor) {
    const { texturesToLoad, gl } = props;

    this.gl = gl;
    if (!this.gl) return;

    const promises = texturesToLoad.map(async (textureUrl, key) => {
      await this.loadTexture(this.gl, textureUrl, key);
    });

    Promise.all(promises).then(() => {
      this.isReady = true;
    });
  }

  getTexture(textureUrl: string) {
    const textureObject = this.loadedTextures.get(textureUrl);
    if (!this.isReady) return null;
    if (!textureObject) {
      console.error(`Texture ${textureUrl} not found.`);
      return null;
    }
    return textureObject;
  }

  // Function to load a texture
  private async loadTexture(
    gl: WebGL2RenderingContext | null,
    url: string,
    textureIndex: number
  ) {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.crossOrigin = "anonymous";
      image.src = url;

      const onLoaded = () => {
        if (!gl) {
          console.error("WebGL context or shader program is not available.");
          reject();
          return;
        }

        // Create and bind the texture
        const texture = gl.createTexture();
        if (!texture) {
          console.error("Unable to create texture.");
          reject();
          return;
        }
        gl.bindTexture(gl.TEXTURE_2D, texture);

        const mode = gl.REPEAT; // or gl.CLAMP_TO_EDGE

        // Set the texture parameters
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, mode);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, mode);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

        // Upload the image to the texture
        gl.texImage2D(
          gl.TEXTURE_2D,
          0,
          gl.RGBA,
          gl.RGBA,
          gl.UNSIGNED_BYTE,
          image
        );

        const isPowerOfTwo = (value: number) => {
          return (value & (value - 1)) == 0;
        };
        if (isPowerOfTwo(image.width) && isPowerOfTwo(image.height)) {
          gl.generateMipmap(gl.TEXTURE_2D);
        }

        this.loadedTextures.set(url, {
          texture,
          height: image.height,
          width: image.width,
          textureIndex,
        });

        // Unbind the texture
        gl.bindTexture(gl.TEXTURE_2D, null);

        resolve(null);
      };

      if (image.complete) {
        onLoaded();
      } else {
        image.onload = onLoaded;
        image.onerror = function () {
          console.error("Failed to load texture image:", url);
          reject();
        };
      }
    });
  }
}
