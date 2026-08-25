"use client";

type Props = {
  name: string;
  size?: "sm" | "md" | "lg";
};

const RULES: { test: RegExp; icon: string }[] = [
  { test: /цул/iu, icon: "steak" },
  { test: /ястай|үхрийн|хонины|ямааны|адууны/iu, icon: "lamb" },
  { test: /гурил/iu, icon: "wheat" },
  { test: /хар талх/iu, icon: "bread" },
  { test: /талх.*зүссэн/iu, icon: "toast" },
  { test: /талх/iu, icon: "bread" },
  { test: /сүү.*ууттай/iu, icon: "milk-carton" },
  { test: /сүү.*савтай/iu, icon: "milk-bottle" },
  { test: /сүү.*задгай/iu, icon: "milk" },
  { test: /тараг/iu, icon: "yogurt" },
  { test: /цөцгийн тос/iu, icon: "butter" },
  { test: /сүү/iu, icon: "milk" },
  { test: /цай/iu, icon: "tea" },
  { test: /өндөг/iu, icon: "egg" },
  { test: /алим/iu, icon: "apple" },
  { test: /төмс/iu, icon: "potato" },
  { test: /лууван/iu, icon: "carrot" },
  { test: /байцаа/iu, icon: "cabbage" },
  { test: /манжин/iu, icon: "beet" },
  { test: /сонгино/iu, icon: "onion" },
  { test: /дизел|түлш/iu, icon: "gas" },
  { test: /евро/iu, icon: "gas-station" },
  { test: /аи-80/iu, icon: "gas-pump" },
  { test: /аи-92/iu, icon: "petrol" },
  { test: /бензин/iu, icon: "gas-pump" },
];

const PX = { sm: 20, md: 28, lg: 40 };

function iconFor(name: string) {
  return RULES.find((rule) => rule.test.test(name))?.icon ?? "bread";
}

export function ProductIcon({ name, size = "md" }: Props) {
  const icon = iconFor(name);
  const px = PX[size];

  return (
    <span className={`product-icon product-icon--${size}`}>
      <img src={`/icons/price/${icon}.png`} alt="" width={px} height={px} />
    </span>
  );
}
