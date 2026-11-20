
import { cp, mkdir, rm } from "node:fs/promises";
import path from "node:path";

const source = path.resolve(
  "node_modules/cesium/Build/Cesium"
);

const destination = path.resolve("public/cesium");

try {
  await mkdir(path.dirname(destination), {
    recursive: true,
  });

  await rm(destination, {
    recursive: true,
    force: true,
  });

  await cp(source, destination, {
    recursive: true,
  });

  console.log("Cesium runtime assets berhasil disalin.");
  console.log(`Source: ${source}`);
  console.log(`Destination: ${destination}`);
} catch (error) {
  console.error("Gagal menyalin Cesium runtime assets.");
  console.error(error);
  process.exit(1);
}
