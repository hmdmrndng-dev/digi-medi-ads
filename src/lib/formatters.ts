// src/lib/formatters.ts
export const formatCurrency = (amount: number | null | undefined) => {
    if (!amount) return "-"
    return new Intl.NumberFormat("en-PH", {
        style: "currency",
        currency: "PHP",
    }).format(amount)
}