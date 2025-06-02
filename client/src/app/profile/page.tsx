"use client";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getUser, logoutUser } from "../../store/authSlice";
import { AppDispatch, RootState } from "../../store";
import { useRouter } from "next/navigation";
import Spinner from "../../components/Spinner";
import ErrorMessage from "../../components/ErrorMessage";
import ProfileDetails from "../../components/ProfileDetails";

// Profile component
export default function Profile() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { user, loading, error, token } = useSelector(
    (state: RootState) => state.auth
  );

  useEffect(() => {
    if (!token) {
      router.replace("/login");
      return;
    }
    if (!user) {
      dispatch(getUser());
    }
  }, [dispatch, token, user, router]);

  const handleLogout = async () => {
    try {
      await dispatch(logoutUser()).unwrap();
      router.push("/login");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  if (loading || !user) {
    return <Spinner />;
  }

  if (error) {
    return <ErrorMessage error={error} />;
  }

  return <ProfileDetails user={user} onLogout={handleLogout} router={router} />;
}
