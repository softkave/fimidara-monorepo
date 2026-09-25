import assert from 'assert';
import {Job, kJobType, ProbeImageDimensionsJobParams} from '../../../definitions/job.js';
import {probeAndPersistImageDimensions} from '../../files/utils/probeImageDimensions.js';

export async function runProbeImageDimensionsJob(
  job: Pick<Job, 'params' | 'type'>
) {
  assert.ok(job.type === kJobType.probeImageDimensions);
  const params = job.params as ProbeImageDimensionsJobParams;
  await probeAndPersistImageDimensions(params.fileId);
}
