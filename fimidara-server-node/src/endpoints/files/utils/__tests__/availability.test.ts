import {describe, expect, test} from 'vitest';
import {File} from '../../../../definitions/file.js';
import {kFimidaraResourceType} from '../../../../definitions/system.js';
import {getFileReadAvailability, getFileWriteAvailability} from '../availability.js';
import {extractPublicFile} from '../extractPublicFile.js';

const mockAgent = {
  agentId: 'user-123',
  agentType: kFimidaraResourceType.User,
  agentTokenId: 'token-456',
  agentToken: {resourceId: 'token-456'} as any,
};

describe('availability', () => {
  test('write available when isWriteAvailable is true', () => {
    const file = {isWriteAvailable: true} as File;
    const result = getFileWriteAvailability(file, 'user-123');
    expect(result.available).toBe(true);
    expect(result.availableForYou).toBe(true);
    expect(result.lockedBy).toBeUndefined();
  });

  test('write available for lock holder', () => {
    const file = {
      isWriteAvailable: false,
      writeLockedBy: 'user-123',
    } as File;
    const result = getFileWriteAvailability(file, 'user-123');
    expect(result.available).toBe(false);
    expect(result.availableForYou).toBe(true);
    expect(result.lockedBy).toBe('user-123');
  });

  test('write not available for other user', () => {
    const file = {
      isWriteAvailable: false,
      writeLockedBy: 'user-123',
    } as File;
    const result = getFileWriteAvailability(file, 'other-user');
    expect(result.available).toBe(false);
    expect(result.availableForYou).toBe(false);
    expect(result.lockedBy).toBe('user-123');
  });

  test('read availability follows isReadAvailable', () => {
    const lockedFile = {
      isReadAvailable: false,
      writeLockedBy: 'session-abc',
    } as File;
    const result = getFileReadAvailability(lockedFile, 'session-abc');
    expect(result.available).toBe(false);
    expect(result.availableForYou).toBe(true);
    expect(result.lockedBy).toBe('session-abc');
  });

  test('extractPublicFile includes availability', () => {
    const file = {
      resourceId: 'file-1',
      workspaceId: 'ws-1',
      isWriteAvailable: false,
      isReadAvailable: false,
      writeLockedBy: 'user-123',
      parentId: null,
      idPath: ['file-1'],
      namepath: ['test'],
      size: 0,
      name: 'test',
      version: 0,
      createdAt: 1,
      lastUpdatedAt: 1,
      createdBy: mockAgent,
      lastUpdatedBy: mockAgent,
      isDeleted: false,
    } as File;

    const publicFile = extractPublicFile(file, mockAgent.agentId);
    expect(publicFile.read.available).toBe(false);
    expect(publicFile.write.availableForYou).toBe(true);
    expect(publicFile.write.lockedBy).toBe('user-123');
  });
});
