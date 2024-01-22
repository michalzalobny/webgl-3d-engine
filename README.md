# webgl-viewer

WebGL2 3D Viewer built from scratch.

## Performance

- Application without any WebGL2 context scores 4x 100% on lighthouse, with 0ms of Total Blocking Time, 0.8s First and Largest Contentful Paint. Speed index is 0.8s.
- After adding the WebGL2 context, the Total Blocking Time increases to 40ms.
