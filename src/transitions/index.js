import { priceAlert, drawPriceAlert } from './priceAlert';
import { wakar1Lower, drawWakar1Lower } from './wakar1Lower';
import { aiScan, drawAiScan } from './aiScan';
import { marketTransition, drawMarketTransition } from './marketTransition';
import { epicTransition, drawEpicTransition } from './epicTransition';
import { smartMoneyTransition, drawSmartMoneyTransition } from './smartMoneyTransition';
import { bigBelugaTransition, drawBigBelugaTransition } from './bigBelugaTransition';
import { cryptoUniverseTransition, drawCryptoUniverse } from './cryptoUniverse';
import { introTransition, drawIntroTransition } from './introTransition';
import { pixabayIntroTransition, drawPixabayIntroTransition } from './pixabayIntroTransition';

export const TRANSITIONS = [
  introTransition,
  pixabayIntroTransition,
  priceAlert,
  wakar1Lower,
  aiScan,
  marketTransition,
  epicTransition,
  smartMoneyTransition,
  bigBelugaTransition,
  cryptoUniverseTransition,
];

export const DRAW_FUNCTIONS = {
  intro: drawIntroTransition,
  pixabay_intro: drawPixabayIntroTransition,
  price_alert: drawPriceAlert,
  wakar1_lower: drawWakar1Lower,
  ai_scan: drawAiScan,
  market_transition: drawMarketTransition,
  epic_transition: drawEpicTransition,
  smart_money: drawSmartMoneyTransition,
  big_beluga: drawBigBelugaTransition,
  crypto_universe: drawCryptoUniverse,
};

export function getDrawFunction(transitionId) {
  return DRAW_FUNCTIONS[transitionId] || null;
}
