"use client";
import { AppDispatch, RootState } from "@/store";
import { getUser } from "@/store/authSlice";
import Link from "next/link";
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

export default function ProfileButton() {
  const dispatch = useDispatch<AppDispatch>();
  const { user, loading, token } = useSelector(
    (state: RootState) => state.auth
  );

  useEffect(() => {
    if (token) {
      dispatch(getUser());
    }
  }, [dispatch, token]);
  return (
    <>
      {loading ? (
        <div className="flex items-center space-x-2">
          <svg
            className="animate-spin h-5 w-5 text-indigo-600"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <span className="text-sm text-gray-500">Loading...</span>
        </div>
      ) : user ? (
        <div className="rounded-md shadow">
          <Link
            href="/profile"
            className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 md:py-4 md:text-lg md:px-10"
          >
            View Profile
          </Link>
        </div>
      ) : null}
    </>
  );
}
