import { ChildProcess, exec } from 'child_process';
import { promises as fs } from 'fs';
import { resolve } from 'path';

export interface AsyncProcess {
  proc: ChildProcess;
  promise: Promise<string>;
  resolve: (stdout: string) => void;
  reject: (err: any) => void;
}

export const runCommand = (cmd: string): AsyncProcess => {
  let resolve: AsyncProcess['resolve'];
  let reject: AsyncProcess['reject'];

  const promise = new Promise<string>((res, rej) => {
    resolve = res;
    reject = rej;
  });

  const proc = exec(cmd.trim(), (err, stdout) => (err ? reject(err) : resolve(stdout)));

  return { proc, promise, resolve, reject };
};

export const boatsFixtureFolder = async (folder: string): Promise<Record<string, any>> => {
  await fs.rm(resolve('test/.boats'), { recursive: true, force: true });
  delete require.cache[resolve('test/.boats/api_0.json')];

  await runCommand(`\
      NODE_ENV=test node node_modules/boats/bin/cli.js \
        -f dist/src \
        -i test/fixtures/${folder}/src/index.yml \
        -o test/.boats/api.json
    `).promise;

  return require(resolve('test/.boats/api_0.json'));
};
