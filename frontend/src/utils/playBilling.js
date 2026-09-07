export const PLAY_BILLING_METHOD = "https://play.google.com/billing";

let cachedService;

export const getPlayBillingService = async () => {
  if (cachedService !== undefined) return cachedService;
  if (!("getDigitalGoodsService" in window)) {
    cachedService = null;
    return null;
  }
  try {
    cachedService = await window.getDigitalGoodsService(PLAY_BILLING_METHOD);
  } catch {
    cachedService = null;
  }
  return cachedService;
};

export const isPlayBillingAvailable = async () => Boolean(await getPlayBillingService());

export const getPlayPrices = async (skus) => {
  const service = await getPlayBillingService();
  if (!service) return {};
  try {
    const details = await service.getDetails(skus.filter(Boolean));
    const map = {};
    for (const item of details) {
      const price = item.price || {};
      map[item.itemId] = {
        formatted: new Intl.NumberFormat(navigator.language, {
          style: "currency",
          currency: price.currency || "AUD",
        }).format(Number(price.value || 0)),
        currency: price.currency,
        value: price.value,
        title: item.title,
      };
    }
    return map;
  } catch {
    return {};
  }
};

export const purchaseViaPlay = async (sku) => {
  const service = await getPlayBillingService();
  if (!service) throw new Error("PLAY_BILLING_UNAVAILABLE");
  const request = new PaymentRequest(
    [{ supportedMethods: PLAY_BILLING_METHOD, data: { sku } }],
    { total: { label: "Total", amount: { currency: "AUD", value: "0" } } },
  );
  const response = await request.show();
  const purchaseToken = response.details?.purchaseToken || response.details?.token;
  return { response, purchaseToken };
};

export const restorePlayPurchases = async (api, config) => {
  const service = await getPlayBillingService();
  if (!service) return { available: false, restored: 0, found: 0 };
  const purchases = await service.listPurchases();
  let restored = 0;
  for (const purchase of purchases) {
    const topLevelId = String(purchase.itemId || "").split(":")[0];
    const kind = config?.lifetime_product_id && topLevelId === config.lifetime_product_id ? "onetime" : "subscription";
    try {
      await api.post("/playbilling/verify", {
        product_id: topLevelId,
        purchase_token: purchase.purchaseToken,
        kind,
      });
      restored += 1;
    } catch {
      // token invalid/expired — skip silently
    }
  }
  return { available: true, restored, found: purchases.length };
};
