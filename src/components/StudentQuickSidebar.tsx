import React from "react";
import { Link } from "react-router-dom";
import { useProfile } from "../context/ProfileContext";

export function StudentQuickSidebar() {
  const { student, setEditorOpen } = useProfile();
  const a = student.academic;

  return (
    <aside className="space-y-4 rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm lg:sticky lg:top-24">
      <h2 className="text-sm font-semibold text-slate-900">Your profile</h2>
      <dl className="space-y-2 text-sm">
        <div className="flex justify-between gap-2">
          <dt className="text-slate-500">GPA</dt>
          <dd className="font-medium tabular-nums text-slate-900">{a.gpa.toFixed(1)}</dd>
        </div>
        <div className="flex justify-between gap-2">
          <dt className="text-slate-500">SAT</dt>
          <dd className="font-medium tabular-nums text-slate-900">{a.sat}</dd>
        </div>
        <div className="flex justify-between gap-2">
          <dt className="text-slate-500">UNT/ЕНТ</dt>
          <dd className="font-medium tabular-nums text-slate-900">{a.untScore}/140</dd>
        </div>
        <div className="flex justify-between gap-2">
          <dt className="text-slate-500">IELTS</dt>
          <dd className="font-medium tabular-nums text-slate-900">{a.ielts.toFixed(1)}</dd>
        </div>
        <div className="pt-1 text-xs text-slate-600">
          <span className="font-medium text-slate-700">Funding: </span>
          {student.preferences.financialStatus}
        </div>
      </dl>
      <div className="flex flex-col gap-2 border-t border-slate-100 pt-4">
        <button
          type="button"
          onClick={() => setEditorOpen(true)}
          className="w-full rounded-xl bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
        >
          Edit profile
        </button>
        <Link
          to="/#admission-checklist"
          className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 text-center text-sm font-medium text-slate-800 transition hover:bg-slate-100"
        >
          Admission checklist
        </Link>
        <Link
          to="/#program-grid"
          className="w-full rounded-xl border border-slate-200 bg-white py-2 text-center text-sm font-medium text-slate-800 transition hover:bg-slate-50"
        >
          All programs
        </Link>
        <Link
          to="/"
          className="w-full text-center text-sm font-medium text-indigo-600 hover:text-indigo-800"
        >
          ← Back to dashboard
        </Link>
      </div>
    </aside>
  );
}
