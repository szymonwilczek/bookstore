import { Metadata } from "next";
import { redirect } from "next/navigation";
import { RankingDebugDashboard } from "@/components/ranking/debug-dashboard";
import connectToDB from "@/lib/db/connect";
import User, { IUser } from "@/lib/models/User";
import { auth } from "@/app/api/auth/[...nextauth]/auth";

export const metadata: Metadata = {
  title: "Ranking Debug",
  description: "Testing dashboard for ranking system",
};

const ADMIN_USER_ID = "69011c821d77b9c14759d338";

async function checkAdminAccess() {
  const session = await auth();

  if (!session?.user?.email) {
    redirect("/");
  }

  await connectToDB();
  const user = await User.findOne({ email: session.user.email }).lean() as IUser | null;

  if (!user || user._id.toString() !== ADMIN_USER_ID) {
    redirect("/");
  }

  return true;
}

export default async function RankingDebugPage() {
  await checkAdminAccess();

  return (
    <div className="container mx-auto max-w-4xl space-y-6 px-4 py-8">
      <div>
        <h1 className="text-3xl font-bold">Ranking System Debug</h1>
        <p className="text-muted-foreground">
          Manual testing tools for ranking calculations
        </p>
      </div>

      <RankingDebugDashboard />
    </div>
  );
}
