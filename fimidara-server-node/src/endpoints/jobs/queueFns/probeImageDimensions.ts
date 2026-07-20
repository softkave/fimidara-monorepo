import {SemanticProviderMutationParams} from '../../../contexts/semantic/types.js';
import {
  kJobType,
  ProbeImageDimensionsJobParams,
} from '../../../definitions/job.js';
import {Agent} from '../../../definitions/system.js';
import {queueJobs} from '../queueJobs.js';

export async function queueProbeImageDimensionsJob(props: {
  workspaceId: string;
  fileId: string;
  agent: Agent;
  parentJobId?: string;
  opts?: SemanticProviderMutationParams;
}) {
  const {workspaceId, fileId, agent, parentJobId, opts} = props;

  const [job] = await queueJobs<ProbeImageDimensionsJobParams>(
    workspaceId,
    parentJobId,
    {
      createdBy: agent,
      type: kJobType.probeImageDimensions,
      idempotencyToken: `probeImageDimensions_${fileId}_${Date.now()}`,
      params: {fileId},
    },
    {opts}
  );

  return job;
}
