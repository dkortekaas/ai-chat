import { NextRequest, NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session?.user) {
      return NextResponse.json(
        { message: "Je moet ingelogd zijn om gebruikers op te halen" },
        { status: 401 }
      );
    }
    if (session.user.role !== "SUPERUSER") {
      return NextResponse.json(
        { message: "Je hebt geen toegang tot deze functionaliteit" },
        { status: 403 }
      );
    }
    const users = await db.user.findMany();
    return NextResponse.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { message: "Er is een interne serverfout opgetreden" },
      { status: 500 }
    );
  }
}
