import {File} from '../../definitions/file.js';
import {Workspace} from '../../definitions/workspace.js';
import {kIjxSemantic} from '../ijx/injectables.js';

export interface WorkspaceFileSummary {
  workspaceId: string;
  workspaceName: string;
  fileCount: number;
  totalSizeBytes: number;
}

export function summarizeFilesByWorkspaceId(
  files: Pick<File, 'workspaceId' | 'size'>[]
) {
  const byWorkspace = new Map<
    string,
    Pick<WorkspaceFileSummary, 'fileCount' | 'totalSizeBytes'>
  >();

  for (const file of files) {
    const current = byWorkspace.get(file.workspaceId) ?? {
      fileCount: 0,
      totalSizeBytes: 0,
    };

    byWorkspace.set(file.workspaceId, {
      fileCount: current.fileCount + 1,
      totalSizeBytes: current.totalSizeBytes + (file.size || 0),
    });
  }

  return byWorkspace;
}

export function buildWorkspaceFileSummaries(params: {
  workspaces: Workspace[];
  files: Pick<File, 'workspaceId' | 'size'>[];
}) {
  const byWorkspace = summarizeFilesByWorkspaceId(params.files);

  return params.workspaces
    .map(workspace => {
      const summary = byWorkspace.get(workspace.resourceId);

      return {
        workspaceId: workspace.resourceId,
        workspaceName: workspace.name,
        fileCount: summary?.fileCount ?? 0,
        totalSizeBytes: summary?.totalSizeBytes ?? 0,
      };
    })
    .sort((a, b) => a.workspaceName.localeCompare(b.workspaceName));
}

export async function getWorkspaceFileSummaries() {
  const [workspaces, files] = await Promise.all([
    kIjxSemantic.workspace().getManyByQuery({isDeleted: false}),
    kIjxSemantic.file().getManyByQuery({isDeleted: false}),
  ]);

  return buildWorkspaceFileSummaries({workspaces, files});
}

export function formatBytes(bytes: number) {
  if (bytes === 0) {
    return '0 B';
  }

  const units = ['B', 'KB', 'MB', 'GB', 'TB'] as const;
  const unitIndex = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1
  );
  const value = bytes / Math.pow(1024, unitIndex);

  return `${value.toFixed(unitIndex === 0 ? 0 : 2)} ${units[unitIndex]}`;
}

export function formatWorkspaceFileSummariesTable(
  summaries: WorkspaceFileSummary[]
) {
  const nameWidth = Math.max(
    'Workspace'.length,
    ...summaries.map(summary => summary.workspaceName.length)
  );
  const fileCountWidth = Math.max(
    'Files'.length,
    ...summaries.map(summary => String(summary.fileCount).length)
  );
  const totalSizeWidth = Math.max(
    'Total size'.length,
    ...summaries.map(summary => formatBytes(summary.totalSizeBytes).length)
  );

  const header = [
    'Workspace'.padEnd(nameWidth),
    'Files'.padStart(fileCountWidth),
    'Total size'.padStart(totalSizeWidth),
  ].join('  ');

  const rows = summaries.map(summary =>
    [
      summary.workspaceName.padEnd(nameWidth),
      String(summary.fileCount).padStart(fileCountWidth),
      formatBytes(summary.totalSizeBytes).padStart(totalSizeWidth),
    ].join('  ')
  );

  const totals = summaries.reduce(
    (acc, summary) => ({
      fileCount: acc.fileCount + summary.fileCount,
      totalSizeBytes: acc.totalSizeBytes + summary.totalSizeBytes,
    }),
    {fileCount: 0, totalSizeBytes: 0}
  );

  const footer = [
    'Total'.padEnd(nameWidth),
    String(totals.fileCount).padStart(fileCountWidth),
    formatBytes(totals.totalSizeBytes).padStart(totalSizeWidth),
  ].join('  ');

  return [header, ...rows, '-'.repeat(header.length), footer].join('\n');
}
