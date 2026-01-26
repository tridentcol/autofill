/**
 * Git synchronization service
 * Automatically commits and pushes data changes to the repository
 */

import { Worker, Cuadrilla, Camioneta, Grua } from '@/types';

interface GitCommitOptions {
  message: string;
  files: {
    path: string;
    content: string;
  }[];
}

/**
 * Commits and pushes changes to the repository using GitHub API
 * This works in both development and production (serverless) environments
 */
export async function commitAndPushChanges(options: GitCommitOptions): Promise<boolean> {
  try {
    const response = await fetch('/api/git/commit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(options),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('❌ Error committing to git:', error);
      return false;
    }

    const result = await response.json();
    console.log('✅ Changes committed and pushed to repository:', result.commit?.sha);
    return true;
  } catch (error) {
    console.error('❌ Error in git sync:', error);
    return false;
  }
}

/**
 * Sync all data files to git
 */
export async function syncAllDataToGit(data: {
  workers: Worker[];
  cuadrillas: Cuadrilla[];
  camionetas: Camioneta[];
  gruas: Grua[];
}): Promise<boolean> {
  const timestamp = new Date().toISOString();

  const files = [
    {
      path: 'public/data/workers.json',
      content: JSON.stringify(data.workers, null, 2),
    },
    {
      path: 'public/data/cuadrillas.json',
      content: JSON.stringify(data.cuadrillas, null, 2),
    },
    {
      path: 'public/data/camionetas.json',
      content: JSON.stringify(data.camionetas, null, 2),
    },
    {
      path: 'public/data/gruas.json',
      content: JSON.stringify(data.gruas, null, 2),
    },
  ];

  return await commitAndPushChanges({
    message: `chore: Update data files (admin changes) - ${timestamp}`,
    files,
  });
}

/**
 * Sync workers data to git
 */
export async function syncWorkersToGit(workers: Worker[]): Promise<boolean> {
  const timestamp = new Date().toISOString();

  return await commitAndPushChanges({
    message: `chore: Update workers data - ${timestamp}`,
    files: [
      {
        path: 'public/data/workers.json',
        content: JSON.stringify(workers, null, 2),
      },
    ],
  });
}

/**
 * Sync cuadrillas data to git
 */
export async function syncCuadrillasToGit(cuadrillas: Cuadrilla[]): Promise<boolean> {
  const timestamp = new Date().toISOString();

  return await commitAndPushChanges({
    message: `chore: Update cuadrillas data - ${timestamp}`,
    files: [
      {
        path: 'public/data/cuadrillas.json',
        content: JSON.stringify(cuadrillas, null, 2),
      },
    ],
  });
}

/**
 * Sync camionetas data to git
 */
export async function syncCamionetasToGit(camionetas: Camioneta[]): Promise<boolean> {
  const timestamp = new Date().toISOString();

  return await commitAndPushChanges({
    message: `chore: Update camionetas data - ${timestamp}`,
    files: [
      {
        path: 'public/data/camionetas.json',
        content: JSON.stringify(camionetas, null, 2),
      },
    ],
  });
}

/**
 * Sync gruas data to git
 */
export async function syncGruasToGit(gruas: Grua[]): Promise<boolean> {
  const timestamp = new Date().toISOString();

  return await commitAndPushChanges({
    message: `chore: Update gruas data - ${timestamp}`,
    files: [
      {
        path: 'public/data/gruas.json',
        content: JSON.stringify(gruas, null, 2),
      },
    ],
  });
}

/**
 * Sync cargos data to git
 */
export async function syncCargosToGit(cargos: string[]): Promise<boolean> {
  const timestamp = new Date().toISOString();

  return await commitAndPushChanges({
    message: `chore: Update cargos data - ${timestamp}`,
    files: [
      {
        path: 'public/data/cargos.json',
        content: JSON.stringify(cargos, null, 2),
      },
    ],
  });
}
