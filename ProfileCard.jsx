import React from "react";

export default function ProfileCard() {
  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-6">
      <div className="w-full max-w-sm rounded-2xl bg-white shadow-xl p-6 text-center">
        <img
          src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&q=80&auto=format&fit=crop"
          alt="Profile avatar"
          className="mx-auto h-24 w-24 rounded-full object-cover ring-4 ring-indigo-100"
        />

        <h2 className="mt-4 text-2xl font-semibold text-slate-800">Emma Parker</h2>

        <p className="mt-2 text-sm text-slate-600">
          Frontend developer who loves building clean interfaces and delightful
          user experiences.
        </p>

        <button
          type="button"
          className="mt-6 inline-flex items-center justify-center rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white shadow-md transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2"
        >
          Follow
        </button>
      </div>
    </div>
  );

}

