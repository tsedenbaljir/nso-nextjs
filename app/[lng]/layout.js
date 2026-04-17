import "./globals.scss";
export const metadata = {
  title: "ҮСХ - Үндэсний статистикийн хороо",
  description: "Үндэсний статистикийн хороо – Монгол Улсын албан ёсны статистик мэдээллийн нэгдсэн сан. Эдийн засаг, хүн ам, нийгэм, байгаль орчны статистик мэдээ, тайлан, дата.",
  keywords: [
      "ҮСХ", 
      "Үндэсний статистикийн хороо", 
      "статистик", 
      "статистикийн мэдээлэл", 
      "Монголын статистик", 
      "1212.mn", 
      "статистик дата", 
      "эдийн засгийн статистик", 
      "хүн амын статистик"
  ],
  authors: [{ name: "ҮСХ", url: "https://www.1212.mn" }],
  creator: "Үндэсний статистикийн хороо",
  publisher: "Үндэсний статистикийн хороо",
  robots: {
      index: true,
      follow: true,
      googleBot: {
          index: true,
          follow: true,
          'max-video-preview': -1,
          'max-image-preview': 'large',
          'max-snippet': -1,
      },
  },
  openGraph: {
      title: "ҮСХ - Үндэсний статистикийн хороо",
      description: "Монгол Улсын эдийн засаг, хүн ам, нийгэм, байгаль орчны талаарх албан ёсны статистик мэдээлэл, тайлан, дата.",
      url: "https://www.1212.mn",
      siteName: "ҮСХ",
      images: [
          {
              url: "https://www.1212.mn/images/logo.png",
              width: 1200,
              height: 630,
              alt: "Үндэсний статистикийн хороо",
              type: "image/png"
          }
      ],
      type: "website",
      locale: "mn_MN"
  },
  twitter: {
      card: "summary_large_image",
      title: "ҮСХ - Үндэсний статистикийн хороо",
      description: "Монгол Улсын статистикийн албан ёсны эх сурвалж. Эдийн засаг, хүн ам, нийгэм, байгаль орчны статистик мэдээлэл.",
      images: ["https://www.1212.mn/images/logo.png"],
      creator: "@1212.mn",
      site: "@1212.mn"
  },
  alternates: {
      canonical: "https://www.1212.mn"  
  }
};

export default function LanguageLayout({ children }) {
  return children;
}
