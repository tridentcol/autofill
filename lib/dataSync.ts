import type { Worker, Cuadrilla, Camioneta, Grua } from '@/types';

/**
 * Service to sync data with server (write to JSON files)
 * Only used when admin makes changes
 */

export async function syncWorkersToServer(workers: Worker[]): Promise<boolean> {
  try {
    const response = await fetch('/api/data/workers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(workers),
    });

    if (!response.ok) {
      throw new Error('Failed to sync workers');
    }

    console.log('✅ Workers synced to repository');
    return true;
  } catch (error) {
    console.error('❌ Error syncing workers:', error);
    return false;
  }
}

export async function syncCuadrillasToServer(cuadrillas: Cuadrilla[]): Promise<boolean> {
  try {
    const response = await fetch('/api/data/cuadrillas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cuadrillas),
    });

    if (!response.ok) {
      throw new Error('Failed to sync cuadrillas');
    }

    console.log('✅ Cuadrillas synced to repository');
    return true;
  } catch (error) {
    console.error('❌ Error syncing cuadrillas:', error);
    return false;
  }
}

export async function syncCamionetasToServer(camionetas: Camioneta[]): Promise<boolean> {
  try {
    const response = await fetch('/api/data/camionetas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(camionetas),
    });

    if (!response.ok) {
      throw new Error('Failed to sync camionetas');
    }

    console.log('✅ Camionetas synced to repository');
    return true;
  } catch (error) {
    console.error('❌ Error syncing camionetas:', error);
    return false;
  }
}

export async function syncGruasToServer(gruas: Grua[]): Promise<boolean> {
  try {
    const response = await fetch('/api/data/gruas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(gruas),
    });

    if (!response.ok) {
      throw new Error('Failed to sync gruas');
    }

    console.log('✅ Gruas synced to repository');
    return true;
  } catch (error) {
    console.error('❌ Error syncing gruas:', error);
    return false;
  }
}

/**
 * Sync all data to server
 */
export async function syncAllDataToServer(data: {
  workers: Worker[];
  cuadrillas: Cuadrilla[];
  camionetas: Camioneta[];
  gruas: Grua[];
}): Promise<boolean> {
  const results = await Promise.all([
    syncWorkersToServer(data.workers),
    syncCuadrillasToServer(data.cuadrillas),
    syncCamionetasToServer(data.camionetas),
    syncGruasToServer(data.gruas),
  ]);

  return results.every(result => result === true);
}
