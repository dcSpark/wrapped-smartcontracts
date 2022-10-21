function wait_for_service() {
    echo -n "Waiting for $1 to start"
    local interval=0.5
    local timeout=20
    local count=0

    while ! curl -s $2 > /dev/null; do
        if (( $(echo "$count > $timeout" |bc -l) )); then
            echo "Timeout waiting for $1"
            exit 1
        fi
        count=$(echo $count + $interval |bc)
        echo -n "."
        sleep $interval
    done
    echo
}

npx hardhat node > /dev/null & wait_for_service node http://localhost:8545 -X POST --data '{"jsonrpc":"2.0","method":"eth_blockNumber","id":1}'
node_pid=$!

result=$(npx hardhat prepare-chain-for-tests --network localhost)

private_key=$(echo $result | cut -d " " -f 1)
factory_address=$(echo $result | cut -d " " -f 2)

echo "Building oracle"
npm run build

PROVIDER_URL=http://localhost:8545 \
PRIVATE_KEY=$private_key \
FACTORY_ADDRESS=$factory_address \
PORT=8080 \
npm start > /dev/null & wait_for_service oracle http://localhost:8080/ping
oracle_pid=$!

npx hardhat test --network localhost test/integration/**.test.ts
return_code=$?

kill $oracle_pid
kill $node_pid

exit $return_code
