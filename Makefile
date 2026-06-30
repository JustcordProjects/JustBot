
DENO ?= deno
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

.PHONY: all run dev check
.PHONY: format fmt lint test tests
.PHONY: hook-register
all: compile

CMD_FILES = $(shell find src/cmd -name "*.ts" -not -name "list.ts")
INCLUDE_FLAGS = $(foreach file,$(CMD_FILES),--include $(file))

compile: check lint
	@$(DENO) compile $(DENO_FLAGS) $(INCLUDE_FLAGS) --output justbot src/main.ts

run: check lint
	@$(DENO) run $(DENO_FLAGS) src/main.ts
dev: check lint
	@$(DENO) run $(DENO_FLAGS) --watch src/main.ts

check:
	@$(DENO) check src/main.ts
	@$(DENO) check src/cmd/**/*.ts
lint:
	@$(DENO) lint src/**/*

format:
	@$(DENO) fmt src/**/*
test:
	@$(DENO) test $(DENO_FLAGS) tests/main.ts

tests: test
fmt: format

hook-register:
	chmod +x scripts/git/pre-commit
	git config core.hooksPath scripts/git

