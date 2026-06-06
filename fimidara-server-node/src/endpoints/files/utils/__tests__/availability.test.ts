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
    const result = getFileWriteAvailability(file);
    expect(result.available).toBe(true);
    expect(result.availableForYou).toBe(true);
    expect(result.lockedBy).toBeUndefined();
  });

  test('write not available for lock holder without uploadSessionId', () => {
    const file = {
      isWriteAvailable: false,
      writeLockedBy: 'user-123',
    } as File;
    const result = getFileWriteAvailability(file);
    expect(result.available).toBe(false);
    expect(result.availableForYou).toBe(false);
    expect(result.lockedBy).toBe('user-123');
  });

  test('write available for lock holder with matching uploadSessionId', () => {
    const uploadSessionId = 'session-abc';
    const file = {
      isWriteAvailable: false,
      writeLockedBy: uploadSessionId,
    } as File;
    const result = getFileWriteAvailability(file, uploadSessionId);
    expect(result.available).toBe(false);
    expect(result.availableForYou).toBe(true);
    expect(result.lockedBy).toBe(uploadSessionId);
  });

  test('write not available for other user', () => {
    const file = {
      isWriteAvailable: false,
      writeLockedBy: 'user-123',
    } as File;
    const result = getFileWriteAvailability(file, 'other-session');
    expect(result.available).toBe(false);
    expect(result.availableForYou).toBe(false);
    expect(result.lockedBy).toBe('user-123');
  });

  test('read available for lock holder via uploadSessionId', () => {
    const uploadSessionId = 'session-abc';
    const lockedFile = {
      isReadAvailable: false,
      writeLockedBy: uploadSessionId,
    } as File;
    const result = getFileReadAvailability(
      lockedFile,
      mockAgent.agentId,
      uploadSessionId
    );
    expect(result.available).toBe(false);
    expect(result.availableForYou).toBe(true);
    expect(result.lockedBy).toBe(uploadSessionId);
  });

  test('read available when lock owner is agent id and uploadSessionId omitted', () => {
    const lockedFile = {
      isReadAvailable: false,
      writeLockedBy: mockAgent.agentId,
    } as File;
    const result = getFileReadAvailability(lockedFile, mockAgent.agentId);
    expect(result.available).toBe(false);
    expect(result.availableForYou).toBe(true);
    expect(result.lockedBy).toBe(mockAgent.agentId);
  });

  test('read not available when lock is uploadSessionId but caller omits it', () => {
    const lockedFile = {
      isReadAvailable: false,
      writeLockedBy: 'session-abc',
    } as File;
    const result = getFileReadAvailability(lockedFile, mockAgent.agentId);
    expect(result.available).toBe(false);
    expect(result.availableForYou).toBe(false);
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
    expect(publicFile.read.availableForYou).toBe(true);
    expect(publicFile.write.availableForYou).toBe(false);
    expect(publicFile.write.lockedBy).toBe('user-123');
  });
});
