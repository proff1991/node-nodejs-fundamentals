import { parentPort, workerData } from "worker_threads";

const worker = () => {
  var arr = workerData.slice();

  arr.sort( (a, b) => {
    return a - b;
  });

  parentPort.postMessage(arr);
};

worker();