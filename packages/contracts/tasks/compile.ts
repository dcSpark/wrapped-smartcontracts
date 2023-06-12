import type { Artifacts } from "hardhat/types";
import { task } from "hardhat/config";
import { exec } from "child_process";
import { readFile, writeFile } from "fs/promises";

// const codeToPrepend = `
//   let gas_limit := gas()
//   let ptr := memoryguard(128)

//   mstore(ptr, gas_limit)
//   mstore(64, add(ptr, 32))
// `;

/**
 * @dev This code is prepended to the deployed Actor bytecode to store the gas limit in storage.
 */
const codeToPrepend = `
  let gas_limit := gas()
          
  mstore(0, "tx.gasLimit")
  let storage_slot := keccak256(0, 11)
  mstore(0, 0)

  sstore(storage_slot, gas_limit)
`;

/**
 * @dev Finds the yul subobject and injects the code.
 */
const prependDeployedActorYulCode = async (path: string) => {
  const yulCode = await readFile(path, "utf8");

  const yulCodeLines = yulCode.split("\n");

  const deployedActorIndex = yulCodeLines.findIndex(
    (line) => line.match(/object "Actor_.*_deployed/g)?.length
  );

  yulCodeLines.splice(deployedActorIndex + 2, 0, codeToPrepend);

  await writeFile(path, yulCodeLines.join("\n"), "utf8");
};

const compileYulToBytecode = async (yulCodePath: string) => {
  const solcOutput = await execAsync(`solc --strict-assembly --optimize ${yulCodePath}`);

  const solcOutputLines = solcOutput.split("\n");

  const bytecodeIndex =
    solcOutputLines.findIndex((line) => line.startsWith("Binary representation:")) + 1;

  const bytecode = solcOutputLines.at(bytecodeIndex)?.trim();

  if (bytecode === undefined) {
    throw new Error("Could not find bytecode in solc output");
  }

  return bytecode;
};

/**
 * @dev Used to extract the deployed bytecode from the yul code.
 */
const extractYulSubobject = async (
  yulCodePath: string,
  outputPath: string,
  subobjectName: RegExp
) => {
  const yulCode = await readFile(yulCodePath, "utf8");

  const yulCodeWithoutComments = yulCode.replace(
    /((?:\/\*(?:[^*]|(?:\*+[^*/]))*\*+\/)|(?:\/\/.*))/g,
    ""
  );

  const yulCodeLines = yulCodeWithoutComments.split("\n");

  const subobjectIndex = yulCodeLines.findIndex((line) => line.match(subobjectName)?.length);

  let curlyBracesCount = 0;

  const subobjectLines = [];

  for (let i = subobjectIndex; i < yulCodeLines.length; i++) {
    const line = yulCodeLines.at(i);

    if (line === undefined) break;

    curlyBracesCount += line.match(/{/g)?.length ?? 0;
    curlyBracesCount -= line.match(/}/g)?.length ?? 0;

    subobjectLines.push(line);

    if (curlyBracesCount === 0) {
      break;
    }
  }

  await writeFile(outputPath, subobjectLines.join("\n"), "utf8");
};

const updateArtifact = async (
  artifacts: Artifacts,
  artifactName: string,
  bytecode: string,
  deployedBytecode: string
) => {
  const artifact = await artifacts.readArtifact(artifactName);

  artifact.bytecode = `0x${bytecode}`;
  artifact.deployedBytecode = `0x${deployedBytecode}`;

  await artifacts.saveArtifactAndDebugFile(artifact);
};

const execAsync = async (cmd: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    exec(cmd, (error, stdout, stderr) => {
      if (error) {
        reject(error);
      }
      resolve(stdout ? stdout : stderr);
    });
  });
};

task("compile")
  .addFlag("noGaslimitAltering", "Do not alter bytecode with gaslimit prefix")
  .setAction(async ({ noGaslimitAltering }, { artifacts }, runSuper) => {
    await runSuper();

    if (noGaslimitAltering) return;

    console.log("Altering Actor and ActorFactory artifacts with gas limit...");

    await execAsync(
      "solc --ir-optimized --optimize --overwrite -o artifacts.yul ./contracts/ActorFactory.sol"
    );

    await prependDeployedActorYulCode("artifacts.yul/Actor_opt.yul");
    await prependDeployedActorYulCode("artifacts.yul/ActorFactory_opt.yul");

    const actorBytecode = await compileYulToBytecode("artifacts.yul/Actor_opt.yul");
    const actorFactoryBytecode = await compileYulToBytecode("artifacts.yul/ActorFactory_opt.yul");

    await extractYulSubobject(
      "artifacts.yul/Actor_opt.yul",
      "artifacts.yul/Actor_deployed.yul",
      /object "Actor_.*_deployed"/g
    );

    await extractYulSubobject(
      "artifacts.yul/ActorFactory_opt.yul",
      "artifacts.yul/ActorFactory_deployed.yul",
      /object "ActorFactory_.*_deployed"/g
    );

    const actorDeployedBytecode = await compileYulToBytecode("artifacts.yul/Actor_deployed.yul");
    const actorFactoryDeployedBytecode = await compileYulToBytecode(
      "artifacts.yul/ActorFactory_deployed.yul"
    );

    await updateArtifact(artifacts, "Actor", actorBytecode, actorDeployedBytecode);
    await updateArtifact(
      artifacts,
      "ActorFactory",
      actorFactoryBytecode,
      actorFactoryDeployedBytecode
    );
  });
