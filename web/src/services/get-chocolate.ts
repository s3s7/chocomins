import { prisma } from '@/lib/prisma'

export async function getChocolates() {
  // const rows = await prisma.chocolate.findMany({
  //   orderBy: { createdAt: 'desc' },
  //   include: {
  //     brand: { select: { name: true } },
  //     category: { select: { name: true } },
  //   },
  const rows = await prisma.chocolate.findMany({
  orderBy: { createdAt: 'desc' },
  select: {
    id: true,
    name: true,
    cacaoPercent: true,
    createdAt: true,
    brand: { select: { name: true } },
    category: { select: { name: true } },
  },
  })

  return rows.map(({ brand, category, ...chocolate }) => ({
    ...chocolate,
    brandName: brand.name,
    categoryName: category?.name ?? null,
    cacaoPercent:
      chocolate.cacaoPercent == null ? null : Number(chocolate.cacaoPercent),
  }))
}
// うん、そのやり方で **「一覧に brandName / categoryName を載せる」**目的はちゃんと達成できてる 👍
// include + select で必要なフィールドだけ取って、map で brandName / categoryName に整形するのは一般的だよ。
// ただ、いくつかだけ注意点＆改善案ある：
// 1) brand が必ずある前提なら OK（でも nullable なら落ちる）
// 今 brand.name って直で読んでるので、もし brand が nullable（任意リレーション）だとここで落ちる。
// 必須ならそのままでOK。任意ならこうする：
// brandName: brand?.name ?? null,

// 2) category は今の書き方でOK
// category?.name ?? null になってるから安全。
// 3) include より select に寄せると “返す形” が分かりやすい
// rows.map で整形するのは全然OKなんだけど、取得段階で欲しい形に寄せるなら select もあり：
// const rows = await prisma.chocolate.findMany({
//   orderBy: { createdAt: 'desc' },
//   select: {
//     id: true,
//     name: true,
//     cacaoPercent: true,
//     createdAt: true,
//     brand: { select: { name: true } },
//     category: { select: { name: true } },
//   },
// })

// とはいえ、API/画面用DTOに整形したいなら、今みたいに map で変換するのはむしろ良い。
// 4) cacaoPercent の Number 変換は良い（Decimal 対策）
// Prisma の Decimal をそのまま返すと扱いづらいことが多いので、Number(...) にするのは妥当。
// ただし「小数の精度が重要」なら文字列で返す選択肢もある（例: toString()）。

// 結論：そのままで基本OK。
// 確認したいのは1点だけで、brand は必須リレーション（nullにならない）で合ってる？もし任意なら brand?.name ?? null に直すのがおすすめ。
