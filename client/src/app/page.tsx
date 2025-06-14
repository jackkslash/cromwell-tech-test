"use client";
import ProfileButton from "@/components/ProfileButton";

export default function HomePage() {
  return (
    <div>
      <main className="mt-28 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
        <div className="sm:text-center lg:text-left">
          <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
            <span className="block xl:inline">Welcome to</span>{" "}
            <span className="block text-indigo-600 xl:inline">Auth Demo</span>
          </h1>
          <p className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
            A secure authentication system built with Next.js, Node.js, and
            MongoDB. Experience modern web development with best practices in
            security and user experience.
          </p>
          <div className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start">
            <ProfileButton />
          </div>
        </div>
      </main>
    </div>
  );
}
