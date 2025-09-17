import apiFetch from './apiFetch';

// Nota: el back-end espera consultas en /api/projects y acepta query params como userId y status
// Por defecto usamos el sentinel 'dynamic-admin-id' para solicitar los proyectos públicos/por defecto
export async function getProjects(userId: string | number = 'dynamic-admin-id', status?: string) {
  const params = new URLSearchParams();
  if (userId !== undefined && userId !== null) params.set('userId', String(userId));
  if (status) params.set('status', status);
  const res = await apiFetch(`/api/projects?${params.toString()}`);
  const contentType = res.headers.get('content-type');
  if (!res.ok) {
    // Lee el body solo una vez
    const text = await res.text().catch(() => '');
    throw new Error(`Failed to fetch projects: ${res.status} ${text}`);
  }
  if (!contentType || !contentType.includes('application/json')) {
    const text = await res.text().catch(() => '');
    throw new Error(
      `Respuesta no es JSON. Content-Type: ${contentType}. Respuesta: ${text.slice(0, 200)}`
    );
  }
  return res.json();
}

export async function getProjectById(id: string) {
  const res = await apiFetch(`/api/projects/${encodeURIComponent(id)}`);
  if (!res.ok) throw new Error('Project not found');
  return res.json();
}

export async function createProject(project: any) {
  const res = await apiFetch(`/api/projects/admin`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(project),
  });
  if (!res.ok) throw new Error('Failed to create project');
  return res.json();
}

export async function updateProject(id: string, project: any) {
  const res = await apiFetch(`/api/projects/admin/${encodeURIComponent(id)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(project),
  });
  if (!res.ok) throw new Error('Failed to update project');
  return res.json();
}

export async function deleteProject(id: string) {
  const res = await apiFetch(`/api/projects/admin/${encodeURIComponent(id)}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete project');
  return res;
}

// -------------------------------
// Experiences API helpers
// -------------------------------
export async function getExperiences(userId?: string | number) {
  const params = new URLSearchParams();
  if (userId !== undefined && userId !== null) params.set('userId', String(userId));
  const res = await apiFetch(`/api/experiences${params.toString() ? `?${params.toString()}` : ''}`);
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Failed to fetch experiences: ${res.status} ${text}`);
  }
  return res.json();
}

export async function createExperience(experience: any) {
  const res = await apiFetch(`/api/experiences`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(experience),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Failed to create experience: ${res.status} ${text}`);
  }
  return res.json();
}

export async function updateExperience(id: string | number, experience: any) {
  const res = await apiFetch(`/api/experiences/${encodeURIComponent(String(id))}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(experience),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Failed to update experience: ${res.status} ${text}`);
  }
  return res.json();
}

export async function deleteExperience(id: string | number) {
  const res = await apiFetch(`/api/experiences/${encodeURIComponent(String(id))}`, {
    method: 'DELETE',
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Failed to delete experience: ${res.status} ${text}`);
  }
  return res;
}

// -------------------------------
// Education API helpers
// -------------------------------
export async function getEducation(userId?: string | number) {
  const params = new URLSearchParams();
  if (userId !== undefined && userId !== null) params.set('userId', String(userId));
  const res = await apiFetch(`/api/education${params.toString() ? `?${params.toString()}` : ''}`);
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Failed to fetch education: ${res.status} ${text}`);
  }
  return res.json();
}

export async function createEducation(education: any) {
  const res = await apiFetch(`/api/education`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(education),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Failed to create education: ${res.status} ${text}`);
  }
  return res.json();
}

export async function updateEducation(id: string | number, education: any) {
  const res = await apiFetch(`/api/education/${encodeURIComponent(String(id))}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(education),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Failed to update education: ${res.status} ${text}`);
  }
  return res.json();
}

export async function deleteEducation(id: string | number) {
  const res = await apiFetch(`/api/education/${encodeURIComponent(String(id))}`, {
    method: 'DELETE',
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Failed to delete education: ${res.status} ${text}`);
  }
  return res;
}

export default {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
};
