import { NextResponse } from "next/server";

export function success<T>(data: T, status: number = 200) {
  return NextResponse.json({ success: true, data }, { status });
}

export function error<T>(data: T, status: number = 400) {
  return NextResponse.json({ success: false, data }, { status });
}
