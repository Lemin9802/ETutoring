export const convertDocumentStatusColor = (status: number) => {
  switch (status) {
    case 0:
      return "orange";
    case 1:
      return "green";
    default:
      return "gray";
  }
};
