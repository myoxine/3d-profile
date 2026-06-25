// src/config/tutorials.ts
// Koleksi tutorial (Medium) yang ditampilkan sebagai "buku" di rak honeycomb.
// Tiap series = satu sel; klik sel -> panel daftar artikel.

export type Article = { title: string; url: string }
export type Series = { name: string; color: string; articles: Article[] }

export const TUTORIALS: Series[] = [
  {
    name: 'Expo Router',
    color: '#3a7bd5',
    articles: [
      { title: 'Navigasi Asik di Expo Router: Dari Dasar Sampai Pro', url: 'https://medium.com/@hadish19/navigasi-asik-di-expo-router-dari-dasar-sampai-pro-9b5cc4bf925c' },
      { title: 'Bagian 1 — Install Expo dan Membuat Screen', url: 'https://medium.com/@hadish19/expo-router-bagian-1-install-expo-dan-membuat-screen-0946cf219a9d' },
      { title: 'Bagian 2 — Nested, Dynamic & Group Routes', url: 'https://medium.com/@hadish19/expo-router-bagian-2-membangun-navigasi-kompleks-dengan-nested-routes-and-dynamic-routes-16551ce60098' },
      { title: 'Bagian 3 — Navigasi Tabs', url: 'https://medium.com/@hadish19/expo-router-bagian-3-navigasi-tabs-ce1b2ae46708' },
      { title: 'Bagian 4 — Navigasi Drawer', url: 'https://medium.com/@hadish19/expo-router-bagian-4-navigasi-drawer-5a434d3d610c' },
    ],
  },
  {
    name: 'Fastify REST API',
    color: '#22a06b',
    articles: [
      { title: 'Restful API menggunakan Fastify', url: 'https://medium.com/@hadish19/restful-api-menggunakan-fastify-e23277dc2391' },
      { title: 'Bagian 1 — Project Initial Setup (TS + Node.js)', url: 'https://medium.com/@hadish19/fastify-restful-api-bagian-1-project-initial-setup-typescript-node-js-0854f478216c' },
      { title: 'Bagian 2 — Setup Route & Handling Request', url: 'https://medium.com/@hadish19/fastify-restful-api-bagian-2-setup-route-dan-handling-request-1a619428b5b5' },
      { title: 'Bagian 3 — Struktur Ulang dengan SOA', url: 'https://medium.com/@hadish19/fastify-restful-api-bagian-3-struktur-ulang-aplikasi-dengan-soa-5c6400028314' },
      { title: 'Bagian 4 — Validasi Request & Serialisasi Response', url: 'https://medium.com/@hadish19/fastify-restful-api-bagian-4-cara-efektif-validasi-request-dan-serialisasi-response-0323fdde12a1' },
      { title: 'Bagian 5 — Logging & Environment', url: 'https://medium.com/@hadish19/fastify-restful-api-bagian-5-setup-logging-dan-environment-yang-efektif-7fd5b5ebbd84' },
      { title: 'Bagian 6 — Dokumentasi API (Swagger UI)', url: 'https://medium.com/@hadish19/fastify-restful-api-bagian-6-langkah-mudah-bikin-dokumentasi-api-dengan-swagger-ui-a423adf0c51f' },
      { title: 'Bagian 7 — Integrasi Database dengan Knex', url: 'https://medium.com/@hadish19/fastify-restful-api-bagian-7-integrasi-database-dengan-knex-migrasi-dan-seed-6d5f902071fa' },
      { title: 'Bagian 8 — CRUD dengan Knex & Objection.js', url: 'https://medium.com/@hadish19/fastify-restful-api-bagian-8-crud-dengan-mudah-menggunakan-knex-objection-js-b832f47ebd16' },
      { title: 'Bagian 9 — Enkripsi Password pada Model User', url: 'https://medium.com/@hadish19/fastify-restful-api-bagian-9-proteksi-data-pengguna-di-fastify-enkripsi-password-pada-model-0390f803ce4b' },
      { title: 'Bagian 10 — Autentikasi dengan JWT', url: 'https://medium.com/@hadish19/fastify-restful-api-bagian-10-autentikasi-aman-dengan-jwt-json-web-token-799eac9a75fa' },
      { title: 'Bagian 11 — Refresh Token dengan Redis', url: 'https://medium.com/@hadish19/fastify-restful-api-bagian-11-menyimpan-refresh-token-dengan-redis-03b671a35cf7' },
      { title: 'Bagian 12 — API Multilingual', url: 'https://medium.com/@hadish19/fastify-restful-api-bagian-12-buat-api-fastify-multilingual-dalam-sekejap-b0d8cdfdbc78' },
      { title: 'Bagian 13 — Testing', url: 'https://medium.com/@hadish19/fastify-restful-api-bagian-13-meningkatkan-kualitas-aplikasi-fastify-dengan-testing-24b55f1df9da' },
      { title: 'Bagian 14 — Deploy dengan Docker', url: 'https://medium.com/@hadish19/fastify-restful-api-bagian-14-deploy-project-fastify-dengan-docker-7ed5da86e390' },
    ],
  },
  {
    name: 'ExpressJS + TypeScript',
    color: '#e0a526',
    articles: [
      { title: 'Dev Server API Backend (Express + TS + TypeORM)', url: 'https://medium.com/@hadish19/development-server-api-backend-with-expressjs-typescript-typeorm-29d297c93a32' },
      { title: 'Part 1 — Install TypeScript + Node.js', url: 'https://medium.com/@hadish19/part-1-install-typescript-node-js-fa8eb850a9d5' },
      { title: 'Part 2 — Install Express dan Nodemon', url: 'https://medium.com/@hadish19/part-2-7ca0bf56dd18' },
      { title: 'Part 3 — Validate Route using OpenAPI', url: 'https://medium.com/@hadish19/part-3-validate-route-using-openapi-2c82348048cd' },
      { title: 'Part 4 — Controllers ke OpenAPI & Dokumentasi', url: 'https://medium.com/@hadish19/part-4-connect-your-controllers-to-openapi-and-create-documentation-ec13062ba8' },
      { title: 'Part 5 — Authentication dengan OpenAPI 3.0', url: 'https://medium.com/@hadish19/part-5-authentication-with-open-api-3-0-487baf17c6' },
    ],
  },
  {
    // Series yang sedang berjalan — ganti URL saat artikel terbit.
    name: '3D Profile Website',
    color: '#b5179e',
    articles: [
      { title: 'Series Intro — Membangun 3D Profile dengan React Three Fiber', url: 'https://medium.com/@hadish19' },
      { title: 'Part 1 — Setup R3F & Scene Dasar', url: 'https://medium.com/@hadish19' },
      { title: 'Part 2 — Dinding, Lantai & Struktur Ruangan', url: 'https://medium.com/@hadish19' },
      { title: 'Part 3 — Furnitur & Model GLB', url: 'https://medium.com/@hadish19' },
      { title: 'Part 4 — Pintu, Jendela & Interaksi', url: 'https://medium.com/@hadish19' },
      { title: 'Part 5 — Pencahayaan Interaktif & Siang/Malam', url: 'https://medium.com/@hadish19' },
      { title: 'Part 6 — Media: Foto, Ijazah & TV YouTube', url: 'https://medium.com/@hadish19' },
      { title: 'Part 7 — Animasi: Karakter, Jam & Neon', url: 'https://medium.com/@hadish19' },
      { title: 'Part 8 — Kamera Fokus, Menu & Hotspot Interaktif', url: 'https://medium.com/@hadish19' },
      { title: 'Part 9 — (Segera hadir)', url: 'https://medium.com/@hadish19' },
    ],
  },
]
