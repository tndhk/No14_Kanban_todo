import { auth } from "@clerk/nextjs/server";
import { Board } from "@prisma/client";
import Link from "next/link";

import prismadb from "@/lib/prisma";
import { CreateBoardForm } from "@/components/create-board-form";

export default async function Home() {
  const { userId } = await auth();
  let boards: Board[] = [];

  if (userId) {
    try {
      boards = await prismadb.board.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
      });
    } catch (error) {
      console.error("Failed to fetch boards:", error);
      // Handle error display if necessary
    }
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Your Boards</h1>

      <div className="mb-6">
        <CreateBoardForm />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {boards.length > 0 ? (
          boards.map((board) => (
            <Link key={board.id} href={`/board/${board.id}`} className="block hover:shadow-md transition-shadow duration-200">
              <div className="p-4 border rounded h-full">
                <h2 className="font-semibold mb-1 truncate">{board.title}</h2>
                {/* Add link to board page later */}
                {/* <p className="text-sm text-gray-500">Created: {new Date(board.createdAt).toLocaleDateString()}</p> */}
              </div>
            </Link>
          ))
        ) : (
          !userId && (
            <p>
              Please sign in to see your boards. <Link href="/sign-in">Sign In</Link>
            </p>
          )
        )}
      </div>
    </div>
  );
}
