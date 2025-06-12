// ### src/app/api/portfolio/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase/config";
import {
  doc,
  setDoc,
  getDoc,
  deleteDoc,
  collection,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
} from "firebase/firestore";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const isPublic = searchParams.get("public") === "true";

    if (userId) {
      const docRef = doc(db, "users", userId, "portfolio", "data");
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return NextResponse.json(docSnap.data());
      } else {
        return NextResponse.json(
          { error: "Portfolio not found" },
          { status: 404 }
        );
      }
    }

    if (isPublic) {
      const q = query(
        collection(db, "portfolios"),
        where("isPublic", "==", true),
        orderBy("createdAt", "desc"),
        limit(50)
      );
      const querySnapshot = await getDocs(q);
      const portfolios = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      return NextResponse.json(portfolios);
    }

    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const portfolioData = await request.json();
    const { userId } = portfolioData;

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    const docRef = doc(db, "users", userId, "portfolio", "data");
    await setDoc(docRef, {
      ...portfolioData,
      updatedAt: serverTimestamp(),
      createdAt: portfolioData.createdAt || serverTimestamp(),
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    const docRef = doc(db, "users", userId, "portfolio", "data");
    await deleteDoc(docRef);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
