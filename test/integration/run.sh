echo Starting node...
npx hardhat node > /dev/null & sleep 2
node_pid=$!

result=$(npx hardhat prepare-chain-for-tests --network localhost)

private_key=$(echo $result | cut -d " " -f 1)
factory_address=$(echo $result | cut -d " " -f 2)

echo Starting server...
PROVIDER_URL=http://localhost:8545 \
PRIVATE_KEY=$private_key \
FACTORY_ADDRESS=$factory_address \
PORT=8080 \
npm run dev > /dev/null & sleep 3
server_pid=$!

npx hardhat test --network localhost test/integration/**.test.ts
return_code=$?

kill $server_pid
kill $node_pid

exit $return_code
