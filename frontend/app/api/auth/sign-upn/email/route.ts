import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { success } from "better-auth";

interface RequestBody {
  email: string;
  password: string;
  name: string;
  image: string;
  callbackURL: string;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as RequestBody; // Parses incoming JSON
    const data = await auth.api.signUpEmail({
      body: {
        email: body.email,
        password: body.password,
        name: body.name,
        image: body.image,
      },
    });

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Signup failed" },
      { status: 400 },
    );
  }
}
