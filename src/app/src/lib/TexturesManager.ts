interface Constructor {
  gl: WebGL2RenderingContext | null;
}

interface TextureObject {
  texture: WebGLTexture;
  textureIndex: number;
  width: number;
  height: number;
}

interface LoadTexture {
  gl: WebGL2RenderingContext | null;
  url: string;
  textureIndex: number;
}

export class TexturesManager {
  private gl: WebGL2RenderingContext | null = null;
  private isReady = false;
  private startedLoading = false;
  private loadedTextures: Map<string, TextureObject> = new Map();

  constructor(props: Constructor) {
    const { gl } = props;

    this.gl = gl;
    if (!this.gl) return;
  }

  getTexture(textureUrl: string) {
    const textureObject = this.loadedTextures.get(textureUrl);
    if (!this.isReady) return null;
    if (!textureObject) {
      console.error(`Texture not found. ${textureUrl} `);
      return null;
    }
    return textureObject;
  }

  private loadImage(url: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.crossOrigin = "anonymous";
      image.src = url;

      const onLoaded = () => {
        resolve(image);
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

  private async loadTexture(props: LoadTexture) {
    const { gl, url, textureIndex } = props;

    const image = await this.loadImage(url);

    if (!gl) {
      return console.error("WebGL context or shader program is not available.");
    }

    // Create and bind the texture
    const texture = gl.createTexture();
    if (!texture) {
      return console.error("Unable to create texture.");
    }
    gl.bindTexture(gl.TEXTURE_2D, texture);

    const mode = gl.REPEAT; // or gl.CLAMP_TO_EDGE

    // Set the texture parameters
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, mode);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, mode);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

    // Upload the image to the texture
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);

    // Generate mipmaps
    const isPowerOfTwo = (value: number) => {
      return (value & (value - 1)) == 0;
    };
    if (isPowerOfTwo(image.width) && isPowerOfTwo(image.height)) {
      gl.generateMipmap(gl.TEXTURE_2D);
    }

    // Add the texture to the loaded textures
    this.loadedTextures.set(url, {
      texture,
      height: image.height,
      width: image.width,
      textureIndex,
    });

    // Unbind the texture
    gl.bindTexture(gl.TEXTURE_2D, null);
  }

  async addTexturesToLoad(texturesToLoad: string[]) {
    if (!this.gl) {
      return console.error("WebGL context not available for TexturesManager.");
    }

    if (this.startedLoading) {
      console.error(
        "TexturesManager already started loading textures. Cannot add more textures."
      );
      return;
    }

    this.startedLoading = true;

    const promises = texturesToLoad.map((textureUrl, key) => {
      return this.loadTexture({
        gl: this.gl,
        url: textureUrl,
        textureIndex: key,
      });
    });

    return Promise.allSettled(promises).then(() => {
      this.isReady = true;
      Promise.resolve();
    });
  }

  destroy() {
    this.loadedTextures.forEach((textureObject) => {
      this.gl?.deleteTexture(textureObject.texture);
    });
    this.loadedTextures.clear();
  }
}
