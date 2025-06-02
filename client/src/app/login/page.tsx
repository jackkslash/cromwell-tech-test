import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import LoginForm from "../../components/LoginForm";

export default async function LoginPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token");

  // If user is authenticated, redirect to profile
  if (token) {
    redirect("/profile");
  }

  return (
    <div className="flex items-center justify-center py-24 px-4 sm:px-6 lg:px-8">
      <LoginForm />
    </div>
  );
}
