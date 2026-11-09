import test from "node:test";
import assert from "node:assert/strict";
import type * as AuthTypesModule from "../src/features/auth/types/auth.types";

const {
  normalizeProfileInput,
  profileSchema,
} = (await import(
  new URL("../src/features/auth/types/auth.types.ts", import.meta.url).href
)) as typeof AuthTypesModule;

// ==========================================
// AC-3: Inisialisasi & Pembaruan Parsial Kolom Profil
// ==========================================

test("AC-3: profileSchema menerima data awal 4 kolom termasuk saat WA/IG masih kosong atau baru salah satu diisi", () => {
  const initialEmptyContacts = profileSchema.safeParse({
    name: "Rani Putri",
    email: "rani@cira.id",
    whatsapp: "",
    instagram: "",
  });
  assert.equal(initialEmptyContacts.success, true);

  const partialUpdateWhatsappOnly = profileSchema.safeParse({
    name: "Rani Putri",
    email: "rani@cira.id",
    whatsapp: "+6281234567890",
    instagram: "",
  });
  assert.equal(partialUpdateWhatsappOnly.success, true);

  const partialUpdateInstagramOnly = profileSchema.safeParse({
    name: "Rani Putri",
    email: "rani@cira.id",
    whatsapp: "",
    instagram: "rani.putri_01",
  });
  assert.equal(partialUpdateInstagramOnly.success, true);
});

// ==========================================
// AC-4: Validasi Format & Normalisasi Payload WhatsApp / Instagram
// ==========================================

test("AC-4: profileSchema & normalizeProfileInput men-trim input valid dan mengubah kolom kosong menjadi null", () => {
  const input = {
    name: "  Rani Putri  ",
    email: "  rani@cira.id ",
    whatsapp: " +6281234567890 ",
    instagram: "  rani.cira_1 ",
  };

  assert.equal(profileSchema.safeParse(input).success, true);
  assert.deepEqual(normalizeProfileInput(input), {
    name: "Rani Putri",
    email: "rani@cira.id",
    whatsapp: "+6281234567890",
    instagram: "rani.cira_1",
  });

  assert.deepEqual(
    normalizeProfileInput({
      name: "Rani Putri",
      email: "rani@cira.id",
      whatsapp: "   ",
      instagram: "",
    }),
    {
      name: "Rani Putri",
      email: "rani@cira.id",
      whatsapp: null,
      instagram: null,
    },
  );
});

test("AC-4: profileSchema menolak format WhatsApp & Instagram tidak valid dengan pesan error spesifik pada kolomnya", () => {
  const localWhatsapp = profileSchema.safeParse({
    name: "Rani Putri",
    email: "rani@cira.id",
    whatsapp: "081234567890",
    instagram: "rani_cira",
  });
  assert.equal(localWhatsapp.success, false);
  if (!localWhatsapp.success) {
    assert.equal(localWhatsapp.error.issues[0].path[0], "whatsapp");
    assert.match(localWhatsapp.error.issues[0].message, /WhatsApp.*internasional/i);
  }

  const shortWhatsapp = profileSchema.safeParse({
    name: "Rani Putri",
    email: "rani@cira.id",
    whatsapp: "+6212",
    instagram: "",
  });
  assert.equal(shortWhatsapp.success, false);
  if (!shortWhatsapp.success) {
    assert.equal(shortWhatsapp.error.issues[0].path[0], "whatsapp");
  }

  const prefixedAtInstagram = profileSchema.safeParse({
    name: "Rani Putri",
    email: "rani@cira.id",
    whatsapp: "+6281234567890",
    instagram: "@rani_cira",
  });
  assert.equal(prefixedAtInstagram.success, false);
  if (!prefixedAtInstagram.success) {
    assert.equal(prefixedAtInstagram.error.issues[0].path[0], "instagram");
    assert.match(prefixedAtInstagram.error.issues[0].message, /tanpa @/i);
  }

  const urlInstagram = profileSchema.safeParse({
    name: "Rani Putri",
    email: "rani@cira.id",
    whatsapp: "",
    instagram: "https://instagram.com/rani_cira",
  });
  assert.equal(urlInstagram.success, false);
  if (!urlInstagram.success) {
    assert.equal(urlInstagram.error.issues[0].path[0], "instagram");
  }

  const spacedInstagram = profileSchema.safeParse({
    name: "Rani Putri",
    email: "rani@cira.id",
    whatsapp: "",
    instagram: "rani cira",
  });
  assert.equal(spacedInstagram.success, false);
  if (!spacedInstagram.success) {
    assert.equal(spacedInstagram.error.issues[0].path[0], "instagram");
  }
});
