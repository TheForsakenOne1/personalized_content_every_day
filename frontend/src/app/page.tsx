import { redirect } from "next/navigation";

export default function Home() {
  // Redirect to login page for now
  // Later, this will check if user is authenticated
  redirect("/auth/login");
}
