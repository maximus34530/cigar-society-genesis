export function bookingStatusLabel(status: string | null | undefined): string {
  switch (status) {
    case "paid":
      return "Paid";
    case "pending_payment":
      return "Pending payment";
    case "cancelled":
      return "Cancelled";
    case null:
    case undefined:
    case "":
      return "Unknown";
    default:
      return status.replace(/_/g, " ");
  }
}
