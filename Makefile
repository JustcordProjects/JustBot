.PHONY: all run dev check format fmt lint tests

HOME ?= ~

CACHE_DIR ?= $(HOME)/.cache/justbot
PKG_DIR ?= $(HOME)/.cache/deno/npm
CONFIG_FILE ?= bot/config.js
DATABASES ?= bot.db,bot.db-journal

-include local.mk
ZAPBOX_PATH ?= zapbox

DENO_IO_PERMS_FLAGS   = --allow-read=$(CONFIG_FILE),tests,.env,$(DATABASES),$(CACHE_DIR),$(PKG_DIR),. \
						--allow-write=$(CONFIG_FILE),$(DATABASES),$(CACHE_DIR),$(PKG_DIR),.
DENO_PERMISSION_FLAGS = $(DENO_IO_PERMS_FLAGS) --allow-net --allow-sys --allow-ffi \
						--allow-env --allow-run=cdecl,chmod,git,make,$(ZAPBOX_PATH)

DENO_FLAGS            = --no-prompt --env-file $(DENO_PERMISSION_FLAGS)

all:
	@deno compile $(DENO_FLAGS) --output justbot src/main.ts

run:
	@deno run $(DENO_FLAGS) src/main.ts

dev: check lint
	@deno run $(DENO_FLAGS) --watch src/main.ts

check:
	@deno check src/main.ts
	@deno check src/cmd/**/*.ts

format:
	@deno fmt src/**/*

hook_register:
	git config core.hooksPath src/events/git 
	chmod +x src/events/git/pre-commit

tests:
	deno test $(DENO_FLAGS) tests/main.ts	

fmt: format

lint:
	@deno lint src/**/*
