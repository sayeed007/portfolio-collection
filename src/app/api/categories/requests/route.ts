// ### src/app/api/categories/requests/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase/config";
import {
  collection,
  getDocs,
  addDoc,
  doc,
  updateDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const userId = searchParams.get("userId");

    let q;
    if (status) {
      q = query(
        collection(db, "categoryRequests"),
        where("status", "==", status),
        orderBy("createdAt", "desc")
      );
    } else if (userId) {
      q = query(
        collection(db, "categoryRequests"),
        where("userId", "==", userId),
        orderBy("createdAt", "desc")
      );
    } else {
      q = query(
        collection(db, "categoryRequests"),
        orderBy("createdAt", "desc")
      );
    }

    const snapshot = await getDocs(q);
    const requests = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    return NextResponse.json(requests);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const requestData = await request.json();
    const requestsRef = collection(db, "categoryRequests");

    const docRef = await addDoc(requestsRef, {
      ...requestData,
      status: "Pending",
      createdAt: serverTimestamp(),
    });

    return NextResponse.json({ id: docRef.id, success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { id, status, adminComment } = await request.json();
    const docRef = doc(db, "categoryRequests", id);

    await updateDoc(docRef, {
      status,
      adminComment,
      updatedAt: new Date().toISOString(),
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
