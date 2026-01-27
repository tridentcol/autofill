import type { Worker, Cuadrilla, Camioneta, Grua, Zona } from '@/types';

/**
 * Service to load default data from JSON files in the repository
 */

export async function loadWorkersFromJSON(): Promise<Worker[]> {
  try {
    const response = await fetch('/data/workers.json');
    if (!response.ok) throw new Error('Failed to load workers');
    const data = await response.json();

    // Convert date strings to Date objects
    return data.map((worker: any) => ({
      ...worker,
      createdAt: new Date(worker.createdAt),
      updatedAt: new Date(worker.updatedAt),
    }));
  } catch (error) {
    console.error('Error loading workers from JSON:', error);
    return [];
  }
}

export async function loadCuadrillasFromJSON(): Promise<Cuadrilla[]> {
  try {
    const response = await fetch('/data/cuadrillas.json');
    if (!response.ok) throw new Error('Failed to load cuadrillas');
    const data = await response.json();

    return data.map((cuadrilla: any) => ({
      ...cuadrilla,
      createdAt: new Date(cuadrilla.createdAt),
      updatedAt: new Date(cuadrilla.updatedAt),
    }));
  } catch (error) {
    console.error('Error loading cuadrillas from JSON:', error);
    return [];
  }
}

export async function loadCamionetasFromJSON(): Promise<Camioneta[]> {
  try {
    const response = await fetch('/data/camionetas.json');
    if (!response.ok) throw new Error('Failed to load camionetas');
    const data = await response.json();

    return data.map((camioneta: any) => ({
      ...camioneta,
      createdAt: new Date(camioneta.createdAt),
      updatedAt: new Date(camioneta.updatedAt),
    }));
  } catch (error) {
    console.error('Error loading camionetas from JSON:', error);
    return [];
  }
}

export async function loadGruasFromJSON(): Promise<Grua[]> {
  try {
    const response = await fetch('/data/gruas.json');
    if (!response.ok) throw new Error('Failed to load gruas');
    const data = await response.json();

    return data.map((grua: any) => ({
      ...grua,
      createdAt: new Date(grua.createdAt),
      updatedAt: new Date(grua.updatedAt),
    }));
  } catch (error) {
    console.error('Error loading gruas from JSON:', error);
    return [];
  }
}

export async function loadCargosFromJSON(): Promise<string[]> {
  try {
    const response = await fetch('/data/cargos.json');
    if (!response.ok) throw new Error('Failed to load cargos');
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error loading cargos from JSON:', error);
    return [];
  }
}

export async function loadZonasFromJSON(): Promise<Zona[]> {
  try {
    const response = await fetch('/data/zonas.json');
    if (!response.ok) throw new Error('Failed to load zonas');
    const data = await response.json();

    return data.map((zona: any) => ({
      ...zona,
      createdAt: new Date(zona.createdAt),
      updatedAt: new Date(zona.updatedAt),
    }));
  } catch (error) {
    console.error('Error loading zonas from JSON:', error);
    return [];
  }
}

/**
 * Load all default data from JSON files
 */
export async function loadAllDefaultData() {
  const [workers, cuadrillas, camionetas, gruas, cargos, zonas] = await Promise.all([
    loadWorkersFromJSON(),
    loadCuadrillasFromJSON(),
    loadCamionetasFromJSON(),
    loadGruasFromJSON(),
    loadCargosFromJSON(),
    loadZonasFromJSON(),
  ]);

  return {
    workers,
    cuadrillas,
    camionetas,
    gruas,
    cargos,
    zonas,
  };
}
