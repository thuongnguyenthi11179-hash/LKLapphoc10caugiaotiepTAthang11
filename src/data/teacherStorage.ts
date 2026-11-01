export interface TeacherRecord {
  id: string;
  name: string;
  role: string;
  joinedAt: string;
  lastActive: string;
  stars: number;
  completedSkills: {
    listen: boolean;
    speak: boolean;
    read: boolean;
    write: boolean;
    practice: boolean;
  };
  notes?: string;
  updatedAtMs?: number;
}

const STORAGE_KEY = 'lekimlang_teacher_dashboard_nov';
const ACTIVE_TEACHER_KEY = 'lekimlang_active_teacher_nov';
const DELETED_IDS_KEY = 'lekimlang_deleted_teachers_nov';

// Cloud Sync Endpoints (Zero-config cross-device sync for TH Le Kim Lang)
const KV_APP_KEY = 'agqjik2a';
const KV_ITEM_KEY = 'lekimlang_nov2026';
const KV_UPDATE_URL = `https://keyvalue.immanuel.co/api/KeyVal/UpdateValue/${KV_APP_KEY}/${KV_ITEM_KEY}`;
const KV_GET_URL = `https://keyvalue.immanuel.co/api/KeyVal/GetValue/${KV_APP_KEY}/${KV_ITEM_KEY}`;
const NTFY_TOPIC = 'th_le_kim_lang_nov_2026_teachers_v1';
const NTFY_URL = `https://ntfy.sh/${NTFY_TOPIC}`;

export const INITIAL_TEACHERS: TeacherRecord[] = [
  {
    id: 'teacher-1',
    name: 'Cô Nguyễn Thị Thương',
    role: 'Giáo viên Tổ Ngoại ngữ',
    joinedAt: '01/11/2026 08:30',
    lastActive: 'Vừa xong',
    stars: 89,
    completedSkills: {
      listen: true,
      speak: true,
      read: true,
      write: true,
      practice: true,
    },
    notes: 'Đã hoàn thành xuất sắc 10/10 mẫu câu tháng 11.',
    updatedAtMs: 1793520000000
  }
];

// UTF-8 safe Base64URL encoding/decoding for browser
function encodeBase64Url(str: string): string {
  try {
    const bytes = new TextEncoder().encode(str);
    let binary = '';
    bytes.forEach((b) => (binary += String.fromCharCode(b)));
    return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  } catch {
    return '';
  }
}

function decodeBase64Url(b64Url: string): string {
  try {
    const base64 = b64Url.replace(/-/g, '+').replace(/_/g, '/');
    const pad = base64.length % 4;
    const padded = pad ? base64 + '='.repeat(4 - pad) : base64;
    const binary = atob(padded);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return new TextDecoder().decode(bytes);
  } catch {
    return '';
  }
}

function getDeletedTeacherIds(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(DELETED_IDS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function addDeletedTeacherId(id: string): void {
  if (typeof window === 'undefined') return;
  try {
    const list = getDeletedTeacherIds();
    if (!list.includes(id)) {
      list.push(id);
      localStorage.setItem(DELETED_IDS_KEY, JSON.stringify(list));
    }
  } catch {}
}

/**
 * Merges two teacher lists by normalized teacher name, keeping highest stars, union of completedSkills, and latest activity
 */
export function mergeTeacherLists(
  localList: TeacherRecord[],
  remoteList: TeacherRecord[]
): TeacherRecord[] {
  const deletedIds = new Set(getDeletedTeacherIds());
  const byName = new Map<string, TeacherRecord>();

  const processItem = (item: TeacherRecord) => {
    if (!item || !item.name || deletedIds.has(item.id)) return;
    if (item.name === 'Thầy Trần Minh Hoàng' || item.name === 'Cô Lê Thị Mai Lan') return;

    const key = item.name.trim().toLowerCase();
    const existing = byName.get(key);

    if (!existing) {
      byName.set(key, {
        ...item,
        completedSkills: {
          listen: Boolean(item.completedSkills?.listen),
          speak: Boolean(item.completedSkills?.speak),
          read: Boolean(item.completedSkills?.read),
          write: Boolean(item.completedSkills?.write),
          practice: Boolean(item.completedSkills?.practice),
        }
      });
    } else {
      const mergedSkills = {
        listen: Boolean(existing.completedSkills?.listen || item.completedSkills?.listen),
        speak: Boolean(existing.completedSkills?.speak || item.completedSkills?.speak),
        read: Boolean(existing.completedSkills?.read || item.completedSkills?.read),
        write: Boolean(existing.completedSkills?.write || item.completedSkills?.write),
        practice: Boolean(existing.completedSkills?.practice || item.completedSkills?.practice),
      };
      const isNewer = (item.updatedAtMs || 0) >= (existing.updatedAtMs || 0);
      byName.set(key, {
        ...existing,
        ...item,
        id: existing.id || item.id,
        role: isNewer ? item.role || existing.role : existing.role || item.role,
        joinedAt: existing.joinedAt || item.joinedAt,
        lastActive: isNewer ? item.lastActive || existing.lastActive : existing.lastActive,
        stars: Math.max(existing.stars || 0, item.stars || 0),
        completedSkills: mergedSkills,
        notes: isNewer ? item.notes || existing.notes : existing.notes,
        updatedAtMs: Math.max(existing.updatedAtMs || 0, item.updatedAtMs || 0)
      });
    }
  };

  remoteList.forEach(processItem);
  localList.forEach(processItem);

  const result = Array.from(byName.values()).sort(
    (a, b) => (b.updatedAtMs || 0) - (a.updatedAtMs || 0)
  );
  return result.length > 0 ? result : INITIAL_TEACHERS;
}

export function getStoredTeachers(): TeacherRecord[] {
  if (typeof window === 'undefined') return INITIAL_TEACHERS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_TEACHERS));
      return INITIAL_TEACHERS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      const cleaned = parsed.filter(
        t => t.name !== 'Thầy Trần Minh Hoàng' && t.name !== 'Cô Lê Thị Mai Lan'
      );
      if (cleaned.length === 0) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_TEACHERS));
        return INITIAL_TEACHERS;
      }
      return cleaned;
    }
    return INITIAL_TEACHERS;
  } catch {
    return INITIAL_TEACHERS;
  }
}

/**
 * Push a teacher update to Cloud Sync (both Realtime Stream & KeyValue Store)
 */
export async function pushTeachersToCloud(
  teachers: TeacherRecord[],
  upsertedTeacher?: TeacherRecord,
  deletedId?: string
): Promise<boolean> {
  if (typeof window === 'undefined') return false;
  let ok = false;

  // 1. Broadcast event to realtime ntfy stream
  try {
    const payload = deletedId
      ? { type: 'DELETE_TEACHER', deletedId, timestamp: Date.now() }
      : upsertedTeacher
      ? { type: 'UPSERT_TEACHER', teacher: upsertedTeacher, timestamp: Date.now() }
      : { type: 'SYNC_ALL', teachers: teachers.slice(0, 50), timestamp: Date.now() };

    const res = await fetch(NTFY_URL, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    if (res.ok) ok = true;
  } catch (e) {
    console.warn('Cloud stream broadcast warning:', e);
  }

  // 2. Save full snapshot to KeyValue store (keep top 60 teachers to fit URL limits)
  try {
    const compact = teachers.slice(0, 60);
    const encoded = encodeBase64Url(JSON.stringify(compact));
    if (encoded) {
      const res = await fetch(`${KV_UPDATE_URL}/${encoded}`, {
        method: 'POST'
      });
      if (res.ok) ok = true;
    }
  } catch (e) {
    console.warn('Cloud KV snapshot warning:', e);
  }

  return ok;
}

/**
 * Pull and merge teachers from Cloud Sync (KeyValue Snapshot + Recent Realtime Stream)
 */
export async function syncTeachersFromCloud(): Promise<TeacherRecord[]> {
  const local = getStoredTeachers();
  if (typeof window === 'undefined') return local;

  let remoteKV: TeacherRecord[] = [];
  let remoteStream: TeacherRecord[] = [];

  // 1. Fetch KeyValue snapshot
  try {
    const res = await fetch(KV_GET_URL, { cache: 'no-store' });
    if (res.ok) {
      const b64 = await res.json();
      if (typeof b64 === 'string' && b64.length > 5) {
        const jsonStr = decodeBase64Url(b64);
        const parsed = JSON.parse(jsonStr);
        if (Array.isArray(parsed)) {
          remoteKV = parsed;
        }
      }
    }
  } catch (e) {
    console.warn('Cloud KV fetch warning:', e);
  }

  // 2. Fetch recent events from ntfy cache (last 24h)
  try {
    const res = await fetch(`${NTFY_URL}/json?poll=1&since=24h`, { cache: 'no-store' });
    if (res.ok) {
      const text = await res.text();
      const lines = text.split('\n').filter(Boolean);
      for (const line of lines) {
        try {
          const evt = JSON.parse(line);
          if (evt.event === 'message' && evt.message) {
            const data = JSON.parse(evt.message);
            if (data.type === 'UPSERT_TEACHER' && data.teacher) {
              remoteStream.push(data.teacher);
            } else if (data.type === 'SYNC_ALL' && Array.isArray(data.teachers)) {
              remoteStream.push(...data.teachers);
            } else if (data.type === 'DELETE_TEACHER' && data.deletedId) {
              addDeletedTeacherId(data.deletedId);
            }
          }
        } catch {}
      }
    }
  } catch (e) {
    console.warn('Cloud stream poll warning:', e);
  }

  const merged = mergeTeacherLists(local, [...remoteKV, ...remoteStream]);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
    window.dispatchEvent(new CustomEvent('lekimlang_teachers_updated', { detail: merged }));
  } catch {}

  return merged;
}

/**
 * Subscribe to real-time teacher registrations from other devices via Server-Sent Events (SSE)
 */
export function subscribeToRealtimeTeacherUpdates(
  onUpdate: (teachers: TeacherRecord[]) => void
): () => void {
  if (typeof window === 'undefined' || typeof EventSource === 'undefined') {
    return () => {};
  }

  let es: EventSource | null = null;
  try {
    es = new EventSource(`${NTFY_URL}/sse`);
    es.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        const msg = payload.message ? JSON.parse(payload.message) : payload;

        if (msg.type === 'UPSERT_TEACHER' && msg.teacher) {
          const current = getStoredTeachers();
          const merged = mergeTeacherLists(current, [msg.teacher]);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
          onUpdate(merged);
        } else if (msg.type === 'SYNC_ALL' && Array.isArray(msg.teachers)) {
          const current = getStoredTeachers();
          const merged = mergeTeacherLists(current, msg.teachers);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
          onUpdate(merged);
        } else if (msg.type === 'DELETE_TEACHER' && msg.deletedId) {
          addDeletedTeacherId(msg.deletedId);
          const current = getStoredTeachers().filter(t => t.id !== msg.deletedId);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
          onUpdate(current);
        }
      } catch {}
    };
  } catch {}

  const handleLocalEvent = (e: any) => {
    if (e?.detail && Array.isArray(e.detail)) {
      onUpdate(e.detail);
    } else {
      onUpdate(getStoredTeachers());
    }
  };
  window.addEventListener('lekimlang_teachers_updated', handleLocalEvent);

  return () => {
    if (es) es.close();
    window.removeEventListener('lekimlang_teachers_updated', handleLocalEvent);
  };
}

export function saveTeacher(name: string, role = 'Giáo viên TH Lê Kim Lăng'): TeacherRecord {
  const teachers = getStoredTeachers();
  const trimmed = name.trim();
  const now = new Date();
  const timeStr = `${now.getDate().toString().padStart(2, '0')}/${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getFullYear()} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

  const existingIndex = teachers.findIndex(
    t => t.name.trim().toLowerCase() === trimmed.toLowerCase()
  );
  let targetTeacher: TeacherRecord;

  if (existingIndex >= 0) {
    targetTeacher = {
      ...teachers[existingIndex],
      role: role || teachers[existingIndex].role,
      lastActive: timeStr,
      updatedAtMs: Date.now()
    };
    teachers[existingIndex] = targetTeacher;
  } else {
    targetTeacher = {
      id: `teacher-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      name: trimmed,
      role: role,
      joinedAt: timeStr,
      lastActive: 'Vừa tham gia',
      stars: 50,
      completedSkills: {
        listen: true,
        speak: false,
        read: false,
        write: false,
        practice: false,
      },
      notes: 'Đã đăng ký tham gia học 10 câu tiếng Anh tháng 11.',
      updatedAtMs: Date.now()
    };
    teachers.unshift(targetTeacher);
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(teachers));
    localStorage.setItem(ACTIVE_TEACHER_KEY, JSON.stringify(targetTeacher));
    window.dispatchEvent(new CustomEvent('lekimlang_teachers_updated', { detail: teachers }));
  } catch (e) {
    console.error(e);
  }

  // Push immediately to Cloud Sync so admin/other devices see it right away!
  pushTeachersToCloud(teachers, targetTeacher).catch(() => {});

  return targetTeacher;
}

export function deleteTeacherRecord(id: string): TeacherRecord[] {
  addDeletedTeacherId(id);
  const currentList = getStoredTeachers();
  const filtered = currentList.filter(t => t.id !== id);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    window.dispatchEvent(new CustomEvent('lekimlang_teachers_updated', { detail: filtered }));
  } catch {}
  pushTeachersToCloud(filtered, undefined, id).catch(() => {});
  return filtered;
}

export function getActiveTeacher(): TeacherRecord {
  if (typeof window === 'undefined') return INITIAL_TEACHERS[0];
  try {
    const raw = localStorage.getItem(ACTIVE_TEACHER_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return INITIAL_TEACHERS[0];
}

export function setActiveTeacherRecord(teacher: TeacherRecord) {
  try {
    localStorage.setItem(ACTIVE_TEACHER_KEY, JSON.stringify(teacher));
  } catch {}
}

export function updateTeacherStars(starsDelta: number) {
  const current = getActiveTeacher();
  const teachers = getStoredTeachers();
  const updatedStars = Math.max(0, (current.stars || 0) + starsDelta);
  current.stars = updatedStars;
  current.updatedAtMs = Date.now();

  const idx = teachers.findIndex(
    t => t.id === current.id || t.name.toLowerCase() === current.name.toLowerCase()
  );
  if (idx >= 0) {
    teachers[idx].stars = updatedStars;
    teachers[idx].updatedAtMs = current.updatedAtMs;
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(teachers));
    localStorage.setItem(ACTIVE_TEACHER_KEY, JSON.stringify(current));
    window.dispatchEvent(new CustomEvent('lekimlang_teachers_updated', { detail: teachers }));
  } catch {}

  pushTeachersToCloud(teachers, idx >= 0 ? teachers[idx] : current).catch(() => {});
  return updatedStars;
}

export function markTeacherSkillCompleted(
  skill: keyof TeacherRecord['completedSkills']
): TeacherRecord {
  const current = getActiveTeacher();
  const teachers = getStoredTeachers();

  const updatedCompleted = {
    ...(current.completedSkills || {
      listen: true,
      speak: false,
      read: false,
      write: false,
      practice: false
    }),
    [skill]: true
  };

  current.completedSkills = updatedCompleted;
  current.updatedAtMs = Date.now();
  const allDone = Object.values(updatedCompleted).every(Boolean);
  if (allDone) {
    current.notes = 'Đã hoàn thành xuất sắc 5/5 kỹ năng tháng 11.';
  }

  const idx = teachers.findIndex(
    t => t.id === current.id || t.name.toLowerCase() === current.name.toLowerCase()
  );
  if (idx >= 0) {
    teachers[idx] = {
      ...teachers[idx],
      completedSkills: updatedCompleted,
      notes: current.notes,
      updatedAtMs: current.updatedAtMs
    };
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(teachers));
    localStorage.setItem(ACTIVE_TEACHER_KEY, JSON.stringify(current));
    window.dispatchEvent(new CustomEvent('lekimlang_teachers_updated', { detail: teachers }));
  } catch {}

  pushTeachersToCloud(teachers, idx >= 0 ? teachers[idx] : current).catch(() => {});
  return current;
}
