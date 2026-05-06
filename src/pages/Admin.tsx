import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen,
  Bot,
  ChevronDown,
  ChevronRight,
  ClipboardList,
  FileText,
  Lightbulb,
  LogOut,
  Newspaper,
  Pencil,
  Plus,
  Trash2,
  X,
  Zap,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import {
  useAdminCollection,
  useAdminCreate,
  useAdminDelete,
  useAdminUpdate,
} from '@/lib/adminQueries';
import { FullScreenLoader } from '@/components/ui/FullScreenLoader';

// ─── Field / Collection config ────────────────────────────────────────────────

type FieldType = 'text' | 'date' | 'textarea' | 'select' | 'sources' | 'json' | 'boolean';

type FieldConfig = {
  key: string;
  label: string;
  type: FieldType;
  options?: { value: string; label: string }[];
  required?: boolean;
};

type CollectionConfig = {
  collectionName: string;
  label: string;
  icon: LucideIcon;
  useDocIdFromField?: string;
  sortField?: string;
  hasStatus?: boolean;
  fields: FieldConfig[];
};

const COLLECTIONS: CollectionConfig[] = [
  {
    collectionName: 'briefings',
    label: 'Briefings',
    icon: Newspaper,
    useDocIdFromField: 'date',
    fields: [
      { key: 'date', label: 'Date (YYYY-MM-DD)', type: 'date', required: true },
      { key: 'news', label: 'News (JSON array)', type: 'json', required: true },
      { key: 'deepRead', label: 'Deep Read (JSON object)', type: 'json', required: true },
    ],
  },
  {
    collectionName: 'rustTasks',
    label: 'Rust Tasks',
    icon: ClipboardList,
    hasStatus: true,
    fields: [
      { key: 'date', label: 'Date', type: 'date', required: true },
      {
        key: 'formatType',
        label: 'Format Type',
        type: 'select',
        required: true,
        options: [
          { value: 'patron', label: 'Patrón' },
          { value: 'teoria', label: 'Teoría' },
          { value: 'aplicacion_real', label: 'Aplicación Real' },
          { value: 'caso_real', label: 'Caso Real' },
          { value: 'ecosistema', label: 'Ecosistema' },
        ],
      },
      { key: 'title', label: 'Title', type: 'text', required: true },
      { key: 'content', label: 'Content (Markdown)', type: 'textarea', required: true },
      { key: 'codeSnippet', label: 'Code Snippet', type: 'textarea' },
      { key: 'sources', label: 'Sources', type: 'sources' },
    ],
  },
  {
    collectionName: 'rustReadings',
    label: 'Rust Readings',
    icon: BookOpen,
    hasStatus: true,
    fields: [
      { key: 'date', label: 'Date', type: 'date', required: true },
      { key: 'title', label: 'Title', type: 'text', required: true },
      { key: 'content', label: 'Content (Markdown)', type: 'textarea', required: true },
      { key: 'sources', label: 'Sources', type: 'sources' },
    ],
  },
  {
    collectionName: 'agentItems',
    label: 'Agent Items',
    icon: Bot,
    hasStatus: true,
    fields: [
      { key: 'date', label: 'Date', type: 'date', required: true },
      { key: 'agentName', label: 'Agent Name', type: 'text', required: true },
      {
        key: 'type',
        label: 'Type',
        type: 'select',
        required: true,
        options: [
          { value: 'news', label: 'News' },
          { value: 'changelog', label: 'Changelog' },
          { value: 'pattern', label: 'Pattern' },
        ],
      },
      { key: 'title', label: 'Title', type: 'text', required: true },
      { key: 'content', label: 'Content (Markdown)', type: 'textarea', required: true },
      { key: 'codeSnippet', label: 'Code Snippet', type: 'textarea' },
      { key: 'version', label: 'Version', type: 'text' },
      { key: 'sources', label: 'Sources', type: 'sources' },
    ],
  },
  {
    collectionName: 'businessIdeas',
    label: 'Business Ideas',
    icon: Lightbulb,
    fields: [
      { key: 'date', label: 'Date', type: 'date', required: true },
      { key: 'title', label: 'Title', type: 'text', required: true },
      { key: 'worldContext', label: 'World Context', type: 'textarea', required: true },
      { key: 'problem', label: 'Problem', type: 'textarea', required: true },
      { key: 'solution', label: 'Solution', type: 'textarea', required: true },
      { key: 'market', label: 'Market', type: 'textarea', required: true },
      { key: 'sources', label: 'Sources', type: 'sources' },
    ],
  },
  {
    collectionName: 'aiTips',
    label: 'AI Tips',
    icon: Zap,
    hasStatus: true,
    fields: [
      { key: 'date', label: 'Date', type: 'date', required: true },
      { key: 'title', label: 'Title', type: 'text', required: true },
      { key: 'content', label: 'Content (Markdown)', type: 'textarea', required: true },
      { key: 'toolName', label: 'Tool Name', type: 'text', required: true },
      {
        key: 'category',
        label: 'Category',
        type: 'select',
        required: true,
        options: [
          { value: 'productividad', label: 'Productividad' },
          { value: 'escritura', label: 'Escritura' },
          { value: 'estudio', label: 'Estudio' },
          { value: 'trabajo', label: 'Trabajo' },
          { value: 'vida_diaria', label: 'Vida Diaria' },
          { value: 'investigacion', label: 'Investigación' },
        ],
      },
      { key: 'sources', label: 'Sources', type: 'sources' },
    ],
  },
  {
    collectionName: 'articles',
    label: 'Articles',
    icon: FileText,
    useDocIdFromField: 'slug',
    sortField: 'publishedAt',
    fields: [
      { key: 'slug', label: 'Slug (doc ID, kebab-case)', type: 'text', required: true },
      { key: 'title', label: 'Title', type: 'text', required: true },
      { key: 'metaDescription', label: 'Meta Description (140-160 chars)', type: 'textarea', required: true },
      { key: 'ogImage', label: 'OG Image URL', type: 'text' },
      { key: 'content', label: 'Content (Markdown)', type: 'textarea', required: true },
      {
        key: 'category',
        label: 'Category',
        type: 'select',
        required: true,
        options: [
          { value: 'mvp', label: 'MVP & Producto' },
          { value: 'automatizacion', label: 'Automatización' },
          { value: 'contratacion', label: 'Contratar Tech' },
          { value: 'ia-aplicada', label: 'IA Aplicada' },
          { value: 'estrategia', label: 'Estrategia' },
        ],
      },
      { key: 'keywords', label: 'Keywords (one per line)', type: 'sources' },
      { key: 'readingTime', label: 'Reading Time (ej: "6 min")', type: 'text', required: true },
      { key: 'author', label: 'Author', type: 'text', required: true },
      {
        key: 'relatedServiceId',
        label: 'Related Service',
        type: 'select',
        options: [
          { value: '', label: '— ninguno —' },
          { value: 'diagnostico', label: 'Diagnóstico Tech' },
          { value: 'mvp', label: 'MVP / Desarrollo' },
          { value: 'automatizacion-ia', label: 'Automatización con IA' },
        ],
      },
      {
        key: 'published',
        label: 'Publicado',
        type: 'boolean',
        required: true,
      },
    ],
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function itemToFormValues(
  item: Record<string, unknown>,
  config: CollectionConfig,
): Record<string, string> {
  const values: Record<string, string> = {};
  for (const field of config.fields) {
    const raw = item[field.key];
    if (field.type === 'sources') {
      values[field.key] = Array.isArray(raw) ? (raw as string[]).join('\n') : '';
    } else if (field.type === 'json') {
      values[field.key] = raw != null ? JSON.stringify(raw, null, 2) : '';
    } else if (field.type === 'boolean') {
      values[field.key] = raw === true ? 'true' : 'false';
    } else {
      values[field.key] = raw != null ? String(raw) : '';
    }
  }
  return values;
}

function formValuesToData(
  values: Record<string, string>,
  config: CollectionConfig,
  isNew: boolean,
): Record<string, unknown> {
  const data: Record<string, unknown> = {};
  for (const field of config.fields) {
    const raw = values[field.key] ?? '';
    if (field.type === 'sources') {
      data[field.key] = raw
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean);
    } else if (field.type === 'json') {
      try {
        data[field.key] = raw.trim() ? JSON.parse(raw) : null;
      } catch {
        data[field.key] = raw;
      }
    } else if (field.type === 'boolean') {
      data[field.key] = raw === 'true';
    } else if (field.type === 'textarea') {
      data[field.key] = raw || null;
    } else {
      data[field.key] = raw || null;
    }
  }
  if (isNew && config.hasStatus) {
    data.status = 'pending';
    data.readAt = null;
  }
  return data;
}

// ─── ItemForm ─────────────────────────────────────────────────────────────────

function ItemForm({
  config,
  values,
  onChange,
  onSubmit,
  onCancel,
  isNew,
  error,
  isPending,
}: {
  config: CollectionConfig;
  values: Record<string, string>;
  onChange: (v: Record<string, string>) => void;
  onSubmit: () => void;
  onCancel: () => void;
  isNew: boolean;
  error: string | null;
  isPending: boolean;
}) {
  function set(key: string, value: string) {
    onChange({ ...values, [key]: value });
  }

  const inputCls =
    'w-full rounded-lg border border-border bg-bg-base px-3 py-2 text-sm text-text-primary ' +
    'focus:border-accent-primary focus:outline-none transition-colors font-mono';

  return (
    <div className="border border-border rounded-xl p-4 mb-3 bg-bg-surface space-y-3">
      <p className="font-mono text-[10px] uppercase tracking-widest text-text-muted">
        {isNew ? 'New item' : 'Edit item'}
      </p>
      {config.fields.map((field) => (
        <label key={field.key} className="block">
          <span className="font-mono text-[10px] text-text-muted uppercase tracking-widest mb-1 block">
            {field.label}
            {field.required && ' *'}
          </span>
          {field.type === 'boolean' ? (
            <select
              value={values[field.key] ?? 'false'}
              onChange={(e) => set(field.key, e.target.value)}
              className={inputCls}
            >
              <option value="false">No publicado</option>
              <option value="true">Publicado</option>
            </select>
          ) : field.type === 'select' ? (
            <select
              value={values[field.key] ?? ''}
              onChange={(e) => set(field.key, e.target.value)}
              className={inputCls}
            >
              <option value="">— select —</option>
              {field.options?.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          ) : field.type === 'textarea' || field.type === 'json' ? (
            <textarea
              value={values[field.key] ?? ''}
              onChange={(e) => set(field.key, e.target.value)}
              rows={field.type === 'json' ? 6 : 4}
              className={inputCls}
            />
          ) : field.type === 'sources' ? (
            <textarea
              value={values[field.key] ?? ''}
              onChange={(e) => set(field.key, e.target.value)}
              rows={3}
              placeholder="One URL per line"
              className={inputCls}
            />
          ) : (
            <input
              type="text"
              value={values[field.key] ?? ''}
              onChange={(e) => set(field.key, e.target.value)}
              className={inputCls}
            />
          )}
        </label>
      ))}
      {error && (
        <p className="text-sm text-accent-rust bg-accent-rust/10 border border-accent-rust/30 rounded-lg px-3 py-2">
          {error}
        </p>
      )}
      <div className="flex gap-2 pt-1">
        <button
          type="button"
          onClick={onSubmit}
          disabled={isPending}
          className="px-4 py-2 bg-accent-primary text-white rounded-xl text-sm font-medium
                     hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {isPending ? 'Saving…' : isNew ? 'Create' : 'Save'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-border rounded-xl text-sm text-text-secondary
                     hover:bg-bg-alt transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

// ─── SectionPanel ─────────────────────────────────────────────────────────────

type EditMode = 'idle' | 'creating' | { id: string };

function SectionPanel({ config }: { config: CollectionConfig }) {
  const Icon = config.icon;
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<EditMode>('idle');
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const { data: items = [], isLoading } = useAdminCollection(config.collectionName, config.sortField);
  const createMutation = useAdminCreate(config.collectionName);
  const updateMutation = useAdminUpdate(config.collectionName);
  const deleteMutation = useAdminDelete(config.collectionName);

  const isPending =
    createMutation.isPending || updateMutation.isPending || deleteMutation.isPending;

  function startCreate() {
    setFormValues({});
    setFormError(null);
    setMode('creating');
  }

  function startEdit(item: Record<string, unknown>) {
    setFormValues(itemToFormValues(item, config));
    setFormError(null);
    setMode({ id: item.id as string });
  }

  function cancelEdit() {
    setMode('idle');
    setFormError(null);
  }

  async function handleSubmit() {
    setFormError(null);
    for (const field of config.fields) {
      if (field.required && !formValues[field.key]?.trim()) {
        setFormError(`"${field.label}" is required.`);
        return;
      }
    }
    try {
      if (mode === 'creating') {
        const data = formValuesToData(formValues, config, true);
        const docId = config.useDocIdFromField
          ? String(data[config.useDocIdFromField])
          : undefined;
        await createMutation.mutateAsync({ data, docId });
      } else if (typeof mode === 'object') {
        const data = formValuesToData(formValues, config, false);
        await updateMutation.mutateAsync({ id: mode.id, data });
      }
      setMode('idle');
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to save.');
    }
  }

  async function handleDelete(id: string) {
    if (deleteConfirm !== id) {
      setDeleteConfirm(id);
      return;
    }
    setDeleteConfirm(null);
    try {
      await deleteMutation.mutateAsync(id);
    } catch {
      // silently handled; user can retry
    }
  }

  const editingId = typeof mode === 'object' ? mode.id : null;

  return (
    <div className="border border-border rounded-2xl overflow-hidden">
      <button
        type="button"
        onClick={() => {
          setOpen((v) => !v);
          setMode('idle');
          setDeleteConfirm(null);
        }}
        className="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-bg-alt transition-colors"
      >
        {open ? (
          <ChevronDown className="w-4 h-4 text-text-muted flex-shrink-0" />
        ) : (
          <ChevronRight className="w-4 h-4 text-text-muted flex-shrink-0" />
        )}
        <Icon className="w-4 h-4 text-accent-primary flex-shrink-0" />
        <span className="font-display text-base font-medium text-text-primary">
          {config.label}
        </span>
        <span className="font-mono text-xs text-text-muted ml-auto">
          {isLoading ? '…' : items.length}
        </span>
      </button>

      {open && (
        <div className="border-t border-border px-5 py-4">
          {mode === 'idle' && (
            <button
              type="button"
              onClick={startCreate}
              className="inline-flex items-center gap-1.5 mb-4 px-3 py-1.5 rounded-xl border border-border
                         text-sm text-text-secondary hover:bg-bg-alt hover:text-text-primary transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              New
            </button>
          )}

          {mode === 'creating' && (
            <ItemForm
              config={config}
              values={formValues}
              onChange={setFormValues}
              onSubmit={handleSubmit}
              onCancel={cancelEdit}
              isNew
              error={formError}
              isPending={isPending}
            />
          )}

          {isLoading ? (
            <p className="text-sm text-text-muted py-2">Loading…</p>
          ) : items.length === 0 ? (
            <p className="text-sm text-text-muted py-2">No items yet.</p>
          ) : (
            <div className="space-y-1">
              {items.map((item) => {
                const id = item.id as string;
                const date = String(item.date ?? id);
                const title = String(item.title ?? item.agentName ?? date);
                const isEditing = editingId === id;

                return (
                  <div key={id}>
                    <div
                      className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-colors ${
                        isEditing ? 'bg-bg-alt' : 'hover:bg-bg-alt'
                      }`}
                    >
                      <span className="font-mono text-xs text-text-muted w-24 flex-shrink-0 tabular-nums">
                        {date}
                      </span>
                      <span className="text-text-secondary truncate flex-1">{title}</span>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        {deleteConfirm === id ? (
                          <>
                            <button
                              type="button"
                              onClick={() => handleDelete(id)}
                              className="px-2 py-1 text-xs text-accent-rust border border-accent-rust/30
                                         rounded-lg hover:bg-accent-rust/10 transition-colors"
                            >
                              Confirm
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleteConfirm(null)}
                              className="px-2 py-1 text-xs text-text-muted border border-border
                                         rounded-lg hover:bg-bg-alt transition-colors"
                            >
                              Cancel
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              type="button"
                              onClick={() => (isEditing ? cancelEdit() : startEdit(item))}
                              aria-label={isEditing ? 'Cancel edit' : 'Edit item'}
                              className="p-1.5 rounded-lg text-text-muted hover:text-text-primary
                                         hover:bg-bg-base transition-colors"
                            >
                              {isEditing ? (
                                <X className="w-3.5 h-3.5" />
                              ) : (
                                <Pencil className="w-3.5 h-3.5" />
                              )}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(id)}
                              aria-label="Delete item"
                              className="p-1.5 rounded-lg text-text-muted hover:text-accent-rust
                                         hover:bg-accent-rust/10 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                    {isEditing && (
                      <div className="mt-2 mb-2">
                        <ItemForm
                          config={config}
                          values={formValues}
                          onChange={setFormValues}
                          onSubmit={handleSubmit}
                          onCancel={cancelEdit}
                          isNew={false}
                          error={formError}
                          isPending={isPending}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Admin page ───────────────────────────────────────────────────────────────

export default function Admin() {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && (!user || user.isAnonymous)) {
      navigate('/admin/login', { replace: true });
    }
  }, [user, loading, navigate]);

  if (loading) return <FullScreenLoader />;
  if (!user || user.isAnonymous) return null;

  async function handleSignOut() {
    await signOut();
    navigate('/admin/login', { replace: true });
  }

  return (
    <div className="min-h-screen bg-bg-base">
      <header className="border-b border-border bg-bg-surface sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 h-14 flex items-center justify-between">
          <span className="font-display text-base font-semibold text-text-primary">Dashboard</span>
          <button
            type="button"
            onClick={handleSignOut}
            className="inline-flex items-center gap-2 text-sm text-text-secondary
                       hover:text-text-primary transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign out
          </button>
        </div>
      </header>
      <main className="max-w-4xl mx-auto px-6 py-8 space-y-3">
        {COLLECTIONS.map((config) => (
          <SectionPanel key={config.collectionName} config={config} />
        ))}
      </main>
    </div>
  );
}
