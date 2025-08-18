'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

type Project = { 
  id: string; 
  name: string; 
  description: string | null;
  created_at?: string;
  decision_count?: number;
};

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [editing, setEditing] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { 
    load(); 
  }, []);

  async function load() {
    setLoading(true);
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) {
      setLoading(false);
      return;
    }
    
    // Get projects with decision counts
    const { data: projectsData } = await supabase
      .from('projects')
      .select(`
        id, 
        name, 
        description, 
        created_at,
        decisions!inner(id)
      `)
      .order('created_at', { ascending: false });
    
    // Transform data to include decision counts
    const projectsWithCounts = (projectsData || []).map(p => ({
      id: p.id,
      name: p.name,
      description: p.description,
      created_at: p.created_at,
      decision_count: Array.isArray(p.decisions) ? p.decisions.length : 0
    }));
    
    setProjects(projectsWithCounts as Project[]);
    setLoading(false);
  }

  function startEdit(p: Project) {
    setEditing(p.id);
    setEditName(p.name);
    setEditDesc(p.description || '');
    setErr(null);
  }

  async function saveEdit(id: string) {
    if (!editName.trim()) {
      setErr('Project name is required');
      return;
    }

    const { error } = await supabase.from('projects')
      .update({ 
        name: editName.trim(), 
        description: editDesc.trim() || null 
      })
      .eq('id', id);
      
    if (error) { 
      setErr(error.message); 
      return; 
    }
    
    setEditing(null);
    setErr(null);
    await load();
  }

  async function del(id: string, name: string) {
    if (!confirm(`Delete "${name}"? This will permanently delete the project and all its decisions. This cannot be undone.`)) {
      return;
    }
    
    // Delete related data first
    await supabase.from('decision_links').delete().eq('project_id', id);
    await supabase.from('decisions').delete().eq('project_id', id);
    
    const { error } = await supabase.from('projects').delete().eq('id', id);
    if (error) { 
      setErr(error.message); 
      return; 
    }
    
    setErr(null);
    await load();
  }

  function formatDate(dateString?: string) {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }

  if (loading) {
    return (
      <section className="container py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-slate-200 rounded-md w-48 mb-6"></div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="card card-pad">
                <div className="h-6 bg-slate-200 rounded mb-3"></div>
                <div className="h-4 bg-slate-100 rounded mb-2"></div>
                <div className="h-4 bg-slate-100 rounded w-3/4 mb-4"></div>
                <div className="flex gap-2">
                  <div className="h-8 bg-slate-200 rounded w-20"></div>
                  <div className="h-8 bg-slate-200 rounded w-16"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="container py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Projects</h1>
          <p className="text-slate-600 mt-1">
            Manage your decision mapping projects
          </p>
        </div>
        <Link 
          className="btn btn-primary gap-2" 
          href="/app/projects/new"
        >
          <span className="icon">add</span>
          New Project
        </Link>
      </div>

      {/* Error Message */}
      {err && (
        <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 flex items-center gap-2">
          <span className="icon text-red-500">error</span>
          {err}
        </div>
      )}

      {/* Projects Grid */}
      {projects.length === 0 ? (
        <div className="text-center py-16">
          <div className="mx-auto w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-4">
            <span className="icon text-slate-400 text-4xl">folder</span>
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">No projects yet</h3>
          <p className="text-slate-600 mb-6 max-w-md mx-auto">
            Create your first Decision Thread project to start mapping your organization's decision processes.
          </p>
          <Link href="/app/projects/new" className="btn btn-primary">
            <span className="icon">add</span>
            Create Your First Project
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map(p => (
            <div key={p.id} className="card hover:shadow-lg transition-shadow duration-200">
              {editing === p.id ? (
                <div className="card-pad space-y-4">
                  <div>
                    <label className="form-label">Project Name</label>
                    <input 
                      className="input" 
                      value={editName} 
                      onChange={e => setEditName(e.target.value)}
                      placeholder="Enter project name"
                      autoFocus
                    />
                  </div>
                  <div>
                    <label className="form-label">Description</label>
                    <textarea 
                      className="textarea h-20" 
                      value={editDesc} 
                      onChange={e => setEditDesc(e.target.value)}
                      placeholder="Brief description of this project"
                    />
                  </div>
                  <div className="flex gap-2 pt-2">
                    <button 
                      className="btn btn-primary" 
                      onClick={() => saveEdit(p.id)}
                      disabled={!editName.trim()}
                    >
                      <span className="icon">save</span>
                      Save
                    </button>
                    <button 
                      className="btn btn-secondary" 
                      onClick={() => {
                        setEditing(null);
                        setErr(null);
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="card-pad pb-0">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-lg font-semibold text-slate-900 leading-snug">
                        {p.name}
                      </h3>
                      <div className="flex items-center gap-1 text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded-md">
                        <span className="icon text-sm">account_tree</span>
                        {p.decision_count || 0} decisions
                      </div>
                    </div>
                    
                    {p.description && (
                      <p className="text-sm text-slate-600 mb-3 line-clamp-2">
                        {p.description}
                      </p>
                    )}
                    
                    {p.created_at && (
                      <div className="text-xs text-slate-500 mb-4">
                        Created {formatDate(p.created_at)}
                      </div>
                    )}
                  </div>

                  <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex gap-2">
                    <Link 
                      className="btn btn-primary flex-1 justify-center" 
                      href={`/app/projects/${p.id}`}
                    >
                      <span className="icon">open_in_new</span>
                      Open Canvas
                    </Link>
                    <button 
                      className="btn btn-icon" 
                      onClick={() => startEdit(p)}
                      title="Edit project"
                    >
                      <span className="icon">edit</span>
                    </button>
                    <button 
                      className="btn btn-icon text-red-600 hover:bg-red-50" 
                      onClick={() => del(p.id, p.name)}
                      title="Delete project"
                    >
                      <span className="icon">delete</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
