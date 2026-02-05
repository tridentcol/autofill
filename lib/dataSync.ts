import type { Worker, Cuadrilla, Camioneta, Grua, Signature, AdminSettings } from '@/types';
import {
  syncWorkersToGit,
  syncCuadrillasToGit,
  syncCamionetasToGit,
  syncGruasToGit,
  syncCargosToGit,
  syncSignaturesToGit,
  syncZonasToGit,
  syncAdminSettingsToGit,
  syncAllDataToGit,
} from './gitSync';

/**
 * Service to sync data with server (write to JSON files and commit to git)
 * Only used when admin makes changes
 */

export async function syncWorkersToServer(workers: Worker[]): Promise<boolean> {
  try {
    // Excluir signatureData del JSON (es demasiado grande - base64)
    // Solo guardamos signatureId, la imagen está en /public/signatures/
    const workersForSync = workers.map(w => {
      const { signatureData, ...workerWithoutSignatureData } = w as any;
      return workerWithoutSignatureData;
    });

    // 1. Write to local JSON file (works in development)
    const response = await fetch('/api/data/workers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(workersForSync),
    });

    if (!response.ok) {
      throw new Error('Failed to sync workers');
    }

    console.log('✅ Workers synced to local files');

    // 2. Commit to git (works in production)
    const gitSuccess = await syncWorkersToGit(workersForSync);
    if (!gitSuccess) {
      console.warn('⚠️ Git sync failed, but local files were updated');
    }

    return true;
  } catch (error) {
    console.error('❌ Error syncing workers:', error);
    return false;
  }
}

export async function syncCuadrillasToServer(cuadrillas: Cuadrilla[]): Promise<boolean> {
  try {
    // 1. Write to local JSON file (works in development)
    const response = await fetch('/api/data/cuadrillas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cuadrillas),
    });

    if (!response.ok) {
      throw new Error('Failed to sync cuadrillas');
    }

    console.log('✅ Cuadrillas synced to local files');

    // 2. Commit to git (works in production)
    const gitSuccess = await syncCuadrillasToGit(cuadrillas);
    if (!gitSuccess) {
      console.warn('⚠️ Git sync failed, but local files were updated');
    }

    return true;
  } catch (error) {
    console.error('❌ Error syncing cuadrillas:', error);
    return false;
  }
}

export async function syncCamionetasToServer(camionetas: Camioneta[]): Promise<boolean> {
  try {
    // 1. Write to local JSON file (works in development)
    const response = await fetch('/api/data/camionetas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(camionetas),
    });

    if (!response.ok) {
      throw new Error('Failed to sync camionetas');
    }

    console.log('✅ Camionetas synced to local files');

    // 2. Commit to git (works in production)
    const gitSuccess = await syncCamionetasToGit(camionetas);
    if (!gitSuccess) {
      console.warn('⚠️ Git sync failed, but local files were updated');
    }

    return true;
  } catch (error) {
    console.error('❌ Error syncing camionetas:', error);
    return false;
  }
}

export async function syncGruasToServer(gruas: Grua[]): Promise<boolean> {
  try {
    // 1. Write to local JSON file (works in development)
    const response = await fetch('/api/data/gruas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(gruas),
    });

    if (!response.ok) {
      throw new Error('Failed to sync gruas');
    }

    console.log('✅ Gruas synced to local files');

    // 2. Commit to git (works in production)
    const gitSuccess = await syncGruasToGit(gruas);
    if (!gitSuccess) {
      console.warn('⚠️ Git sync failed, but local files were updated');
    }

    return true;
  } catch (error) {
    console.error('❌ Error syncing gruas:', error);
    return false;
  }
}

export async function syncCargosToServer(cargos: string[]): Promise<boolean> {
  try {
    // 1. Write to local JSON file (works in development)
    const response = await fetch('/api/data/cargos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cargos),
    });

    if (!response.ok) {
      throw new Error('Failed to sync cargos');
    }

    console.log('✅ Cargos synced to local files');

    // 2. Commit to git (works in production)
    const gitSuccess = await syncCargosToGit(cargos);
    if (!gitSuccess) {
      console.warn('⚠️ Git sync failed, but local files were updated');
    }

    return true;
  } catch (error) {
    console.error('❌ Error syncing cargos:', error);
    return false;
  }
}

export async function syncSignaturesToServer(signatures: Signature[]): Promise<boolean> {
  try {
    // 1. Write to local JSON file (works in development)
    const response = await fetch('/api/data/signatures', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(signatures),
    });

    if (!response.ok) {
      throw new Error('Failed to sync signatures');
    }

    console.log('✅ Signatures synced to local files');

    // 2. Commit to git (works in production)
    const gitSuccess = await syncSignaturesToGit(signatures);
    if (!gitSuccess) {
      console.warn('⚠️ Git sync failed, but local files were updated');
    }

    return true;
  } catch (error) {
    console.error('❌ Error syncing signatures:', error);
    return false;
  }
}

export async function syncZonasToServer(zonas: string[]): Promise<boolean> {
  try {
    // 1. Write to local JSON file (works in development)
    const response = await fetch('/api/data/zonas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(zonas),
    });

    if (!response.ok) {
      throw new Error('Failed to sync zonas');
    }

    console.log('✅ Zonas synced to local files');

    // 2. Commit to git (works in production)
    const gitSuccess = await syncZonasToGit(zonas);
    if (!gitSuccess) {
      console.warn('⚠️ Git sync failed, but local files were updated');
    }

    return true;
  } catch (error) {
    console.error('❌ Error syncing zonas:', error);
    return false;
  }
}

export async function syncAdminSettingsToServer(adminSettings: AdminSettings): Promise<boolean> {
  try {
    // 1. Write to local JSON file (works in development)
    const response = await fetch('/api/data/admin-settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(adminSettings),
    });

    if (!response.ok) {
      throw new Error('Failed to sync admin settings');
    }

    console.log('✅ Admin settings synced to local files');

    // 2. Commit to git (works in production)
    const gitSuccess = await syncAdminSettingsToGit(adminSettings);
    if (!gitSuccess) {
      console.warn('⚠️ Git sync failed, but local files were updated');
    }

    return true;
  } catch (error) {
    console.error('❌ Error syncing admin settings:', error);
    return false;
  }
}

/**
 * Sync all data to server (local files and git)
 */
export async function syncAllDataToServer(data: {
  workers: Worker[];
  cuadrillas: Cuadrilla[];
  camionetas: Camioneta[];
  gruas: Grua[];
}): Promise<boolean> {
  try {
    // Sync all data at once for efficiency
    const results = await Promise.all([
      syncWorkersToServer(data.workers),
      syncCuadrillasToServer(data.cuadrillas),
      syncCamionetasToServer(data.camionetas),
      syncGruasToServer(data.gruas),
    ]);

    // Also do a single git commit with all changes
    // This is more efficient than multiple commits
    await syncAllDataToGit(data);

    return results.every(result => result === true);
  } catch (error) {
    console.error('❌ Error syncing all data:', error);
    return false;
  }
}
