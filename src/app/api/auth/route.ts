// src/app/api/auth/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/firebase/config";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "firebase/auth";

export async function POST(request: NextRequest) {
  try {
    const { email, password, action } = await request.json();

    if (action === "login") {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      return NextResponse.json({ user: userCredential.user });
    } else if (action === "register") {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      return NextResponse.json({ user: userCredential.user });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
