#!/bin/sh

if [ "$MIGRATE" = "true" ]; then
  air -c .air.toml -- --migrate
else
  air -c .air.toml
fi
