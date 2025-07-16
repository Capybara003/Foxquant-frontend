"use client";

import Link from "next/link";

export default function ErrorPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8 flex flex-col items-center">
        <svg className="w-16 h-16 text-red-500 mb-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z" />
        </svg>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Something went wrong</h1>
        <p className="text-gray-600 mb-6 text-center">An unexpected error has occurred. Please try again later or return to the homepage.</p>
        <Link href="/">
          <span className="inline-block bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition-colors cursor-pointer">Go to Homepage</span>
        </Link>
      </div>
    </div>
  );
} 