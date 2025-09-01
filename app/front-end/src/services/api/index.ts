import apiFetch from './apiFetch';

// Nota: el back-end espera consultas en /api/projects y acepta query params como userId y status
// Por defecto usamos el sentinel 'dynamic-admin-id' para solicitar los proyectos públicos/por defecto
export async function getProjects(userId: string | number = 'dynamic-admin-id', status?: string) {
  const params = new URLSearchParams();
  if (userId !== undefined && userId !== null) params.set('userId', String(userId));
  if (status) params.set('status', status);
  const res = await apiFetch(`/api/projects?${params.toString()}`);
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Failed to fetch projects: ${res.status} ${text}`);
  }
  return res.json();
}

export async function getProjectById(id: string) {
  const res = await apiFetch(`/api/projects/${encodeURIComponent(id)}`);
  if (!res.ok) throw new Error('Project not found');
  return res.json();
}

export async function createProject(project: any) {
  const res = await apiFetch(`/api/projects`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(project),
  });
  if (!res.ok) throw new Error('Failed to create project');
  return res.json();
}

export async function updateProject(id: string, project: any) {
  const res = await apiFetch(`/api/projects/${encodeURIComponent(id)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(project),
  });
  if (!res.ok) throw new Error('Failed to update project');
  return res.json();
}

export async function deleteProject(id: string) {
  const res = await apiFetch(`/api/projects/${encodeURIComponent(id)}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete project');
  return res;
}

export default {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
};
