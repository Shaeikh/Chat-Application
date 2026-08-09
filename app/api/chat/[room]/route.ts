import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import db from "@/lib/db";

type Params = Promise<{ room: string }>;

export async function GET(
  request: NextRequest,
  { params }: { params: Params },
) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 410 });
  }
  const { room } = await params;

  const searchParam = request.nextUrl.searchParams;
  const before = searchParam.get("before");

  try {
    const params = [room];
    if (before) params.push(before);
    const rows = db
      .query(
        `
        SELECT   *
        FROM     (
                  SELECT    m.id AS message_id,
                            m.room,
                            m.type,
                            m.content,
                            m.created_at AS message_created_at,
                            u.id         AS user_id,
                            u.name,
                            u.email,
                            u.image,
                            u.createdat AS user_created_at,
                            u.updatedat AS user_updated_at
                  FROM      messages m
                  LEFT JOIN USER u
                  ON        m.user_id = u.id
                  WHERE     m.room = ?
                  AND       m.type != "system" 
                  ${before ? "AND m.id < ?" : ""}
                  ORDER BY  m.id DESC limit 20
                  )
        ORDER BY message_id ASC
        `,
      )
      .all(...params);

    if (!rows) {
      return NextResponse.json({ error: "Room not found!" }, { status: 404 });
    }

    const messages = rows.map((row: any) => ({
      id: row.message_id,
      room: row.room,
      type: row.type,
      content: row.content,
      createdAt: row.message_created_at,

      user: {
        id: row.user_id,
        name: row.name,
        email: row.email,
        image: row.image,
        createdAt: new Date(row.user_created_at),
        updatedAt: new Date(row.user_updated_at),
      },
    }));

    // console.log(messages);

    return NextResponse.json(messages);
  } catch (e: unknown) {
    console.log(e);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
