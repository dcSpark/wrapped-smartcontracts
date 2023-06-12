FROM dcspark/besu:22.10.1-milkomeda-c1 AS besu
FROM ethereum/solc:0.8.18 AS solc
FROM node:16

# Setup besu
RUN apt-get update && apt-get -y install openjdk-11-jre-headless

COPY --from=besu /opt/besu /opt/besu

# Setup solc
COPY --from=solc /usr/bin/solc /usr/bin/solc

# Setup node
WORKDIR /app

COPY package*.json ./
COPY packages/ ./packages
COPY .github/ ./.github
COPY besu_data /besu_data

RUN npm run prepare-artifacts
RUN npm install

RUN chmod +x .github/run-tests.sh

ENTRYPOINT [ ".github/run-tests.sh" ]
