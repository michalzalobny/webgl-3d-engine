# webgl-viewer

WebGL2 3D Viewer built from scratch. The goal is to build what I have learned from the project where I was building a [3D renderer in C](https://github.com/michalzalobny/3d-renderer-in-c). This time I will use WebGL2 API instead of raw rasterization functions computed on CPU. Guided by [WebGL2 Fundamentals](https://webgl2fundamentals.org/).

## Performance

- Application without any WebGL2 context scores 4x 100% on lighthouse, with 0ms of Total Blocking Time, 0.8s First and Largest Contentful Paint. Speed index is 0.8s.
- After adding the WebGL2 context, the Total Blocking Time increases to 40ms.
