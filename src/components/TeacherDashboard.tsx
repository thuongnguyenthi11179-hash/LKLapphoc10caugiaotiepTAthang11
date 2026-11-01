import React, { useState, useEffect } from 'react';
import { 
  GraduationCap, 
  Users, 
  Star, 
  CheckCircle2, 
  Clock, 
  UserPlus, 
  Printer, 
  Award, 
  Search,
  Trash2,
  Check,
  FileSpreadsheet,
  BarChart3,
  Cloud,
  RefreshCw,
  Share2
} from 'lucide-react';
import { 
  TeacherRecord, 
  getStoredTeachers, 
  saveTeacher, 
  setActiveTeacherRecord,
  syncTeachersFromCloud,
  subscribeToRealtimeTeacherUpdates,
  deleteTeacherRecord
} from '../data/teacherStorage';
import { exportTeachersToCSV } from '../utils/wordExport';

interface Props {
  activeTeacher: TeacherRecord;
  onSelectActiveTeacher: (teacher: TeacherRecord) => void;
  onOpenPrint: () => void;
}

export const TeacherDashboard: React.FC<Props> = ({
  activeTeacher,
  onSelectActiveTeacher,
  onOpenPrint
}) => {
  const [teachers, setTeachers] = useState<TeacherRecord[]>(() => getStoredTeachers());
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState('Giáo viên Tổ Ngoại ngữ');
  const [search, setSearch] = useState('');
  const [feedback, setFeedback] = useState('');
  const [isSyncingCloud, setIsSyncingCloud] = useState(false);
  const [lastSyncedTime, setLastSyncedTime] = useState<string>('Vừa đồng bộ');
  const [copiedShareLink, setCopiedShareLink] = useState(false);

  const refreshTeachers = () => {
    setTeachers(getStoredTeachers());
  };

  const handleManualCloudSync = async () => {
    setIsSyncingCloud(true);
    try {
      const merged = await syncTeachersFromCloud();
      setTeachers(merged);
      const now = new Date();
      setLastSyncedTime(
        `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`
      );
    } finally {
      setIsSyncingCloud(false);
    }
  };

  useEffect(() => {
    refreshTeachers();
    handleManualCloudSync();

    const unsubscribe = subscribeToRealtimeTeacherUpdates((updatedList) => {
      setTeachers(updatedList);
      const now = new Date();
      setLastSyncedTime(
        `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`
      );
    });

    const interval = setInterval(() => {
      syncTeachersFromCloud().then((merged) => setTeachers(merged)).catch(() => {});
    }, 12000);

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, [activeTeacher.id]);

  const handleCopyInviteLink = () => {
    const shareUrl = `${window.location.origin}${window.location.pathname}?join=1`;
    navigator.clipboard.writeText(shareUrl);
    setCopiedShareLink(true);
    setFeedback('Đã sao chép đường link học tập! Khi giáo viên mở link và lưu tên trên máy của họ, tên sẽ tự động hiện trên bảng này.');
    setTimeout(() => {
      setCopiedShareLink(false);
      setFeedback('');
    }, 4500);
  };

  const handleAddTeacher = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const saved = saveTeacher(newName.trim(), newRole);
    refreshTeachers();
    onSelectActiveTeacher(saved);
    setNewName('');
    setFeedback(`Đã đăng ký thành công cho giáo viên: ${saved.name}`);
    setTimeout(() => setFeedback(''), 3500);
  };

  const handleSwitchTeacher = (teacher: TeacherRecord) => {
    setActiveTeacherRecord(teacher);
    onSelectActiveTeacher(teacher);
    setFeedback(`Đang học với tài khoản: ${teacher.name}`);
    setTimeout(() => setFeedback(''), 3000);
  };

  const handleDeleteTeacher = (id: string, name: string) => {
    if (confirm(`Bạn có chắc chắn muốn xóa giáo viên "${name}" khỏi danh sách?`)) {
      const updated = deleteTeacherRecord(id);
      setTeachers(updated);
    }
  };

  const filteredTeachers = teachers.filter(t => 
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.role.toLowerCase().includes(search.toLowerCase())
  );

  const totalStars = teachers.reduce((acc, t) => acc + (t.stars || 0), 0);

  // Group stars by role/department for visual chart
  const roleStats = React.useMemo(() => {
    const map: Record<string, { count: number; stars: number }> = {};
    teachers.forEach((t) => {
      const r = t.role || 'Giáo viên Tổ Ngoại ngữ';
      if (!map[r]) map[r] = { count: 0, stars: 0 };
      map[r].count += 1;
      map[r].stars += t.stars || 0;
    });
    const list = Object.entries(map).map(([role, data]) => ({
      role,
      ...data
    }));
    const maxStars = Math.max(100, ...list.map(i => i.stars));
    return { list, maxStars };
  }, [teachers]);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Top Banner Header */}
      <div className="bg-linear-to-r from-teal-800 to-indigo-900 text-white rounded-3xl p-6 sm:p-8 shadow-md border border-teal-700/60">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-xs font-bold text-teal-200">
              <GraduationCap className="w-4 h-4 text-amber-300" />
              <span>BẢNG QUẢN LÝ TIẾN ĐỘ HỌC TẬP · TEACHER DASHBOARD</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white">
              Danh Sách Giáo Viên Trường TH Lê Kim Lăng
            </h2>
            <p className="text-xs sm:text-sm text-teal-100 max-w-2xl leading-relaxed">
              Theo dõi và ghi nhận giáo viên tham gia học 10 mẫu câu giao tiếp Tiếng Anh tháng 11 qua 4 kỹ năng Nghe - Nói - Đọc - Viết & Trò chơi ôn tập.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={handleCopyInviteLink}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-black transition-colors shadow-xs cursor-pointer"
              title="Sao chép link gửi cho giáo viên trong trường vào học"
            >
              {copiedShareLink ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
              <span>{copiedShareLink ? 'Đã sao chép Link!' : 'Copy Link Gửi Giáo Viên'}</span>
            </button>

            <button
              onClick={handleManualCloudSync}
              disabled={isSyncingCloud}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-bold border border-white/20 transition-colors cursor-pointer disabled:opacity-60"
              title="Đồng bộ danh sách giáo viên từ đám mây (Cloud Sync)"
            >
              <RefreshCw className={`w-4 h-4 ${isSyncingCloud ? 'animate-spin text-amber-300' : 'text-teal-200'}`} />
              <span>Đồng bộ Cloud ({lastSyncedTime})</span>
            </button>

            <button
              onClick={() => exportTeachersToCSV(teachers)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 text-xs font-black transition-colors shadow-xs cursor-pointer"
              title="Tải bảng tổng hợp danh sách giáo viên ra file Excel (.CSV)"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Xuất Báo Cáo Excel (.CSV)</span>
            </button>

            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-slate-900 text-xs font-bold hover:bg-slate-100 transition-colors shadow-xs cursor-pointer"
            >
              <Printer className="w-4 h-4 text-teal-700" />
              <span>In danh sách</span>
            </button>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 pt-6 border-t border-teal-700/60">
          <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/30 flex items-center justify-center">
              <Users className="w-5 h-5 text-teal-300" />
            </div>
            <div>
              <div className="text-xs text-teal-200 font-semibold">Giáo viên tham gia</div>
              <div className="text-2xl font-black text-white">{teachers.length}</div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/30 flex items-center justify-center">
              <Star className="w-5 h-5 text-amber-300 fill-amber-300" />
            </div>
            <div>
              <div className="text-xs text-teal-200 font-semibold">Tổng điểm sao thi đua</div>
              <div className="text-2xl font-black text-amber-300">{totalStars}</div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/30 flex items-center justify-center">
              <Award className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <div className="text-xs text-teal-200 font-semibold">Giáo viên đang học</div>
              <div className="text-base font-bold text-white truncate max-w-[180px]">
                {activeTeacher.name || 'Chưa chọn'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {feedback && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Add New Teacher Section */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs space-y-4">
        <div className="flex items-center gap-2">
          <UserPlus className="w-5 h-5 text-teal-600" />
          <h3 className="text-base font-bold text-slate-800">
            Đăng Ký Thêm Giáo Viên Vào Học
          </h3>
        </div>

        <form onSubmit={handleAddTeacher} className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
          <div className="sm:col-span-5">
            <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
              Họ và tên giáo viên
            </label>
            <input
              type="text"
              required
              placeholder="VD: Cô Nguyễn Thị Thương, Thầy Lê Văn Nam..."
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all"
            />
          </div>

          <div className="sm:col-span-4">
            <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
              Tổ chuyên môn / Khối lớp
            </label>
            <select
              value={newRole}
              onChange={(e) => setNewRole(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all"
            >
              <option value="Giáo viên Tổ Ngoại ngữ">Giáo viên Tổ Ngoại ngữ</option>
              <option value="Giáo viên Khối 1">Giáo viên Khối 1</option>
              <option value="Giáo viên Khối 2">Giáo viên Khối 2</option>
              <option value="Giáo viên Khối 3">Giáo viên Khối 3</option>
              <option value="Giáo viên Khối 4">Giáo viên Khối 4</option>
              <option value="Giáo viên Khối 5">Giáo viên Khối 5</option>
              <option value="Giáo viên Tin học - Thể chất - Mỹ thuật">Tổ Bộ Môn (Tin - Thể - Mỹ)</option>
              <option value="Ban Giám Hiệu">Ban Giám Hiệu</option>
            </select>
          </div>

          <div className="sm:col-span-3 pt-5">
            <button
              type="submit"
              className="w-full py-2.5 px-4 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5"
            >
              <UserPlus className="w-4 h-4" />
              <span>Lưu & Bắt đầu học</span>
            </button>
          </div>
        </form>
      </div>

      {/* Department Progress Chart (D3/SVG Style Visual Analytics) */}
      {roleStats.list.length > 0 && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-teal-600" />
              <h3 className="text-base font-bold text-slate-800">
                Biểu Đồ Thi Đua Theo Tổ Chuyên Môn / Khối Lớp
              </h3>
            </div>
            <span className="text-xs font-semibold text-slate-500">
              Tổng cộng: {totalStars} ⭐
            </span>
          </div>

          <div className="space-y-3">
            {roleStats.list.map((item) => {
              const pct = Math.min(100, Math.max(8, Math.round((item.stars / roleStats.maxStars) * 100)));
              return (
                <div key={item.role} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800">
                      {item.role}{' '}
                      <span className="text-slate-400 font-medium">({item.count} giáo viên)</span>
                    </span>
                    <span className="font-black text-amber-700">⭐ {item.stars} sao</span>
                  </div>
                  <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200/60">
                    <div
                      style={{ width: `${pct}%` }}
                      className="h-full bg-linear-to-r from-teal-600 to-emerald-500 rounded-full transition-all duration-500"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Teachers Table */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden">
        {/* Table Toolbar */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-base font-bold text-slate-900">
              Bảng Theo Dõi Học Tập Tháng 11
            </h3>
            <span className="text-xs font-bold text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-full">
              {teachers.length} giáo viên
            </span>
            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <Cloud className="w-3.5 h-3.5 text-emerald-600" />
              <span>Tự động nhận tên giáo viên từ Link chia sẻ</span>
            </span>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm theo tên hoặc tổ..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-teal-500"
            />
          </div>
        </div>

        {/* Responsive Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 text-center w-12">STT</th>
                <th className="px-4 py-3">Họ và tên giáo viên</th>
                <th className="px-4 py-3">Tổ chuyên môn</th>
                <th className="px-4 py-3 text-center">Sao (⭐)</th>
                <th className="px-4 py-3">Tiến độ 5 kỹ năng</th>
                <th className="px-4 py-3">Thời gian</th>
                <th className="px-4 py-3 text-right">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filteredTeachers.map((t, index) => {
                const isCurrent = t.id === activeTeacher.id;
                return (
                  <tr 
                    key={t.id}
                    className={`hover:bg-slate-50/80 transition-colors ${
                      isCurrent ? 'bg-teal-50/50' : ''
                    }`}
                  >
                    <td className="px-4 py-3.5 text-center font-bold text-slate-400">
                      {(index + 1).toString().padStart(2, '0')}
                    </td>

                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-teal-100 text-teal-800 font-bold flex items-center justify-center shrink-0">
                          {t.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 flex items-center gap-1.5">
                            <span>{t.name}</span>
                            {isCurrent && (
                              <span className="text-[10px] font-black text-teal-700 bg-teal-100 px-1.5 py-0.2 rounded-md">
                                Đang học
                              </span>
                            )}
                          </div>
                          {t.notes && (
                            <div className="text-[10px] text-slate-400 font-normal truncate max-w-[200px]">
                              {t.notes}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3.5">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-semibold">
                        {t.role}
                      </span>
                    </td>

                    <td className="px-4 py-3.5 text-center">
                      <span className="font-extrabold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                        ⭐ {t.stars || 0}
                      </span>
                    </td>

                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1">
                        <span 
                          title="Listen"
                          className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            t.completedSkills?.listen ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-400'
                          }`}
                        >
                          L
                        </span>
                        <span 
                          title="Speak"
                          className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            t.completedSkills?.speak ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-400'
                          }`}
                        >
                          S
                        </span>
                        <span 
                          title="Read"
                          className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            t.completedSkills?.read ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-400'
                          }`}
                        >
                          R
                        </span>
                        <span 
                          title="Write"
                          className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            t.completedSkills?.write ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-400'
                          }`}
                        >
                          W
                        </span>
                        <span 
                          title="Practice Game"
                          className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            t.completedSkills?.practice ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-400'
                          }`}
                        >
                          P
                        </span>
                      </div>
                    </td>

                    <td className="px-4 py-3.5 text-slate-500 text-[11px]">
                      <div>{t.joinedAt}</div>
                    </td>

                    <td className="px-4 py-3.5 text-right space-x-1">
                      {!isCurrent ? (
                        <button
                          onClick={() => handleSwitchTeacher(t)}
                          className="px-2.5 py-1 bg-teal-50 hover:bg-teal-100 text-teal-800 rounded-lg text-xs font-bold transition-colors"
                        >
                          Chọn học
                        </button>
                      ) : (
                        <span className="px-2.5 py-1 bg-teal-600 text-white rounded-lg text-xs font-bold">
                          Đang chọn
                        </span>
                      )}

                      <button
                        onClick={() => handleDeleteTeacher(t.id, t.name)}
                        className="p-1 text-slate-300 hover:text-rose-500 rounded-md transition-colors"
                        title="Xóa giáo viên"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
