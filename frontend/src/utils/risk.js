export function getRiskLevel(risk) {
  if (risk >= 75) return { label: "FLAGGED", color: "#ef4444", bg: "#450a0a" };
  if (risk >= 45) return { label: "REVIEW", color: "#f59e0b", bg: "#451a03" };
  return { label: "CLEAR", color: "#22c55e", bg: "#052e16" };
}

export const MERCHANT_LIST = ["Amazon", "Flipkart", "Swiggy", "Zomato", "Myntra", "Paytm", "Razorpay", "PhonePe", "HDFC", "ICICI", "Other"];

export const MERCHANT_ICONS = { Amazon:"🛒", Flipkart:"📦", Swiggy:"🍔", Zomato:"🍕", Myntra:"👗", Paytm:"💰", Razorpay:"💳", PhonePe:"📱", HDFC:"🏦", ICICI:"🏛", Other:"💳" };

export function calcManualRisk(merchant, amount) {
  let risk = Math.floor(Math.random() * 35);
  if (amount > 80000) risk += 30;
  else if (amount > 30000) risk += 15;
  if (merchant === "Other") risk += 20;
  return Math.min(risk + Math.floor(Math.random() * 15), 99);
}
