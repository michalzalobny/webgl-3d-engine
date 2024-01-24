# WebGL2 3D Engine built from scratch

The goal is to build a custom 3D engine without any libraries - just using WebGL2 API and what I have learnt while creating a [3D renderer in C](https://github.com/michalzalobny/3d-renderer-in-c). Guided by [WebGL2 Fundamentals](https://webgl2fundamentals.org/).

## Performance

- Application without any WebGL2 context scores 4x 100% on lighthouse, with 0ms of Total Blocking Time, 0.8s First and Largest Contentful Paint. Speed index is 0.8s.
- After adding the WebGL2 context, the Total Blocking Time increases to 40ms.
