import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/authOptions"; // Import the authOptions (NextAuth configuration)
import Link from "next/link";

export default async function HomePage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return (
      <div>
        <h1>Welcome to the Authentication Page</h1>
        <p>You need to sign in to access the content.</p>

        <div>
          {/* Link to the sign-in page */}
          <Link href="/auth/signin">
            <button>Sign In</button>
          </Link>
        </div>

        <div>
          {/* Link to the sign-up page (assuming you have a custom sign-up page) */}
          <Link href="/auth/signup">
            <button>Sign Up</button>
          </Link>
        </div>

        <div>
          {/* Link to the error page */}
          <Link href="/auth/error">
            <button>Error Page</button>
          </Link>
        </div>
      </div>
    );
  }

  // If session exists, display welcome message
  return (
    <div>
      <h1>Welcome, {session.user?.email}</h1>
      <div>
        <p>You are successfully signed in!</p>
        {/* Link to the sign-out page */}
        <Link href="/api/auth/signout">
          <button>Sign Out</button>
        </Link>
      </div>
    </div>
  );
}