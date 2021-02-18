Build Emscripten port

```
## Enable emscripten tools
$ source <path-to-emsdk-repo>/emsdk.sh

## Build
$ make -C src emscripten_build ARCH=wasm wasm_simd_post_mvp=yes

## Run on NodeJS
$ /usr/bin/node -e 'console.log(`node: ${process.version}\nv8: ${process.versions.v8}`)'
node: v15.8.0
v8: 8.6.395.17-node.23

$ /usr/bin/node --experimental-wasm-{simd,threads} --wasm-simd-post-mvp src/emscripten/public/uci.js

## Run on Browser
$ python src/emscripten/server.py --d src/emscripten/public

## Deploy to Vercel
$ yarn global add vercel
$ $(yarn global bin)/vercel deploy src/emscripten/public --prod
```
