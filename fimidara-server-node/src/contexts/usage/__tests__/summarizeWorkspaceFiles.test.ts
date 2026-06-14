import {describe, expect, test} from 'vitest';
import {
  buildWorkspaceFileSummaries,
  formatBytes,
  formatWorkspaceFileSummariesTable,
  summarizeFilesByWorkspaceId,
} from '../summarizeWorkspaceFiles.js';

describe('summarizeWorkspaceFiles', () => {
  test('summarizeFilesByWorkspaceId totals count and size per workspace', () => {
    const byWorkspace = summarizeFilesByWorkspaceId([
      {workspaceId: 'ws-1', size: 100},
      {workspaceId: 'ws-1', size: 50},
      {workspaceId: 'ws-2', size: 1000},
    ]);

    expect(byWorkspace.get('ws-1')).toEqual({
      fileCount: 2,
      totalSizeBytes: 150,
    });
    expect(byWorkspace.get('ws-2')).toEqual({
      fileCount: 1,
      totalSizeBytes: 1000,
    });
  });

  test('buildWorkspaceFileSummaries includes empty workspaces', () => {
    const summaries = buildWorkspaceFileSummaries({
      workspaces: [
        {
          resourceId: 'ws-2',
          name: 'Beta',
        } as never,
        {
          resourceId: 'ws-1',
          name: 'Alpha',
        } as never,
      ],
      files: [{workspaceId: 'ws-1', size: 512}],
    });

    expect(summaries).toEqual([
      {
        workspaceId: 'ws-1',
        workspaceName: 'Alpha',
        fileCount: 1,
        totalSizeBytes: 512,
      },
      {
        workspaceId: 'ws-2',
        workspaceName: 'Beta',
        fileCount: 0,
        totalSizeBytes: 0,
      },
    ]);
  });

  test('formatBytes renders human-readable sizes', () => {
    expect(formatBytes(0)).toBe('0 B');
    expect(formatBytes(1024)).toBe('1.00 KB');
    expect(formatBytes(1536)).toBe('1.50 KB');
  });

  test('formatWorkspaceFileSummariesTable renders workspace rows and totals', () => {
    const table = formatWorkspaceFileSummariesTable([
      {
        workspaceId: 'ws-1',
        workspaceName: 'Alpha',
        fileCount: 2,
        totalSizeBytes: 150,
      },
      {
        workspaceId: 'ws-2',
        workspaceName: 'Beta',
        fileCount: 1,
        totalSizeBytes: 1024,
      },
    ]);

    expect(table).toContain('Workspace');
    expect(table).toContain('Alpha');
    expect(table).toContain('Beta');
    expect(table).toContain('Total');
    expect(table).toContain('3');
    expect(table).toContain('1.15 KB');
  });
});
