"use client";

export default function Head() {
  const pageUrl =
    "https://www.1212.mn/mn/statistic/fun-statistic/historicalGivenName";
  const imageUrl =
    "https://www.1212.mn/images/sonirkholtoi/Peoples/ЧИНГИС.jpg";

  return (
    <>
      <title>Түүхэн нэртэй хүмүүсийн тоо | NSO</title>
      <meta
        name="description"
        content="Монголын түүхэнд нэрээ үлдээсэн хүмүүсийн нэрсийн тархалтыг эндээс үзээрэй."
      />
      <meta property="og:type" content="website" />
      <meta property="og:title" content="Түүхэн нэртэй хүмүүсийн тоо | NSO" />
      <meta
        property="og:description"
        content="Монголын түүхэн нэрүүдийн тархалтыг харуулсан сонирхолтой статистик."
      />
      <meta property="og:url" content={pageUrl} />
      <meta property="og:image" content={imageUrl} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content="Чингис хааны түүхэн нэр" />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content="Түүхэн нэртэй хүмүүсийн тоо | NSO" />
      <meta
        name="twitter:description"
        content="Монголын түүхэн нэрүүдийн тархалтыг харуулсан сонирхолтой статистик."
      />
      <meta name="twitter:image" content={imageUrl} />
    </>
  );
}

