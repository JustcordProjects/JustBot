#!/bin/bash
set -e

run() {
    echo "-- $*"
    "$@" >/dev/null || {
        echo ":: FAILURE"
        echo "-- commit aborted"
        exit 1
    }
}

run make check
run make lint
run make test
