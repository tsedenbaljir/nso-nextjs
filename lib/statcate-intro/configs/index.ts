import type { IntroDashboardConfig } from "@/lib/statcate-intro/types";
import { monasteries } from "@/lib/statcate-intro/configs/monasteries";
import { poverty } from "@/lib/statcate-intro/configs/poverty";
import { socialInsurance } from "@/lib/statcate-intro/configs/social-insurance";
import { sdg } from "@/lib/statcate-intro/configs/sdg";
import { balanceOfPayments } from "@/lib/statcate-intro/configs/balance-of-payments";
import { consumerPriceIndex } from "@/lib/statcate-intro/configs/consumer-price-index";
import { environment } from "@/lib/statcate-intro/configs/environment";
import { environmentalEconomicAccount } from "@/lib/statcate-intro/configs/environmental-economic-account";
import { foreignTrade } from "@/lib/statcate-intro/configs/foreign-trade";
import { governmentBudget } from "@/lib/statcate-intro/configs/government-budget";
import { housingPriceIndex } from "@/lib/statcate-intro/configs/housing-price-index";
import { investment } from "@/lib/statcate-intro/configs/investment";
import { moneyAndFinance } from "@/lib/statcate-intro/configs/money-and-finance";
import { nationalAccounts } from "@/lib/statcate-intro/configs/national-accounts";
import { producerPriceIndex } from "@/lib/statcate-intro/configs/producer-price-index";
import { productivity } from "@/lib/statcate-intro/configs/productivity";
import { disability } from "@/lib/statcate-intro/configs/disability";
import { election } from "@/lib/statcate-intro/configs/election";
import { foodSecurity } from "@/lib/statcate-intro/configs/food-security";
import { gender } from "@/lib/statcate-intro/configs/gender";

/**
 * Шинэ салбар нэмэх:
 * 1. configs/<id>.ts дээр хүснэгт, хэмжээс, widget-ээ зарлана
 * 2. тэр config-оо энэ жагсаалтад хийнэ
 */
export const INTRO_CONFIGS: IntroDashboardConfig[] = [
  monasteries,
  poverty,
  socialInsurance,
  sdg,
  balanceOfPayments,
  consumerPriceIndex,
  environment,
  environmentalEconomicAccount,
  foreignTrade,
  governmentBudget,
  housingPriceIndex,
  investment,
  moneyAndFinance,
  nationalAccounts,
  producerPriceIndex,
  productivity,
  disability,
  election,
  foodSecurity,
  gender,
];
