#!/bin/bash

/opt/besu/bin/besu --config-file=/besu_data/config.toml > /dev/null &
sleep 5
L1_CHAIN=cardano npm run test
