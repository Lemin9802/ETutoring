export const convertDocumentStatusName = (status: number) => {
  switch (status) {
    case 0:
      return "Review Pending";
    case 1:
      return "Reviewed";
    default:
      return "Unknown";
  }
};
