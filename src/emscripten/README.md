Build Emscripten port

```
$ source <path-to-emsdk-repo>/emsdk.sh

$ make -C src emscripten_build ARCH=wasm wasm_simd_post_mvp=yes

$ /usr/bin/node -e 'console.log(`node: ${process.version}\nv8: ${process.versions.v8}`)'
node: v15.8.0
v8: 8.6.395.17-node.23

$ /usr/bin/node --experimental-wasm-{simd,threads} --wasm-simd-post-mvp src/emscripten/dist/uci.js
```
