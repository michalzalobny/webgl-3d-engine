interface Constructor {
  gl: WebGL2RenderingContext | null;
}

interface TextureObject {
  width: number;
  height: number;
  textureIndex: number;
  frameBuffer?: WebGLFramebuffer;
  texture: WebGLTexture;
  depthBuffer?: WebGLRenderbuffer;
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

  getTextureObj(textureUrl: string) {
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
      image.crossOrigin = 'anonymous';
      image.src = url;

      const onLoaded = () => {
        resolve(image);
      };

      if (image.complete) {
        onLoaded();
      } else {
        image.onload = onLoaded;
        image.onerror = function () {
          console.error('Failed to load texture image:', url);
          reject();
        };
      }
    });
  }

  private async loadTexture(props: LoadTexture) {
    const { gl, url, textureIndex } = props;

    const image = await this.loadImage(url);

    if (!gl) {
      return console.error('WebGL context or shader program is not available.');
    }

    // Create and bind the texture
    const texture = gl.createTexture();
    if (!texture) {
      return console.error('Unable to create texture.');
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

    return this.loadedTextures.get(url);
  }

  createFrameBufferTexture(width: number, height: number, name: string) {
    const gl = this.gl;
    if (!gl) return console.error('Cannot create frame buffer texture, WebGL context not available.');

    const frameBuffer = gl.createFramebuffer();
    if (!frameBuffer) return console.error('Cannot create frame buffer for frame buffer texture.');

    gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer);

    // Create and set up the color texture
    const texture = gl.createTexture();
    if (!texture) return console.error('Cannot create frame buffer texture.');
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);

    // Create and set up the depth renderbuffer
    const depthBuffer = gl.createRenderbuffer();
    if (!depthBuffer) return console.error('Cannot create depth renderbuffer.');
    gl.bindRenderbuffer(gl.RENDERBUFFER, depthBuffer);
    gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, width, height);
    gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, depthBuffer);

    // Check if the framebuffer is complete
    const status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
    if (status !== gl.FRAMEBUFFER_COMPLETE) {
      console.error('Framebuffer is not complete. Status:', status);

      // Remove everything in case of error
      gl.bindTexture(gl.TEXTURE_2D, null);
      gl.bindRenderbuffer(gl.RENDERBUFFER, null);
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);

      texture && gl.deleteTexture(texture);
      depthBuffer && gl.deleteRenderbuffer(depthBuffer);
      frameBuffer && gl.deleteFramebuffer(frameBuffer);
    }

    // Add the texture and renderbuffer to the loaded textures
    this.loadedTextures.set(name, {
      width,
      height,
      textureIndex: 0,
      frameBuffer,
      texture,
      depthBuffer,
    });

    // Unbind texture, renderbuffer, and framebuffer
    gl.bindTexture(gl.TEXTURE_2D, null);
    gl.bindRenderbuffer(gl.RENDERBUFFER, null);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    return this.loadedTextures.get(name);
  }

  resizeFrameBufferTextures(width: number, height: number) {
    this.loadedTextures.forEach((textureObject) => {
      // Don't do anything if the texture does not have a frame buffer etc.
      if (!textureObject.frameBuffer || !textureObject.depthBuffer) return;

      const gl = this.gl;
      if (!gl) return console.error('Cannot resize frame buffer texture.');

      gl.bindFramebuffer(gl.FRAMEBUFFER, textureObject.frameBuffer);

      // Resize the color texture
      gl.bindTexture(gl.TEXTURE_2D, textureObject.texture);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);

      // Resize the depth renderbuffer
      gl.bindRenderbuffer(gl.RENDERBUFFER, textureObject.depthBuffer);
      gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, width, height);

      // Unbind texture, renderbuffer, and framebuffer
      gl.bindTexture(gl.TEXTURE_2D, null);
      gl.bindRenderbuffer(gl.RENDERBUFFER, null);
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    });
  }

  async addTexturesToLoad(texturesToLoad: string[]) {
    if (!this.gl) {
      return console.error('WebGL context not available for TexturesManager.');
    }

    if (this.startedLoading) {
      console.error('TexturesManager already started loading textures. Cannot add more textures.');
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
      if (textureObject.texture) {
        this.gl?.deleteTexture(textureObject.texture);
      }

      if (textureObject.frameBuffer) {
        this.gl?.deleteFramebuffer(textureObject.frameBuffer);
      }

      if (textureObject.depthBuffer) {
        this.gl?.deleteRenderbuffer(textureObject.depthBuffer);
      }
    });
    this.loadedTextures.clear();
  }

  resize() {
    if (!this.gl) return;
    const width = this.gl.drawingBufferWidth || 0;
    const height = this.gl.drawingBufferHeight || 0;
    this.resizeFrameBufferTextures(width, height);
  }
}
