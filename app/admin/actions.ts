"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import {
  COOKIE_NAME,
  COOKIE_MAX_AGE_SEC,
  checkPassword,
  makeSessionToken,
} from "../../lib/auth";
import {
  updateBookingStatus,
  appendBookingNote,
  appendClientNote,
  setClientTags,
  type BookingStatus,
} from "../../lib/store";

export async function loginAction(formData: FormData) {
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "/admin");
  if (!checkPassword(password)) {
    redirect(`/admin/login?error=1&next=${encodeURIComponent(next)}`);
  }
  const token = await makeSessionToken();
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: COOKIE_MAX_AGE_SEC,
  });
  redirect(next.startsWith("/admin") ? next : "/admin");
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
  redirect("/admin/login");
}

export async function setBookingStatusAction(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "") as BookingStatus;
  if (!id || !status) return;
  await updateBookingStatus(id, status);
  revalidatePath("/admin");
  revalidatePath("/admin/bookings");
  const clientId = String(formData.get("clientId") ?? "");
  if (clientId) revalidatePath(`/admin/clients/${clientId}`);
}

export async function addBookingNoteAction(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const note = String(formData.get("note") ?? "");
  if (!id) return;
  await appendBookingNote(id, note);
  revalidatePath("/admin/bookings");
  const clientId = String(formData.get("clientId") ?? "");
  if (clientId) revalidatePath(`/admin/clients/${clientId}`);
}

export async function addClientNoteAction(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const note = String(formData.get("note") ?? "");
  if (!id) return;
  await appendClientNote(id, note);
  revalidatePath(`/admin/clients/${id}`);
}

export async function setClientTagsAction(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const raw = String(formData.get("tags") ?? "");
  if (!id) return;
  const tags = raw.split(",").map((t) => t.trim()).filter(Boolean);
  await setClientTags(id, tags);
  revalidatePath(`/admin/clients/${id}`);
}
