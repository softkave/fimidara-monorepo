import {getDeferredPromise} from 'softkave-js-utils';
import {kIjxSemantic, kIjxUtils} from '../contexts/ijx/injectables.js';
import {kJobStatus} from '../definitions/job.js';

export async function runScript(params: {
  name: string;
  isUnique: boolean;
  fn: () => Promise<void>;
  isMandatory?: boolean;
}) {
  const scriptProvider = kIjxSemantic.script();
  const result = await scriptProvider.tryStartScript({
    name: params.name,
    uniqueId: params.isUnique ? params.name : undefined,
  });

  if (!result.inserted) {
    kIjxUtils.logger().log({
      message: 'Waiting for script to complete',
      scriptName: result.script.name,
    });

    const deferred = getDeferredPromise();
    const pollIntervalMs = kIjxUtils.suppliedConfig().scriptPollIntervalMs;

    await scriptProvider.pollScriptStatus({
      scriptId: result.script.resourceId,
      intervalMs: pollIntervalMs,
      cb: status => {
        if (status.status === kJobStatus.completed) {
          deferred.resolve();
        } else if (status.status === kJobStatus.failed) {
          if (params.isMandatory) {
            deferred.reject(new Error(`Script failed: ${result.script.name}`));
          } else {
            deferred.resolve();
            kIjxUtils.logger().log({
              message: 'Script failed',
              scriptName: result.script.name,
            });
          }
        } else if (status.isRunnerHeartbeatStale) {
          if (params.isMandatory) {
            deferred.reject(
              new Error(`Script heartbeat stale: ${result.script.name}`)
            );
          } else {
            deferred.resolve();
            kIjxUtils.logger().log({
              message: 'Script heartbeat stale',
              scriptName: result.script.name,
            });
          }
        }
      },
    });

    await deferred.promise;
    kIjxUtils.logger().log({
      message: 'Script completed',
      scriptName: result.script.name,
    });
    return;
  }

  try {
    kIjxUtils.logger().log({
      message: 'Running script',
      scriptName: result.script.name,
    });
    await params.fn();
    kIjxUtils.logger().log({
      message: 'Script completed',
      scriptName: result.script.name,
    });
    await kIjxSemantic.utils().withTxn(async opts => {
      await scriptProvider.endScript(
        {scriptId: result.script.resourceId, status: kJobStatus.completed},
        opts
      );
    });
  } catch (error) {
    kIjxUtils.logger().log({
      message: 'Script failed',
      scriptName: result.script.name,
    });
    await kIjxSemantic.utils().withTxn(async opts => {
      await scriptProvider.endScript(
        {scriptId: result.script.resourceId, status: kJobStatus.failed},
        opts
      );
    });

    if (params.isMandatory) {
      throw error;
    }
  }
}
