import {afterAll, beforeAll, describe, expect, test} from 'vitest';
import {ResourceLockedError} from '../../../endpoints/errors.js';
import {completeTests} from '../../../endpoints/testHelpers/helpers/testFns.js';
import {initTests} from '../../../endpoints/testHelpers/utils.js';
import {PartUploadLockProvider} from '../PartUploadLockProvider.js';

beforeAll(async () => {
  await initTests();
});

afterAll(async () => {
  await completeTests();
});

describe('PartUploadLockProvider', () => {
  const provider = new PartUploadLockProvider();
  const fileId = 'test-file-' + Math.random();
  const part = 1;

  test('only one concurrent acquire succeeds for different actors', async () => {
    const keyFileId = fileId + '-concurrent';
    const results = await Promise.allSettled([
      provider.using(keyFileId, part, 'actor-a', async () => {
        await new Promise(resolve => setTimeout(resolve, 50));
        return 'a';
      }),
      provider.using(keyFileId, part, 'actor-b', async () => 'b'),
    ]);

    const fulfilled = results.filter(result => result.status === 'fulfilled');
    const rejected = results.filter(result => result.status === 'rejected');

    expect(fulfilled).toHaveLength(1);
    expect(rejected).toHaveLength(1);
    expect(rejected[0].reason).toBeInstanceOf(ResourceLockedError);
  });

  test('same actor can re-acquire an existing lock', async () => {
    const keyFileId = fileId + '-reacquire';

    await provider.using(keyFileId, part, 'actor-a', async () => {
      await expect(
        provider.using(keyFileId, part, 'actor-a', async () => 'ok')
      ).resolves.toBe('ok');
    });
  });

  test('release only clears lock for matching owner', async () => {
    const keyFileId = fileId + '-release';

    await provider.using(keyFileId, part, 'actor-a', async () => {
      await provider.release(keyFileId, part, 'actor-b');
      await expect(
        provider.using(keyFileId, part, 'actor-b', async () => 'blocked')
      ).rejects.toThrow(ResourceLockedError);
    });
  });
});
