EXE = stockfish.js
COMP = em++
CXX = em++
comp = clang
arch = wasm
bits = 64

# Build options
wasm_simd = no
wasm_simd_post_mvp = no
minify_js = yes
assertion = no

VPATH := $(VPATH):emscripten
SRCS += emscripten/embedded_nnue.cpp
EM_FLAGS += \
	--pre-js emscripten/preamble.js \
	-s MODULARIZE=1 -s EXPORT_NAME="Stockfish" -s ENVIRONMENT=web,worker,node \
	-s STRICT=1 \
	-s ASYNCIFY=1 -s 'ASYNCIFY_IMPORTS=["emscripten_utils_getline_impl"]' \
	-s USE_PTHREADS=1 \
	-s PROXY_TO_PTHREAD=1 \
	-s ALLOW_MEMORY_GROWTH=1 -s INITIAL_MEMORY=$$((1 << 27)) -s MAXIMUM_MEMORY=$$((1 << 31)) \
	-s FILESYSTEM=0

ifeq ($(minify_js),yes)
	EM_FLAGS += --closure 1
else
	EM_FLAGS += --closure 0 --minify 0
endif

ifeq ($(assertion),yes)
	EM_FLAGS += -s ASSERTIONS=1
else
	EM_FLAGS += -s ASSERTIONS=0
endif

ifeq ($(wasm_simd_post_mvp),yes)
	EM_FLAGS += -DUSE_WASM_SIMD -DUSE_WASM_SIMD_POST_MVP -msimd128
	SRCS += emscripten/wasm_simd.cpp
else ifeq ($(wasm_simd),yes)
	EM_FLAGS += -DUSE_WASM_SIMD -msimd128
	SRCS += emscripten/wasm_simd.cpp
endif

EXTRACXXFLAGS += -DUSE_POPCNT $(EM_FLAGS)

emscripten/embedded_nnue.cpp: net
	@echo "-- Generate embedded_nnue.cpp --"
	python emscripten/misc/embedded_nnue.py $(nnuenet) > emscripten/embedded_nnue.cpp

emscripten_copy_files:
	cp -f ../AUTHORS ../Copying.txt emscripten/public
	cp -f stockfish.js stockfish.wasm emscripten/public
	cat stockfish.worker.js emscripten/worker-postamble.js > emscripten/public/stockfish.worker.js

emscripten_build: build emscripten_copy_files
