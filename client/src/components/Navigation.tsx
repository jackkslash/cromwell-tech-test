"use client";
import { AppDispatch, RootState } from "@/store";
import { getUser } from "@/store/authSlice";
import Link from "next/link";
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

export default function Navigation() {
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
    <div>
      <nav className=" p-4">
        <div className="container mx-auto flex justify-between items-center">
          <div className=" text-lg font-bold">
            <Link href="/">Auth</Link>
          </div>
          <div className="">
            {user ? (
              `Welcome, ${user.name}`
            ) : (
              <div className="flex space-x-4">
                <Link
                  href="/login"
                  className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 md:py-4 md:text-lg md:px-10"
                >
                  Sign in
                </Link>
                <div>
                  <Link
                    href="/register"
                    className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 md:py-4 md:text-lg md:px-10"
                  >
                    Register
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>
    </div>
  );
}
